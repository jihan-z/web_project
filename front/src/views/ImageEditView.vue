<template>
  <MainLayout>
    <div class="edit-page">
      <div class="top-bar">
        <el-button @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>

        <div class="top-actions">
          <el-button @click="router.push(`/image/${route.params.id}`)">查看信息</el-button>
        </div>
      </div>

      <el-skeleton :loading="loading" animated>
        <el-row v-if="image" :gutter="24">
          <!-- 预览 -->
          <el-col :span="16">
            <el-card>
              <div class="preview">
                <img
                  ref="previewRef"
                  :src="previewUrl"
                  :alt="image.original_filename"
                  :style="{ filter: previewFilter }"
                />
              </div>
              <div class="hint">
                说明：右侧调整仅做预览；点击“应用调整/应用裁剪”后会调用后端接口并覆盖原图与缩略图。
              </div>
            </el-card>
          </el-col>

          <!-- 编辑面板 -->
          <el-col :span="8">
            <el-card>
              <template #header>
                <div class="panel-header">
                  <span>编辑图片</span>
                  <span class="file-name">{{ image.original_filename }}</span>
                </div>
              </template>

              <el-tabs v-model="activeTab" class="edit-tabs">
                <el-tab-pane label="裁剪" name="crop">
                  <div class="crop-area">
                    <CropperTool
                      v-if="cropImageUrl"
                      :image-url="cropImageUrl"
                      @crop-confirm="onCropConfirm"
                    />
                  </div>

                  <el-button
                    type="primary"
                    style="width: 100%"
                    :loading="cropping"
                    :disabled="!pendingCrop"
                    @click="applyCrop"
                  >
                    应用裁剪
                  </el-button>
                </el-tab-pane>

                <el-tab-pane label="色调" name="adjust">
                  <el-form label-width="90px">
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

                  <div class="adjust-actions">
                    <el-button @click="resetAdjustments">重置</el-button>
                    <el-button
                      type="primary"
                      :loading="adjusting"
                      @click="applyAdjust"
                    >
                      应用调整
                    </el-button>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </el-card>
          </el-col>
        </el-row>
      </el-skeleton>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import MainLayout from '@/components/MainLayout.vue';
import CropperTool from '@/components/CropperTool.vue';
import { useImagesStore } from '@/stores/images';

const route = useRoute();
const router = useRouter();
const imagesStore = useImagesStore();

const loading = ref(false);
const cropping = ref(false);
const adjusting = ref(false);

const image = ref(null);
const previewRef = ref(null);

const activeTab = ref('crop');

const adjustments = reactive({
  brightness: 0,
  saturation: 0,
  contrast: 0
});

const pendingCrop = ref(null); // { x, y, width, height }

const cacheBustKey = computed(() => imagesStore.cacheBust?.[String(route.params.id)]);

const getImageUrl = (path, imageId) => {
  if (!path) return '';
  const baseURL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
  const base = `${baseURL}/${path}`;
  const bust = imagesStore.cacheBust?.[String(imageId)];
  if (!bust) return base;
  return base.includes('?') ? `${base}&t=${bust}` : `${base}?t=${bust}`;
};

const previewUrl = computed(() => {
  if (!image.value) return '';
  return getImageUrl(image.value.stored_path, image.value.id);
});

const cropImageUrl = computed(() => {
  if (!image.value) return '';
  // 裁剪器使用同一张图，但也需要 cache bust
  return getImageUrl(image.value.stored_path, image.value.id);
});

const previewFilter = computed(() => {
  const b = 1 + (adjustments.brightness / 100);
  const s = 1 + (adjustments.saturation / 100);
  const c = 1 + (adjustments.contrast / 100);
  return `brightness(${b}) saturate(${s}) contrast(${c})`;
});

const loadImage = async () => {
  loading.value = true;
  try {
    const imageData = await imagesStore.fetchImageDetail(route.params.id);
    image.value = imageData;
  } catch (e) {
    console.error(e);
    ElMessage.error('加载图片失败');
    router.back();
  } finally {
    loading.value = false;
  }
};

const resetAdjustments = () => {
  adjustments.brightness = 0;
  adjustments.saturation = 0;
  adjustments.contrast = 0;
};

const onCropConfirm = (_blob, _dataUrl, cropData) => {
  // CropperTool 里 emit 的 cropData 来自 cropper.getData(true)
  if (!cropData) {
    pendingCrop.value = null;
    return;
  }
  pendingCrop.value = {
    x: cropData.x,
    y: cropData.y,
    width: cropData.width,
    height: cropData.height
  };
};

const applyCrop = async () => {
  if (!pendingCrop.value) return;
  cropping.value = true;
  try {
    await imagesStore.cropImage(route.params.id, pendingCrop.value);
    imagesStore.bustImageCache(route.params.id);
    pendingCrop.value = null;
    ElMessage.success('裁剪成功');
    await loadImage();
  } catch (e) {
    console.error(e);
  } finally {
    cropping.value = false;
  }
};

const applyAdjust = async () => {
  adjusting.value = true;
  try {
    await imagesStore.adjustImage(route.params.id, { ...adjustments });
    imagesStore.bustImageCache(route.params.id);
    ElMessage.success('调整成功');
    await loadImage();
  } catch (e) {
    console.error(e);
  } finally {
    adjusting.value = false;
  }
};

onMounted(loadImage);

// 当 cache bust 更新时，强制刷新 <img>（有些浏览器对同 URL 的 filter+img 组合缓存较激进）
watch(cacheBustKey, () => {
  if (previewRef.value) {
    previewRef.value.src = previewUrl.value;
  }
});
</script>

<style scoped>
.edit-page {
  max-width: 1400px;
  margin: 0 auto;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 460px;
}

.preview img {
  max-width: 100%;
  max-height: 700px;
  display: block;
}

.hint {
  margin-top: 12px;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.file-name {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}

.crop-area {
  height: 420px;
  margin-bottom: 12px;
}

.adjust-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.slider-value {
  display: inline-block;
  width: 40px;
  text-align: center;
  margin-left: 10px;
  color: #666;
}
</style>


