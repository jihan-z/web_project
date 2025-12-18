import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  // 确保正确处理 UTF-8 编码
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8'
  },
  // 响应类型
  responseType: 'json',
  // 请求数据类型
  transformRequest: [function (data, headers) {
    // 确保中文正确编码
    if (data && typeof data === 'object') {
      headers['Content-Type'] = 'application/json; charset=utf-8';
      return JSON.stringify(data);
    }
    return data;
  }],
  // 响应数据处理
  transformResponse: [function (data) {
    // 确保响应数据正确解码
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    }
    return data;
  }]
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    // 不再手动设置 Accept-Charset，避免浏览器警告；
    // 浏览器会自动使用 UTF-8 发送 JSON 请求
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || '请求失败';
    ElMessage.error(message);
    
    // 401 未授权，跳转登录
    if (error.response?.status === 401) {
      const userStore = useUserStore();
      userStore.logout();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default request;

