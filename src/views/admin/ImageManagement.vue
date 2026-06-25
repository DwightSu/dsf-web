<script setup lang="ts">
import { ref, computed } from 'vue'
import { Image as ImageIcon, Plus, Trash2, Eye, X, Upload, FolderOpen, ChevronRight, Search, Layers, Calendar, Grid, List } from 'lucide-vue-next'
import PixelButton from '@/components/common/PixelButton.vue'
import { mockImages, mockActivities } from '@/mock'
import { formatDate } from '@/utils/format'
import type { Image as ImageType, Activity } from '@/types/database'
import { getCustomImages, saveCustomImage, deleteCustomImage, getCustomActivities } from '@/utils/storage'

// 合并mock数据和本地存储的自定义活动
const allActivities = computed<Activity[]>(() => {
  const stored = getCustomActivities() as Activity[]
  return [...mockActivities, ...stored]
})

// 合并mock数据和本地存储的自定义图片
const images = ref<ImageType[]>([...mockImages, ...(getCustomImages() as ImageType[])])

const selectedActivityId = ref<string | null>(null)
const viewMode = ref<'grid' | 'list'>('grid')
const searchQuery = ref('')

const showUploadModal = ref(false)
const uploadForm = ref({
  activity_id: '',
  description: '',
  url: ''
})
const uploadError = ref('')
const isUploading = ref(false)

const showPreviewModal = ref(false)
const previewImage = ref<ImageType | null>(null)

const showDeleteModal = ref(false)
const deleteTarget = ref<ImageType | null>(null)

const fileInputRef = ref<HTMLInputElement | null>(null)

// 按活动分组的图片统计
const activityStats = computed(() => {
  const stats: Record<string, number> = {}
  images.value.forEach(img => {
    stats[img.activity_id] = (stats[img.activity_id] || 0) + 1
  })
  return stats
})

// 当前选中的活动
const selectedActivity = computed(() => {
  if (!selectedActivityId.value) return null
  return allActivities.value.find(a => a.id === selectedActivityId.value) || null
})

// 过滤后的图片
const filteredImages = computed(() => {
  let result = [...images.value]
  
  // 按活动筛选
  if (selectedActivityId.value) {
    result = result.filter(img => img.activity_id === selectedActivityId.value)
  }
  
  // 搜索筛选
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(img =>
      (img.description || '').toLowerCase().includes(q)
    )
  }
  
  return result.sort((a, b) => 
    new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
  )
})

function selectActivity(activityId: string | null) {
  selectedActivityId.value = activityId
  searchQuery.value = ''
}

function getActivityName(activityId: string): string {
  const activity = allActivities.value.find(a => a.id === activityId)
  return activity?.name || '未知活动'
}

function getActivityCover(activityId: string): string | null {
  const activity = allActivities.value.find(a => a.id === activityId)
  return activity?.cover_image || null
}

function openUploadModal() {
  uploadForm.value = {
    activity_id: selectedActivityId.value || allActivities.value[0]?.id || '',
    url: '',
    description: ''
  }
  uploadError.value = ''
  showUploadModal.value = true
}

function closeUploadModal() {
  showUploadModal.value = false
  uploadError.value = ''
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    uploadError.value = '请选择图片文件'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = '图片大小不能超过5MB'
    return
  }

  uploadError.value = ''
  isUploading.value = true

  const reader = new FileReader()
  reader.onload = (e) => {
    uploadForm.value.url = e.target?.result as string
    isUploading.value = false
  }
  reader.onerror = () => {
    uploadError.value = '图片读取失败'
    isUploading.value = false
  }
  reader.readAsDataURL(file)
}

function uploadImage() {
  if (!uploadForm.value.url) {
    uploadError.value = '请选择一张图片'
    return
  }
  if (!uploadForm.value.activity_id) {
    uploadError.value = '请选择所属活动'
    return
  }

  const newImage: ImageType = {
    id: 'img' + Date.now(),
    activity_id: uploadForm.value.activity_id,
    url: uploadForm.value.url,
    description: uploadForm.value.description,
    uploaded_by: null,
    created_at: new Date().toISOString()
  }
  images.value.unshift(newImage)
  saveCustomImage(newImage)
  showUploadModal.value = false
}

