<template>
  <div class="tag-selector">
    <div class="selected-tags" v-if="modelValue && modelValue.length > 0">
      <el-tag
        v-for="tag in modelValue"
        :key="tag.id"
        closable
        @close="removeTag(tag)"
        style="margin-right: 10px; margin-bottom: 10px;"
      >
        {{ tag.name }}
      </el-tag>
    </div>
    
    <div class="tag-input-area">
      <el-select
        v-model="selectedTag"
        filterable
        remote
        :remote-method="searchTags"
        :loading="loading"
        placeholder="请选择或搜索标签"
        style="width: 100%;"
        @change="addTag"
      >
        <el-option
          v-for="tag in tagOptions"
          :key="tag.id"
          :label="tag.name"
          :value="tag"
        />
      </el-select>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'TagSelector',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    maxTags: {
      type: Number,
      default: 10
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const selectedTag = ref('')
    const tagOptions = ref([])
    const loading = ref(false)
    const allTags = ref([
      { id: 1, name: '风景' },
      { id: 2, name: '自然' },
      { id: 3, name: '山川' },
      { id: 4, name: '城市' },
      { id: 5, name: '夜晚' },
      { id: 6, name: '动物' },
      { id: 7, name: '宠物' },
      { id: 8, name: '人物' },
      { id: 9, name: '建筑' },
      { id: 10, name: '美食' },
      { id: 11, name: '旅行' },
      { id: 12, name: '生活' }
    ])
    
    // 搜索标签
    const searchTags = (query) => {
      if (query !== '') {
        loading.value = true
        // 模拟API调用延迟
        setTimeout(() => {
          tagOptions.value = allTags.value.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase())
          )
          loading.value = false
        }, 200)
      } else {
        tagOptions.value = []
      }
    }
    
    // 添加标签
    const addTag = (tag) => {
      if (tag) {
        // 检查是否已添加
        const exists = props.modelValue.some(t => t.id === tag.id)
        if (!exists) {
          // 检查是否超过最大数量
          if (props.modelValue.length >= props.maxTags) {
            ElMessage.warning(`最多只能添加${props.maxTags}个标签`)
            return
          }
          
          const newValue = [...props.modelValue, tag]
          emit('update:modelValue', newValue)
        } else {
          ElMessage.warning('该标签已添加')
        }
      }
      selectedTag.value = ''
    }
    
    // 删除标签
    const removeTag = (tag) => {
      const newValue = props.modelValue.filter(t => t.id !== tag.id)
      emit('update:modelValue', newValue)
    }
    
    // 初始化标签选项
    onMounted(() => {
      tagOptions.value = allTags.value
    })
    
    return {
      selectedTag,
      tagOptions,
      loading,
      searchTags,
      addTag,
      removeTag
    }
  }
}
</script>

<style scoped>
.tag-selector {
  width: 100%;
}

.selected-tags {
  margin-bottom: 15px;
  min-height: 32px;
}
</style>