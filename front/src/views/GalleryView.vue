<template>
  <MainLayout>
    <div class="gallery-page">
      <!-- 搜索和筛选 -->
      <el-card class="filter-card">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索图片..."
              clearable
              @change="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>

          <el-col :span="8">
            <el-select
              v-model="filters.tags"
              multiple
              placeholder="选择标签"
              clearable
              filterable
              @change="handleSearch"
              style="width: 100%"
            >
              <el-option
                v-for="tag in allTags"
                :key="tag.id"
                :label="tag.name"
                :value="tag.name"
              />
            </el-select>
          </el-col>

          <el-col :span="8">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="handleDateChange"
              style="width: 100%"
            />
          </el-col>
        </el-row>

        <div class="filter-actions">
          <el-button @click="handleReset">重置</el-button>
          <el-button
            v-if="selectedImages.length > 0"
            type="danger"
            @click="handleBatchDelete"
          >
            删除选中 ({{ selectedImages.length }})
          </el-button>
        </div>
      </el-card>

      <!-- 图片网格 -->
      <el-card class="images-card">
        <el-skeleton :loading="loading" :rows="5" animated>
          <div v-if="images.length === 0" class="empty-state">
            <el-empty description="暂无图片">
              <el-button type="primary" @click="router.push('/upload')">
                上传图片
              </el-button>
            </el-empty>
          </div>

          <div v-else>
            <div class="image-grid">
              <div
                v-for="image in images"
                :key="image.id"
                class="image-card"
                :class="{ selected: selectedImages.includes(image.id) }"
              >
                <el-checkbox
                  v-model="selectedImages"
                  :label="image.id"
                  class="image-checkbox"
                />

                <div class="image-wrapper" @click="router.push(`/image/${image.id}/edit`)">
                  <img
                    :src="getImageUrl(image.thumbnail_path || image.stored_path, image.id)"
                    :alt="image.original_filename"
                  />
                </div>

                <div class="image-info">
                  <div class="image-name">{{ image.original_filename }}</div>
                  <div class="image-meta">
                    <span v-if="image.width && image.height">
                      {{ image.width }} × {{ image.height }}
                    </span>
                    <span>{{ formatDate(image.created_at) }}</span>
                  </div>
                  <div class="image-tags" v-if="image.tags">
                    <el-tag
                      v-for="tag in image.tags.split(',').slice(0, 3)"
                      :key="tag"
                      size="small"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="pagination.page"
                v-model:page-size="pagination.limit"
                :total="pagination.total"
                :page-sizes="[12, 24, 48, 96]"
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
              />
            </div>
          </div>
        </el-skeleton>
      </el-card>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import MainLayout from '@/components/MainLayout.vue';
import { useImagesStore } from '@/stores/images';
import { useTagsStore } from '@/stores/tags';

const router = useRouter();
const imagesStore = useImagesStore();
const tagsStore = useTagsStore();

const loading = ref(false);
const images = ref([]);
const allTags = ref([]);
const selectedImages = ref([]);
const dateRange = ref([]);

const filters = reactive({
  keyword: '',
  tags: []
});

const pagination = reactive({
  page: 1,
  limit: 24,
  total: 0
});

const getImageUrl = (path, imageId) => {
  if (!path) return '';
  const baseURL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
  const base = `${baseURL}/${path}`;
  const bust = imagesStore.cacheBust?.[String(imageId)];
  if (!bust) return base;
  return base.includes('?') ? `${base}&t=${bust}` : `${base}?t=${bust}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

const loadImages = async () => {
  loading.value = true;
  try {
    const response = await imagesStore.fetchImages({
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
      startDate: dateRange.value[0] || null,
      endDate: dateRange.value[1] || null
    });
    images.value = response.images;
    pagination.total = response.pagination.total;
    selectedImages.value = [];
  } catch (error) {
    console.error('Failed to load images:', error);
  } finally {
    loading.value = false;
  }
};

const loadTags = async () => {
  try {
    allTags.value = await tagsStore.fetchTags();
  } catch (error) {
    console.error('Failed to load tags:', error);
  }
};

const handleSearch = () => {
  pagination.page = 1;
  loadImages();
};

const handleDateChange = () => {
  pagination.page = 1;
  loadImages();
};

const handleReset = () => {
  filters.keyword = '';
  filters.tags = [];
  dateRange.value = [];
  pagination.page = 1;
  loadImages();
};

const handlePageChange = (page) => {
  pagination.page = page;
  loadImages();
};

const handleSizeChange = (size) => {
  pagination.limit = size;
  pagination.page = 1;
  loadImages();
};

const handleBatchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedImages.value.length} 张图片吗？`,
    '批量删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await imagesStore.deleteImages(selectedImages.value);
      ElMessage.success('删除成功');
      loadImages();
    } catch (error) {
      console.error('Failed to delete images:', error);
    }
  });
};

onMounted(() => {
  loadImages();
  loadTags();
});
</script>

<style scoped>
.gallery-page {
  max-width: 1400px;
  margin: 0 auto;
}

.filter-card {
  margin-bottom: 24px;
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  justify-content: flex-end;
}

.images-card {
  min-height: 500px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.image-card {
  position: relative;
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.image-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.image-card.selected {
  border-color: #409eff;
  background: #ecf5ff;
}

.image-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px;
  border-radius: 4px;
}

:deep(.image-checkbox .el-checkbox__label) {
  display: none;
}

.image-wrapper {
  cursor: pointer;
}

.image-wrapper img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.image-info {
  padding: 12px;
}

.image-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8px;
}

.image-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.image-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
</style>

