const express = require('express');
const router = express.Router();
const db = require('../config/db');
const sharp = require('sharp');
const fsp = require('fs').promises;
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const exifr = require('exifr');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../public/uploads');
const thumbDir = path.join(uploadDir, 'thumbnails');

// 创建上传目录
async function ensureDirs() {
  try {
    await fsp.access(uploadDir);
  } catch {
    await fsp.mkdir(uploadDir, { recursive: true });
  }
  
  try {
    await fsp.access(thumbDir);
  } catch {
    await fsp.mkdir(thumbDir, { recursive: true });
  }
}

ensureDirs();

// 配置 multer 中间件
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 使用时间戳+原始文件名确保唯一性
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制文件大小为10MB
  },
  fileFilter: function (req, file, cb) {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件!'), false);
    }
  }
});

// 单图上传
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // 获取用户ID（从认证中间件）
    const userId = req.userId;
    
    // 检查是否有上传文件
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }
    
    // 获取文件信息
    const originalFilename = req.file.originalname;
    const filePath = req.file.path;
    const fileSize = req.file.size;
    
    console.log('接收到上传文件:', { originalFilename, filePath, fileSize });
    
    // 检查文件是否存在且大小大于0
    if (!fs.existsSync(filePath) || fileSize === 0) {
      console.error('上传文件不存在或为空:', { filePath, fileSize });
      return res.status(400).json({ error: '上传文件无效' });
    }
    
    // 读取图片信息
    let metadata;
    try {
      metadata = await sharp(filePath).metadata();
      console.log('图片元数据:', metadata);
    } catch (sharpError) {
      console.error('读取图片元数据失败:', sharpError.message);
      // 删除无效文件
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: '不支持的图片格式或图片文件已损坏' });
    }
    
    // 生成缩略图
    const thumbFilename = `thumb_${Date.now()}_${originalFilename}`;
    const thumbPath = path.join(thumbDir, thumbFilename);
    await sharp(filePath)
      .resize(200, 200, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);
    
    // 提取EXIF信息
    let exifData = {};
    try {
      const exif = await exifr.parse(filePath);
      if (exif) {
        exifData = {
          taken_time: exif.DateTimeOriginal || exif.DateTime,
          camera_model: exif.Make || exif.Model,
          gps_latitude: exif.latitude,
          gps_longitude: exif.longitude
        };
      }
    } catch (exifError) {
      console.log('无法读取EXIF信息:', exifError.message);
    }
    
    // 保存到数据库
    const [result] = await db.execute(
      `INSERT INTO images 
        (user_id, original_filename, stored_path, thumb_path, file_size, width, height, taken_time, camera_model, gps_latitude, gps_longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        originalFilename,
        filePath,
        thumbPath,
        fileSize,
        metadata.width,
        metadata.height,
        exifData.taken_time || null,
        exifData.camera_model || null,
        exifData.gps_latitude || null,
        exifData.gps_longitude || null
      ]
    );
    
    res.status(201).json({
      message: '图片上传成功',
      image: {
        id: result.insertId,
        original_filename: originalFilename,
        file_size: fileSize,
        width: metadata.width,
        height: metadata.height,
        taken_time: exifData.taken_time || null,
        camera_model: exifData.camera_model || null
      }
    });
  } catch (error) {
    console.error('图片上传错误:', error);
    res.status(500).json({ error: '图片上传失败' });
  }
});

// 分页图片列表查询
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * pageSize;
    
    // 确保所有参数都是正确的整数类型
    const intUserId = parseInt(userId);
    const intLimit = Number.parseInt(pageSize);
    const intOffset = Number.parseInt(offset);
    
    // 构建查询条件
    let whereClause = 'WHERE user_id = ? AND deleted_at IS NULL';
    const params = [intUserId];
    
    // 添加调试日志
    console.log('Debug - userId:', userId, 'intUserId:', intUserId);
    console.log('Debug - page:', page, 'pageSize:', pageSize);
    console.log('Debug - intLimit:', intLimit, 'intOffset:', intOffset);
    console.log('Debug - params:', [...params, intOffset, intLimit]);
    
    // 验证参数是否有效
    if (isNaN(intUserId) || isNaN(intLimit) || isNaN(intOffset)) {
      console.error('Invalid parameters:', { intUserId, intLimit, intOffset });
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    // 查询图片列表
    const [images] = await db.query(
      `SELECT id, original_filename, stored_path, width, height, taken_time, camera_model, description, created_at
       FROM images 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ?, ?`,
      [...params, Number(intOffset), Number(intLimit)]
    );
    
    // 查询总数
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM images ${whereClause}`,
      params
    );
    
    res.json({
      images,
      pagination: {
        page,
        limit: intLimit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / intLimit)
      }
    });
  } catch (error) {
    console.error('查询图片列表错误:', error);
    res.status(500).json({ error: '查询图片列表失败' });
  }
});

