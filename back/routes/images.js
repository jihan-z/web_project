const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { generateThumbnail, extractExifData, extractFullExifData, cropImage, adjustImage } = require('../utils/imageProcessor');

// 修复文件名编码（处理中文）
const fixFilename = (filename) => {
  if (!filename) return filename;
  
  try {
    // 如果文件名已经是乱码（latin1编码），尝试转换为UTF-8
    // 检测是否包含乱码特征字符
    if (/[\u00C0-\u00FF][\u0080-\u00BF]/.test(filename)) {
      // 将错误编码的字符串转回 Buffer，然后用 UTF-8 解码
      const buffer = Buffer.from(filename, 'latin1');
      return buffer.toString('utf8');
    }
    return filename;
  } catch (error) {
    console.warn('Failed to fix filename encoding:', error);
    return filename;
  }
};

// 单图上传
router.post('/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imagePath = req.file.path;
    const thumbnailPath = imagePath.replace(/(\.[^.]+)$/, '_thumb$1');

    // 生成缩略图
    await generateThumbnail(imagePath, thumbnailPath);

    // 提取 EXIF 信息
    const exifData = await extractExifData(imagePath);

    // 存储路径（相对路径）
    const storedPath = path.relative(path.join(__dirname, '..'), imagePath);
    const thumbPath = path.relative(path.join(__dirname, '..'), thumbnailPath);

    // 修复文件名编码
    const originalFilename = fixFilename(req.file.originalname);
    
    // 插入数据库
    const [result] = await db.query(
      `INSERT INTO images (user_id, original_filename, stored_path, thumbnail_path, 
       width, height, taken_time, gps_latitude, gps_longitude, camera_model) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        originalFilename,
        storedPath,
        thumbPath,
        exifData.width,
        exifData.height,
        exifData.takenTime,
        exifData.gpsLatitude,
        exifData.gpsLongitude,
        exifData.cameraModel
      ]
    );

    const imageId = result.insertId;

    // 创建自动标签
    await createAutoTags(imageId, exifData);

    // 获取完整图片信息
    const [images] = await db.query(
      `SELECT i.*, GROUP_CONCAT(t.name) as tags
       FROM images i
       LEFT JOIN image_tags it ON i.id = it.image_id
       LEFT JOIN tags t ON it.tag_id = t.id
       WHERE i.id = ?
       GROUP BY i.id`,
      [imageId]
    );

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: images[0]
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// 批量上传
router.post('/upload/batch', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // 获取描述（如果提供）
    const description = req.body.description || '';

    const uploadedImages = [];

    for (const file of req.files) {
      try {
        // 修复文件名编码
        const originalFilename = fixFilename(file.originalname);
        
        const imagePath = file.path;
        const thumbnailPath = imagePath.replace(/(\.[^.]+)$/, '_thumb$1');

        // 生成缩略图（容错处理）
        let thumbPath = null;
        try {
          await generateThumbnail(imagePath, thumbnailPath);
          thumbPath = path.relative(path.join(__dirname, '..'), thumbnailPath);
          console.log('✅ Thumbnail generated:', thumbnailPath);
        } catch (thumbError) {
          console.error('⚠️ Thumbnail generation failed:', thumbError.message);
          // 缩略图生成失败时，使用原图作为缩略图
          thumbPath = path.relative(path.join(__dirname, '..'), imagePath);
        }
        
        // 提取 EXIF 信息（容错处理）
        let exifData = {
          width: null,
          height: null,
          takenTime: null,
          gpsLatitude: null,
          gpsLongitude: null,
          cameraModel: null
        };
        try {
          exifData = await extractExifData(imagePath);
          console.log('✅ EXIF extracted for:', originalFilename);
        } catch (exifError) {
          console.error('⚠️ EXIF extraction failed:', exifError.message);
        }

        const storedPath = path.relative(path.join(__dirname, '..'), imagePath);

        const [result] = await db.query(
          `INSERT INTO images (user_id, original_filename, stored_path, thumbnail_path, 
           width, height, taken_time, gps_latitude, gps_longitude, camera_model, description) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.user.id,
            originalFilename,
            storedPath,
            thumbPath,
            exifData.width,
            exifData.height,
            exifData.takenTime,
            exifData.gpsLatitude,
            exifData.gpsLongitude,
            exifData.cameraModel,
            description
          ]
        );

        const imageId = result.insertId;
        console.log(`✅ Image saved to database, ID: ${imageId}`);
        
        // 创建自动标签（容错处理）
        try {
          await createAutoTags(imageId, exifData);
          console.log(`✅ Auto tags created for image ${imageId}`);
        } catch (tagError) {
          console.error('⚠️ Auto tag creation failed:', tagError.message);
        }

        uploadedImages.push({ 
          id: imageId, 
          filename: originalFilename,
          stored_path: storedPath,
          thumbnail_path: thumbPath
        });
        console.log(`✅ Image ${imageId} uploaded successfully:`, originalFilename);
      } catch (error) {
        console.error(`❌ Error processing file ${originalFilename || file.originalname}:`, error.message);
        console.error('Stack:', error.stack);
      }
    }

    res.status(201).json({
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages
    });
  } catch (error) {
    console.error('Batch upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// 创建自动标签
async function createAutoTags(imageId, exifData) {
  const autoTags = [];

  // 基于分辨率的标签
  if (exifData.width && exifData.height) {
    const resolution = exifData.width * exifData.height;
    if (resolution >= 2073600) {
      autoTags.push('高清');
    } else if (resolution >= 921600) {
      autoTags.push('标清');
    }

    // 横竖屏标签
    if (exifData.width > exifData.height) {
      autoTags.push('横屏');
    } else if (exifData.height > exifData.width) {
      autoTags.push('竖屏');
    }
  }

  // 基于拍摄时间的标签
  if (exifData.takenTime) {
    const date = new Date(exifData.takenTime);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    autoTags.push(`${year}年`);
    autoTags.push(`${year}年${month}月`);
    
    // 季节标签
    if (month >= 3 && month <= 5) autoTags.push('春季');
    else if (month >= 6 && month <= 8) autoTags.push('夏季');
    else if (month >= 9 && month <= 11) autoTags.push('秋季');
    else autoTags.push('冬季');
  }

  // 基于GPS的标签
  if (exifData.gpsLatitude && exifData.gpsLongitude) {
    autoTags.push('有位置信息');
  }

  // 插入标签
  for (const tagName of autoTags) {
    try {
      // 尝试插入标签，如果已存在则忽略
      await db.query(
        'INSERT IGNORE INTO tags (name, type) VALUES (?, ?)',
        [tagName, 'auto']
      );

      // 获取标签 ID
      const [tags] = await db.query('SELECT id FROM tags WHERE name = ?', [tagName]);
      if (tags.length > 0) {
        // 关联图片和标签
        await db.query(
          'INSERT IGNORE INTO image_tags (image_id, tag_id) VALUES (?, ?)',
          [imageId, tags[0].id]
        );
      }
    } catch (error) {
      console.error(`Error creating tag ${tagName}:`, error);
    }
  }
}

// 批量删除图片（必须放在 /:id 路由之前）
router.delete('/batch', authenticateToken, async (req, res) => {
  try {
    const { imageIds } = req.body;

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({ error: 'Image IDs array is required' });
    }

    // 获取所有图片路径
    const [images] = await db.query(
      `SELECT id, stored_path, thumbnail_path FROM images 
       WHERE id IN (${imageIds.map(() => '?').join(',')}) 
       AND user_id = ? AND deleted_at IS NULL`,
      [...imageIds, req.user.id]
    );

    if (images.length === 0) {
      return res.status(404).json({ error: 'No images found' });
    }

    // 软删除
    await db.query(
      `UPDATE images SET deleted_at = NOW() 
       WHERE id IN (${imageIds.map(() => '?').join(',')}) AND user_id = ?`,
      [...imageIds, req.user.id]
    );

    // 删除文件
    for (const image of images) {
      try {
        const imagePath = path.join(__dirname, '..', image.stored_path);
        const thumbPath = path.join(__dirname, '..', image.thumbnail_path);
        
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
      } catch (fileError) {
        console.error('Error deleting files:', fileError);
      }
    }

    res.json({ 
      message: `${images.length} images deleted successfully`,
      deletedCount: images.length
    });
  } catch (error) {
    console.error('Batch delete error:', error);
    res.status(500).json({ error: 'Failed to delete images' });
  }
});

// 获取图片列表（带分页和筛选）
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      tags,
      startDate,
      endDate,
      keyword,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE i.user_id = ? AND i.deleted_at IS NULL';
    const params = [req.user.id];

    // 标签筛选
    if (tags) {
      const tagArray = tags.split(',');
      whereClause += ` AND i.id IN (
        SELECT it.image_id FROM image_tags it
        JOIN tags t ON it.tag_id = t.id
        WHERE t.name IN (${tagArray.map(() => '?').join(',')})
        GROUP BY it.image_id
        HAVING COUNT(DISTINCT t.id) = ?
      )`;
      params.push(...tagArray, tagArray.length);
    }

    // 时间范围筛选
    if (startDate) {
      whereClause += ' AND (i.taken_time >= ? OR i.created_at >= ?)';
      params.push(startDate, startDate);
    }
    if (endDate) {
      whereClause += ' AND (i.taken_time <= ? OR i.created_at <= ?)';
      params.push(endDate, endDate);
    }

    // 关键词筛选
    if (keyword) {
      whereClause += ' AND (i.original_filename LIKE ? OR i.description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 分辨率筛选
    if (minWidth) {
      whereClause += ' AND i.width >= ?';
      params.push(minWidth);
    }
    if (maxWidth) {
      whereClause += ' AND i.width <= ?';
      params.push(maxWidth);
    }
    if (minHeight) {
      whereClause += ' AND i.height >= ?';
      params.push(minHeight);
    }
    if (maxHeight) {
      whereClause += ' AND i.height <= ?';
      params.push(maxHeight);
    }

    // 查询总数
    const [countResult] = await db.query(
      `SELECT COUNT(DISTINCT i.id) as total FROM images i ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 查询图片列表
    const [images] = await db.query(
      `SELECT i.*, GROUP_CONCAT(t.name) as tags
       FROM images i
       LEFT JOIN image_tags it ON i.id = it.image_id
       LEFT JOIN tags t ON it.tag_id = t.id
       ${whereClause}
       GROUP BY i.id
       ORDER BY i.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      images,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// 获取图片详情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { includeExif } = req.query;
    const imageId = req.params.id;
    
    const [images] = await db.query(
      `SELECT i.*, GROUP_CONCAT(t.name) as tags
       FROM images i
       LEFT JOIN image_tags it ON i.id = it.image_id
       LEFT JOIN tags t ON it.tag_id = t.id
       WHERE i.id = ? AND i.user_id = ? AND i.deleted_at IS NULL
       GROUP BY i.id`,
      [imageId, req.user.id]
    );

    if (images.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = images[0];
    
    // 如果需要详细 EXIF 信息，从文件重新读取
    if (includeExif === 'true' || includeExif === '1') {
      try {
        const imagePath = path.join(__dirname, '..', image.stored_path);
        if (fs.existsSync(imagePath)) {
          const fullExif = await extractFullExifData(imagePath);
          image.fullExif = fullExif;
        }
      } catch (exifError) {
        console.warn('Failed to extract full EXIF:', exifError.message);
        image.fullExif = null;
      }
    }

    res.json({ image });
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// 更新图片信息
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { description, tags, filename } = req.body;
    const imageId = req.params.id;

    // 验证图片所有权
    const [images] = await db.query(
      'SELECT id, original_filename FROM images WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [imageId, req.user.id]
    );

    if (images.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // 更新文件名（如果提供）
    if (filename !== undefined && filename !== null) {
      // 修复文件名编码
      const newFilename = fixFilename(filename);
      
      // 验证文件名（不能为空，不能包含特殊字符）
      if (!newFilename || newFilename.trim() === '') {
        return res.status(400).json({ error: 'Filename cannot be empty' });
      }
      
      // 检查文件名中是否包含非法字符
      const invalidChars = /[<>:"/\\|?*]/;
      if (invalidChars.test(newFilename)) {
        return res.status(400).json({ error: 'Filename contains invalid characters' });
      }
      
      await db.query(
        'UPDATE images SET original_filename = ? WHERE id = ?',
        [newFilename, imageId]
      );
    }

    // 更新描述
    if (description !== undefined) {
      await db.query(
        'UPDATE images SET description = ? WHERE id = ?',
        [description, imageId]
      );
    }

    // 更新自定义标签
    if (tags && Array.isArray(tags)) {
      // 删除旧的自定义标签关联
      await db.query(
        `DELETE it FROM image_tags it
         JOIN tags t ON it.tag_id = t.id
         WHERE it.image_id = ? AND t.type = 'custom'`,
        [imageId]
      );

      // 添加新的自定义标签
      for (const tagName of tags) {
        await db.query(
          'INSERT IGNORE INTO tags (name, type) VALUES (?, ?)',
          [tagName, 'custom']
        );

        const [tagResult] = await db.query('SELECT id FROM tags WHERE name = ?', [tagName]);
        if (tagResult.length > 0) {
          await db.query(
            'INSERT IGNORE INTO image_tags (image_id, tag_id) VALUES (?, ?)',
            [imageId, tagResult[0].id]
          );
        }
      }
    }

    // 返回更新后的图片信息
    const [updatedImages] = await db.query(
      `SELECT i.*, GROUP_CONCAT(t.name) as tags
       FROM images i
       LEFT JOIN image_tags it ON i.id = it.image_id
       LEFT JOIN tags t ON it.tag_id = t.id
       WHERE i.id = ?
       GROUP BY i.id`,
      [imageId]
    );

    res.json({
      message: 'Image updated successfully',
      image: updatedImages[0]
    });
  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// 裁剪图片
router.post('/:id/crop', authenticateToken, async (req, res) => {
  try {
    const { x, y, width, height } = req.body;
    const imageId = req.params.id;

    if (x === undefined || y === undefined || width === undefined || height === undefined) {
      return res.status(400).json({ error: 'Crop parameters (x, y, width, height) are required' });
    }

    // 获取原图路径和缩略图路径
    const [images] = await db.query(
      'SELECT stored_path, thumbnail_path FROM images WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [imageId, req.user.id]
    );

    if (images.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const originalPath = path.join(__dirname, '..', images[0].stored_path);
    const thumbnailPath = path.join(__dirname, '..', images[0].thumbnail_path);
    const croppedPath = originalPath.replace(/(\.[^.]+)$/, '_cropped$1');

    // 执行裁剪
    await cropImage(originalPath, croppedPath, { x, y, width, height });

    // 生成新的缩略图
    const croppedThumbPath = croppedPath.replace(/(\.[^.]+)$/, '_thumb$1');
    await generateThumbnail(croppedPath, croppedThumbPath);

    // 替换原图和缩略图
    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
    }
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }
    fs.renameSync(croppedPath, originalPath);
    fs.renameSync(croppedThumbPath, thumbnailPath);

    res.json({ message: 'Image cropped successfully' });
  } catch (error) {
    console.error('Crop image error:', error);
    res.status(500).json({ error: 'Failed to crop image' });
  }
});

// 调整图片色调
router.post('/:id/adjust', authenticateToken, async (req, res) => {
  try {
    const { brightness, saturation, contrast } = req.body;
    const imageId = req.params.id;

    // 获取原图路径和缩略图路径
    const [images] = await db.query(
      'SELECT stored_path, thumbnail_path FROM images WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [imageId, req.user.id]
    );

    if (images.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const originalPath = path.join(__dirname, '..', images[0].stored_path);
    const thumbnailPath = path.join(__dirname, '..', images[0].thumbnail_path);
    const adjustedPath = originalPath.replace(/(\.[^.]+)$/, '_adjusted$1');

    // 执行调整
    await adjustImage(originalPath, adjustedPath, { brightness, saturation, contrast });

    // 生成新的缩略图
    const adjustedThumbPath = adjustedPath.replace(/(\.[^.]+)$/, '_thumb$1');
    await generateThumbnail(adjustedPath, adjustedThumbPath);

    // 替换原图和缩略图
    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
    }
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }
    fs.renameSync(adjustedPath, originalPath);
    fs.renameSync(adjustedThumbPath, thumbnailPath);

    res.json({ message: 'Image adjusted successfully' });
  } catch (error) {
    console.error('Adjust image error:', error);
    res.status(500).json({ error: 'Failed to adjust image' });
  }
});

// 删除单张图片
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const imageId = req.params.id;

    // 获取图片路径
    const [images] = await db.query(
      'SELECT stored_path, thumbnail_path FROM images WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [imageId, req.user.id]
    );

    if (images.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // 软删除（设置 deleted_at）
    await db.query(
      'UPDATE images SET deleted_at = NOW() WHERE id = ?',
      [imageId]
    );

    // 也可以选择物理删除文件
    try {
      const imagePath = path.join(__dirname, '..', images[0].stored_path);
      const thumbPath = path.join(__dirname, '..', images[0].thumbnail_path);
      
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    } catch (fileError) {
      console.error('Error deleting files:', fileError);
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
