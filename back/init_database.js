const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// 数据库配置（不指定数据库，用于创建数据库）
const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '123456',
  charset: 'utf8mb4',
  multipleStatements: true
};

async function initDatabase() {
  let connection;
  
  try {
    console.log('🚀 开始初始化数据库...\n');
    
    // 连接 MySQL（不指定数据库）
    console.log('正在连接 MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ MySQL 连接成功\n');

    // 读取 SQL 文件
    console.log('正在读取 init.sql...');
    const sqlFile = path.join(__dirname, 'config', 'init.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log('✅ SQL 文件读取成功\n');

    // 执行 SQL
    console.log('正在创建数据库和表...');
    await connection.query(sql);
    console.log('✅ 数据库和表创建成功\n');

    // 切换到新数据库
    await connection.changeUser({ database: 'image_manager' });
    console.log('✅ 已切换到 image_manager 数据库\n');

    // 创建测试用户
    console.log('正在创建测试用户...');
    const username = 'admin';
    const email = 'admin@example.com';
    const password = '123456';
    
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const [result] = await connection.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );
    console.log(`✅ 测试用户创建成功，ID: ${result.insertId}\n`);

    // 显示表结构
    console.log('📋 数据库表结构：\n');
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log('已创建的表：');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('✅ 数据库初始化完成！');
    console.log('='.repeat(50));
    console.log('\n📝 登录信息：');
    console.log('   用户名: admin');
    console.log('   邮箱: admin@example.com');
    console.log('   密码: 123456');
    console.log('\n🚀 现在可以启动服务了：');
    console.log('   cd back');
    console.log('   npm start');
    console.log('\n   前端：http://localhost:5173');
    console.log('   后端：http://localhost:3000');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n请检查：');
      console.error('  1. MySQL 服务是否启动');
      console.error('  2. 用户名和密码是否正确');
      console.error('  3. 当前脚本中的密码是否与你的 MySQL root 密码一致');
    } else if (error.code === 'ENOENT') {
      console.error('\n找不到 init.sql 文件！');
      console.error('请确保文件位置：back/config/init.sql');
    } else if (error.code === 'ER_DUP_ENTRY') {
      console.error('\n用户已存在，跳过创建');
    }
    
    console.error('\n完整错误：', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

// 运行初始化
initDatabase();