// 图片详情查询
router.get('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const imageId = req.params.id;
    
    // 查询图片详情
    const [images] = await db.execute(
      `SELECT i.id, i.original_filename, i.stored_path, i.width, i.height, 
              i.taken_time, i.gps_latitude, i.gps_longitude, i.camera_model, 
              i.description, i.created_at,
              GROUP_CONCAT(t.name) as tags
       FROM images i
       LEFT JOIN image_tags it ON i.id = it.image_id
       LEFT JOIN tags t ON it.tag_id = t.id
       WHERE i.id = ? AND i.user_id = ? AND i.deleted_at IS NULL
       GROUP BY i.id`,
      [imageId, userId]
    );
    
    if (images.length === 0) {
      return res.status(404).json({ error: '图片不存在' });
    }
    
    const image = images[0];
    // 将标签字符串转换为数组
    image.tags = image.tags ? image.tags.split(',') : [];
    
    res.json({ image });
  } catch (error) {
    console.error('查询图片详情错误:', error);
    res.status(500).json({ error: '查询图片详情失败' });
  }
});

// 更新图片信息
// 更新图片信息
router.put('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const imageId = req.params.id;
    const { description } = req.body;
    
    // 检查是否提供了可更新的字段
    if (description === undefined) {
      return res.status(400).json({ error: '请提供要更新的字段（目前只支持description）' });
    }
    
    // 更新图片信息
    const [result] = await db.execute(
      'UPDATE images SET description = ? WHERE id = ? AND user_id = ?',
      [description, imageId, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '图片不存在' });
    }
    
    res.json({ message: '图片信息更新成功' });
  } catch (error) {
    console.error('更新图片信息错误:', error);
    res.status(500).json({ error: '更新图片信息失败' });
  }
});

// 删除图片
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const imageId = req.params.id;
    
    // 先查询图片信息
    const [images] = await db.execute(
      'SELECT stored_path, thumb_path FROM images WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [imageId, userId]
    );
    
    if (images.length === 0) {
      return res.status(404).json({ error: '图片不存在' });
    }
    
    const imagePath = images[0].stored_path;
    const thumbPath = images[0].thumb_path;
    
    // 软删除图片（标记为已删除）
    const [result] = await db.execute(
      'UPDATE images SET deleted_at = NOW() WHERE id = ? AND user_id = ?',
      [imageId, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '图片不存在' });
    }
    
    // 尝试删除物理文件
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      if (thumbPath && fs.existsSync(thumbPath)) {
        fs.unlinkSync(thumbPath);
      }
    } catch (fileError) {
      console.warn('删除物理文件时出错:', fileError.message);
      // 不返回错误给客户端，因为数据库记录已成功删除
    }
    
    res.json({ message: '图片删除成功' });
  } catch (error) {
    console.error('删除图片错误:', error);
    res.status(500).json({ error: '删除图片失败' });
  }
});

