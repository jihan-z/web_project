const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'image_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  // 确保使用 utf8mb4 字符集和正确的排序规则
  collation: 'utf8mb4_unicode_ci',
  // 在每次连接时设置字符集
  connectionInitSql: "SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'"
};

const pool = mysql.createPool(dbConfig);

// 测试数据库连接
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = pool;

