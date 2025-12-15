import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useTagStore = defineStore('tag', () => {
  // 所有标签
  const tags = ref([])
  
  // 用户自定义标签
  const customTags = ref([])
  
  // 常用标签
  const popularTags = ref([])
  
  // 设置所有标签
  function setTags(data) {
    tags.value = data
  }
  
  // 设置用户自定义标签
  function setCustomTags(data) {
    customTags.value = data
  }
  
  // 设置常用标签
  function setPopularTags(data) {
    popularTags.value = data
  }
  
  // 添加自定义标签
  function addCustomTag(tag) {
    customTags.value.push(tag)
    
    // 如果标签不在总标签列表中，也添加进去
    if (!tags.value.some(t => t.id === tag.id)) {
      tags.value.push(tag)
    }
  }
  
  // 删除自定义标签
  function removeCustomTag(tagId) {
    customTags.value = customTags.value.filter(tag => tag.id !== tagId)
  }
  
  // 根据搜索词过滤标签
  function searchTags(query) {
    if (!query) return tags.value
    
    return tags.value.filter(tag => 
      tag.name.toLowerCase().includes(query.toLowerCase())
    )
  }
  
  // 重置状态
  function reset() {
    tags.value = []
    customTags.value = []
    popularTags.value = []
  }
  
  return { 
    tags,
    customTags,
    popularTags,
    setTags,
    setCustomTags,
    setPopularTags,
    addCustomTag,
    removeCustomTag,
    searchTags,
    reset
  }
})