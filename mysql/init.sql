-- 创建数据库
CREATE DATABASE IF NOT EXISTS image_manager DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE image_manager;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    password_hash VARCHAR(255) NOT NULL COMMENT 'bcrypt 加密后的密码',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 图片表
CREATE TABLE IF NOT EXISTS images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '所属用户ID',
    original_filename VARCHAR(255) NOT NULL COMMENT '原始文件名',
    stored_path VARCHAR(500) NOT NULL COMMENT '存储路径',
    thumbnail_path VARCHAR(500) COMMENT '缩略图路径',
    width INT COMMENT '图片宽度（像素）',
    height INT COMMENT '图片高度（像素）',
    taken_time DATETIME NULL COMMENT 'EXIF 拍摄时间',
    gps_latitude DECIMAL(10,8) NULL COMMENT 'GPS 纬度',
    gps_longitude DECIMAL(11,8) NULL COMMENT 'GPS 经度',
    camera_model VARCHAR(100) NULL COMMENT '相机型号',
    description TEXT COMMENT '用户描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL COMMENT '软删除时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_deleted (user_id, deleted_at),
    INDEX idx_taken_time (taken_time),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE COMMENT '标签名',
    type ENUM('auto', 'custom') NOT NULL DEFAULT 'custom' COMMENT '标签类型',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 图片-标签关联表
CREATE TABLE IF NOT EXISTS image_tags (
    image_id INT NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (image_id, tag_id),
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

