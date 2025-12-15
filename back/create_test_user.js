// create_test_user.js
const axios = require('axios');

async function createTestUser() {
  try {
    console.log('正在创建测试用户...');
    
    // 注册新用户
    const registerResponse = await axios.post('http://localhost:3000/api/auth/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    console.log('用户注册成功!');
    console.log('响应数据:', JSON.stringify(registerResponse.data, null, 2));
    
    // 登录获取token
    console.log('\n正在登录获取认证令牌...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'testuser',
      password: 'testpassword123'
    });
    
    const token = loginResponse.data.token;
    console.log('认证令牌获取成功:', token.substring(0, 20) + '...');
    
    // 获取用户信息
    console.log('\n正在获取用户信息...');
    const userResponse = await axios.get('http://localhost:3000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('用户信息获取成功:');
    console.log('用户数据:', JSON.stringify(userResponse.data, null, 2));
    
    console.log('\n测试用户创建和验证完成!');
    console.log('请使用以下信息进行图片上传测试:');
    console.log('- 用户名: testuser');
    console.log('- 密码: testpassword123');
    console.log('- Token:', token);
    
  } catch (error) {
    console.error('创建测试用户过程中出现错误:');
    if (error.response) {
      console.error('错误响应:', error.response.status, error.response.data);
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

createTestUser();