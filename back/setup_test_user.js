// setup_test_user.js
const db = require('./config/db');
const bcrypt = require('bcrypt');

async function setupTestUser() {
  try {
    console.log('正在设置测试用户...');
    
    // 检查是否已存在testuser
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE username = ?', 
      ['testuser']
    );
    
    if (existingUsers.length > 0) {
      console.log('删除已存在的测试用户...');
      await db.execute('DELETE FROM users WHERE username = ?', ['testuser']);
    }
    
    // 创建新用户
    const username = 'testuser';
    const email = 'test@example.com';
    const password = 'testpassword123';
    
    // 密码加密
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // 插入新用户
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );
    
    console.log('测试用户创建成功!');
    console.log('用户ID:', result.insertId);
    console.log('用户名:', username);
    console.log('邮箱:', email);
    console.log('密码:', password);
    
    await db.end();
  } catch (error) {
    console.error('设置测试用户过程中出现错误:');
    console.error(error);
  }
}

setupTestUser();