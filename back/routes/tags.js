const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 获取用户全部标签
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    
    // 查询用户相关的所有标签（包括自动标签和自定义标签）
    const [tags] = await db.execute(
      `SELECT DISTINCT t.id, t.name, t.type, t.created_at
       FROM tags t
       JOIN image_tags it ON t.id = it.tag_id
       JOIN images i ON it.image_id = i.id
       WHERE i.user_id = ?
       ORDER BY t.type, t.name`,
      [userId]
    );
    
    res.json({ tags });
  } catch (error) {
    console.error('查询标签错误:', error);
    res.status(500).json({ error: '查询标签失败' });
  }
});

// 标签搜索联想
router.get('/suggest', async (req, res) => {
  try {
    const keyword = req.query.keyword;
    
    if (!keyword) {
      return res.json({ tags: [] });
    }
    
    // 搜索匹配的标签
    const [tags] = await db.execute(
      `SELECT id, name, type
       FROM tags
       WHERE name LIKE ?
       ORDER BY type, name
       LIMIT 10`,
      [`%${keyword}%`]
    );
    
    res.json({ tags });
  } catch (error) {
    console.error('标签搜索错误:', error);
    res.status(500).json({ error: '标签搜索失败' });
  }
});

// 创建自定义标签
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: '标签名不能为空' });
    }
    
    // 插入新标签
    const [result] = await db.execute(
      'INSERT IGNORE INTO tags (name, type) VALUES (?, ?)',
      [name, 'custom']
    );
    
    res.status(201).json({
      message: '标签创建成功',
      tag: { id: result.insertId, name, type: 'custom' }
    });
  } catch (error) {
    console.error('创建标签错误:', error);
    res.status(500).json({ error: '创建标签失败' });
  }
});

// 删除自定义标签
router.delete('/:id', async (req, res) => {
  try {
    const tagId = req.params.id;
    const userId = req.userId;
    
    // 检查标签是否存在且为自定义标签
    const [tags] = await db.execute(
      'SELECT id, type FROM tags WHERE id = ?',
      [tagId]
    );
    
    if (tags.length === 0) {
      return res.status(404).json({ error: '标签不存在' });
    }
    
    if (tags[0].type !== 'custom') {
      return res.status(400).json({ error: '只能删除自定义标签' });
    }
    
    // 检查是否有图片关联了这个标签
    const [associatedImages] = await db.execute(
      `SELECT COUNT(*) as count FROM image_tags it
       JOIN images i ON it.image_id = i.id
       WHERE it.tag_id = ? AND i.user_id = ?`,
      [tagId, userId]
    );
    
    if (associatedImages[0].count > 0) {
      return res.status(400).json({ error: '无法删除有关联图片的标签，请先解除关联' });
    }
    
    // 删除标签
    await db.execute('DELETE FROM tags WHERE id = ?', [tagId]);
    
    res.json({ message: '标签删除成功' });
  } catch (error) {
    console.error('删除标签错误:', error);
    res.status(500).json({ error: '删除标签失败' });
  }
});

// 为图片添加标签
router.post('/assign/:imageId/:tagId', async (req, res) => {
  try {
    const { imageId, tagId } = req.params;
    const userId = req.userId;
    
    // 检查图片是否存在且属于当前用户
    const [images] = await db.execute(
      'SELECT id FROM images WHERE id = ? AND user_id = ?',
      [imageId, userId]
    );
    
    if (images.length === 0) {
      return res.status(404).json({ error: '图片不存在' });
    }
    
    // 检查标签是否存在
    const [tags] = await db.execute(
      'SELECT id, name, type FROM tags WHERE id = ?',
      [tagId]
    );
    
    if (tags.length === 0) {
      return res.status(404).json({ error: '标签不存在' });
    }
    
    // 检查是否已经关联
    const [existing] = await db.execute(
      'SELECT image_id, tag_id FROM image_tags WHERE image_id = ? AND tag_id = ?',
      [imageId, tagId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: '标签已经关联到该图片' });
    }
    
    // 关联标签到图片
    await db.execute(
      'INSERT INTO image_tags (image_id, tag_id) VALUES (?, ?)',
      [imageId, tagId]
    );
    
    res.json({ 
      message: '标签关联成功',
      tag: tags[0]
    });
  } catch (error) {
    console.error('关联标签错误:', error);
    res.status(500).json({ error: '关联标签失败' });
  }
});

// 从图片移除标签
router.delete('/unassign/:imageId/:tagId', async (req, res) => {
  try {
    const { imageId, tagId } = req.params;
    const userId = req.userId;
    
    // 检查图片是否存在且属于当前用户
    const [images] = await db.execute(
      'SELECT id FROM images WHERE id = ? AND user_id = ?',
      [imageId, userId]
    );
    
    if (images.length === 0) {
      return res.status(404).json({ error: '图片不存在' });
    }
    
    // 检查标签是否存在
    const [tags] = await db.execute(
      'SELECT id FROM tags WHERE id = ?',
      [tagId]
    );
    
    if (tags.length === 0) {
      return res.status(404).json({ error: '标签不存在' });
    }
    
    // 移除标签关联
    const [result] = await db.execute(
      'DELETE FROM image_tags WHERE image_id = ? AND tag_id = ?',
      [imageId, tagId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ error: '标签未关联到该图片' });
    }
    
    res.json({ message: '标签移除成功' });
  } catch (error) {
    console.error('移除标签错误:', error);
    res.status(500).json({ error: '移除标签失败' });
  }
});

module.exports = router;