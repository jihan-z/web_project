<template>
  <MainLayout>
    <div class="home-page">
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <el-icon :size="48" color="#409eff"><Picture /></el-icon>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalImages }}</div>
                <div class="stat-label">总图片数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <el-icon :size="48" color="#67c23a"><CollectionTag /></el-icon>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalTags }}</div>
                <div class="stat-label">标签数量</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="stat-card">
            <div class="stat-content">
              <el-icon :size="48" color="#e6a23c"><Calendar /></el-icon>
              <div class="stat-info">
                <div class="stat-value">{{ stats.recentUploads }}</div>
                <div class="stat-label">最近上传</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 快速操作 -->
      <el-card class="quick-actions">
        <template #header>
          <span>快速操作</span>
        </template>
        <div class="action-buttons">
          <el-button type="primary" size="large" @click="router.push('/upload')">
            <el-icon><Upload /></el-icon>
            <span>上传图片</span>
          </el-button>
          <el-button size="large" @click="router.push('/gallery')">
            <el-icon><Picture /></el-icon>
            <span>浏览相册</span>
          </el-button>
      </div>
      </el-card>

      <!-- 图片轮播 -->
      <el-card class="carousel-card" v-if="recentImages.length > 0">
        <template #header>
          <div class="card-header">
            <span>图片轮播</span>
            <el-switch
              v-model="showCarousel"
              active-text="轮播"
              inactive-text="网格"
            />
          </div>
        </template>
        
        <!-- 轮播模式 -->
        <ImageCarousel v-if="showCarousel" :images="recentImages" />
        
        <!-- 网格模式 -->
        <div v-else class="image-grid">
          <div
            v-for="image in recentImages"
            :key="image.id"
            class="image-item"
            @click="router.push(`/image/${image.id}/edit`)"
          >
            <img
              :src="getImageUrl(image.thumbnail_path || image.stored_path, image.id)"
              :alt="image.original_filename"
            />
            <div class="image-name">{{ image.original_filename }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MainLayout from '@/components/MainLayout.vue';
import ImageCarousel from '@/components/ImageCarousel.vue';
import { useImagesStore } from '@/stores/images';
import { useTagsStore } from '@/stores/tags';

const router = useRouter();
const imagesStore = useImagesStore();
const tagsStore = useTagsStore();

const stats = ref({
  totalImages: 0,
  totalTags: 0,
  recentUploads: 0
});

const recentImages = ref([]);
const showCarousel = ref(true);

const getImageUrl = (path, imageId) => {
  if (!path) return '';
  const baseURL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
  const base = `${baseURL}/${path}`;
  const bust = imagesStore.cacheBust?.[String(imageId)];
  if (!bust) return base;
  return base.includes('?') ? `${base}&t=${bust}` : `${base}?t=${bust}`;
};

onMounted(async () => {
  try {
    const response = await imagesStore.fetchImages({ page: 1, limit: 6 });
    recentImages.value = response.images;
    stats.value.totalImages = response.pagination.total;
    stats.value.recentUploads = Math.min(response.images.length, 6);

    const tags = await tagsStore.fetchTags();
    stats.value.totalTags = tags.length;
  } catch (error) {
    console.error('Failed to load home data:', error);
  }
});
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.quick-actions {
  margin-bottom: 24px;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.carousel-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.image-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s;
  background: #f5f7fa;
}

.image-item:hover {
  transform: scale(1.05);
}

.image-item img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.image-name {
  padding: 8px;
  font-size: 12px;
  color: #666;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

