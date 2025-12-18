const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * 生成缩略图
 */
const generateThumbnail = async (imagePath, thumbnailPath, size = 300) => {
  try {
    await sharp(imagePath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
    return thumbnailPath;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
};

/**
 * 读取 EXIF 信息
 */
const extractExifData = async (imagePath) => {
  try {
    const metadata = await sharp(imagePath).metadata();
    const exifData = {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      takenTime: null,
      gpsLatitude: null,
      gpsLongitude: null,
      cameraModel: null
    };

    // 提取 EXIF 数据
    if (metadata.exif) {
      const exif = metadata.exif;
      
      // 尝试解析拍摄时间
      if (metadata.exif) {
        try {
          const exifr = require('exifr');
          const fullExif = await exifr.parse(imagePath);
          
          if (fullExif) {
            exifData.takenTime = fullExif.DateTimeOriginal || fullExif.DateTime || null;
            exifData.cameraModel = fullExif.Model || null;
            
            // GPS 信息
            if (fullExif.latitude && fullExif.longitude) {
              exifData.gpsLatitude = fullExif.latitude;
              exifData.gpsLongitude = fullExif.longitude;
            }
          }
        } catch (err) {
          console.warn('Failed to parse detailed EXIF:', err.message);
        }
      }
    }

    return exifData;
  } catch (error) {
    console.error('Error extracting EXIF data:', error);
    return {
      width: null,
      height: null,
      format: null,
      takenTime: null,
      gpsLatitude: null,
      gpsLongitude: null,
      cameraModel: null
    };
  }
};

/**
 * 裁剪图片
 */
const cropImage = async (imagePath, outputPath, cropData) => {
  try {
    const { x, y, width, height } = cropData;
    
    await sharp(imagePath)
      .extract({
        left: Math.round(x),
        top: Math.round(y),
        width: Math.round(width),
        height: Math.round(height)
      })
      .toFile(outputPath);
    
    return outputPath;
  } catch (error) {
    console.error('Error cropping image:', error);
    throw error;
  }
};

/**
 * 调整图片色调
 */
const adjustImage = async (imagePath, outputPath, adjustments) => {
  try {
    // 使用 modulate 一次性应用亮度和饱和度
    const modulateOptions = {};
    
    // 亮度调整
    if (adjustments.brightness !== undefined && adjustments.brightness !== 0) {
      modulateOptions.brightness = 1 + (adjustments.brightness / 100);
    }
    
    // 饱和度调整
    if (adjustments.saturation !== undefined && adjustments.saturation !== 0) {
      modulateOptions.saturation = 1 + (adjustments.saturation / 100);
    }
    
    let pipeline = sharp(imagePath);
    
    // 应用亮度和饱和度
    if (Object.keys(modulateOptions).length > 0) {
      pipeline = pipeline.modulate(modulateOptions);
    }
    
    // 对比度调整使用 linear 方法
    if (adjustments.contrast !== undefined && adjustments.contrast !== 0) {
      // linear 公式: output = (input * a) + b
      // 对比度增加时 a > 1, 减少时 a < 1
      const contrastMultiplier = 1 + (adjustments.contrast / 100);
      // 调整 b 值使中间色调保持不变
      const offset = 128 * (1 - contrastMultiplier);
      pipeline = pipeline.linear(contrastMultiplier, offset);
    }
    
    await pipeline.toFile(outputPath);
    return outputPath;
  } catch (error) {
    console.error('Error adjusting image:', error);
    throw error;
  }
};

module.exports = {
  generateThumbnail,
  extractExifData,
  cropImage,
  adjustImage
};

