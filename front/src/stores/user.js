import { defineStore } from 'pinia';
import request from '@/utils/request';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    // 用户注册
    async register(userData) {
      const response = await request.post('/auth/register', userData);
      return response;
    },

    // 用户登录
    async login(credentials) {
      const response = await request.post('/auth/login', credentials);
      this.token = response.token;
      this.userInfo = response.user;
      localStorage.setItem('token', response.token);
      return response;
    },

    // 获取用户信息
    async getUserInfo() {
      const response = await request.get('/auth/me');
      this.userInfo = response.user;
      return response.user;
    },

    // 退出登录
    logout() {
      this.token = '';
      this.userInfo = null;
      localStorage.removeItem('token');
    }
  }
});
