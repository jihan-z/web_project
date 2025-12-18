# 图片管理系统 - 后端

基于 Node.js + Express + MySQL 的图片管理系统后端服务。

## 技术栈

- **Node.js** - 运行环境
- **Express** - Web 框架
- **MySQL** - 数据库
- **JWT** - 用户认证
- **Bcrypt** - 密码加密
- **Sharp** - 图片处理
- **Multer** - 文件上传
- **Exifr** - EXIF 信息提取

## 安装依赖

\`\`\`bash
npm install
\`\`\`

## 环境配置

创建 `.env` 文件（可选，不创建则使用默认配置）：

\`\`\`env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=image_manager

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

PORT=3000
\`\`\`

## 数据库初始化

### 方式一：使用 SQL 脚本

\`\`\`bash
mysql -u root -p < config/init.sql
\`\`\`

### 方式二：手动创建

1. 创建数据库：

\`\`\`sql
CREATE DATABASE image_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
\`\`\`

2. 执行 `config/init.sql` 中的表结构创建语句

## 运行

### 开发模式

\`\`\`bash
npm start
\`\`\`

服务将在 http://localhost:3000 启动

### 生产模式

\`\`\`bash
NODE_ENV=production npm start
\`\`\`

## API 接口

### 健康检查

\`\`\`
GET /api/health
\`\`\`

### 用户认证

#### 注册
\`\`\`
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
\`\`\`

#### 登录
\`\`\`
POST /api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "testuser",
  "password": "password123"
}
\`\`\`

#### 获取用户信息
\`\`\`
GET /api/auth/me
Authorization: Bearer <token>
\`\`\`

### 图片管理

#### 上传图片
\`\`\`
POST /api/images/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
\`\`\`

#### 批量上传
\`\`\`
POST /api/images/upload/batch
Authorization: Bearer <token>
Content-Type: multipart/form-data

images: <file1>
images: <file2>
...
\`\`\`

#### 获取图片列表
\`\`\`
GET /api/images?page=1&limit=20&tags=标签1,标签2&keyword=关键词
Authorization: Bearer <token>
\`\`\`

#### 获取图片详情
\`\`\`
GET /api/images/:id
Authorization: Bearer <token>
\`\`\`

#### 更新图片信息
\`\`\`
PUT /api/images/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "图片描述",
  "tags": ["标签1", "标签2"]
}
\`\`\`

#### 裁剪图片
\`\`\`
POST /api/images/:id/crop
Authorization: Bearer <token>
Content-Type: application/json

{
  "x": 100,
  "y": 100,
  "width": 500,
  "height": 500
}
\`\`\`

#### 调整图片色调
\`\`\`
POST /api/images/:id/adjust
Authorization: Bearer <token>
Content-Type: application/json

{
  "brightness": 10,
  "saturation": 5,
  "contrast": 0
}
\`\`\`

#### 删除图片
\`\`\`
DELETE /api/images/:id
Authorization: Bearer <token>
\`\`\`

#### 批量删除
\`\`\`
DELETE /api/images/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "imageIds": [1, 2, 3]
}
\`\`\`

### 标签管理

#### 获取所有标签
\`\`\`
GET /api/tags
Authorization: Bearer <token>
\`\`\`

#### 标签搜索建议
\`\`\`
GET /api/tags/suggest?keyword=关键词
Authorization: Bearer <token>
\`\`\`

#### 创建标签
\`\`\`
POST /api/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新标签"
}
\`\`\`

#### 删除标签
\`\`\`
DELETE /api/tags/:id
Authorization: Bearer <token>
\`\`\`

## 项目结构

\`\`\`
back/
├── config/                 # 配置文件
│   ├── database.js        # 数据库连接配置
│   └── init.sql           # 数据库初始化脚本
├── middleware/            # 中间件
│   ├── auth.js           # JWT 认证中间件
│   └── upload.js         # 文件上传配置
├── routes/               # 路由
│   ├── auth.js          # 用户认证路由
│   ├── images.js        # 图片管理路由
│   └── tags.js          # 标签管理路由
├── utils/               # 工具函数
│   └── imageProcessor.js # 图片处理工具
├── uploads/             # 图片存储目录
├── app.js               # Express 应用主文件
├── package.json         # 项目依赖
└── bin/
    └── www              # 启动脚本
\`\`\`

## 功能特性

1. **用户认证**
   - JWT Token 认证
   - 密码 bcrypt 加密
   - 用户名/邮箱唯一性验证

2. **图片上传**
   - 支持单图/批量上传
   - 文件类型验证
   - 文件大小限制（10MB）
   - 自动生成缩略图

3. **EXIF 信息提取**
   - 自动提取拍摄时间
   - GPS 位置信息
   - 相机型号
   - 图片分辨率

4. **自动标签**
   - 基于分辨率自动打标签
   - 基于拍摄时间自动打标签
   - 基于GPS信息自动打标签

5. **图片处理**
   - Sharp 图片裁剪
   - 色调调整（亮度/饱和度）
   - 缩略图生成

6. **数据管理**
   - 软删除机制
   - 级联删除
   - 事务处理

## 注意事项

1. **数据库**
   - 必须使用 utf8mb4 字符集
   - 确保 MySQL 服务运行正常
   - 定期备份数据

2. **文件存储**
   - uploads 目录需要写入权限
   - 定期清理软删除的文件
   - 考虑使用 CDN 加速

3. **安全性**
   - 生产环境务必修改 JWT_SECRET
   - 定期更新依赖包
   - 使用 HTTPS 协议

4. **性能优化**
   - 添加数据库索引
   - 使用缓存（Redis）
   - 图片压缩和 CDN

## 开发说明

### 添加新接口

1. 在 `routes/` 目录创建或修改路由文件
2. 使用 `authenticateToken` 中间件保护需要认证的接口
3. 在 `app.js` 中注册新路由

### 数据库操作

使用 mysql2/promise 进行数据库操作：

\`\`\`javascript
const db = require('./config/database');
const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
\`\`\`

### 图片处理

使用 Sharp 进行图片处理：

\`\`\`javascript
const sharp = require('sharp');
await sharp(inputPath)
  .resize(300, 300)
  .toFile(outputPath);
\`\`\`

## 故障排查

### 数据库连接失败
- 检查 MySQL 服务状态
- 验证数据库配置信息
- 确认数据库已创建

### 文件上传失败
- 检查 uploads 目录权限
- 验证文件大小限制
- 确认磁盘空间充足

### JWT 验证失败
- 检查 token 是否过期
- 验证 JWT_SECRET 配置
- 确认 Authorization header 格式

## 许可证

MIT License

