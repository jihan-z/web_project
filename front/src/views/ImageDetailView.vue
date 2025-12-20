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
                  <div class="card-header">
                    <span>图片信息</span>
                    <el-button
                      :type="showFullExif ? 'primary' : 'default'"
                      size="small"
                      @click="toggleFullExif"
                      :loading="loadingExif"
                    >
                      <el-icon v-if="!loadingExif">
                        <component :is="showFullExif ? 'Hide' : 'View'" />
                      </el-icon>
                      {{ showFullExif ? '隐藏详细信息' : '显示详细信息' }}
                    </el-button>
                  </div>
                </template>

                <el-form label-position="top">
                  <el-form-item label="文件名">
                    <div class="filename-edit">
                      <el-input
                        v-model="editableFilename"
                        placeholder="输入文件名"
                        :disabled="!editingFilename"
                      >
                        <template #suffix>
                          <span class="file-extension">.{{ fileExtension }}</span>
                        </template>
                      </el-input>
                      <el-button
                        :icon="editingFilename ? 'Check' : 'Edit'"
                        :type="editingFilename ? 'primary' : 'default'"
                        size="small"
                        @click="toggleEditFilename"
                        style="margin-left: 8px"
                      >
                        {{ editingFilename ? '保存' : '编辑' }}
                      </el-button>
                    </div>
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
                      {{ formatGPS(image.gps_latitude) }}, {{ formatGPS(image.gps_longitude) }}
                    </div>
                  </el-form-item>

                  <el-form-item label="上传时间">
                    <div class="info-value">{{ formatDateTime(image.created_at) }}</div>
                  </el-form-item>

                  <!-- 详细 EXIF 信息 -->
                  <template v-if="showFullExif">
                    <el-divider />
                    <el-form-item label="详细 EXIF 信息">
                      <div v-if="loadingExif" class="exif-loading">
                        <el-icon class="is-loading"><Loading /></el-icon>
                        <span>正在加载 EXIF 信息...</span>
                      </div>
                      <div v-else-if="fullExifData" class="exif-details">
                        <el-collapse>
                          <el-collapse-item title="相机信息" name="camera">
                            <div class="exif-item" v-if="fullExifData.exif?.Make || fullExifData.cameraMake">
                              <span class="exif-label">设备制造商:</span>
                              <span class="exif-value">{{ fullExifData.exif?.Make || fullExifData.cameraMake }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.Model || fullExifData.cameraModel">
                              <span class="exif-label">设备型号:</span>
                              <span class="exif-value">{{ fullExifData.exif?.Model || fullExifData.cameraModel }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.LensModel || fullExifData.lensModel">
                              <span class="exif-label">镜头型号:</span>
                              <span class="exif-value">{{ fullExifData.exif?.LensModel || fullExifData.lensModel }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.Software || fullExifData.software">
                              <span class="exif-label">内容创作者:</span>
                              <span class="exif-value">{{ fullExifData.exif?.Software || fullExifData.software }}</span>
                            </div>
                          </el-collapse-item>
                          
                          <el-collapse-item title="拍摄参数" name="settings">
                            <div class="exif-item" v-if="fullExifData.exif?.ExposureTime || fullExifData.exposureTime">
                              <span class="exif-label">曝光时间:</span>
                              <span class="exif-value">{{ formatExposureTime(fullExifData.exif?.ExposureTime || fullExifData.exposureTime) }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.FNumber || fullExifData.fNumber">
                              <span class="exif-label">光圈数:</span>
                              <span class="exif-value">f/{{ fullExifData.exif?.FNumber || fullExifData.fNumber }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.ISO || fullExifData.exif?.ISOSpeedRatings || fullExifData.iso">
                              <span class="exif-label">ISO感光度:</span>
                              <span class="exif-value">{{ fullExifData.exif?.ISO || fullExifData.exif?.ISOSpeedRatings || fullExifData.iso }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.FocalLength || fullExifData.focalLength">
                              <span class="exif-label">焦距:</span>
                              <span class="exif-value">{{ formatFocalLength(fullExifData.exif?.FocalLength || fullExifData.focalLength) }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.FocalLengthIn35mmFilm || fullExifData.focalLength35mm">
                              <span class="exif-label">等效焦距:</span>
                              <span class="exif-value">{{ fullExifData.exif?.FocalLengthIn35mmFilm || fullExifData.focalLength35mm }}mm</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.ExposureProgram">
                              <span class="exif-label">曝光模式:</span>
                              <span class="exif-value">{{ formatExposureProgram(fullExifData.exif.ExposureProgram) }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.ExposureBiasValue !== undefined && fullExifData.exif?.ExposureBiasValue !== null">
                              <span class="exif-label">曝光补偿:</span>
                              <span class="exif-value">{{ formatExposureBias(fullExifData.exif.ExposureBiasValue) }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.MeteringMode">
                              <span class="exif-label">测光模式:</span>
                              <span class="exif-value">{{ formatMeteringMode(fullExifData.exif.MeteringMode) }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.Flash !== undefined && fullExifData.exif?.Flash !== null">
                              <span class="exif-label">闪光灯:</span>
                              <span class="exif-value">{{ formatFlash(fullExifData.exif.Flash) }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.WhiteBalance !== undefined && fullExifData.exif?.WhiteBalance !== null">
                              <span class="exif-label">白平衡:</span>
                              <span class="exif-value">{{ formatWhiteBalance(fullExifData.exif.WhiteBalance) }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.SceneCaptureType !== undefined && fullExifData.exif?.SceneCaptureType !== null">
                              <span class="exif-label">场景捕获类型:</span>
                              <span class="exif-value">{{ formatSceneCaptureType(fullExifData.exif.SceneCaptureType) }}</span>
                            </div>
                          </el-collapse-item>
                          
                          <el-collapse-item title="图像信息" name="image">
                            <div class="exif-item" v-if="fullExifData.exif?.ImageWidth || fullExifData.exif?.PixelXDimension || fullExifData.imageWidth">
                              <span class="exif-label">尺寸:</span>
                              <span class="exif-value">
                                {{ fullExifData.exif?.ImageWidth || fullExifData.exif?.PixelXDimension || fullExifData.imageWidth || fullExifData.width }} × 
                                {{ fullExifData.exif?.ImageLength || fullExifData.exif?.PixelYDimension || fullExifData.imageHeight || fullExifData.height }}
                              </span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.XResolution || fullExifData.xResolution">
                              <span class="exif-label">分辨率:</span>
                              <span class="exif-value">
                                {{ fullExifData.exif?.XResolution || fullExifData.xResolution }} × 
                                {{ fullExifData.exif?.YResolution || fullExifData.yResolution }}
                                <span v-if="fullExifData.exif?.ResolutionUnit || fullExifData.resolutionUnit">
                                  {{ formatResolutionUnit(fullExifData.exif?.ResolutionUnit || fullExifData.resolutionUnit) }}
                                </span>
                              </span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.Orientation || fullExifData.orientation">
                              <span class="exif-label">图像方向:</span>
                              <span class="exif-value">{{ formatOrientation(fullExifData.exif?.Orientation || fullExifData.orientation) }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.format">
                              <span class="exif-label">格式:</span>
                              <span class="exif-value">{{ fullExifData.format.toUpperCase() }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.channels">
                              <span class="exif-label">通道数:</span>
                              <span class="exif-value">{{ fullExifData.channels }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.ColorSpace !== undefined && fullExifData.exif?.ColorSpace !== null">
                              <span class="exif-label">色彩空间:</span>
                              <span class="exif-value">{{ formatColorSpace(fullExifData.exif.ColorSpace) }}</span>
                            </div>
                          </el-collapse-item>
                          
                          <el-collapse-item title="GPS 信息" name="gps" v-if="(fullExifData.exif?.GPSLatitude || fullExifData.gpsLatitude) && (fullExifData.exif?.GPSLongitude || fullExifData.gpsLongitude)">
                            <div class="exif-item">
                              <span class="exif-label">GPS经纬度:</span>
                              <span class="exif-value">
                                {{ formatGPS(fullExifData.exif?.GPSLatitude || fullExifData.gpsLatitude) }} 
                                {{ formatGPS(fullExifData.exif?.GPSLongitude || fullExifData.gpsLongitude) }}
                              </span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.GPSLatitudeRef">
                              <span class="exif-label">纬度参考:</span>
                              <span class="exif-value">{{ fullExifData.exif.GPSLatitudeRef }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.GPSLongitudeRef">
                              <span class="exif-label">经度参考:</span>
                              <span class="exif-value">{{ fullExifData.exif.GPSLongitudeRef }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.GPSAltitude || fullExifData.gpsAltitude">
                              <span class="exif-label">GPS海拔:</span>
                              <span class="exif-value">{{ formatGPS(fullExifData.exif?.GPSAltitude || fullExifData.gpsAltitude) }} 米</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.GPSDateStamp || fullExifData.gpsDateStamp">
                              <span class="exif-label">GPS日期:</span>
                              <span class="exif-value">{{ fullExifData.exif?.GPSDateStamp || fullExifData.gpsDateStamp }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.GPSTimeStamp || fullExifData.gpsTimeStamp">
                              <span class="exif-label">GPS时间:</span>
                              <span class="exif-value">{{ formatGPSTimeStamp(fullExifData.exif?.GPSTimeStamp || fullExifData.gpsTimeStamp) }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.GPSImgDirection">
                              <span class="exif-label">拍摄方向:</span>
                              <span class="exif-value">{{ formatGPS(fullExifData.exif.GPSImgDirection) }}°</span>
                            </div>
                          </el-collapse-item>
                          
                          <el-collapse-item title="时间信息" name="time">
                            <div class="exif-item" v-if="fullExifData.exif?.DateTimeOriginal">
                              <span class="exif-label">内容创建时间:</span>
                              <span class="exif-value">{{ formatExifDateTime(fullExifData.exif.DateTimeOriginal) }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.DateTimeDigitized">
                              <span class="exif-label">原始日期:</span>
                              <span class="exif-value">{{ formatExifDateTime(fullExifData.exif.DateTimeDigitized) }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.OffsetTimeOriginal">
                              <span class="exif-label">时区:</span>
                              <span class="exif-value">{{ fullExifData.exif.OffsetTimeOriginal }}</span>
                            </div>
                          </el-collapse-item>
                          
                          <el-collapse-item title="其他信息" name="other">
                            <div class="exif-item" v-if="fullExifData.exif?.Artist">
                              <span class="exif-label">作者:</span>
                              <span class="exif-value">{{ fullExifData.exif.Artist }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.Copyright">
                              <span class="exif-label">版权:</span>
                              <span class="exif-value">{{ fullExifData.exif.Copyright }}</span>
                            </div>
                            <div class="exif-item" v-if="fullExifData.exif?.UserComment">
                              <span class="exif-label">用户注释:</span>
                              <span class="exif-value">{{ fullExifData.exif.UserComment }}</span>
                            </div>
                          </el-collapse-item>
                        </el-collapse>
                      </div>
                      <div v-else class="exif-empty">
                        <el-empty description="未找到 EXIF 信息" :image-size="80" />
                      </div>
                    </el-form-item>
                  </template>

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
const editableFilename = ref('');
const editingFilename = ref(false);
const fileExtension = ref('');
const showFullExif = ref(false);
const loadingExif = ref(false);
const fullExifData = ref(null);

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

const formatGPS = (value) => {
  if (!value) return '';
  // 转换为数字并格式化，保留6位小数
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (isNaN(num)) return value;
  return num.toFixed(6);
};

const formatExposureTime = (value) => {
  if (!value) return '';
  const num = Number(value);
  if (isNaN(num)) return value;
  if (num >= 1) {
    return `${num.toFixed(1)} 秒`;
  } else {
    return `1/${Math.round(1 / num)} 秒`;
  }
};

const formatExposureProgram = (value) => {
  const programs = {
    0: '未定义',
    1: '手动',
    2: '标准程序',
    3: '光圈优先',
    4: '快门优先',
    5: '创意程序',
    6: '动作程序',
    7: '肖像模式',
    8: '风景模式'
  };
  return programs[value] || `模式 ${value}`;
};

const formatMeteringMode = (value) => {
  const modes = {
    0: '未知',
    1: '平均',
    2: '中央重点',
    3: '点测光',
    4: '多点',
    5: '多区域',
    6: '部分',
    255: '其他'
  };
  return modes[value] || `模式 ${value}`;
};

const formatFlash = (value) => {
  if (value === 0) return '未使用';
  if (value === 1) return '已使用';
  const bits = value.toString(2);
  const fired = bits[bits.length - 1] === '1';
  const returned = bits.length > 1 && bits[bits.length - 2] === '1';
  return `${fired ? '已' : '未'}闪光${returned ? '，返回检测到' : ''}`;
};

const formatWhiteBalance = (value) => {
  return value === 0 ? '自动' : '手动';
};

const formatColorSpace = (value) => {
  const spaces = {
    1: 'sRGB',
    65535: 'Uncalibrated'
  };
  return spaces[value] || `色彩空间 ${value}`;
};

const formatFocalLength = (value) => {
  if (!value) return '';
  const num = Number(value);
  if (isNaN(num)) return value;
  return `${num.toFixed(2)} mm`;
};

const formatExposureBias = (value) => {
  if (value === undefined || value === null) return '';
  const num = Number(value);
  if (isNaN(num)) return value;
  if (num === 0) return '0 EV';
  return `${num > 0 ? '+' : ''}${num.toFixed(1)} EV`;
};

const formatSceneCaptureType = (value) => {
  const types = {
    0: 'Standard',
    1: 'Landscape',
    2: 'Portrait',
    3: 'Night scene'
  };
  return types[value] || `类型 ${value}`;
};

const formatResolutionUnit = (value) => {
  const units = {
    1: '无单位',
    2: 'inches',
    3: 'cm'
  };
  return units[value] || '';
};

const formatOrientation = (value) => {
  const orientations = {
    1: 'Normal',
    2: 'Flip horizontal',
    3: 'Rotate 180',
    4: 'Flip vertical',
    5: 'Rotate 90 CW and flip horizontal',
    6: 'Rotate 90 CW',
    7: 'Rotate 90 CCW and flip horizontal',
    8: 'Rotate 90 CCW'
  };
  return orientations[value] || 'Undefined';
};

const formatExifDateTime = (value) => {
  if (!value) return '';
  // EXIF 日期格式通常是 "YYYY:MM:DD HH:mm:ss"
  if (typeof value === 'string' && value.includes(':')) {
    return value.replace(/:/g, '-').replace(' ', ' ');
  }
  return formatDateTime(value);
};

const formatGPSTimeStamp = (value) => {
  if (!value) return '';
  // GPS 时间戳可能是数组格式 [小时, 分钟, 秒]
  if (Array.isArray(value) && value.length >= 3) {
    const [h, m, s] = value;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(Math.round(s)).padStart(2, '0')}`;
  }
  return String(value);
};

const loadImage = async (includeExif = false) => {
  loading.value = true;
  try {
    const imageData = await imagesStore.fetchImageDetail(route.params.id, includeExif);
    image.value = imageData;
    description.value = imageData.description || '';
    
    // 解析文件名和扩展名
    const filename = imageData.original_filename || '';
    const lastDot = filename.lastIndexOf('.');
    if (lastDot > 0) {
      editableFilename.value = filename.substring(0, lastDot);
      fileExtension.value = filename.substring(lastDot + 1);
    } else {
      editableFilename.value = filename;
      fileExtension.value = '';
    }

    const tags = await tagsStore.fetchTags();
    availableTags.value = tags;

    if (imageData.tags) {
      const allTags = imageData.tags.split(',');
      customTags.value = allTags.filter(tag => {
        const tagObj = tags.find(t => t.name === tag);
        return tagObj?.type === 'custom';
      });
    }
    
    // 如果有完整 EXIF 数据，保存它
    if (imageData.fullExif) {
      fullExifData.value = imageData.fullExif;
    }
  } catch (error) {
    console.error('Failed to load image:', error);
    ElMessage.error('加载图片失败');
    router.back();
  } finally {
    loading.value = false;
    loadingExif.value = false;
  }
};

const toggleFullExif = async () => {
  if (showFullExif.value) {
    // 隐藏详细信息
    showFullExif.value = false;
    fullExifData.value = null;
  } else {
    // 显示详细信息
    showFullExif.value = true;
    
    // 如果还没有加载 EXIF 数据，则加载
    if (!fullExifData.value) {
      loadingExif.value = true;
      try {
        await loadImage(true);
      } catch (error) {
        console.error('Failed to load EXIF:', error);
        ElMessage.error('加载 EXIF 信息失败');
        showFullExif.value = false;
      }
    }
  }
};

const toggleEditFilename = async () => {
  if (editingFilename.value) {
    // 保存文件名
    const newFilename = editableFilename.value.trim();
    if (!newFilename) {
      ElMessage.warning('文件名不能为空');
      return;
    }
    
    // 检查文件名是否包含非法字符
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(newFilename)) {
      ElMessage.warning('文件名包含非法字符');
      return;
    }
    
    const fullFilename = fileExtension.value ? `${newFilename}.${fileExtension.value}` : newFilename;
    
    try {
      await imagesStore.updateImage(route.params.id, {
        filename: fullFilename
      });
      ElMessage.success('文件名修改成功');
      editingFilename.value = false;
      await loadImage();
    } catch (error) {
      console.error('Failed to update filename:', error);
      ElMessage.error('文件名修改失败');
    }
  } else {
    // 开始编辑
    editingFilename.value = true;
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

.filename-edit {
  display: flex;
  align-items: center;
}

.file-extension {
  color: #999;
  font-size: 14px;
  margin-right: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.exif-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #999;
  gap: 8px;
}

.exif-details {
  max-height: 600px;
  overflow-y: auto;
}

.exif-item {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.exif-item:last-child {
  border-bottom: none;
}

.exif-label {
  font-weight: 500;
  color: #666;
  min-width: 100px;
  margin-right: 12px;
}

.exif-value {
  color: #333;
  flex: 1;
  word-break: break-all;
}

.exif-empty {
  padding: 20px;
  text-align: center;
}

:deep(.el-collapse-item__header) {
  font-weight: 500;
  color: #333;
}

:deep(.el-collapse-item__content) {
  padding: 12px 0;
}
</style>

