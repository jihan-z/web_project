import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: () => import('@/views/GalleryView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/image/:id',
      name: 'imageDetail',
      component: () => import('@/views/ImageDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/image/:id/edit',
      name: 'imageEdit',
      component: () => import('@/views/ImageEditView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/upload',
      name: 'upload',
      component: () => import('@/views/UploadView.vue'),
      meta: { requiresAuth: true }
    }
  ]
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'login' });
  } else if ((to.name === 'login' || to.name === 'register') && userStore.isLoggedIn) {
    next({ name: 'home' });
  } else {
    next();
  }
});

export default router;
