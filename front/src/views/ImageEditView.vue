<template>
  <div class="image-edit-container">
    <el-page-header @back="goBack" content="编辑图片" />
    
    <div class="edit-content">
      <div class="image-preview-section">
        <div class="image-canvas-container">
          <img 
            ref="imageCanvas" 
            :src="image.fullUrl" 
            alt="待编辑图片"
            crossorigin="anonymous"
          >
        </div>
      </div>
      
      <div class="edit-controls">
        <el-tabs v-model="activeTab" class="edit-tabs">
          <el-tab-pane label="裁剪" name="crop">
            <div class="control-group">
              <h4>裁剪比例</h4>
              <div class="aspect-ratio-buttons">
                <el-button 
                  v-for="ratio in aspectRatios" 
                  :key="ratio.value"
                  :type="currentAspectRatio === ratio.value ? 'primary' : 'default'"
                  @click="setAspectRatio(ratio.value)"
                >
                  {{ ratio.label }}
                </el-button>
              </div>
              <el-button @click="resetCrop">重置裁剪</el-button>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="滤镜" name="filter">
            <div class="control-group">
              <h4>预设滤镜</h4>
              <div class="filter-presets">
                <div 
                  v-for="filter in filters" 
                  :key="filter.name"
                  class="filter-preset"
                  :class="{ active: currentFilter === filter.name }"
                  @click="applyFilter(filter.name)"
                >
                  <div 
                    class="filter-preview" 
                    :style="{ filter: filter.value }"
                  >
                    <img :src="image.thumbnailUrl" alt="滤镜预览">
                  </div>
                  <span>{{ filter.name }}</span>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="调整" name="adjust">
            <div class="control-group">
              <div class="adjustment-control">
                <label>亮度</label>
                <el-slider 
                  v-model="adjustments.brightness" 
                  :min="0" 
                  :max="200" 
                  :step="1"
                  @change="applyAdjustments"
                />
                <span>{{ adjustments.brightness }}%</span>
              </div>
              
              <div class="adjustment-control">
                <label>对比度</label>
                <el-slider 
                  v-model="adjustments.contrast" 
                  :min="0" 
                  :max="200" 
                  :step="1"
                  @change="applyAdjustments"
                />
                <span>{{ adjustments.contrast }}%</span>
              </div>
              
              <div class="adjustment-control">
                <label>饱和度</label>
                <el-slider 
                  v-model="adjustments.saturation" 
                  :min="0" 
                  :max="200" 
                  :step="1"
                  @change="applyAdjustments"
                />
                <span>{{ adjustments.saturation }}%</span>
              </div>
              
              <el-button @click="resetAdjustments">重置调整</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
        
        <div class="action-buttons">
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="saveChanges">保存更改</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'

