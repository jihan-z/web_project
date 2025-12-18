<template>
  <div class="tag-selector">
    <div class="selected-tags" v-if="modelValue && modelValue.length > 0">
      <div
        v-for="tag in modelValue"
        :key="tag.id"
        class="tag-chip"
      >
        <span class="tag-name">{{ tag.name }}</span>
        <button class="tag-remove" @click="removeTag(tag)">×</button>
      </div>
    </div>

    <div class="tag-input-area">
      <el-input
        v-model="inputValue"
        placeholder="输入新标签并回车，或搜索选择已有标签"
        @keyup.enter.native="createOrAdd"
        clearable
        class="tag-input"
      />

      <el-select
        v-model="selectedTag"
        filterable
        remote
        :remote-method="searchTags"
        :loading="loading"
        placeholder="搜索标签并回车添加"
        class="tag-select"
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
    const inputValue = ref('')
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
      inputValue.value = ''
    }
    
    // 删除标签
    const removeTag = (tag) => {
      const newValue = props.modelValue.filter(t => t.id !== tag.id)
      emit('update:modelValue', newValue)
    }

    const createOrAdd = () => {
      const name = inputValue.value && inputValue.value.trim()
      if (!name) return

      // 尝试在已有标签中查找
      let found = allTags.value.find(t => t.name === name)
      if (!found) {
        // 生成临时 id（前端）
        const newId = Date.now()
        found = { id: newId, name }
        // 可选：将新标签加入全局列表
        allTags.value.unshift(found)
      }

      addTag(found)
    }
    
    // 初始化标签选项
    onMounted(() => {
      tagOptions.value = allTags.value
    })
    
    return {
      selectedTag,
      inputValue,
      tagOptions,
      loading,
      searchTags,
      addTag,
      removeTag
      ,createOrAdd
    }
  }
}
</script>

<style scoped>
.tag-selector {
  width: 100%;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(180deg,#fff,#f5f7fa);
  border: 1px solid #e6e9ef;
  padding: 6px 10px;
  border-radius: 20px;
  box-shadow: 0 1px 2px rgba(16,24,40,0.04);
}

.tag-name {
  margin-right: 8px;
  color: #324057;
  font-size: 13px;
}

.tag-remove {
  border: none;
  background: transparent;
  cursor: pointer;
  color: #8b9bb1;
  font-weight: 600;
}

.tag-input-area {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tag-input {
  flex: 1;
}

.tag-select {
  width: 260px;
}
</style>