<template>
  <MainLayout>
    <div class="detail-page">
      <el-skeleton :loading="loading" animated>
        <div v-if="image">
          <el-button @click="router.back()" class="back-button">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>

          <el-row :gutter="24">
            <!-- 图片展示区 -->
            <el-col :span="16">
              <el-card>
                <div class="image-viewer">
                  <img
                    ref="imageRef"
                    :src="getImageUrl(image.stored_path)"
                    :alt="image.original_filename"
                  />
                </div>

                <div class="image-actions">
                  <el-button @click="showCropDialog">
                    <el-icon><Crop /></el-icon>
                    裁剪
                  </el-button>
                  <el-button @click="showAdjustDialog">
                    <el-icon><Edit /></el-icon>
                    调整色调
                  </el-button>
                  <el-button type="danger" @click="handleDelete">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </el-card>
            </el-col>

            <!-- 信息和编辑区 -->
            <el-col :span="8">
              <el-card>
                <template #header>
                  <span>图片信息</span>
                </template>

                <el-form label-position="top">
                  <el-form-item label="文件名">
                    <div class="info-value">{{ image.original_filename }}</div>
                  </el-form-item>

                  <el-form-item label="尺寸" v-if="image.width && image.height">
                    <div class="info-value">{{ image.width }} × {{ image.height }} 像素</div>
                  </el-form-item>

                  <el-form-item label="拍摄时间" v-if="image.taken_time">
                    <div class="info-value">{{ formatDateTime(image.taken_time) }}</div>
                  </el-form-item>

                  <el-form-item label="相机型号" v-if="image.camera_model">
                    <div class="info-value">{{ image.camera_model }}</div>
                  </el-form-item>

                  <el-form-item label="位置" v-if="image.gps_latitude && image.gps_longitude">
                    <div class="info-value">
                      {{ image.gps_latitude.toFixed(6) }}, {{ image.gps_longitude.toFixed(6) }}
                    </div>
                  </el-form-item>

                  <el-form-item label="上传时间">
                    <div class="info-value">{{ formatDateTime(image.created_at) }}</div>
                  </el-form-item>

                  <el-divider />

                  <el-form-item label="描述">
                    <el-input
                      v-model="description"
                      type="textarea"
                      :rows="3"
                      placeholder="添加图片描述..."
                    />
                  </el-form-item>

                  <el-form-item label="自定义标签">
                    <el-select
                      v-model="customTags"
                      multiple
                      filterable
                      allow-create
                      placeholder="选择或创建标签"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="tag in availableTags"
                        :key="tag.id"
                        :label="tag.name"
                        :value="tag.name"
                      />
                    </el-select>
                  </el-form-item>

                  <el-form-item label="自动标签" v-if="autoTags.length > 0">
                    <div class="tag-list">
                      <el-tag v-for="tag in autoTags" :key="tag" type="info" size="small">
                        {{ tag }}
                      </el-tag>
                    </div>
                  </el-form-item>

                  <el-button type="primary" @click="handleUpdate" :loading="updating" style="width: 100%">
                    保存修改
                  </el-button>
                </el-form>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-skeleton>

      <!-- 裁剪对话框 -->
      <el-dialog v-model="cropDialogVisible" title="裁剪图片" width="800px">
        <div class="crop-container">
          <img ref="cropImageRef" :src="getImageUrl(image?.stored_path)" style="max-width: 100%" />
        </div>
        <template #footer>
          <el-button @click="cropDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCrop" :loading="cropping">确定</el-button>
        </template>
      </el-dialog>

      <!-- 色调调整对话框 -->
      <el-dialog v-model="adjustDialogVisible" title="调整色调" width="600px">
        <el-form label-width="100px">
          <el-form-item label="亮度">
            <el-slider v-model="adjustments.brightness" :min="-50" :max="50" :step="1" />
            <span class="slider-value">{{ adjustments.brightness }}</span>
          </el-form-item>

          <el-form-item label="饱和度">
            <el-slider v-model="adjustments.saturation" :min="-50" :max="50" :step="1" />
            <span class="slider-value">{{ adjustments.saturation }}</span>
          </el-form-item>

          <el-form-item label="对比度">
            <el-slider v-model="adjustments.contrast" :min="-50" :max="50" :step="1" />
            <span class="slider-value">{{ adjustments.contrast }}</span>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="adjustDialogVisible = false">取消</el-button>
          <el-button @click="resetAdjustments">重置</el-button>
          <el-button type="primary" @click="handleAdjust" :loading="adjusting">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import MainLayout from '@/components/MainLayout.vue';
import { useImagesStore } from '@/stores/images';
import { useTagsStore } from '@/stores/tags';

