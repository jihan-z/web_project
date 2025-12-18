import { defineStore } from 'pinia';
import request from '@/utils/request';

export const useImagesStore = defineStore('images', {
  state: () => ({
    images: [],
    currentImage: null,
    // 用于解决裁剪/调整后浏览器仍显示旧缩略图/旧原图的缓存问题
    // key: imageId, value: timestamp
    cacheBust: {},
    filters: {
      tags: [],
      keyword: '',
      startDate: null,
      endDate: null
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    }
  }),

  actions: {
    bustImageCache(id) {
      if (!id) return;
      this.cacheBust = { ...this.cacheBust, [String(id)]: Date.now() };
    },

    // 上传图片
    async uploadImage(file) {
      const formData = new FormData();
      formData.append('image', file);
      const response = await request.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    },

    // 批量上传图片
    async uploadImages(files) {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      const response = await request.post('/images/upload/batch', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    },

    // 获取图片列表
    async fetchImages(params = {}) {
      const queryParams = {
        page: this.pagination.page,
        limit: this.pagination.limit,
        ...this.filters,
        ...params
      };

      // 移除空值
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === null || queryParams[key] === '' || 
            (Array.isArray(queryParams[key]) && queryParams[key].length === 0)) {
          delete queryParams[key];
        }
      });

      // 处理标签数组
      if (queryParams.tags && Array.isArray(queryParams.tags)) {
        queryParams.tags = queryParams.tags.join(',');
      }

      const response = await request.get('/images', { params: queryParams });
      this.images = response.images;
      this.pagination = response.pagination;
      return response;
    },

    // 获取图片详情
    async fetchImageDetail(id) {
      const response = await request.get(`/images/${id}`);
      this.currentImage = response.image;
      return response.image;
    },

    // 更新图片信息
    async updateImage(id, data) {
      const response = await request.put(`/images/${id}`, data);
      return response;
    },

    // 裁剪图片
    async cropImage(id, cropData) {
      const response = await request.post(`/images/${id}/crop`, cropData);
      return response;
    },

    // 调整图片色调
    async adjustImage(id, adjustments) {
      const response = await request.post(`/images/${id}/adjust`, adjustments);
      return response;
    },

    // 删除图片
    async deleteImage(id) {
      const response = await request.delete(`/images/${id}`);
      return response;
    },

    // 批量删除图片
    async deleteImages(ids) {
      const response = await request.delete('/images/batch', {
        data: { imageIds: ids }
      });
      return response;
    },

    // 设置筛选条件
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
      this.pagination.page = 1; // 重置到第一页
    },

    // 重置筛选条件
    resetFilters() {
      this.filters = {
        tags: [],
        keyword: '',
        startDate: null,
        endDate: null
      };
      this.pagination.page = 1;
    },

    // 设置当前页
    setPage(page) {
      this.pagination.page = page;
    }
  }
});

