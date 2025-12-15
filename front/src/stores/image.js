import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useImageStore = defineStore('image', () => {
  // 图片列表相关状态
  const images = ref([])
  const currentPage = ref(1)
  const pageSize = ref(12)
  const totalImages = ref(0)
  const loading = ref(false)
  
  // 搜索和筛选相关状态
  const searchQuery = ref('')
  const selectedTags = ref([])
  
  // 当前查看的图片
  const currentImage = ref(null)
  
  // 设置图片列表
  function setImages(data) {
    images.value = data.images
    totalImages.value = data.total
    currentPage.value = data.currentPage
  }
  
  // 添加图片到列表
  function addImage(image) {
    images.value.unshift(image)
    totalImages.value += 1
  }
  
  // 更新图片信息
  function updateImage(updatedImage) {
    const index = images.value.findIndex(img => img.id === updatedImage.id)
    if (index !== -1) {
      images.value[index] = updatedImage
    }
    
    // 如果当前查看的是这个图片，也更新
    if (currentImage.value && currentImage.value.id === updatedImage.id) {
      currentImage.value = updatedImage
    }
  }
  
  // 从列表中删除图片
  function removeImage(imageId) {
    images.value = images.value.filter(img => img.id !== imageId)
    totalImages.value -= 1
    
    // 如果当前查看的是这个图片，清空
    if (currentImage.value && currentImage.value.id === imageId) {
      currentImage.value = null
    }
  }
  
  // 设置当前查看的图片
  function setCurrentImage(image) {
    currentImage.value = image
  }
  
  // 设置加载状态
  function setLoading(status) {
    loading.value = status
  }
  
  // 设置搜索查询
  function setSearchQuery(query) {
    searchQuery.value = query
  }
  
  // 设置选中的标签
  function setSelectedTags(tags) {
    selectedTags.value = tags
  }
  
  // 重置状态
  function reset() {
    images.value = []
    currentPage.value = 1
    pageSize.value = 12
    totalImages.value = 0
    loading.value = false
    searchQuery.value = ''
    selectedTags.value = []
    currentImage.value = null
  }
  
  return { 
    // 状态
    images,
    currentPage,
    pageSize,
    totalImages,
    loading,
    searchQuery,
    selectedTags,
    currentImage,
    
    // 方法
    setImages,
    addImage,
    updateImage,
    removeImage,
    setCurrentImage,
    setLoading,
    setSearchQuery,
    setSelectedTags,
    reset
  }
})