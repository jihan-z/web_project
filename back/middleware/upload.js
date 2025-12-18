const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// 修复文件名编码（处理中文）
const fixFilename = (filename) => {
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

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user.id;
    const uploadPath = path.join(__dirname, '../uploads', `user_${userId}`);
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // 修复原始文件名编码
    file.originalname = fixFilename(file.originalname);
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `img_${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.'), false);
  }
};

// 配置 multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

module.exports = upload;