// 图片裁剪接口
router.post('/:id/crop', async (req, res) => {
  try {
    const userId = req.userId;
    const imageId = req.params.id;
    const { x, y, width, height } = req.body;

    // 参数验证
    if (typeof x !== 'number' || typeof y !== 'number' || 
        typeof width !== 'number' || typeof height !== 'number' ||
        width <= 0 || height <= 0) {
      return res.status(400).json({ error: '无效的裁剪参数' });
    }

    // 查询图片信息
    const [images] = await db.execute(
      'SELECT stored_path, original_filename FROM images WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [imageId, userId]
    );

    if (images.length === 0) {
      return res.status(404).json({ error: '图片不存在' });
    }

    const imagePath = images[0].stored_path;
    const originalFilename = images[0].original_filename;

    // 检查图片文件是否存在
     if (!fs.existsSync(imagePath)) {
       return res.status(404).json({ error: '图片文件不存在' });
     }

    // 获取图片元数据以验证裁剪参数
    const metadata = await sharp(imagePath).metadata();
    const { width: imgWidth, height: imgHeight } = metadata;

    // 验证裁剪区域是否在图片边界内
    if (x < 0 || y < 0 || x + width > imgWidth || y + height > imgHeight) {
      return res.status(400).json({ 
        error: '裁剪区域超出图片边界',
        imageDimensions: { width: imgWidth, height: imgHeight },
        cropRegion: { x, y, width, height }
      });
    }

    // 生成新的文件名
    const ext = path.extname(originalFilename);
    const baseName = path.basename(originalFilename, ext);
    const timestamp = Date.now();
    const newFileName = `${baseName}_cropped_${timestamp}${ext}`;
    const uploadsDir = path.join(__dirname, '../public/uploads');
    const newImagePath = path.join(uploadsDir, newFileName);

    // 确保uploads目录存在
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 执行裁剪操作
    await sharp(imagePath)
      .extract({ left: Math.round(x), top: Math.round(y), width: Math.round(width), height: Math.round(height) })
      .toFile(newImagePath);

    // 生成新的缩略图
    const thumbDir = path.join(__dirname, '../public/uploads/thumbnails');
    
    // 确保thumbnails目录存在
    if (!fs.existsSync(thumbDir)) {
      fs.mkdirSync(thumbDir, { recursive: true });
    }
    
    const thumbFileName = `thumb_${newFileName}`;
    const thumbPath = path.join(thumbDir, thumbFileName);
    
    await sharp(newImagePath)
      .resize(200, 200, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);

    // 更新数据库记录
    const [result] = await db.execute(
      'UPDATE images SET stored_path = ?, thumb_path = ?, original_filename = ? WHERE id = ? AND user_id = ?',
      [newImagePath, thumbPath, newFileName, imageId, userId]
    );

    if (result.affectedRows === 0) {
      // 如果更新失败，删除刚刚创建的文件
      try {
        if (fs.existsSync(newImagePath)) {
          fs.unlinkSync(newImagePath);
        }
        if (fs.existsSync(thumbPath)) {
          fs.unlinkSync(thumbPath);
        }
      } catch (unlinkError) {
        console.error('清理文件失败:', unlinkError);
      }
      return res.status(500).json({ error: '裁剪操作失败' });
    }

    res.json({ 
      message: '图片裁剪成功',
      imagePath: newImagePath,
      thumbPath: thumbPath
    });
  } catch (error) {
    console.error('图片裁剪错误:', error);
    res.status(500).json({ error: '图片裁剪失败' });
  }
});

// 图片色调调整接口
router.post('/:id/adjust', async (req, res) => {
  try {
    const userId = req.userId;
    const imageId = req.params.id;
    const { brightness, contrast, saturation } = req.body;

    // 参数验证
    if ((brightness !== undefined && (typeof brightness !== 'number' || brightness < 0 || brightness > 200)) ||
        (contrast !== undefined && (typeof contrast !== 'number' || contrast < 0 || contrast > 200)) ||
        (saturation !== undefined && (typeof saturation !== 'number' || saturation < 0 || saturation > 200))) {
      return res.status(400).json({ error: '无效的调整参数' });
    }

    // 查询图片信息
    const [images] = await db.execute(
      'SELECT stored_path FROM images WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [imageId, userId]
    );

    if (images.length === 0) {
      return res.status(404).json({ error: '图片不存在' });
    }

    const imagePath = images[0].stored_path;

    // 生成新的文件名
    const ext = path.extname(imagePath);
    const baseName = path.basename(imagePath, ext);
    const newFileName = `${baseName}_adjusted_${Date.now()}${ext}`;
    const newImagePath = path.join(path.dirname(imagePath), newFileName);

    // 构建调整选项
    const sharpInstance = sharp(imagePath);
    const modifiers = {};

    if (brightness !== undefined) {
      modifiers.brightness = brightness / 100;
    }
    if (contrast !== undefined) {
      modifiers.contrast = contrast / 100;
    }
    if (saturation !== undefined) {
      modifiers.saturation = saturation / 100;
    }

    // 应用调整
    await sharpInstance.modulate(modifiers).toFile(newImagePath);

    // 生成新的缩略图
    const thumbDir = path.join(__dirname, '../public/uploads/thumbnails');
    const thumbFileName = `thumb_${newFileName}`;
    const thumbPath = path.join(thumbDir, thumbFileName);
    
    await sharp(newImagePath)
      .resize(200, 200, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);

    // 更新数据库记录
    const [result] = await db.execute(
      'UPDATE images SET stored_path = ?, thumb_path = ? WHERE id = ? AND user_id = ?',
      [newImagePath, thumbPath, imageId, userId]
    );

    if (result.affectedRows === 0) {
      // 如果更新失败，删除刚刚创建的文件
      try {
        await fsp.unlink(newImagePath);
        await fsp.unlink(thumbPath);
      } catch (unlinkError) {
        console.error('清理文件失败:', unlinkError);
      }
      return res.status(500).json({ error: '色调调整操作失败' });
    }

    res.json({ 
      message: '图片色调调整成功',
      imagePath: newImagePath,
      thumbPath: thumbPath
    });
  } catch (error) {
    console.error('图片色调调整错误:', error);
    res.status(500).json({ error: '图片色调调整失败' });
  }
});

module.exports = router;