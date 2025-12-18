<template>
  <div class="carousel-container">
    <swiper
      :modules="modules"
      :slides-per-view="1"
      :space-between="30"
      :loop="images.length > 1"
      :autoplay="{
        delay: 3000,
        disableOnInteraction: false,
      }"
      :pagination="{ clickable: true }"
      :navigation="true"
      class="image-swiper"
    >
      <swiper-slide v-for="image in images" :key="image.id">
        <div class="slide-content" @click="handleImageClick(image.id)">
          <img :src="getImageUrl(image.stored_path, image.id)" :alt="image.original_filename" />
          <div class="image-caption">
            <h3>{{ image.original_filename }}</h3>
            <p v-if="image.description">{{ image.description }}</p>
            <div class="image-meta">
              <span v-if="image.width && image.height">
                {{ image.width }} × {{ image.height }}
              </span>
              <span>{{ formatDate(image.created_at) }}</span>
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useRouter } from 'vue-router';
import { useImagesStore } from '@/stores/images';

const router = useRouter();
const imagesStore = useImagesStore();

const props = defineProps({
  images: {
    type: Array,
    required: true
  }
});

const modules = [Navigation, Pagination, Autoplay];

const getImageUrl = (path, imageId) => {
  if (!path) return '';
  const baseURL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
  const base = `${baseURL}/${path}`;
  const bust = imagesStore.cacheBust?.[String(imageId)];
  if (!bust) return base;
  return base.includes('?') ? `${base}&t=${bust}` : `${base}?t=${bust}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

const handleImageClick = (imageId) => {
  router.push(`/image/${imageId}/edit`);
};
</script>

<style scoped>
.carousel-container {
  width: 100%;
  margin: 0 auto;
}

.image-swiper {
  width: 100%;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
}

.slide-content {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  background: #000;
}

.slide-content img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.image-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  padding: 30px 20px 20px;
}

.image-caption h3 {
  font-size: 18px;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.image-caption p {
  font-size: 14px;
  margin: 0 0 8px 0;
  opacity: 0.9;
}

.image-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  opacity: 0.8;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: white;
  background: rgba(0, 0, 0, 0.5);
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

:deep(.swiper-button-next:after),
:deep(.swiper-button-prev:after) {
  font-size: 20px;
}

:deep(.swiper-pagination-bullet) {
  background: white;
  opacity: 0.5;
}

:deep(.swiper-pagination-bullet-active) {
  opacity: 1;
  background: #409eff;
}
</style>

