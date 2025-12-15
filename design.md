《BS体系软件设计》大程 
1 实验：图片管理网站 
1.1 实验目的 
任选Web 开发技术实现一个图片管理的网站 
1.2 实验要求 
需要实现的基本功能如下： 
1. 实现用户注册、登录功能，用户注册时需要填写必要的信息并验证，如用户名、密码要
求在6字节以上，email的格式验证，并保证用户名和email在系统中唯一，用户登录后
可以进行以下操作。 
2. 通过PC或手机浏览器将照片或其他类型的图片上传到网站进行存储。 
3. 能够通过照片的exif信息自动创建图片分类标签及其他辅助信息，如时间、地点、图片
分辨率等。 
4. 可以给图片增加自定义分类标签，方便检索。 
5. 生产缩略图方便后续显示。 
6. 图片信息保存在数据库中，方便后续查询。 
7. 提供查询界面能根据各种条件查找图片。 
8. 提供友好的展示界面，如选择一定的图片进行轮播显示等 
9. 对选定的图片提供简单的编辑功能，如裁剪、修改色调等 
10. 提供删除功能 
11. 样式适配手机，开发手机 App 或能够在手机浏览器/微信等应用内置的浏览器中友好显
示。 

1. 项目概述 
本项目旨在开发一个功能完备、用户体验良好的图片管理网站。用户可以通过Web浏览器进行注册登录，上传、管理、编辑和检索个人图片。系统将利用图片的EXIF信息自动分类，并支持用户自定义标签，最终实现一个集存储、管理、展示于一体的个人图片中心。
1. 技术架构 
本项目采用B/S架构，前端使用Vue 3 + JavaScript，后端采用Node.js。 
前端: 
框架: Vue 3+ JavaScript。
UI库: Element Plus，用于快速构建美观的表单、按钮、对话框等组件。
状态管理: Pinia，用于集中管理应用状态，如用户登录态、当前选中图片、搜索条件等。
路由: Vue Router，实现页面间的导航。
移动端适配: 使用CSS媒体查询和Flex/Grid布局，确保在手机浏览器中流畅显示。
图片处理库: cropperjs 用于前端交互式裁剪，exif-js 用于在前端读取部分EXIF信息。
后端: 
语言/框架: Node.js。
数据库: MySQL。
图片存储: 本地文件系统。
图片处理库: sharp，用于生成缩略图、读取EXIF信息、执行后端裁剪和色调调整。
部署: 
容器化: 使用 Docker 和 Docker Compose。将前端、后端、数据库打包成独立容器，通过Compose文件一键启动。
1. 核心功能模块设计 
3.1 用户管理模块 
注册:
表单字段：用户名、密码、确认密码、邮箱。
验证规则：
用户名：6-20字符，仅允许字母、数字、下划线。
密码：至少6位，包含大小写字母和数字。
邮箱：正则表达式验证。
唯一性：检查用户名和邮箱在数据库中是否已存在。
数据存储：密码使用bcrypt加密后存入数据库。
登录:
输入用户名/邮箱和密码。
验证成功后，颁发JWT Token，用于后续请求的身份认证。
登录态管理：前端使用Pinia存储Token，每次请求携带至后端验证。
3.2 图片上传与存储模块
上传:
支持拖拽上传和文件选择器上传。
支持常见图片格式：JPG, PNG, GIF, WebP等。
限制单文件大小。
后端接收文件，保存到指定目录，并记录原始文件名。
EXIF信息提取:使用Sharp库读取图片EXIF数据。
提取关键信息：拍摄时间、GPS坐标、相机型号、分辨率等。将这些信息存入数据库的图片元数据表。
缩略图生成:上传后，自动为每张图片生成不同尺寸的缩略图。缩略图路径也存入数据库，供前端展示列表时使用。
3.3 图片分类与标签管理模块 
自动标签:
基于EXIF信息自动创建标签：时间、地点、分辨率等。
自定义标签:
用户可以为任意图片手动添加、删除、编辑标签。
标签支持多选和搜索联想。
标签与图片是多对多关系，通过中间表关联。
3.4 图片查询与展示模块 
查询界面:
提供多种筛选条件：
1.按标签（自动标签+自定义标签）
2.按上传时间范围
3.按拍摄时间（EXIF）
4.按关键词（图片描述或标签名模糊匹配）
5.按分辨率
支持组合查询。
展示界面:
列表视图：以网格或瀑布流形式展示图片缩略图。
详情视图：点击缩略图进入详情页，展示原图、EXIF信息、所有标签、操作按钮。
轮播展示: 在首页或特定相册页，提供图片轮播功能，可配置播放速度、切换方式。
3.5 图片编辑与删除模块 
简单编辑:
1.裁剪: 使用cropperjs在前端提供交互式裁剪框，用户选择区域后，将裁剪参数（左上角坐标、宽度、高度）发送给后端，后端用Sharp执行裁剪并保存新图片。
2.色调调整: 提供滑块调整亮度、对比度、饱和度等，前端预览，后端处理保存。
删除功能:
1.用户可选择一张或多张图片进行删除。
2.删除操作需二次确认。
3.删除时，同时从文件系统和数据库中移除相关记录。
1. 数据库设计 
使用MySQL，主要表结构如下： 
用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    password_hash VARCHAR(255) NOT NULL COMMENT 'bcrypt 加密后的密码',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

