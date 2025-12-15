<template>
  <div class="upload-container">
    <h2>图片上传</h2>
    <el-upload
      class="upload-demo"
      drag
      action="/api/images/upload"
      :headers="uploadHeaders"
      :multiple="true"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          jpg/png 文件大小不超过 10MB
        </div>
      </template>
    </el-upload>
    
    <!-- 图片裁剪区域 -->
    <div v-if="showCropper" class="cropper-container">
      <h3>图片裁剪</h3>
      <div class="cropper-wrapper">
        <img ref="cropperImage" :src="croppingImage" alt="待裁剪图片">
      </div>
      <div class="cropper-actions">
        <el-button type="primary" @click="confirmCrop">确认裁剪</el-button>
        <el-button @click="cancelCrop">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

export default {
  name: 'UploadView',
  components: {
    UploadFilled
  },
  setup() {
    const showCropper = ref(false)
    const croppingImage = ref('')
    const cropperInstance = ref(null)
    const cropperImage = ref(null)
    
    // 获取JWT token用于上传
    const uploadHeaders = computed(() => {
      const token = localStorage.getItem('token')
      return token ? { Authorization: `Bearer ${token}` } : {}
    })
    
    const beforeUpload = (file) => {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt10M = file.size / 1024 / 1024 < 10
      
      if (!isJPG) {
        ElMessage.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt10M) {
        ElMessage.error('上传头像图片大小不能超过 10MB!')
      }
      
      // 如果需要裁剪，打开裁剪器
      if (isJPG && isLt10M) {
        const reader = new FileReader()
        reader.onload = (e) => {
          croppingImage.value = e.target.result
          showCropper.value = true
          // 等待DOM更新后再初始化裁剪器
          setTimeout(() => {
            initCropper()
          }, 100)
        }
        reader.readAsDataURL(file)
        return false // 阻止自动上传
      }
      
      return isJPG && isLt10M
    }
    
    const initCropper = () => {
      if (cropperInstance.value) {
        cropperInstance.value.destroy()
      }
      
      cropperInstance.value = new Cropper(cropperImage.value, {
        aspectRatio: 16 / 9,
        viewMode: 1,
        autoCropArea: 0.8,
        preview: '.preview'
      })
    }
    
    const handleSuccess = (response, file, fileList) => {
      ElMessage.success('上传成功')
      // 可以在这里刷新图片列表
    }
    
    const handleError = (error, file, fileList) => {
      ElMessage.error('上传失败: ' + error.message)
    }
    
    const confirmCrop = () => {
      if (cropperInstance.value) {
        // 获取裁剪后的图片数据
        const canvas = cropperInstance.value.getCroppedCanvas()
        canvas.toBlob((blob) => {
          // 这里应该将裁剪后的图片上传到服务器
          // 暂时只是演示流程
          ElMessage.success('裁剪完成')
          showCropper.value = false
        })
      }
    }
    
    const cancelCrop = () => {
      showCropper.value = false
      if (cropperInstance.value) {
        cropperInstance.value.destroy()
        cropperInstance.value = null
      }
    }
    
    return {
      showCropper,
      croppingImage,
      cropperImage,
      uploadHeaders,
      beforeUpload,
      handleSuccess,
      handleError,
      confirmCrop,
      cancelCrop
    }
  }
}
</script>

<style scoped>
.upload-container {
  padding: 20px;
}

.cropper-container {
  margin-top: 30px;
}

.cropper-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

.cropper-wrapper img {
  max-width: 100%;
}

.cropper-actions {
  text-align: center;
  margin-top: 20px;
}
</style>