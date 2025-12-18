-- 修复数据库表结构
USE image_manager;

-- 检查并添加 thumbnail_path 字段
ALTER TABLE images 
ADD COLUMN IF NOT EXISTS thumbnail_path VARCHAR(500) COMMENT '缩略图路径' 
AFTER stored_path;

-- 显示表结构确认
DESCRIBE images;

SELECT '✅ 数据库表结构修复完成！' AS result;

