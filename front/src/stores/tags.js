import { defineStore } from 'pinia';
import request from '@/utils/request';

export const useTagsStore = defineStore('tags', {
  state: () => ({
    tags: [],
    suggestions: []
  }),

  getters: {
    autoTags: (state) => state.tags.filter(tag => tag.type === 'auto'),
    customTags: (state) => state.tags.filter(tag => tag.type === 'custom')
  },

  actions: {
    // 获取所有标签
    async fetchTags() {
      const response = await request.get('/tags');
      this.tags = response.tags;
      return response.tags;
    },

    // 标签搜索建议
    async searchTags(keyword) {
      if (!keyword) {
        this.suggestions = [];
        return [];
      }
      const response = await request.get('/tags/suggest', {
        params: { keyword }
      });
      this.suggestions = response.suggestions;
      return response.suggestions;
    },

    // 创建标签
    async createTag(name) {
      const response = await request.post('/tags', { name });
      await this.fetchTags(); // 刷新标签列表
      return response.tag;
    },

    // 删除标签
    async deleteTag(id) {
      const response = await request.delete(`/tags/${id}`);
      await this.fetchTags(); // 刷新标签列表
      return response;
    }
  }
});

