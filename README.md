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


## 快速开始

### 方式一：Docker 部署（推荐）

使用 Docker Compose 一键部署，无需手动配置环境。

#### 前置要求

- Docker Engine 20.10+
- Docker Compose 2.0+

#### 部署步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd BS
```

2. **配置环境变量**

```bash
# Windows PowerShell
Copy-Item env.example .env

# Linux/Mac
cp env.example .env
```

编辑 `.env` 文件，修改数据库密码和 JWT 密钥（生产环境必须修改）：

```env
DB_PASSWORD=your_secure_password
DB_ROOT_PASSWORD=your_secure_password
JWT_SECRET=your_random_secret_key
```

3. **启动所有服务**

```bash
docker-compose up -d --build
```

4. **查看服务状态**

```bash
docker-compose ps
```

5. **访问应用**

- **前端**: http://localhost
- **后端 API**: http://localhost:3000
- **健康检查**: http://localhost:3000/api/health

#### Docker 常用命令

```bash
# 查看日志
docker-compose logs -f

# 停止服务
docker-compose stop

# 重启服务
docker-compose restart

# 停止并删除容器
docker-compose down

# 停止并删除容器和数据卷（谨慎操作）
docker-compose down -v
```

#### 故障排查

如果遇到端口冲突（如 3306 端口被占用），MySQL 容器已配置为不暴露端口到主机，容器间通过内部网络通信，无需担心。

如果容器启动失败，查看日志：

```bash
docker-compose logs [服务名]
# 例如：docker-compose logs mysql
```

---

### 方式二：本地开发部署

适合开发和调试使用。

#### 前置要求

- Node.js >= 18.x
- MySQL >= 5.7
- npm 或 yarn

#### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd BS
```

2. **数据库配置**

创建 MySQL 数据库并执行初始化脚本：

```bash
mysql -u root -p < mysql/init.sql
```

或手动创建数据库：

```sql
CREATE DATABASE image_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

然后运行 `mysql/init.sql` 中的表结构创建语句。

3. **后端设置**

```bash
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
```

后端将在 http://localhost:3000 运行

4. **前端设置**

```bash
cd front
npm install

# 配置 API 地址（可选）
# 创建 .env 文件：
# VITE_API_BASE_URL=http://localhost:3000/api

