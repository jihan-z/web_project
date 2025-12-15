<template>
  <div class="image-uploader">
    <el-upload
      class="upload-area"
      drag
      :action="uploadUrl"
      :headers="uploadHeaders"
      :multiple="multiple"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
      :on-progress="handleProgress"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          {{ tipText }}
        </div>
      </template>
    </el-upload>
    
    <div class="upload-progress" v-if="uploadingFiles.length > 0">
      <div 
        v-for="file in uploadingFiles" 
        :key="file.uid"
        class="progress-item"
      >
        <span class="file-name">{{ file.name }}</span>
        <el-progress :percentage="file.progress" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'ImageUploader',
  components: {
    UploadFilled
  },
  props: {
    multiple: {
      type: Boolean,
      default: false
    },
    maxSize: {
      type: Number,
      default: 10 // MB
    },
    accept: {
      type: String,
      default: 'image/jpeg,image/png,image/gif'
    }
  },
  emits: ['success', 'error'],
  setup(props, { emit }) {
    const uploadingFiles = ref([])
    
    // 上传URL
    const uploadUrl = computed(() => '/api/images/upload')
    
    // 获取JWT token用于上传
    const uploadHeaders = computed(() => {
      const token = localStorage.getItem('token')
      return token ? { Authorization: `Bearer ${token}` } : {}
    })
    
    // 提示文本
    const tipText = computed(() => {
      return `支持 ${props.accept.split(',').map(type => type.split('/')[1].toUpperCase()).join('/')} 格式，单个文件不超过 ${props.maxSize}MB`
    })
    
    // 上传前检查
    const beforeUpload = (file) => {
      const fileTypeValid = props.accept.split(',').some(type => 
        file.type === type
      )
      
      const fileSizeValid = file.size / 1024 / 1024 < props.maxSize
      
      if (!fileTypeValid) {
        ElMessage.error(`上传文件只能是 ${props.accept.split(',').map(type => type.split('/')[1].toUpperCase()).join('/')} 格式!`)
        return false
      }
      
      if (!fileSizeValid) {
        ElMessage.error(`上传文件大小不能超过 ${props.maxSize}MB!`)
        return false
      }
      
      // 添加到上传列表
      uploadingFiles.value.push({
        uid: file.uid,
        name: file.name,
        progress: 0
      })
      
      return true
    }
    
    // 处理上传进度
    const handleProgress = (event, file) => {
      const fileInfo = uploadingFiles.value.find(f => f.uid === file.uid)
      if (fileInfo) {
        fileInfo.progress = Math.floor(event.percent)
      }
    }
    
    // 上传成功处理
    const handleSuccess = (response, file, fileList) => {
      // 从上传列表中移除
      uploadingFiles.value = uploadingFiles.value.filter(f => f.uid !== file.uid)
      
      ElMessage.success('上传成功')
      emit('success', response, file, fileList)
    }
    
    // 上传失败处理
    const handleError = (error, file, fileList) => {
      // 从上传列表中移除
      uploadingFiles.value = uploadingFiles.value.filter(f => f.uid !== file.uid)
      
      ElMessage.error('上传失败: ' + (error.message || '未知错误'))
      emit('error', error, file, fileList)
    }
    
    return {
      uploadingFiles,
      uploadUrl,
      uploadHeaders,
      tipText,
      beforeUpload,
      handleProgress,
      handleSuccess,
      handleError
    }
  }
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.upload-area {
  width: 100%;
}

.upload-progress {
  margin-top: 20px;
}

.progress-item {
  margin-bottom: 15px;
}

.file-name {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #606266;
}
</style>