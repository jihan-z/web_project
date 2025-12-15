<template>
  <div class="image-list">
    <div 
      v-for="image in images" 
      :key="image.id" 
      class="image-card"
      @click="$emit('select', image)"
    >
      <el-image
        :src="image.thumbnailUrl"
        fit="cover"
        class="image-preview"
        lazy
      >
        <template #placeholder>
          <div class="image-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-image>
      <div class="image-info">
        <h3>{{ image.title }}</h3>
        <div class="image-tags">
          <el-tag 
            v-for="tag in image.tags.slice(0, 2)" 
            :key="tag.id" 
            size="small"
            style="margin-right: 5px;"
          >
            {{ tag.name }}
          </el-tag>
          <el-tag v-if="image.tags.length > 2" size="small">
            +{{ image.tags.length - 2 }}
          </el-tag>
        </div>
        <p class="upload-date">{{ formatDate(image.uploadDate) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { Picture } from '@element-plus/icons-vue'

export default {
  name: 'ImageList',
  components: {
    Picture
  },
  props: {
    images: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  emits: ['select'],
  setup() {
    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    }
    
    return {
      formatDate
    }
  }
}
</script>

<style scoped>
.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.image-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-preview {
  width: 100%;
  height: 180px;
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  color: #909399;
}

.image-info {
  padding: 15px;
}

.image-info h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-tags {
  margin-bottom: 10px;
  min-height: 24px;
}

.upload-date {
  margin: 0;
  font-size: 12px;
  color: #909399;
}
</style>