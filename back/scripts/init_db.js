// 数据库初始化脚本
const mysql = require('mysql2');

// 先创建连接（不指定数据库）
const initConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456'
});

// 创建数据库连接池
const db = require('../config/db');

async function initDatabase() {
  try {
    // 创建数据库
    await new Promise((resolve, reject) => {
      initConnection.query('CREATE DATABASE IF NOT EXISTS image_manager', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('数据库创建成功');
    
    // 创建用户表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
        email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
        password_hash VARCHAR(255) NOT NULL COMMENT 'bcrypt 加密后的密码',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    console.log('用户表创建成功');

    // 创建图片表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL COMMENT '所属用户ID',
        original_filename VARCHAR(255) NOT NULL COMMENT '原始文件名',
        stored_path VARCHAR(500) NOT NULL COMMENT '存储路径（如 /uploads/user1/uuid.jpg）',
        thumb_path VARCHAR(500) COMMENT '缩略图路径',
        file_size BIGINT COMMENT '文件大小（字节）',
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    console.log('图片表创建成功');

    // 创建标签表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tags (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE COMMENT '标签名',
        type ENUM('auto', 'custom') NOT NULL DEFAULT 'custom' COMMENT '标签类型',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    console.log('标签表创建成功');

    // 创建图片-标签关联表
    await db.execute(`
      CREATE TABLE IF NOT EXISTS image_tags (
        image_id INT NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (image_id, tag_id),
        FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        INDEX idx_tag_id (tag_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    
    console.log('图片-标签关联表创建成功');
    console.log('所有数据库表创建完成！');
    
    // 关闭连接
    initConnection.end();
    // 关闭连接池
    await db.end();
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
}

// 执行初始化
initDatabase();