const route = useRoute();
const router = useRouter();
const imagesStore = useImagesStore();
const tagsStore = useTagsStore();

const loading = ref(false);
const updating = ref(false);
const cropping = ref(false);
const adjusting = ref(false);

const image = ref(null);
const description = ref('');
const customTags = ref([]);
const availableTags = ref([]);

const imageRef = ref(null);
const cropImageRef = ref(null);
const cropDialogVisible = ref(false);
const adjustDialogVisible = ref(false);

let cropper = null;

const adjustments = ref({
  brightness: 0,
  saturation: 0,
  contrast: 0
});

const autoTags = computed(() => {
  if (!image.value?.tags) return [];
  const allTags = image.value.tags.split(',');
  return allTags.filter(tag => {
    const tagObj = availableTags.value.find(t => t.name === tag);
    return tagObj?.type === 'auto';
  });
});

const getImageUrl = (path) => {
  if (!path) return '';
  const baseURL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
  return `${baseURL}/${path}`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

const loadImage = async () => {
  loading.value = true;
  try {
    const imageData = await imagesStore.fetchImageDetail(route.params.id);
    image.value = imageData;
    description.value = imageData.description || '';

    const tags = await tagsStore.fetchTags();
    availableTags.value = tags;

    if (imageData.tags) {
      const allTags = imageData.tags.split(',');
      customTags.value = allTags.filter(tag => {
        const tagObj = tags.find(t => t.name === tag);
        return tagObj?.type === 'custom';
      });
    }
  } catch (error) {
    console.error('Failed to load image:', error);
    ElMessage.error('加载图片失败');
    router.back();
  } finally {
    loading.value = false;
  }
};

const handleUpdate = async () => {
  updating.value = true;
  try {
    await imagesStore.updateImage(route.params.id, {
      description: description.value,
      tags: customTags.value
    });
    ElMessage.success('保存成功');
    await loadImage();
  } catch (error) {
    console.error('Failed to update image:', error);
  } finally {
    updating.value = false;
  }
};

const showCropDialog = () => {
  cropDialogVisible.value = true;
  setTimeout(() => {
    if (cropImageRef.value && !cropper) {
      cropper = new Cropper(cropImageRef.value, {
        aspectRatio: NaN,
        viewMode: 1,
        autoCropArea: 0.8
      });
    }
  }, 100);
};

const handleCrop = async () => {
  if (!cropper) return;

  cropping.value = true;
  try {
    const cropData = cropper.getData();
    await imagesStore.cropImage(route.params.id, {
      x: cropData.x,
      y: cropData.y,
      width: cropData.width,
      height: cropData.height
    });

    ElMessage.success('裁剪成功');
    cropDialogVisible.value = false;

    if (cropper) {
      cropper.destroy();
      cropper = null;
    }

    await loadImage();

    if (imageRef.value) {
      imageRef.value.src = `${getImageUrl(image.value.stored_path)}?t=${Date.now()}`;
    }
  } catch (error) {
    console.error('Failed to crop image:', error);
  } finally {
    cropping.value = false;
  }
};

const showAdjustDialog = () => {
  adjustDialogVisible.value = true;
};

const resetAdjustments = () => {
  adjustments.value = {
    brightness: 0,
    saturation: 0,
    contrast: 0
  };
};

const handleAdjust = async () => {
  adjusting.value = true;
  try {
    await imagesStore.adjustImage(route.params.id, adjustments.value);
    ElMessage.success('调整成功');
    adjustDialogVisible.value = false;
    resetAdjustments();

    await loadImage();

    if (imageRef.value) {
      imageRef.value.src = `${getImageUrl(image.value.stored_path)}?t=${Date.now()}`;
    }
  } catch (error) {
    console.error('Failed to adjust image:', error);
  } finally {
    adjusting.value = false;
  }
};

const handleDelete = () => {
  ElMessageBox.confirm('确定要删除这张图片吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await imagesStore.deleteImage(route.params.id);
      ElMessage.success('删除成功');
      router.push('/gallery');
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  });
};

onMounted(() => {
  loadImage();
});

onBeforeUnmount(() => {
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
});
</script>

<style scoped>
.detail-page {
  max-width: 1400px;
  margin: 0 auto;
}

.back-button {
  margin-bottom: 20px;
}

.image-viewer {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.image-viewer img {
  max-width: 100%;
  max-height: 600px;
  display: block;
}

.image-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.info-value {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.crop-container {
  max-height: 500px;
  overflow: hidden;
}

.slider-value {
  display: inline-block;
  width: 40px;
  text-align: center;
  margin-left: 10px;
}
</style>

