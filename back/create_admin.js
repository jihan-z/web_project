const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'image_manager',
  charset: 'utf8mb4'
};

async function createAdmin() {
  let connection;
  
  try {
    console.log('正在连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 加密密码
    const username = 'admin';
    const email = 'admin@example.com';
    const password = '123456';
    
    console.log('\n正在加密密码...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('✅ 密码加密完成');

    // 检查用户是否已存在
    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      console.log('\n⚠️  用户已存在，正在更新密码...');
      await connection.query(
        'UPDATE users SET password_hash = ?, email = ? WHERE username = ?',
        [passwordHash, email, username]
      );
      console.log('✅ 密码更新成功！');
    } else {
      console.log('\n正在创建新用户...');
      const [result] = await connection.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash]
      );
      console.log('✅ 用户创建成功！');
      console.log(`   用户ID: ${result.insertId}`);
    }

    console.log('\n📋 登录信息：');
    console.log('   用户名: admin');
    console.log('   邮箱: admin@example.com');
    console.log('   密码: 123456');
    console.log('\n✅ 现在可以使用这些信息登录了！');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   数据库连接失败，请检查用户名和密码');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   数据库不存在，请先创建 image_manager 数据库');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

// 运行脚本
createAdmin();

