# 图片管理系统 - 前端

基于 Vue 3 + Element Plus 的现代化图片管理系统前端应用。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Element Plus** - Vue 3 UI 组件库
- **Pinia** - Vue 状态管理
- **Vue Router** - 路由管理
- **Axios** - HTTP 客户端
- **Cropper.js** - 图片裁剪
- **EXIF.js** - EXIF 信息读取
- **Vite** - 构建工具

## 安装依赖

\`\`\`bash
npm install
\`\`\`

## 环境配置

创建 `.env` 文件（可选）：

\`\`\`env
VITE_API_BASE_URL=http://localhost:3000/api
\`\`\`

## 开发

### 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 http://localhost:5173

### 构建生产版本

\`\`\`bash
npm run build
\`\`\`

构建产物在 `dist/` 目录

### 预览生产构建

\`\`\`bash
npm run preview
\`\`\`

## 项目结构

\`\`\`
front/
├── public/                 # 静态资源
│   └── favicon.ico
├── src/
│   ├── assets/            # 资源文件
│   │   ├── base.css
│   │   ├── logo.svg
│   │   └── main.css
│   ├── components/        # 公共组件
│   │   └── LayoutHeader.vue    # 头部导航组件
│   ├── router/            # 路由配置
│   │   └── index.js
│   ├── stores/            # Pinia 状态管理
│   │   ├── user.js        # 用户状态
│   │   ├── images.js      # 图片状态
│   │   └── tags.js        # 标签状态
│   ├── utils/             # 工具函数
│   │   └── request.js     # Axios 封装
│   ├── views/             # 页面组件
│   │   ├── LoginView.vue          # 登录页
│   │   ├── RegisterView.vue       # 注册页
│   │   ├── HomeView.vue           # 首页
│   │   ├── GalleryView.vue        # 相册页
│   │   ├── UploadView.vue         # 上传页
│   │   └── ImageDetailView.vue    # 图片详情页
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── index.html             # HTML 模板
├── package.json           # 项目依赖
├── vite.config.js         # Vite 配置
└── jsconfig.json          # JS 配置
\`\`\`

## 主要功能

### 1. 用户认证
- **登录页** (`/login`)
  - 支持用户名/邮箱登录
  - 密码长度验证
  - JWT Token 存储

- **注册页** (`/register`)
  - 用户名格式验证（6-20位，字母数字下划线）
  - 邮箱格式验证
  - 密码确认

### 2. 首页
- **快速入口** - 上传和浏览按钮
- **统计数据** - 图片总数、标签数量、最近上传
- **最近图片** - 显示最新上传的图片

### 3. 图片上传
- **拖拽上传** - 支持拖拽文件到上传区域
- **多图上传** - 一次选择多张图片上传
- **格式验证** - 支持 JPG、PNG、GIF、WebP
- **大小限制** - 单个文件最大 10MB
- **上传预览** - 实时显示上传进度和结果

### 4. 相册浏览
- **网格展示** - 响应式瀑布流布局
- **搜索功能** - 关键词搜索图片
- **标签筛选** - 多标签组合筛选
- **日期筛选** - 按日期范围筛选
- **批量操作** - 支持批量选择和删除
- **分页加载** - 支持分页和每页数量调整

### 5. 图片详情
- **信息展示**
  - 文件名、尺寸、上传时间
  - EXIF 信息（拍摄时间、相机型号、GPS 位置）
  - 自动标签和自定义标签

- **编辑功能**
  - 添加/修改描述
  - 添加/删除自定义标签
  - 图片裁剪（Cropper.js）
  - 色调调整（亮度、饱和度、对比度）

- **操作功能**
  - 删除图片（二次确认）
  - 返回相册

### 6. 移动端适配
- 响应式布局设计
- 移动端优化的交互
- 触摸手势支持
- 自适应导航栏

## 状态管理

### User Store (用户状态)
\`\`\`javascript
- token          // JWT Token
- userInfo       // 用户信息
- isLoggedIn     // 登录状态
- login()        // 登录
- register()     // 注册
- logout()       // 退出登录
- getUserInfo()  // 获取用户信息
\`\`\`

### Images Store (图片状态)
\`\`\`javascript
- images         // 图片列表
- currentImage   // 当前图片
- filters        // 筛选条件
- pagination     // 分页信息
- fetchImages()  // 获取图片列表
- uploadImage()  // 上传图片
- updateImage()  // 更新图片
- deleteImage()  // 删除图片
- cropImage()    // 裁剪图片
- adjustImage()  // 调整色调
\`\`\`

### Tags Store (标签状态)
\`\`\`javascript
- tags           // 所有标签
- suggestions    // 搜索建议
- autoTags       // 自动标签
- customTags     // 自定义标签
- fetchTags()    // 获取标签
- searchTags()   // 搜索标签
- createTag()    // 创建标签
- deleteTag()    // 删除标签
\`\`\`

## 路由配置

\`\`\`javascript
/               # 首页（需要登录）
/login          # 登录页
/register       # 注册页
/gallery        # 相册页（需要登录）
/upload         # 上传页（需要登录）
/image/:id      # 图片详情页（需要登录）
\`\`\`

## 样式规范

- 使用 Element Plus 主题色
- 响应式断点：768px（移动端）
- 统一的圆角：8px
- 统一的阴影：0 2px 8px rgba(0, 0, 0, 0.06)
- 主色调：#667eea

## 开发说明

### 添加新页面

1. 在 `src/views/` 创建新的 Vue 组件
2. 在 `src/router/index.js` 添加路由配置
3. 根据需要在导航栏添加入口

### 添加新的 API 请求

1. 在相应的 Store 中添加 action
2. 使用 `src/utils/request.js` 封装的 axios 实例
3. 处理响应和错误

### 样式开发

- 优先使用 Element Plus 组件
- 使用 scoped 样式避免污染
- 移动端适配使用媒体查询

## 注意事项

1. **路由守卫** - 未登录用户会被重定向到登录页
2. **Token 管理** - Token 存储在 localStorage
3. **请求拦截** - 自动在请求头添加 Authorization
4. **错误处理** - 统一的错误提示
5. **图片路径** - 需要拼接后端 URL

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)
- 移动端浏览器

## 开发工具

推荐使用以下工具提升开发体验：

- **VS Code** + Volar 插件
- **Vue DevTools** - Vue 调试工具
- **Postman** - API 测试

## 故障排查

### 无法连接后端
- 检查后端服务是否启动
- 验证 API 地址配置
- 检查 CORS 设置

### 图片显示不出来
- 检查图片 URL 是否正确
- 验证后端静态文件服务
- 检查网络请求

### Token 失效
- 检查 Token 是否过期
- 清除 localStorage 重新登录
- 验证后端 JWT 配置

## 许可证

MIT License
