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
 * 读取 EXIF 信息（基础信息，用于上传时）
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
 * 读取完整的 EXIF 信息（用于详情显示）
 */
const extractFullExifData = async (imagePath) => {
  try {
    const metadata = await sharp(imagePath).metadata();
    const fullExifData = {
      // 基础信息
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      channels: metadata.channels,
      density: metadata.density,
      hasAlpha: metadata.hasAlpha,
      hasProfile: metadata.hasProfile,
      orientation: metadata.orientation,
      space: metadata.space,
      // EXIF 详细信息
      exif: null
    };

    // 提取完整 EXIF 数据
    try {
      const exifr = require('exifr');
      // 使用 parse 方法提取所有字段，不限制字段
      const fullExif = await exifr.parse(imagePath, {
        // 不限制字段，提取所有可用的 EXIF 数据
        translateKeys: false,
        translateValues: false,
        reviveValues: true,
        sanitize: true,
        mergeOutput: false
      });
      
      if (fullExif) {
        fullExifData.exif = fullExif;
        
        // 提取常用字段到顶层（方便前端使用）
        fullExifData.takenTime = fullExif.DateTimeOriginal || fullExif.DateTime || null;
        fullExifData.cameraMake = fullExif.Make || null;
        fullExifData.cameraModel = fullExif.Model || null;
        fullExifData.lensModel = fullExif.LensModel || null;
        fullExifData.exposureTime = fullExif.ExposureTime || null;
        fullExifData.fNumber = fullExif.FNumber || null;
        fullExifData.iso = fullExif.ISO || fullExif.ISOSpeedRatings || null;
        fullExifData.focalLength = fullExif.FocalLength || null;
        fullExifData.focalLength35mm = fullExif.FocalLengthIn35mmFilm || null;
        fullExifData.gpsLatitude = fullExif.latitude || fullExif.GPSLatitude || null;
        fullExifData.gpsLongitude = fullExif.longitude || fullExif.GPSLongitude || null;
        fullExifData.gpsAltitude = fullExif.GPSAltitude || null;
        fullExifData.gpsTimeStamp = fullExif.GPSTimeStamp || null;
        fullExifData.gpsDateStamp = fullExif.GPSDateStamp || null;
        fullExifData.imageWidth = fullExif.ImageWidth || fullExif.PixelXDimension || null;
        fullExifData.imageHeight = fullExif.ImageLength || fullExif.PixelYDimension || null;
        fullExifData.xResolution = fullExif.XResolution || null;
        fullExifData.yResolution = fullExif.YResolution || null;
        fullExifData.resolutionUnit = fullExif.ResolutionUnit || null;
        fullExifData.software = fullExif.Software || null;
        fullExifData.orientation = fullExif.Orientation || metadata.orientation || null;
      }
    } catch (err) {
      console.warn('Failed to parse full EXIF:', err.message);
    }

    return fullExifData;
  } catch (error) {
    console.error('Error extracting full EXIF data:', error);
    return {
      width: metadata?.width || null,
      height: metadata?.height || null,
      format: metadata?.format || null,
      exif: null
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
  extractFullExifData,
  cropImage,
  adjustImage
};

