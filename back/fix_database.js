const mysql = require('mysql2/promise');

const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'image_manager',
  charset: 'utf8mb4'
};

async function fixDatabase() {
  let connection;
  
  try {
    console.log('正在连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // 检查表结构
    console.log('检查 images 表结构...');
    const [columns] = await connection.query(
      `SHOW COLUMNS FROM images WHERE Field = 'thumbnail_path'`
    );

    if (columns.length === 0) {
      console.log('⚠️  缺少 thumbnail_path 字段，正在添加...');
      
      await connection.query(`
        ALTER TABLE images 
        ADD COLUMN thumbnail_path VARCHAR(500) COMMENT '缩略图路径' 
        AFTER stored_path
      `);
      
      console.log('✅ thumbnail_path 字段添加成功！');
    } else {
      console.log('✅ thumbnail_path 字段已存在');
    }

    // 显示完整表结构
    console.log('\n当前 images 表结构：');
    const [structure] = await connection.query('DESCRIBE images');
    console.table(structure);

    console.log('\n✅ 数据库修复完成！现在可以重启后端服务了。');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   数据库连接失败，请检查用户名和密码');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   数据库不存在');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

fixDatabase();

