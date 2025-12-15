<template>
  <div class="image-view-container">
    <el-page-header @back="goBack" content="图片详情" />
    
    <div class="image-content">
      <div class="image-display">
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
      </div>
      
      <div class="image-details">
        <div class="detail-section">
          <h3>基本信息</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="标题">{{ image.title }}</el-descriptions-item>
            <el-descriptions-item label="上传时间">{{ formatDate(image.uploadDate) }}</el-descriptions-item>
            <el-descriptions-item label="尺寸">{{ image.width }} × {{ image.height }}</el-descriptions-item>
            <el-descriptions-item label="文件大小">{{ formatFileSize(image.fileSize) }}</el-descriptions-item>
            <el-descriptions-item label="格式">{{ image.format }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="detail-section">
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
        
        <div class="detail-section" v-if="exifData">
          <h3>EXIF信息</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item 
              v-for="(value, key) in exifData" 
              :key="key" 
              :label="key"
            >
              {{ value }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="action-buttons">
          <el-button type="primary" @click="editImage">编辑图片</el-button>
          <el-button @click="downloadImage">下载原图</el-button>
          <el-button type="danger" @click="deleteImage">删除图片</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'ImageView',
  components: {
    Picture
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    // 数据状态
    const image = ref({
      id: 1,
      title: '示例图片',
      fullUrl: 'https://picsum.photos/800/600?random=1',
      thumbnailUrl: 'https://picsum.photos/300/200?random=1',
      uploadDate: '2023-05-15T10:30:00Z',
      width: 1920,
      height: 1080,
      fileSize: 2048000,
      format: 'JPEG',
      tags: [
        { id: 1, name: '风景' },
        { id: 2, name: '自然' }
      ]
    })
    
    const exifData = ref({
      '拍摄设备': 'Canon EOS 5D Mark IV',
      '光圈值': 'f/8.0',
      '快门速度': '1/125s',
      'ISO': '100',
      '焦距': '50mm',
      '拍摄时间': '2023:05:15 10:30:00'
    })
    
    const inputVisible = ref(false)
    const inputValue = ref('')
    const inputRef = ref(null)
    
    // 返回上一页
    const goBack = () => {
      router.back()
    }
    
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
        const exists = image.value.tags.some(tag => tag.name === inputValue.value.trim())
        if (!exists) {
          image.value.tags.push({
            id: Date.now(), // 简单生成ID
            name: inputValue.value.trim()
          })
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
      image.value.tags = image.value.tags.filter(t => t.id !== tag.id)
      ElMessage.success('标签删除成功')
    }
    
    // 编辑图片
    const editImage = () => {
      router.push(`/image/${image.value.id}/edit`)
    }
    
    // 下载图片
    const downloadImage = () => {
      ElMessage.info('开始下载图片...')
      // 实际项目中这里会触发下载逻辑
    }
    
    // 删除图片
    const deleteImage = () => {
      ElMessageBox.confirm(
        '确定要删除这张图片吗？此操作不可恢复。',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 实际项目中这里会调用删除API
        ElMessage.success('图片删除成功')
        router.push('/gallery')
      }).catch(() => {
        ElMessage.info('已取消删除')
      })
    }
    
    return {
      image,
      exifData,
      inputVisible,
      inputValue,
      inputRef,
      formatDate,
      formatFileSize,
      showInput,
      addTag,
      removeTag,
      goBack,
      editImage,
      downloadImage,
      deleteImage
    }
  }
}
</script>

<style scoped>
.image-view-container {
  padding: 20px;
}

.image-content {
  display: flex;
  margin-top: 20px;
  gap: 30px;
}

.image-display {
  flex: 1;
  min-width: 0;
}

.full-image {
  width: 100%;
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
  height: 500px;
  color: #909399;
}

.image-placeholder span,
.image-error span {
  margin-top: 10px;
}

.image-details {
  width: 350px;
  flex-shrink: 0;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.action-buttons .el-button {
  width: 100%;
}
</style>