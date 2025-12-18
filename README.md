# 图片管理系统

一个功能完备的图片管理网站，支持图片上传、管理、编辑和检索。

## 技术栈

### 前端
- Vue 3 + JavaScript
- Element Plus (UI 组件库)
- Pinia (状态管理)
- Vue Router (路由管理)
- Axios (HTTP 客户端)
- Cropper.js (图片裁剪)
- EXIF.js (EXIF 信息读取)

### 后端
- Node.js + Express
- MySQL (数据库)
- JWT (用户认证)
- Bcrypt (密码加密)
- Sharp (图片处理)
- Multer (文件上传)

## 主要功能

1. ✅ **用户认证**
   - 用户注册（用户名/密码验证，邮箱验证）
   - 用户登录
   - JWT Token 认证

2. ✅ **图片上传**
   - 单图上传
   - 批量上传
   - 支持 JPG、PNG、GIF、WebP 格式
   - 自动生成缩略图

3. ✅ **EXIF 信息提取**
   - 自动提取拍摄时间、GPS 位置、相机型号等
   - 基于 EXIF 自动创建标签

4. ✅ **图片管理**
   - 图片列表展示（网格/瀑布流）
   - 图片详情查看
   - 添加描述和自定义标签
   - 图片删除（单个/批量）

5. ✅ **搜索和筛选**
   - 关键词搜索
   - 标签筛选
   - 时间范围筛选
   - 分辨率筛选

6. ✅ **图片编辑**
   - 图片裁剪
   - 色调调整（亮度、饱和度、对比度）

7. ✅ **移动端适配**
   - 响应式设计
   - 支持手机浏览器访问

## 快速开始

### 前置要求

- Node.js >= 18.x
- MySQL >= 5.7
- npm 或 yarn

### 安装步骤

#### 1. 克隆项目

\`\`\`bash
git clone <repository-url>
cd BS
\`\`\`

#### 2. 数据库配置

创建 MySQL 数据库并执行初始化脚本：

\`\`\`bash
mysql -u root -p < back/config/init.sql
\`\`\`

或手动创建数据库：

\`\`\`sql
CREATE DATABASE image_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
\`\`\`

然后运行 `back/config/init.sql` 中的表结构创建语句。

#### 3. 后端设置

\`\`\`bash
cd back
npm install

# 配置环境变量（可选，使用默认配置）
# 创建 .env 文件并设置以下变量：
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=image_manager
# JWT_SECRET=your_secret_key
# PORT=3000

# 启动后端服务
npm start
\`\`\`

后端将在 http://localhost:3000 运行

#### 4. 前端设置

\`\`\`bash
cd front
npm install

# 配置 API 地址（可选）
# 创建 .env 文件：
# VITE_API_BASE_URL=http://localhost:3000/api

# 启动开发服务器
npm run dev
\`\`\`

前端将在 http://localhost:5173 运行

### 生产环境部署

#### 前端构建

\`\`\`bash
cd front
npm run build
\`\`\`

构建产物在 `front/dist` 目录。

#### 后端生产模式

\`\`\`bash
cd back
NODE_ENV=production npm start
\`\`\`

## 项目结构

\`\`\`
BS/
├── back/                    # 后端项目
│   ├── config/             # 配置文件
│   │   ├── database.js     # 数据库连接
│   │   └── init.sql        # 数据库初始化脚本
│   ├── middleware/         # 中间件
│   │   ├── auth.js         # JWT 认证
│   │   └── upload.js       # 文件上传配置
│   ├── routes/             # 路由
│   │   ├── auth.js         # 用户认证接口
│   │   ├── images.js       # 图片管理接口
│   │   └── tags.js         # 标签管理接口
│   ├── utils/              # 工具函数
│   │   └── imageProcessor.js  # 图片处理
│   ├── uploads/            # 图片存储目录
│   ├── app.js              # Express 应用
│   ├── package.json
│   └── bin/www             # 启动脚本
│
├── front/                   # 前端项目
│   ├── src/
│   │   ├── assets/         # 静态资源
│   │   ├── components/     # 公共组件
│   │   │   └── LayoutHeader.vue
│   │   ├── stores/         # Pinia 状态管理
│   │   │   ├── user.js     # 用户状态
│   │   │   ├── images.js   # 图片状态
│   │   │   └── tags.js     # 标签状态
│   │   ├── utils/          # 工具函数
│   │   │   └── request.js  # Axios 封装
│   │   ├── views/          # 页面组件
│   │   │   ├── LoginView.vue
│   │   │   ├── RegisterView.vue
│   │   │   ├── HomeView.vue
│   │   │   ├── GalleryView.vue
│   │   │   ├── UploadView.vue
│   │   │   └── ImageDetailView.vue
│   │   ├── router/         # 路由配置
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   └── vite.config.js
│
└── README.md               # 项目说明
\`\`\`

## API 接口文档

### 用户认证

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 图片管理

- `POST /api/images/upload` - 单图上传
- `POST /api/images/upload/batch` - 批量上传
- `GET /api/images` - 获取图片列表（支持分页和筛选）
- `GET /api/images/:id` - 获取图片详情
- `PUT /api/images/:id` - 更新图片信息
- `DELETE /api/images/:id` - 删除图片
- `DELETE /api/images/batch` - 批量删除图片

### 图片编辑

- `POST /api/images/:id/crop` - 裁剪图片
- `POST /api/images/:id/adjust` - 调整图片色调

### 标签管理

- `GET /api/tags` - 获取所有标签
- `GET /api/tags/suggest` - 标签搜索建议
- `POST /api/tags` - 创建标签
- `DELETE /api/tags/:id` - 删除标签

## 使用说明

1. **注册账户**：首次使用需要注册账户
2. **登录系统**：使用注册的用户名/邮箱和密码登录
3. **上传图片**：点击"上传"按钮，选择或拖拽图片上传
4. **浏览相册**：在相册页面查看所有图片，支持搜索和筛选
5. **图片详情**：点击图片查看详细信息，添加描述和标签
6. **编辑图片**：在详情页可以裁剪图片或调整色调
7. **删除图片**：支持单个或批量删除图片

## 注意事项

- 图片文件大小限制为 10MB
- 支持的图片格式：JPG、PNG、GIF、WebP
- 数据库字符集必须为 utf8mb4
- 确保 MySQL 服务正常运行
- 首次运行需要创建数据库和表结构
- 上传目录需要有写入权限

## 开发说明

### 后端开发

后端使用 Express 框架，采用模块化设计：

- `routes/` - 路由定义
- `middleware/` - 中间件（认证、文件上传等）
- `utils/` - 工具函数（图片处理等）
- `config/` - 配置文件

### 前端开发

前端使用 Vue 3 Composition API：

- 组件化开发
- Pinia 状态管理
- Axios 统一请求封装
- Element Plus 组件库
- 响应式设计

## 常见问题

### 1. 数据库连接失败

检查 MySQL 服务是否启动，数据库配置是否正确。

### 2. 图片上传失败

检查上传目录是否存在且有写入权限，文件大小是否超过限制。

### 3. 前端无法连接后端

检查后端服务是否启动，CORS 配置是否正确。

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue。
