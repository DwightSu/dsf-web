<script setup lang="ts">
import { ref, computed } from 'vue'
import { Image as ImageIcon, Plus, Search, Trash2, Eye, ChevronLeft, ChevronRight, X, Upload, FolderOpen } from 'lucide-vue-next'
import PixelButton from '@/components/common/PixelButton.vue'
import { mockImages, mockActivities } from '@/mock'
import { formatDate } from '@/utils/format'
import type { Image as ImageType } from '@/types/database'
import { getCustomImages, saveCustomImage, deleteCustomImage } from '@/utils/storage'

const searchQuery = ref('')
const activityFilter = ref('all')
const currentPage = ref(1)
const pageSize = 12

// 合并mock数据和本地存储的自定义图片
const images = ref<ImageType[]>([...mockImages, ...(getCustomImages() as ImageType[])])

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

const filteredImages = computed(() => {
  let result = [...images.value]
  if (activityFilter.value !== 'all') {
    result = result.filter(img => img.activity_id === activityFilter.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(img =>
      (img.description || '').toLowerCase().includes(q) ||
      getActivityName(img.activity_id).toLowerCase().includes(q)
    )
  }
  return result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
})

const totalPages = computed(() => Math.ceil(filteredImages.value.length / pageSize))

const paginatedImages = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredImages.value.slice(start, start + pageSize)
})

function getActivityName(activityId: string): string {
  const activity = mockActivities.find(a => a.id === activityId)
  return activity?.name || '未分类'
}

function openUploadModal() {
  uploadForm.value = {
    activity_id: mockActivities[0]?.id || '',
    description: '',
    url: ''
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
  // 保存到本地存储
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
    // 从本地存储删除
    deleteCustomImage(id)
  }
  showDeleteModal.value = false
  deleteTarget.value = null
}
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
          <ImageIcon :size="24" class="text-white" />
        </div>
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-white">图片管理</h1>
          <p class="text-white/60 text-sm">管理活动图片资源</p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <div class="relative flex-1">
          <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索图片描述或活动..."
            class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
          />
        </div>
        <div class="flex gap-3">
          <div class="relative">
            <FolderOpen :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <select
              v-model="activityFilter"
              class="pl-11 pr-8 py-3 bg-[#1a2744] border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 appearance-none cursor-pointer min-w-[160px] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]"
            >
              <option value="all" class="bg-[#1a2744] text-white">全部活动</option>
              <option v-for="act in mockActivities" :key="act.id" :value="act.id" class="bg-[#1a2744] text-white">
                {{ act.name }}
              </option>
            </select>
          </div>
          <PixelButton variant="success" size="md" @click="openUploadModal">
            <Upload :size="18" />
            上传图片
          </PixelButton>
        </div>
      </div>

      <div v-if="paginatedImages.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        <div
          v-for="img in paginatedImages"
          :key="img.id"
          class="group relative aspect-square rounded-xl overflow-hidden bg-white/5 cursor-pointer border border-white/10 hover:border-amber-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1"
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
            <p class="text-white/60 text-xs">
              {{ getActivityName(img.activity_id) }}
            </p>
            <div class="flex items-center gap-2 mt-3">
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

      <div v-else class="py-20 text-center">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <ImageIcon :size="36" class="text-white/30" />
        </div>
        <p class="text-white/50 mb-4">暂无图片</p>
        <button
          @click="openUploadModal"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <Plus :size="18" />
          上传第一张图片
        </button>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-4">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronLeft :size="20" />
        </button>
        <span class="px-4 py-2 text-sm text-white/80">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronRight :size="20" />
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showUploadModal"
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          @click.self="closeUploadModal"
        >
          <div class="w-full max-w-md bg-[#1a2744] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 class="text-lg font-bold text-white">上传图片</h3>
              <button
                @click="closeUploadModal"
                class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <X :size="20" />
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-white/80 mb-2">选择图片</label>
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileSelect"
                />
                <div
                  @click="triggerFileInput"
                  class="aspect-video rounded-xl overflow-hidden bg-white/5 border-2 border-dashed border-white/20 cursor-pointer hover:border-amber-500/50 transition-all duration-200 flex items-center justify-center"
                >
                  <div v-if="uploadForm.url" class="w-full h-full">
                    <img :src="uploadForm.url" alt="预览" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="text-center py-8">
                    <Upload :size="40" class="mx-auto mb-3 text-white/30" />
                    <p class="text-white/60 mb-1">点击选择本地图片</p>
                    <p class="text-white/40 text-xs">支持 JPG、PNG、GIF 格式，最大 5MB</p>
                  </div>
                </div>
                <p v-if="uploadError" class="text-red-400 text-sm mt-2">{{ uploadError }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-white/80 mb-2">所属活动</label>
                <select
                  v-model="uploadForm.activity_id"
                  class="w-full px-4 py-3 bg-[#1a2744] border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]"
                >
                  <option v-for="act in mockActivities" :key="act.id" :value="act.id" class="bg-[#1a2744] text-white">
                    {{ act.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-white/80 mb-2">图片描述</label>
                <textarea
                  v-model="uploadForm.description"
                  rows="2"
                  placeholder="请输入图片描述"
                  class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all duration-200 resize-none"
                ></textarea>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
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
              class="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
            />
            <div class="mt-4 text-center">
              <p v-if="previewImage.description" class="text-white font-medium mb-2">
                {{ previewImage.description }}
              </p>
              <p class="text-white/50 text-sm">
                {{ getActivityName(previewImage.activity_id) }}
                <span v-if="previewImage.created_at"> · {{ formatDate(previewImage.created_at) }}</span>
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          @click.self="showDeleteModal = false"
        >
          <div class="w-full max-w-md bg-[#1a2744] rounded-2xl border border-white/10 shadow-2xl p-6 text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <Trash2 :size="28" class="text-red-400" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2">确认删除</h3>
            <p class="text-white/60 mb-6">
              确定要删除这张图片吗？此操作不可撤销。
            </p>
            <div class="flex items-center justify-center gap-3">
              <button
                @click="showDeleteModal = false"
                class="px-5 py-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                取消
              </button>
              <button
                @click="confirmDelete"
                class="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
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
  background: #1a2744;
  color: white;
}
</style>
