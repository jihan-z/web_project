const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// 获取用户的所有标签
router.get('/', authenticateToken, async (req, res) => {
  try {
    // 获取用户图片使用的所有标签
    const [tags] = await db.query(
      `SELECT DISTINCT t.id, t.name, t.type, COUNT(it.image_id) as usage_count
       FROM tags t
       JOIN image_tags it ON t.id = it.tag_id
       JOIN images i ON it.image_id = i.id
       WHERE i.user_id = ? AND i.deleted_at IS NULL
       GROUP BY t.id, t.name, t.type
       ORDER BY t.type, t.name`,
      [req.user.id]
    );

    res.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// 标签搜索联想
router.get('/suggest', authenticateToken, async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    // 搜索匹配的标签
    const [tags] = await db.query(
      `SELECT DISTINCT t.id, t.name, t.type
       FROM tags t
       JOIN image_tags it ON t.id = it.tag_id
       JOIN images i ON it.image_id = i.id
       WHERE i.user_id = ? AND i.deleted_at IS NULL
       AND t.name LIKE ?
       LIMIT 10`,
      [req.user.id, `%${keyword}%`]
    );

    res.json({ suggestions: tags });
  } catch (error) {
    console.error('Tag suggest error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// 创建自定义标签
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    // 尝试插入标签
    try {
      const [result] = await db.query(
        'INSERT INTO tags (name, type) VALUES (?, ?)',
        [name.trim(), 'custom']
      );

      res.status(201).json({
        message: 'Tag created successfully',
        tag: {
          id: result.insertId,
          name: name.trim(),
          type: 'custom'
        }
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        // 标签已存在，返回现有标签
        const [existingTags] = await db.query(
          'SELECT id, name, type FROM tags WHERE name = ?',
          [name.trim()]
        );
        
        res.json({
          message: 'Tag already exists',
          tag: existingTags[0]
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// 删除自定义标签
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const tagId = req.params.id;

    // 检查标签类型（只能删除自定义标签）
    const [tags] = await db.query(
      'SELECT id, type FROM tags WHERE id = ?',
      [tagId]
    );

    if (tags.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    if (tags[0].type !== 'custom') {
      return res.status(403).json({ error: 'Cannot delete auto-generated tags' });
    }

    // 删除标签（级联删除关联关系）
    await db.query('DELETE FROM tags WHERE id = ?', [tagId]);

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

module.exports = router;
