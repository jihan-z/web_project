<template>
  <el-container class="main-layout">
    <!-- 左侧导航栏 -->
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <el-icon :size="32"><Picture /></el-icon>
        <span>图片管理</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>

        <el-menu-item index="/gallery">
          <el-icon><Picture /></el-icon>
          <span>相册</span>
        </el-menu-item>

        <el-menu-item index="/upload">
          <el-icon><Upload /></el-icon>
          <span>上传图片</span>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <div class="user-info">
          <el-icon><User /></el-icon>
          <span>{{ userStore.userInfo?.username || '用户' }}</span>
        </div>
        <el-button type="danger" size="small" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </el-button>
      </div>
    </el-aside>

    <!-- 右侧主内容区 -->
    <el-container class="main-content">
      <el-header class="content-header">
        <div class="header-title">{{ pageTitle }}</div>
      </el-header>

      <el-main class="content-main">
        <slot></slot>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const activeMenu = computed(() => route.path);

const pageTitle = computed(() => {
  const titles = {
    '/': '首页',
    '/gallery': '相册浏览',
    '/upload': '上传图片',
    '/image': '图片详情'
  };
  
  for (const [path, title] of Object.entries(titles)) {
    if (route.path.startsWith(path)) {
      return title;
    }
  }
  return '图片管理系统';
});

const handleMenuSelect = (index) => {
  router.push(index);
};

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout();
    router.push('/login');
  });
};
</script>

<style scoped>
.main-layout {
  height: 100vh;
  width: 100vw;
}

.sidebar {
  background: #304156;
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-menu {
  flex: 1;
  border: none;
  background: transparent;
}

.sidebar-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.7);
}

.sidebar-menu .el-menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.sidebar-menu .el-menu-item.is-active {
  background: #409eff;
  color: #fff;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 14px;
}

.sidebar-footer .el-button {
  width: 100%;
}

.main-content {
  background: #f0f2f5;
}

.content-header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 60px;
}

.header-title {
  font-size: 20px;
  font-weight: 500;
  color: #333;
}

.content-main {
  padding: 24px;
  overflow-y: auto;
}
</style>

