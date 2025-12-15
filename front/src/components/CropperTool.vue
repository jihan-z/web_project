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
import { ref, onMounted, onUnmounted, watch } from 'vue'
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
    const cropperInstance = ref(null)
    const currentAspectRatio = ref(props.aspectRatio)
    
    const aspectRatios = ref([
      { label: '自由', value: NaN },
      { label: '1:1', value: 1 },
      { label: '4:3', value: 4/3 },
      { label: '16:9', value: 16/9 },
      { label: '2:3', value: 2/3 }
    ])
    
    // 初始化裁剪器
    const initCropper = () => {
      if (cropperInstance.value) {
        cropperInstance.value.destroy()
      }
      
      cropperInstance.value = new Cropper(cropperImage.value, {
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
    const reset = () => {
      if (cropperInstance.value) {
        cropperInstance.value.reset()
      }
    }
    
    // 确认裁剪
    const confirmCrop = () => {
      if (cropperInstance.value) {
        // 获取裁剪后的图片数据
        const canvas = cropperInstance.value.getCroppedCanvas()
        canvas.toBlob((blob) => {
          emit('crop-confirm', blob, canvas.toDataURL())
        })
      }
    }
    
    // 监听图片URL变化
    watch(() => props.imageUrl, () => {
      if (props.imageUrl) {
        // 延迟初始化以确保图片加载完成
        setTimeout(() => {
          initCropper()
        }, 100)
      }
    })
    
    // 监听裁剪比例变化
    watch(() => props.aspectRatio, (newRatio) => {
      currentAspectRatio.value = newRatio
      if (cropperInstance.value) {
        cropperInstance.value.setAspectRatio(newRatio)
      }
    })
    
    // 组件挂载后初始化
    onMounted(() => {
      if (props.imageUrl) {
        setTimeout(() => {
          initCropper()
        }, 100)
      }
    })
    
    // 组件卸载前销毁裁剪器
    onUnmounted(() => {
      if (cropperInstance.value) {
        cropperInstance.value.destroy()
        cropperInstance.value = null
      }
    })
    
    return {
      cropperImage,
      currentAspectRatio,
      aspectRatios,
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