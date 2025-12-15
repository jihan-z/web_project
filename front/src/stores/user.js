import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo')) || null)
  
  // 计算属性：是否已登录
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  
  // 设置用户信息
  function setUserInfo(data) {
    token.value = data.token
    userInfo.value = data.userInfo
    
    // 保存到localStorage
    localStorage.setItem('token', data.token)
    localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
  }
  
  // 清除用户信息
  function clearUserInfo() {
    token.value = ''
    userInfo.value = null
    
    // 从localStorage清除
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }
  
  // 更新用户信息
  function updateUserInfo(data) {
    userInfo.value = { ...userInfo.value, ...data }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }
  
  return { 
    token, 
    userInfo, 
    isLoggedIn,
    setUserInfo, 
    clearUserInfo,
    updateUserInfo
  }
})