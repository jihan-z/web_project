<template>
  <div class="image-detail">
    <el-image
      :src="image.fullUrl"
      fit="contain"
      class="full-image"
    >
      <template #placeholder>
        <div class="image-placeholder">
          <el-icon><Picture /></el-icon>
          <span>加载中...</span>
        </div>
      </template>
      <template #error>
        <div class="image-error">
          <el-icon><Picture /></el-icon>
          <span>图片加载失败</span>
        </div>
      </template>
    </el-image>
    
    <div class="image-info">
      <h2>{{ image.title }}</h2>
      <p class="upload-date">{{ formatDate(image.uploadDate) }}</p>
      
      <div class="image-meta">
        <el-descriptions :column="2" size="small">
          <el-descriptions-item label="尺寸">{{ image.width }} × {{ image.height }}</el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ formatFileSize(image.fileSize) }}</el-descriptions-item>
          <el-descriptions-item label="格式">{{ image.format }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <div class="image-tags">
        <h3>标签</h3>
        <div class="tags-container">
          <el-tag 
            v-for="tag in image.tags" 
            :key="tag.id" 
            closable
            @close="removeTag(tag)"
            style="margin: 0 10px 10px 0;"
          >
            {{ tag.name }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="inputRef"
            v-model="inputValue"
            size="small"
            style="max-width: 120px; margin: 0 10px 10px 0;"
            @keyup.enter="addTag"
            @blur="addTag"
          />
          <el-button 
            v-else 
            size="small" 
            @click="showInput"
            plain
          >
            + 添加标签
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'ImageDetail',
  components: {
    Picture
  },
  props: {
    image: {
      type: Object,
      required: true,
      default: () => ({
        id: 0,
        title: '',
        fullUrl: '',
        thumbnailUrl: '',
        uploadDate: '',
        width: 0,
        height: 0,
        fileSize: 0,
        format: '',
        tags: []
      })
    }
  },
  emits: ['update:tags'],
  setup(props, { emit }) {
    const inputVisible = ref(false)
    const inputValue = ref('')
    const inputRef = ref(null)
    
    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    }
    
    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
      if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB'
      return (bytes / 1073741824).toFixed(1) + ' GB'
    }
    
    // 显示添加标签输入框
    const showInput = () => {
      inputVisible.value = true
      nextTick(() => {
        inputRef.value.focus()
      })
    }
    
    // 添加标签
    const addTag = () => {
      if (inputValue.value.trim()) {
        // 检查标签是否已存在
        const exists = props.image.tags.some(tag => tag.name === inputValue.value.trim())
        if (!exists) {
          const newTag = {
            id: Date.now(), // 简单生成ID
            name: inputValue.value.trim()
          }
          
          // 更新父组件的标签列表
          const updatedTags = [...props.image.tags, newTag]
          emit('update:tags', updatedTags)
          
          ElMessage.success('标签添加成功')
        } else {
          ElMessage.warning('标签已存在')
        }
        inputValue.value = ''
      }
      inputVisible.value = false
    }
    
    // 删除标签
    const removeTag = (tag) => {
      const updatedTags = props.image.tags.filter(t => t.id !== tag.id)
      emit('update:tags', updatedTags)
      ElMessage.success('标签删除成功')
    }
    
    return {
      inputVisible,
      inputValue,
      inputRef,
      formatDate,
      formatFileSize,
      showInput,
      addTag,
      removeTag
    }
  }
}
</script>

<style scoped>
.image-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.full-image {
  flex: 1;
  max-height: 70vh;
  object-fit: contain;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.image-placeholder,
.image-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #909399;
}

.image-placeholder span,
.image-error span {
  margin-top: 10px;
}

.image-info {
  padding: 20px 0;
}

.image-info h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.upload-date {
  margin: 0 0 20px 0;
  color: #909399;
}

.image-meta {
  margin-bottom: 20px;
}

.image-tags h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
</style>