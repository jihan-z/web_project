// 数据库配置文件
const mysql = require('mysql2');

// 创建连接池
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'image_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 获取Promise版本的连接池
const promisePool = pool.promise();

module.exports = promisePool;