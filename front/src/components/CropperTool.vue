<template>
  <div class="cropper-tool">
    <div class="cropper-container">
      <img 
        ref="cropperImage" 
        :src="imageUrl" 
        alt="待裁剪图片"
        crossorigin="anonymous"
      >
    </div>
    
    <div class="cropper-controls">
      <div class="aspect-ratio-buttons">
        <el-button 
          v-for="ratio in aspectRatios" 
          :key="ratio.value"
          :type="currentAspectRatio === ratio.value ? 'primary' : 'default'"
          size="small"
          @click="setAspectRatio(ratio.value)"
        >
          {{ ratio.label }}
        </el-button>
      </div>
      
      <div class="action-buttons">
        <el-button @click="reset">重置</el-button>
        <el-button type="primary" @click="confirmCrop">确认裁剪</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

export default {
  name: 'CropperTool',
  props: {
    imageUrl: {
      type: String,
      required: true
    },
    aspectRatio: {
      type: Number,
      default: NaN
    }
  },
  emits: ['crop-confirm'],
  setup(props, { emit }) {
    const cropperImage = ref(null)
    let cropperInstance = null  // 不使用 ref，直接使用普通变量
    const currentAspectRatio = ref(props.aspectRatio)
    const imageLoaded = ref(false)
    
    const aspectRatios = ref([
      { label: '自由', value: NaN },
      { label: '1:1', value: 1 },
      { label: '4:3', value: 4/3 },
      { label: '16:9', value: 16/9 },
      { label: '2:3', value: 2/3 }
    ])
    
    // 初始化裁剪器
    const initCropper = () => {
      if (!cropperImage.value) {
        console.error('cropperImage ref is null')
        return
      }

      // 销毁旧实例
      if (cropperInstance) {
        cropperInstance.destroy()
        cropperInstance = null
      }
      
      // 等待图片加载完成后再初始化
      const imgElement = cropperImage.value
      
      const createCropper = () => {
        try {
          cropperInstance = new Cropper(imgElement, {
            aspectRatio: currentAspectRatio.value,
            viewMode: 1,
            autoCropArea: 0.8,
            movable: true,
            zoomable: true,
            rotatable: true,
            scalable: true,
            ready() {
              console.log('Cropper initialized successfully')
              imageLoaded.value = true
            }
          })
        } catch (error) {
          console.error('Failed to initialize cropper:', error)
        }
      }
      
      // 如果图片已经加载，直接初始化
      if (imgElement.complete) {
        createCropper()
      } else {
        // 否则等待图片加载
        imgElement.onload = createCropper
        imgElement.onerror = () => {
          console.error('Failed to load image')
        }
      }
    }
    
    // 设置裁剪比例
    const setAspectRatio = (ratio) => {
      currentAspectRatio.value = ratio
      if (cropperInstance && typeof cropperInstance.setAspectRatio === 'function') {
        cropperInstance.setAspectRatio(ratio)
      }
    }
    
    // 重置裁剪
    const reset = () => {
      if (cropperInstance && typeof cropperInstance.reset === 'function') {
        cropperInstance.reset()
      }
    }
    
    // 确认裁剪
    const confirmCrop = () => {
      if (!cropperInstance) {
        console.error('Cropper instance is not initialized')
        return
      }
      
      try {
        // 检查方法是否存在
        if (typeof cropperInstance.getData !== 'function') {
          console.error('getData method does not exist on cropper instance')
          return
        }
        
        // 获取裁剪后的图片数据
        const cropData = cropperInstance.getData(true)
        const canvas = cropperInstance.getCroppedCanvas()
        
        if (!canvas) {
          console.error('Failed to get cropped canvas')
          return
        }
        
        canvas.toBlob((blob) => {
          if (blob) {
            emit('crop-confirm', blob, canvas.toDataURL(), cropData)
          } else {
            console.error('Failed to create blob from canvas')
          }
        })
      } catch (error) {
        console.error('Error during crop confirmation:', error)
      }
    }
    
    // 监听图片URL变化
    watch(() => props.imageUrl, async (newUrl) => {
      if (newUrl) {
        imageLoaded.value = false
        await nextTick()
        // 等待 DOM 更新后再初始化
        setTimeout(() => {
          initCropper()
        }, 200)
      }
    })
    
    // 监听裁剪比例变化
    watch(() => props.aspectRatio, (newRatio) => {
      currentAspectRatio.value = newRatio
      if (cropperInstance && typeof cropperInstance.setAspectRatio === 'function') {
        cropperInstance.setAspectRatio(newRatio)
      }
    })
    
    // 组件挂载后初始化
    onMounted(async () => {
      if (props.imageUrl && cropperImage.value) {
        await nextTick()
        setTimeout(() => {
          initCropper()
        }, 200)
      }
    })
    
    // 组件卸载前销毁裁剪器
    onUnmounted(() => {
      if (cropperInstance) {
        try {
          cropperInstance.destroy()
        } catch (error) {
          console.error('Error destroying cropper:', error)
        }
        cropperInstance = null
      }
    })
    
    return {
      cropperImage,
      currentAspectRatio,
      aspectRatios,
      imageLoaded,
      setAspectRatio,
      reset,
      confirmCrop
    }
  }
}
</script>

<style scoped>
.cropper-tool {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cropper-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.cropper-container img {
  max-width: 100%;
  max-height: 100%;
  display: block;
}

.cropper-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.aspect-ratio-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}
</style>