# 启动开发服务器
npm run dev
```

前端将在 http://localhost:5173 运行

#### 生产环境部署

**前端构建**

```bash
cd front
npm run build
```

构建产物在 `front/dist` 目录。

**后端生产模式**

```bash
cd back
NODE_ENV=production npm start
```

---

## 项目功能简介

本项目是一个功能完备的图片管理系统，支持图片上传、管理、编辑和检索。主要功能包括：

### 1. 用户认证系统
- ✅ **用户注册**：支持用户名和邮箱注册，包含格式验证和唯一性检查
- ✅ **用户登录**：支持用户名/邮箱登录，密码加密存储
- ✅ **JWT 认证**：基于 Token 的身份验证机制，安全可靠

### 2. 图片上传功能
- ✅ **单图上传**：支持单张图片上传
- ✅ **批量上传**：支持一次选择多张图片批量上传
- ✅ **格式支持**：支持 JPG、PNG、GIF、WebP 等常见图片格式
- ✅ **自动缩略图**：上传后自动生成缩略图，提升加载速度
- ✅ **拖拽上传**：支持拖拽文件到上传区域

### 3. EXIF 信息提取
- ✅ **自动提取**：上传时自动提取图片的 EXIF 信息
- ✅ **拍摄信息**：提取拍摄时间、相机型号、拍摄参数等
- ✅ **GPS 定位**：提取图片的 GPS 位置信息（如果存在）
- ✅ **自动标签**：基于 EXIF 信息自动创建标签（如分辨率、拍摄日期等）

### 4. 图片管理功能
- ✅ **图片列表**：网格/瀑布流布局展示所有图片
- ✅ **图片详情**：查看图片的详细信息、EXIF 数据、标签等
- ✅ **描述编辑**：为图片添加或修改描述信息
- ✅ **标签管理**：添加、删除自定义标签，支持标签搜索
- ✅ **批量操作**：支持批量选择和删除图片
- ✅ **软删除**：删除的图片采用软删除机制，可恢复

### 5. 搜索和筛选
- ✅ **关键词搜索**：根据文件名、描述等关键词搜索图片
- ✅ **标签筛选**：通过标签筛选图片，支持多标签组合
- ✅ **时间筛选**：按拍摄时间或上传时间范围筛选
- ✅ **分辨率筛选**：按图片分辨率筛选
- ✅ **分页加载**：支持分页浏览，可调整每页数量

### 6. 图片编辑功能
- ✅ **图片裁剪**：使用 Cropper.js 进行图片裁剪
- ✅ **色调调整**：调整图片的亮度、饱和度、对比度
- ✅ **实时预览**：编辑操作实时预览效果
- ✅ **保存编辑**：编辑后的图片可保存为新版本

### 7. 移动端适配
- ✅ **响应式设计**：适配不同屏幕尺寸
- ✅ **移动端优化**：针对手机浏览器优化的交互体验
- ✅ **触摸支持**：支持触摸手势操作

### 8. 数据安全
- ✅ **密码加密**：使用 bcrypt 加密存储用户密码
- ✅ **文件验证**：上传文件类型和大小验证
- ✅ **权限控制**：用户只能管理自己的图片
- ✅ **数据持久化**：Docker 部署时数据自动持久化

## 项目结构

```
BS/
├── back/                          # 后端项目
│   ├── config/                    # 配置文件
│   │   ├── database.js            # 数据库连接配置
│   │   └── init.sql               # 数据库初始化脚本（已废弃，使用 mysql/init.sql）
│   ├── middleware/                # 中间件
│   │   ├── auth.js                # JWT 认证中间件
│   │   └── upload.js              # 文件上传配置
│   ├── routes/                    # 路由
│   │   ├── auth.js                # 用户认证接口
│   │   ├── images.js              # 图片管理接口
│   │   └── tags.js                # 标签管理接口
│   ├── utils/                     # 工具函数
│   │   └── imageProcessor.js      # 图片处理工具
│   ├── uploads/                   # 图片存储目录
│   ├── app.js                     # Express 应用主文件
│   ├── package.json               # 后端依赖配置
│   ├── Dockerfile                 # 后端 Docker 镜像配置
│   ├── .dockerignore              # Docker 构建忽略文件
│   └── bin/
│       └── www                    # 启动脚本
│
├── front/                         # 前端项目
│   ├── src/
│   │   ├── assets/                # 静态资源
│   │   ├── components/            # 公共组件
│   │   │   ├── MainLayout.vue     # 主布局组件
│   │   │   ├── ImageList.vue      # 图片列表组件
│   │   │   ├── ImageUploader.vue  # 图片上传组件
│   │   │   ├── ImageDetail.vue    # 图片详情组件
│   │   │   ├── ImageCarousel.vue  # 图片轮播组件
│   │   │   ├── CropperTool.vue    # 图片裁剪工具
│   │   │   └── TagSelector.vue    # 标签选择器
│   │   ├── stores/                # Pinia 状态管理
│   │   │   ├── user.js            # 用户状态
│   │   │   ├── images.js          # 图片状态
│   │   │   ├── tags.js            # 标签状态
│   │   │   └── image.js           # 单个图片状态
│   │   ├── utils/                 # 工具函数
│   │   │   ├── api.js             # API 请求封装
│   │   │   └── request.js         # Axios 封装
│   │   ├── views/                 # 页面组件
│   │   │   ├── LoginView.vue      # 登录页
│   │   │   ├── RegisterView.vue   # 注册页
│   │   │   ├── HomeView.vue       # 首页
│   │   │   ├── GalleryView.vue    # 相册页
│   │   │   ├── UploadView.vue     # 上传页
│   │   │   ├── ImageDetailView.vue # 图片详情页
│   │   │   └── ImageEditView.vue  # 图片编辑页
│   │   ├── router/                # 路由配置
│   │   │   └── index.js           # 路由定义
│   │   ├── App.vue                # 根组件
│   │   └── main.js                # 入口文件
│   ├── public/                    # 公共静态资源
│   ├── package.json               # 前端依赖配置
│   ├── vite.config.js             # Vite 构建配置
│   ├── Dockerfile                 # 前端 Docker 镜像配置
│   ├── nginx.conf                 # Nginx 配置文件
│   └── .dockerignore              # Docker 构建忽略文件
│
├── mysql/                         # 数据库脚本
│   ├── init.sql                   # 数据库初始化脚本
│   └── fix_chinese_encoding.sql   # 中文编码修复脚本
│
├── docker-compose.yml             # Docker Compose 编排文件
├── .dockerignore                  # 根目录 Docker 忽略文件
├── .gitignore                     # Git 忽略文件
├── env.example                    # 环境变量示例文件
└── README.md                      # 项目说明文档
```

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