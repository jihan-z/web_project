const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

// 导入路由
const authRouter = require('./routes/auth');
const imagesRouter = require('./routes/images');
const tagsRouter = require('./routes/tags');

const app = express();

// 中间件
app.use(logger('dev'));
app.use(express.json({ charset: 'utf-8' }));
app.use(express.urlencoded({ extended: false, charset: 'utf-8' }));
app.use(cookieParser());

// CORS 配置 - 支持中文
app.use(cors({
  origin: true,
  credentials: true,
  exposedHeaders: ['Content-Type', 'Content-Disposition']
}));

// 设置默认响应头 - 确保 UTF-8 编码
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// 静态文件服务 - 提供上传的图片访问
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.use('/api/auth', authRouter);
app.use('/api/images', imagesRouter);
app.use('/api/tags', tagsRouter);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Image Manager API is running' });
});

// 404 处理
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Multer 错误处理
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB' });
    }
    return res.status(400).json({ error: err.message });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

module.exports = app;