图片表
CREATE TABLE images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '所属用户ID',
    original_filename VARCHAR(255) NOT NULL COMMENT '原始文件名',
    stored_path VARCHAR(500) NOT NULL COMMENT '存储路径（如 /uploads/user1/uuid.jpg）',
    width INT COMMENT '图片宽度（像素）',
    height INT COMMENT '图片高度（像素）',
    taken_time DATETIME NULL COMMENT 'EXIF 拍摄时间（可能为空）',
    gps_latitude DECIMAL(10,8) NULL COMMENT 'GPS 纬度',
    gps_longitude DECIMAL(11,8) NULL COMMENT 'GPS 经度',
    camera_model VARCHAR(100) NULL COMMENT '相机型号',
    description TEXT COMMENT '用户描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL COMMENT '软删除时间，NULL 表示未删除',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_deleted (user_id, deleted_at),
    INDEX idx_taken_time (taken_time),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
标签表
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE COMMENT '标签名',
    type ENUM('auto', 'custom') NOT NULL DEFAULT 'custom' COMMENT '标签类型',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

图片-标签关联表
CREATE TABLE image_tags (
    image_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (image_id, tag_id),
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
数据库ER图：
 
5. 函数接口设计 
5.1 用户认证接口 
用户注册接口（POST /api/auth/register）：处理用户注册请求，校验字段合法性与唯一性，加密存储密码。 
用户登录接口（POST /api/auth/login）：验证用户名/邮箱与密码，成功后签发 JWT 令牌。 
获取当前用户信息接口（GET /api/auth/me）：根据令牌返回当前登录用户的完整资料。
5.2 图片上传与元数据处理接口 
单图上传接口（POST /api/images/upload）：接收并保存用户上传的图片，提取 EXIF 元数据，生成缩略图，存入数据库。 
批量上传接口（POST /api/images/upload/batch）：支持一次上传多张图片，逐张处理并记录元数据。
5.3 图片查询与展示接口 
分页图片列表查询接口（GET /api/images）：按用户 ID 查询图片，支持按标签、拍摄/上传时间、分辨率、关键词等条件组合筛选。 
图片详情查询接口（GET /api/images/{id}）：根据图片 ID 返回其完整信息，包括原图路径、EXIF、标签和描述。 
标签搜索联想接口（GET /api/tags/suggest）：根据用户输入的关键词，返回匹配的自动标签与自定义标签，用于前端搜索提示。
5.4 图片编辑接口 
图片裁剪接口（POST /api/images/{id}/crop）：根据前端传入的裁剪区域参数，对指定图片执行裁剪操作并保存新版本。 
图片色调调整接口（POST /api/images/{id}/adjust）：根据亮度、对比度、饱和度等参数调整图片，并持久化处理结果。
5.5 图片管理接口 
更新图片信息接口（PUT /api/images/{id}）：修改图片的描述或关联的自定义标签。 
删除单张图片接口（DELETE /api/images/{id}）：删除指定图片及其文件与数据库记录。 
批量删除图片接口（DELETE /api/images/batch）：根据图片 ID 列表批量删除多张图片及相关资源。
5.6 标签管理接口 
获取用户全部标签接口（GET /api/tags）：返回当前用户拥有的所有自动标签与自定义标签。 
创建自定义标签接口（POST /api/tags）：为当前用户新建一个自定义标签。 
删除自定义标签接口（DELETE /api/tags/{id}）：删除指定的自定义标签及其与图片的所有关联关系。
6. 预期成果 
一个功能完整的图片管理网站，可通过浏览器访问。
一份设计文档。
包含完整代码的Git仓库，包含提交历史。
一套Docker Compose配置文件，可一键部署。
一段功能演示视频。
一份包含封面、设计文档、使用手册、实验报告等内容的最终提交包。