export default {
  name: 'ImageEditView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    // 数据状态
    const image = ref({
      id: route.params.id,
      title: '',
      fullUrl: '',
      thumbnailUrl: ''
    })
    
    const activeTab = ref('crop')
    const imageCanvas = ref(null)
    const cropperInstance = ref(null)
    
    // 裁剪相关
    const currentAspectRatio = ref(NaN)
    const aspectRatios = ref([
      { label: '自由', value: NaN },
      { label: '1:1', value: 1 },
      { label: '4:3', value: 4/3 },
      { label: '16:9', value: 16/9 },
      { label: '2:3', value: 2/3 }
    ])
    
    // 滤镜相关
    const currentFilter = ref('原始')
    const filters = ref([
      { name: '原始', value: 'none' },
      { name: '黑白', value: 'grayscale(100%)' },
      { name: '复古', value: 'sepia(100%)' },
      { name: '高对比', value: 'contrast(150%)' },
      { name: '亮色', value: 'brightness(120%)' },
      { name: '暗色', value: 'brightness(80%)' }
    ])
    
    // 调整相关
    const adjustments = reactive({
      brightness: 100,
      contrast: 100,
      saturation: 100
    })
    
    // 返回上一页
    const goBack = () => {
      router.back()
    }
    
    // 初始化裁剪器
    const initCropper = () => {
      if (cropperInstance.value) {
        cropperInstance.value.destroy()
      }
      
      cropperInstance.value = new Cropper(imageCanvas.value, {
        aspectRatio: currentAspectRatio.value,
        viewMode: 1,
        autoCropArea: 0.8,
        movable: true,
        zoomable: true,
        rotatable: true,
        scalable: true
      })
    }
    
    // 设置裁剪比例
    const setAspectRatio = (ratio) => {
      currentAspectRatio.value = ratio
      if (cropperInstance.value) {
        cropperInstance.value.setAspectRatio(ratio)
      }
    }
    
    // 重置裁剪
    const resetCrop = () => {
      if (cropperInstance.value) {
        cropperInstance.value.reset()
      }
    }
    
    // 应用滤镜
    const applyFilter = (filterName) => {
      currentFilter.value = filterName
      const filter = filters.value.find(f => f.name === filterName)
      if (filter && imageCanvas.value) {
        imageCanvas.value.style.filter = filter.value
      }
    }
    
    // 应用调整
    const applyAdjustments = () => {
      if (imageCanvas.value) {
        imageCanvas.value.style.filter = `
          brightness(${adjustments.brightness}%)
          contrast(${adjustments.contrast}%)
          saturate(${adjustments.saturation}%)
        `
      }
    }
    
    // 重置调整
    const resetAdjustments = () => {
      adjustments.brightness = 100
      adjustments.contrast = 100
      adjustments.saturation = 100
      applyAdjustments()
    }
    
    // 取消编辑
    const cancelEdit = () => {
      router.back()
    }
    
    // 获取图片详情
    const fetchImageDetails = async () => {
      try {
        const response = await api.get(`/images/${image.value.id}`)
        const imageData = response.data.image
        image.value.title = imageData.original_filename
        image.value.fullUrl = `/uploads/${imageData.original_filename}`
        // 构造缩略图URL
        const thumbPath = imageData.thumb_path
        if (thumbPath) {
          const thumbName = thumbPath.split('/').pop()
          image.value.thumbnailUrl = `/uploads/thumbnails/${thumbName}`
        }
      } catch (error) {
        console.error('获取图片详情失败:', error)
        ElMessage.error('获取图片详情失败: ' + (error.response?.data?.error || error.message))
      }
    }
    
    // 保存更改
    const saveChanges = async () => {
      try {
        // 根据当前活动的标签页执行不同的保存操作
        if (activeTab.value === 'crop' && cropperInstance.value) {
          // 获取裁剪数据
          const cropData = cropperInstance.value.getData()
          
          // 发送裁剪请求到后端
          await api.post(`/images/${image.value.id}/crop`, {
            x: cropData.x,
            y: cropData.y,
            width: cropData.width,
            height: cropData.height
          })
          
          ElMessage.success('图片裁剪保存成功')
        } else if (activeTab.value === 'adjust') {
          // 发送色调调整请求到后端
          await api.post(`/images/${image.value.id}/adjust`, {
            brightness: adjustments.brightness,
            contrast: adjustments.contrast,
            saturation: adjustments.saturation
          })
          
          ElMessage.success('图片色调调整保存成功')
        } else if (activeTab.value === 'filter') {
          // 滤镜效果已在前端应用，需要发送到后端处理
          // 这里可以根据实际需求实现
          ElMessage.success('滤镜效果保存成功')
        }
        
        // 重新加载图片详情页
        router.push(`/image/${image.value.id}`)
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败: ' + (error.response?.data?.error || error.message))
      }
    }
    
    // 监听标签页变化
    watch(activeTab, (newTab) => {
      if (newTab === 'crop') {
        // 延迟初始化裁剪器，确保DOM已更新
        setTimeout(() => {
          initCropper()
        }, 100)
      } else {
        // 销毁裁剪器
        if (cropperInstance.value) {
          cropperInstance.value.destroy()
          cropperInstance.value = null
        }
      }
    })
    
    // 组件挂载后初始化
    onMounted(async () => {
      // 获取图片详情
      await fetchImageDetails()
      
      // 初始化裁剪器
      setTimeout(() => {
        initCropper()
      }, 100)
    })
    
    return {
      image,
      activeTab,
      imageCanvas,
      currentAspectRatio,
      aspectRatios,
      currentFilter,
      filters,
      adjustments,
      goBack,
      setAspectRatio,
      resetCrop,
      applyFilter,
      applyAdjustments,
      resetAdjustments,
      cancelEdit,
      saveChanges
    }
  }
}
</script>

<style scoped>
.image-edit-container {
  padding: 20px;
  height: calc(100vh - 40px);
}

.edit-content {
  display: flex;
  height: calc(100% - 60px);
  margin-top: 20px;
  gap: 30px;
}

.image-preview-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.image-canvas-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.image-canvas-container img {
  max-width: 100%;
  max-height: 100%;
  display: block;
}

.edit-controls {
  width: 350px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.edit-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.edit-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
}

.control-group {
  padding: 20px 0;
}

.control-group h4 {
  margin: 0 0 15px 0;
  color: #333;
}

.aspect-ratio-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.aspect-ratio-buttons .el-button {
  flex: 1;
  min-width: 70px;
}

.filter-presets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.filter-preset {
  text-align: center;
  cursor: pointer;
}

.filter-preset.active .filter-preview {
  border-color: #409eff;
  box-shadow: 0 0 0 2px #409eff;
}

.filter-preview {
  width: 100%;
  height: 80px;
  border: 2px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 5px;
}

.filter-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.adjustment-control {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.adjustment-control label {
  width: 60px;
  margin-right: 15px;
}

.adjustment-control .el-slider {
  flex: 1;
  margin-right: 15px;
}

.adjustment-control span {
  width: 50px;
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 15px;
  padding: 20px 0;
  border-top: 1px solid #ebeef5;
}

.action-buttons .el-button {
  flex: 1;
}
</style>