<template>
  <el-container class="main-layout">
    <!-- 左侧导航栏（桌面端） -->
    <el-aside width="200px" class="sidebar" :class="{ 'sidebar-mobile-hidden': isMobile && !sidebarVisible }">
      <div class="logo">
        <el-icon :size="32"><Picture /></el-icon>
        <span class="logo-text">图片管理</span>
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

    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && sidebarVisible" 
      class="sidebar-overlay"
      @click="sidebarVisible = false"
    ></div>

    <!-- 右侧主内容区 -->
    <el-container class="main-content">
      <el-header class="content-header">
        <div class="header-left">
          <el-button 
            v-if="isMobile" 
            class="mobile-menu-btn"
            @click="sidebarVisible = !sidebarVisible"
            text
          >
            <el-icon :size="24"><Menu /></el-icon>
          </el-button>
          <div class="header-title">{{ pageTitle }}</div>
        </div>
        <div class="header-right">
          <div v-if="isMobile" class="mobile-user-info">
            <el-icon><User /></el-icon>
            <span>{{ userStore.userInfo?.username || '用户' }}</span>
          </div>
        </div>
      </el-header>

      <el-main class="content-main">
        <slot></slot>
      </el-main>
    </el-container>

    <!-- 移动端底部导航栏 -->
    <div v-if="isMobile" class="mobile-bottom-nav">
      <div 
        class="nav-item"
        :class="{ active: activeMenu === '/' }"
        @click="handleMenuSelect('/')"
      >
        <el-icon><HomeFilled /></el-icon>
        <span>首页</span>
      </div>
      <div 
        class="nav-item"
        :class="{ active: activeMenu === '/gallery' }"
        @click="handleMenuSelect('/gallery')"
      >
        <el-icon><Picture /></el-icon>
        <span>相册</span>
      </div>
      <div 
        class="nav-item"
        :class="{ active: activeMenu === '/upload' }"
        @click="handleMenuSelect('/upload')"
      >
        <el-icon><Upload /></el-icon>
        <span>上传</span>
      </div>
    </div>
  </el-container>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { 
  Menu, 
  Picture, 
  HomeFilled, 
  Upload, 
  User, 
  SwitchButton 
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const sidebarVisible = ref(false);
const isMobile = ref(false);

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

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    sidebarVisible.value = false;
  }
};

const handleMenuSelect = (index) => {
  router.push(index);
  if (isMobile.value) {
    sidebarVisible.value = false;
  }
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

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.main-layout {
  height: 100vh;
  width: 100vw;
  position: relative;
}

.sidebar {
  background: #304156;
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  z-index: 1000;
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

.logo-text {
  display: inline;
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
  transition: margin-left 0.3s ease;
}

.content-header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-menu-btn {
  padding: 8px;
  min-height: auto;
}

.header-title {
  font-size: 20px;
  font-weight: 500;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

.content-main {
  padding: 24px;
  overflow-y: auto;
  padding-bottom: 80px; /* 为移动端底部导航栏留出空间 */
}

/* 移动端遮罩层 */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* 移动端底部导航栏 */
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-bottom-nav .nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;
  color: #909399;
  font-size: 12px;
  padding: 8px;
  -webkit-tap-highlight-color: transparent;
}

.mobile-bottom-nav .nav-item.active {
  color: #409eff;
}

.mobile-bottom-nav .nav-item .el-icon {
  font-size: 22px;
}

.mobile-bottom-nav .nav-item span {
  font-size: 12px;
  white-space: nowrap;
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 200px;
    transform: translateX(-100%);
  }

  .sidebar:not(.sidebar-mobile-hidden) {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0 !important;
    width: 100%;
  }

  .content-header {
    padding: 0 12px;
    height: 56px;
  }

  .header-title {
    font-size: 18px;
  }

  .content-main {
    padding: 16px;
    padding-bottom: 80px;
  }

  .logo-text {
    display: none;
  }

  .logo {
    padding: 16px;
  }
}

@media (min-width: 769px) {
  .mobile-bottom-nav {
    display: none;
  }

  .sidebar-overlay {
    display: none;
  }

  .mobile-menu-btn {
    display: none;
  }

  .mobile-user-info {
    display: none;
  }
}
</style>

