<template>
  <MainLayout>
    <div class="upload-page">
      <el-card>
    <el-upload
          ref="uploadRef"
          name="images"
          :action="uploadUrl"
      :headers="uploadHeaders"
      :data="uploadData"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="beforeUpload"
          v-model:file-list="fileList"
          list-type="picture-card"
          :auto-upload="false"
          multiple
          accept="image/*"
          drag
    >
          <el-icon class="upload-icon"><Plus /></el-icon>
          <div class="upload-text">点击或拖拽图片到此处上传</div>
      <template #tip>
            <div class="upload-tip">
              支持 JPG、PNG、GIF、WebP 格式，单个文件不超过 10MB
        </div>
      </template>
    </el-upload>
    
        <div class="upload-options" v-if="fileList.length > 0">
          <el-form label-width="80px">
            <el-form-item label="添加描述">
              <el-switch 
                v-model="enableDescription" 
                active-text="是" 
                inactive-text="否"
              />
            </el-form-item>
            <el-form-item v-if="enableDescription" label="图片描述">
              <el-input
                v-model="imageDescription"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
                placeholder="为这批图片添加统一描述（可选，最多200字）"
              />
            </el-form-item>
          </el-form>
        </div>

        <div class="upload-actions" v-if="fileList.length > 0">
          <el-button @click="clearFiles">清空</el-button>
          <el-button type="primary" :loading="uploading" @click="submitUpload">
            上传 ({{ fileList.length }})
          </el-button>
        </div>
      </el-card>

      <!-- 上传成功的图片预览 -->
      <el-card v-if="uploadedImages.length > 0" class="uploaded-card">
        <template #header>
          <div class="card-header">
            <span>上传成功 ({{ uploadedImages.length }})</span>
            <el-button type="primary" @click="router.push('/gallery')">
              查看相册
            </el-button>
          </div>
        </template>
        
        <div class="uploaded-grid">
          <div
            v-for="image in uploadedImages"
            :key="image.id"
            class="uploaded-item"
            @click="router.push(`/image/${image.id}`)"
          >
            <img :src="getImageUrl(image.thumbnail_path || image.stored_path)" :alt="image.filename" />
            <div class="uploaded-name">{{ image.filename }}</div>
      </div>
      </div>
      </el-card>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import MainLayout from '@/components/MainLayout.vue';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();
const uploadRef = ref();
const fileList = ref([]);
const uploading = ref(false);
const uploadedImages = ref([]);
const enableDescription = ref(false);
const imageDescription = ref('');

const uploadUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/images/upload/batch`;

const uploadHeaders = {
  Authorization: `Bearer ${userStore.token}`
};

const uploadData = {
  get description() {
    return enableDescription.value && imageDescription.value ? imageDescription.value : '';
  }
};
    
    const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt10M = file.size / 1024 / 1024 < 10;
      
  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
      }
      if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB！');
    return false;
  }
  return true;
};

const submitUpload = () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要上传的图片');
    return;
  }

  uploading.value = true;
  uploadRef.value.submit();
};

const handleSuccess = (response) => {
  uploading.value = false;
  
  console.log('Upload response:', response);
  
  if (response && response.images && response.images.length > 0) {
    uploadedImages.value = response.images;
    ElMessage.success(response.message || '上传成功');
    clearFiles();
  } else {
    ElMessage.warning('上传完成，但未返回图片信息');
    console.error('Invalid response:', response);
  }
};
    
const handleError = (error, file, fileList) => {
  uploading.value = false;
  console.error('Upload error:', error);
  console.error('Failed file:', file);
  console.error('Response:', error.response);
  ElMessage.error('上传失败：' + (error.message || '请重试'));
};

const clearFiles = () => {
  fileList.value = [];
  uploadRef.value.clearFiles();
  enableDescription.value = false;
  imageDescription.value = '';
};

const getImageUrl = (path) => {
  if (!path) return '';
  const baseURL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
  return `${baseURL}/${path}`;
};
</script>

<style scoped>
.upload-page {
  max-width: 1000px;
  margin: 0 auto;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.upload-icon {
  font-size: 60px;
  color: #999;
  margin-bottom: 20px;
}

.upload-text {
  font-size: 16px;
  color: #666;
}

.upload-tip {
  font-size: 14px;
  color: #999;
  margin-top: 10px;
  text-align: center;
}

.upload-options {
  margin-top: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.upload-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.uploaded-card {
  margin-top: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.uploaded-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.uploaded-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
}

.uploaded-item:hover {
  transform: scale(1.05);
  border-color: #409eff;
}

.uploaded-item img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.uploaded-name {
  padding: 8px;
  font-size: 12px;
  color: #666;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

