<template>
  <div class="gallery-container">
    <div class="gallery-header">
      <h2>图片 gallery</h2>
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索图片..."
          style="width: 300px; margin-right: 20px;"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="selectedTags"
          multiple
          filterable
          placeholder="选择标签"
          style="width: 200px;"
        >
          <el-option
            v-for="tag in availableTags"
            :key="tag.id"
            :label="tag.name"
            :value="tag.id"
          />
        </el-select>
      </div>
    </div>
    
    <div class="image-grid">
      <div 
        v-for="image in images" 
        :key="image.id" 
        class="image-card"
        @click="viewImageDetails(image)"
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
              v-for="tag in image.tags.slice(0, 3)" 
              :key="tag.id" 
              size="small"
              style="margin-right: 5px;"
            >
              {{ tag.name }}
            </el-tag>
            <el-tag v-if="image.tags.length > 3" size="small">
              +{{ image.tags.length - 3 }}
            </el-tag>
          </div>
          <p class="upload-date">{{ formatDate(image.uploadDate) }}</p>
        </div>
      </div>
    </div>
    
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalImages"
        :page-sizes="[12, 24, 48, 96]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'GalleryView',
  components: {
    Search,
    Picture
  },
  setup() {
    const router = useRouter()
    
    // 数据状态
    const images = ref([])
    const availableTags = ref([])
    const searchQuery = ref('')
    const selectedTags = ref([])
    const currentPage = ref(1)
    const pageSize = ref(12)
    const totalImages = ref(0)
    
    // 模拟数据
    const mockImages = [
      {
        id: 1,
        title: '风景照片 1',
        thumbnailUrl: 'https://picsum.photos/300/200?random=1',
        uploadDate: '2023-05-15T10:30:00Z',
        tags: [
          { id: 1, name: '风景' },
          { id: 2, name: '自然' },
          { id: 3, name: '山川' }
        ]
      },
      {
        id: 2,
        title: '城市夜景',
        thumbnailUrl: 'https://picsum.photos/300/200?random=2',
        uploadDate: '2023-05-16T14:45:00Z',
        tags: [
          { id: 4, name: '城市' },
          { id: 5, name: '夜晚' }
        ]
      },
      {
        id: 3,
        title: '动物写真',
        thumbnailUrl: 'https://picsum.photos/300/200?random=3',
        uploadDate: '2023-05-17T09:15:00Z',
        tags: [
          { id: 6, name: '动物' },
          { id: 7, name: '宠物' }
        ]
      }
    ]
    
    const mockTags = [
      { id: 1, name: '风景' },
      { id: 2, name: '自然' },
      { id: 3, name: '山川' },
      { id: 4, name: '城市' },
      { id: 5, name: '夜晚' },
      { id: 6, name: '动物' },
      { id: 7, name: '宠物' },
      { id: 8, name: '人物' },
      { id: 9, name: '建筑' }
    ]
    
    // 加载图片数据
    const loadImages = async () => {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        images.value = mockImages
        totalImages.value = mockImages.length
      } catch (error) {
        ElMessage.error('加载图片失败: ' + error.message)
      }
    }
    
    // 加载标签数据
    const loadTags = async () => {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 300))
        availableTags.value = mockTags
      } catch (error) {
        ElMessage.error('加载标签失败: ' + error.message)
      }
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    }
    
    // 查看图片详情
    const viewImageDetails = (image) => {
      router.push(`/image/${image.id}`)
    }
    
    // 分页处理
    const handleSizeChange = (val) => {
      pageSize.value = val
      loadImages()
    }
    
    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadImages()
    }
    
    // 初始化数据
    onMounted(() => {
      loadImages()
      loadTags()
    })
    
    return {
      images,
      availableTags,
      searchQuery,
      selectedTags,
      currentPage,
      pageSize,
      totalImages,
      formatDate,
      viewImageDetails,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.gallery-container {
  padding: 20px;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.search-bar {
  display: flex;
  align-items: center;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
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
  height: 200px;
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

.pagination-container {
  display: flex;
  justify-content: center;
}
</style>