function openPreview(img: ImageType) {
  previewImage.value = img
  showPreviewModal.value = true
}

function closePreview() {
  showPreviewModal.value = false
  previewImage.value = null
}

function openDeleteModal(img: ImageType) {
  deleteTarget.value = img
  showDeleteModal.value = true
}

function confirmDelete() {
  if (deleteTarget.value) {
    const id = deleteTarget.value.id
    images.value = images.value.filter(i => i.id !== id)
    deleteCustomImage(id)
  }
  showDeleteModal.value = false
  deleteTarget.value = null
}

function getTypeColor(type: string | null): { bg: string; border: string; text: string } {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    'PVP竞技': { bg: 'from-red-500/20 to-rose-600/20', border: 'border-red-500/30', text: 'text-red-300' },
    '建筑比赛': { bg: 'from-blue-500/20 to-indigo-600/20', border: 'border-blue-500/30', text: 'text-blue-300' },
    '生存挑战': { bg: 'from-amber-500/20 to-orange-600/20', border: 'border-amber-500/30', text: 'text-amber-300' },
    '其他活动': { bg: 'from-purple-500/20 to-violet-600/20', border: 'border-purple-500/30', text: 'text-purple-300' }
  }
  return colors[type || '其他活动'] || colors['其他活动']
}
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="relative mb-8">
        <div class="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent rounded-3xl"></div>
        <div class="relative flex flex-col md:flex-row md:items-center gap-4 p-6 md:p-8">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
            <Layers :size="32" class="text-white" />
          </div>
          <div class="flex-1">
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
              图片管理中心
            </h1>
            <p class="text-white/60 text-lg">按活动整理和浏览所有图片资源</p>
          </div>
          <PixelButton variant="success" size="lg" @click="openUploadModal" class="shadow-xl shadow-amber-500/20">
            <Upload :size="20" />
            上传图片
          </PixelButton>
        </div>
      </div>

      <!-- Main Layout: Sidebar + Content -->
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Activity Sidebar -->
        <div class="lg:w-80 flex-shrink-0">
          <div class="bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden sticky top-4">
            <div class="p-4 border-b border-white/10">
              <h3 class="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <FolderOpen :size="16" />
                活动分类
              </h3>
            </div>
            
            <!-- All Images -->
            <button
              @click="selectActivity(null)"
              class="w-full px-4 py-3 flex items-center gap-3 transition-all duration-200"
              :class="!selectedActivityId 
                ? 'bg-amber-500/20 text-amber-300 border-r-2 border-amber-500' 
                : 'text-white/70 hover:bg-white/5 hover:text-white'"
            >
              <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Layers :size="18" class="text-white/60" />
              </div>
              <div class="flex-1 text-left">
                <p class="font-medium">全部图片</p>
                <p class="text-xs text-white/40">{{ images.length }} 张</p>
              </div>
              <ChevronRight :size="16" class="text-white/30" />
            </button>

            <!-- Activity List -->
            <div class="max-h-[60vh] overflow-y-auto">
              <button
                v-for="activity in allActivities"
                :key="activity.id"
                @click="selectActivity(activity.id)"
                class="w-full px-4 py-3 flex items-center gap-3 transition-all duration-200"
                :class="[
                  selectedActivityId === activity.id 
                    ? 'bg-amber-500/20 text-amber-300 border-r-2 border-amber-500' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white border-r-2 border-transparent'
                ]"
              >
                <div class="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                  <img 
                    v-if="getActivityCover(activity.id)" 
                    :src="getActivityCover(activity.id)!" 
                    :alt="activity.name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center">
                    <Calendar :size="16" class="text-white/60" />
                  </div>
                </div>
                <div class="flex-1 text-left min-w-0">
                  <p class="font-medium truncate">{{ activity.name }}</p>
                  <p class="text-xs text-white/40">{{ activityStats[activity.id] || 0 }} 张</p>
                </div>
                <ChevronRight :size="16" class="text-white/30 flex-shrink-0" />
              </button>
            </div>

            <!-- Empty State for Activities -->
            <div v-if="allActivities.length === 0" class="p-6 text-center">
              <Calendar :size="32" class="mx-auto mb-3 text-white/30" />
              <p class="text-white/50 text-sm">暂无活动</p>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="flex-1 min-w-0">
          <!-- Toolbar -->
          <div class="flex flex-col sm:flex-row gap-4 mb-6">
            <div class="relative flex-1">
              <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="selectedActivity ? `搜索 ${selectedActivity.name} 的图片...` : '搜索图片描述...'"
                class="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
              />
            </div>
            <div class="flex gap-2 bg-white/[0.03] p-1 rounded-xl border border-white/10">
              <button
                @click="viewMode = 'grid'"
                class="px-4 py-2 rounded-lg transition-all duration-200"
                :class="viewMode === 'grid' 
                  ? 'bg-amber-500/20 text-amber-300' 
                  : 'text-white/60 hover:text-white'"
              >
                <Grid :size="18" />
              </button>
              <button
                @click="viewMode = 'list'"
                class="px-4 py-2 rounded-lg transition-all duration-200"
                :class="viewMode === 'list' 
                  ? 'bg-amber-500/20 text-amber-300' 
                  : 'text-white/60 hover:text-white'"
              >
                <List :size="18" />
              </button>
            </div>
          </div>

          <!-- Current Filter Info -->
          <div v-if="selectedActivity" class="mb-6 flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <div class="w-12 h-12 rounded-lg overflow-hidden bg-white/10">
              <img 
                v-if="getActivityCover(selectedActivity.id)" 
                :src="getActivityCover(selectedActivity.id)!" 
                :alt="selectedActivity.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center">
                <Calendar :size="20" class="text-white/60" />
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-white">{{ selectedActivity.name }}</h3>
              <p class="text-white/50 text-sm">{{ filteredImages.length }} 张图片</p>
            </div>
            <button
              @click="selectActivity(null)"
              class="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
            >
              清除筛选
            </button>
          </div>

          <!-- Grid View -->
          <div v-if="viewMode === 'grid' && filteredImages.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div
              v-for="img in filteredImages"
              :key="img.id"
              class="group relative aspect-square rounded-2xl overflow-hidden bg-white/[0.03] border border-white/10 cursor-pointer hover:border-amber-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1"
              @click="openPreview(img)"
            >
              <img
                :src="img.url"
                :alt="img.description || '图片'"
                class="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div class="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p v-if="img.description" class="text-white text-sm font-medium line-clamp-2 mb-2">
                  {{ img.description }}
                </p>
                <div class="flex items-center gap-2">
                  <button
                    @click.stop="openPreview(img)"
                    class="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs rounded-lg transition-all duration-200"
                  >
                    <Eye :size="14" />
                    查看
                  </button>
                  <button
                    @click.stop="openDeleteModal(img)"
                    class="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-500/30 hover:bg-red-500/50 text-white text-xs rounded-lg transition-all duration-200"
                  >
                    <Trash2 :size="14" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-if="viewMode === 'list' && filteredImages.length > 0" class="space-y-3">
            <div
              v-for="img in filteredImages"
              :key="img.id"
              class="group flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/10 hover:border-amber-500/30 transition-all duration-300 cursor-pointer"
              @click="openPreview(img)"
            >
              <div class="w-20 h-20 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                <img :src="img.url" :alt="img.description" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-white font-medium truncate mb-1">{{ img.description || '无描述' }}</p>
                <div class="flex items-center gap-4 text-sm text-white/50">
                  <span class="flex items-center gap-1">
                    <FolderOpen :size="14" />
                    {{ getActivityName(img.activity_id) }}
                  </span>
                  <span v-if="img.created_at" class="flex items-center gap-1">
                    <Calendar :size="14" />
                    {{ formatDate(img.created_at) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  @click.stop="openPreview(img)"
                  class="p-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-all duration-200"
                >
                  <Eye :size="18" />
                </button>
                <button
                  @click.stop="openDeleteModal(img)"
                  class="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-200"
                >
                  <Trash2 :size="18" />
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredImages.length === 0" class="py-20 text-center">
            <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
              <ImageIcon :size="48" class="text-white/30" />
            </div>
            <h3 class="text-2xl font-bold text-white/80 mb-3">
              {{ selectedActivity ? '该活动暂无图片' : '暂无图片' }}
            </h3>
            <p class="text-white/50 mb-6">
              {{ selectedActivity ? '为此活动上传第一张图片吧' : '上传你的第一张活动图片' }}
            </p>
            <PixelButton variant="success" size="lg" @click="openUploadModal">
              <Upload :size="20" />
              上传图片
            </PixelButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showUploadModal"
          class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          @click.self="closeUploadModal"
        >
          <div class="w-full max-w-md bg-[#0f172a] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div class="relative px-6 py-5 border-b border-white/10">
              <div class="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent"></div>
              <div class="relative flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Upload :size="20" class="text-white" />
                  </div>
                  <h3 class="text-xl font-bold text-white">上传图片</h3>
                </div>
                <button
                  @click="closeUploadModal"
                  class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200"
                >
                  <X :size="20" />
                </button>
              </div>
            </div>
            <div class="p-6 space-y-5">
              <div>
                <label class="block text-sm font-semibold text-white/80 mb-2">选择图片</label>
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileSelect"
                />
                <div
                  @click="triggerFileInput"
                  class="aspect-video rounded-2xl overflow-hidden bg-white/[0.03] border-2 border-dashed border-white/20 cursor-pointer hover:border-amber-500/50 transition-all duration-300 flex items-center justify-center"
                >
                  <div v-if="uploadForm.url" class="w-full h-full">
                    <img :src="uploadForm.url" alt="预览" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="text-center py-12">
                    <Upload :size="48" class="mx-auto mb-4 text-white/30" />
                    <p class="text-white/60 mb-2">点击选择本地图片</p>
                    <p class="text-white/40 text-sm">支持 JPG、PNG 格式，最大 5MB</p>
                  </div>
                </div>
                <p v-if="uploadError" class="text-red-400 text-sm mt-2">{{ uploadError }}</p>
              </div>
              <div>
                <label class="block text-sm font-semibold text-white/80 mb-2">所属活动</label>
                <select
                  v-model="uploadForm.activity_id"
                  class="w-full px-5 py-4 bg-[#0f172a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]"
                >
                  <option v-for="act in allActivities" :key="act.id" :value="act.id" class="bg-[#0f172a] text-white">
                    {{ act.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-white/80 mb-2">图片描述</label>
                <textarea
                  v-model="uploadForm.description"
                  rows="2"
                  placeholder="请输入图片描述（可选）"
                  class="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 resize-none"
                ></textarea>
              </div>
            </div>
            <div class="flex items-center justify-end gap-4 px-6 py-5 border-t border-white/10 bg-white/[0.02]">
              <PixelButton variant="ghost" size="md" @click="closeUploadModal">
                取消
              </PixelButton>
              <PixelButton variant="success" size="md" :loading="isUploading" @click="uploadImage">
                <Upload :size="16" />
                上传
              </PixelButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Preview Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showPreviewModal && previewImage"
          class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          @click.self="closePreview"
        >
          <button
            class="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 z-10"
            @click="closePreview"
          >
            <X :size="24" />
          </button>
          <div class="max-w-[90vw] max-h-[85vh] flex flex-col items-center">
            <img
              :src="previewImage.url"
              :alt="previewImage.description || '图片'"
              class="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
            />
            <div class="mt-6 text-center">
              <p v-if="previewImage.description" class="text-white font-medium text-lg mb-3">
                {{ previewImage.description }}
              </p>
              <div class="flex items-center justify-center gap-4 text-white/50">
                <span class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10">
                  <FolderOpen :size="16" />
                  {{ getActivityName(previewImage.activity_id) }}
                </span>
                <span v-if="previewImage.created_at" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10">
                  <Calendar :size="16" />
                  {{ formatDate(previewImage.created_at) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          @click.self="showDeleteModal = false"
        >
          <div class="w-full max-w-md bg-[#0f172a] rounded-3xl border border-white/10 shadow-2xl p-8 text-center">
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center">
              <Trash2 :size="40" class="text-red-400" />
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">确认删除图片</h3>
            <p class="text-white/60 mb-8">
              确定要删除这张图片吗？<br/>此操作不可撤销。
            </p>
            <div class="flex items-center justify-center gap-4">
              <button
                @click="showDeleteModal = false"
                class="px-6 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 font-medium"
              >
                取消
              </button>
              <button
                @click="confirmDelete"
                class="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}

select option {
  background: #0f172a;
  color: white;
}
</style>
