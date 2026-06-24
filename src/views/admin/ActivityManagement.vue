<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, X, CalendarDays, Eye, Upload } from 'lucide-vue-next'
import PixelButton from '@/components/common/PixelButton.vue'
import { mockActivities } from '@/mock'
import { formatDate } from '@/utils/format'
import type { Activity } from '@/types/database'
import { getCustomActivities, saveCustomActivity, updateCustomActivity, deleteCustomActivity } from '@/utils/storage'

const router = useRouter()

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 8

// 合并mock数据和本地存储的自定义活动
const activities = ref<Activity[]>([...mockActivities, ...(getCustomActivities() as Activity[])])

const showFormModal = ref(false)
const isEditMode = ref(false)
const activeTab = ref<'basic' | 'content' | 'rules' | 'rewards'>('basic')
const formData = ref({
  id: '',
  name: '',
  description: '',
  activity_date: '',
  activity_type: '生存挑战',
  has_groups: false,
  cover_image: '',
  content: '',
  rules: '',
  rewards: ''
})

const showDeleteModal = ref(false)
const deleteTarget = ref<Activity | null>(null)
const coverUploadError = ref('')
const isUploadingCover = ref(false)
const coverFileInputRef = ref<HTMLInputElement | null>(null)

const filteredActivities = computed(() => {
  let result = [...activities.value]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(a =>
      a.name.toLowerCase().includes(q) ||
      (a.activity_type || '').toLowerCase().includes(q)
    )
  }
  return result.sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())
})

const totalPages = computed(() => Math.ceil(filteredActivities.value.length / pageSize))

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredActivities.value.slice(start, start + pageSize)
})

function openAddModal() {
  isEditMode.value = false
  activeTab.value = 'basic'
  formData.value = {
    id: '',
    name: '',
    description: '',
    activity_date: new Date().toISOString().split('T')[0],
    activity_type: '生存挑战',
    has_groups: false,
    cover_image: '',
    content: '',
    rules: '',
    rewards: ''
  }
  coverUploadError.value = ''
  showFormModal.value = true
}

function openEditModal(activity: Activity) {
  isEditMode.value = true
  activeTab.value = 'basic'
  formData.value = {
    id: activity.id,
    name: activity.name,
    description: activity.description || '',
    activity_date: activity.activity_date,
    activity_type: activity.activity_type || '生存挑战',
    has_groups: activity.has_groups,
    cover_image: activity.cover_image || '',
    content: activity.content || '',
    rules: activity.rules || '',
    rewards: activity.rewards || ''
  }
  coverUploadError.value = ''
  showFormModal.value = true
}

function closeFormModal() {
  showFormModal.value = false
  coverUploadError.value = ''
}

function triggerCoverFileInput() {
  coverFileInputRef.value?.click()
}

function handleCoverFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    coverUploadError.value = '请选择图片文件'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    coverUploadError.value = '图片大小不能超过5MB'
    return
  }

  coverUploadError.value = ''
  isUploadingCover.value = true

  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.cover_image = e.target?.result as string
    isUploadingCover.value = false
  }
  reader.onerror = () => {
    coverUploadError.value = '图片读取失败'
    isUploadingCover.value = false
  }
  reader.readAsDataURL(file)
}

function saveActivity() {
  if (!formData.value.name.trim()) return

  if (isEditMode.value) {
    const idx = activities.value.findIndex(a => a.id === formData.value.id)
    if (idx !== -1) {
      const updated = {
        ...activities.value[idx],
        name: formData.value.name,
        description: formData.value.description,
        activity_date: formData.value.activity_date,
        activity_type: formData.value.activity_type,
        has_groups: formData.value.has_groups,
        cover_image: formData.value.cover_image,
        content: formData.value.content || null,
        rules: formData.value.rules || null,
        rewards: formData.value.rewards || null,
        updated_at: new Date().toISOString()
      }
      activities.value[idx] = updated
      // 保存到本地存储
      updateCustomActivity(formData.value.id, updated)
    }
  } else {
    const newActivity: Activity = {
      id: 'a' + Date.now(),
      name: formData.value.name,
      description: formData.value.description,
      activity_date: formData.value.activity_date,
      activity_type: formData.value.activity_type,
      has_groups: formData.value.has_groups,
      cover_image: formData.value.cover_image || null,
      content: formData.value.content || null,
      rules: formData.value.rules || null,
      rewards: formData.value.rewards || null,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    activities.value.unshift(newActivity)
    // 保存到本地存储
    saveCustomActivity(newActivity)
  }
  showFormModal.value = false
}

function openDeleteModal(activity: Activity) {
  deleteTarget.value = activity
  showDeleteModal.value = true
}

function confirmDelete() {
  if (deleteTarget.value) {
    const id = deleteTarget.value.id
    activities.value = activities.value.filter(a => a.id !== id)
    // 从本地存储删除
    deleteCustomActivity(id)
  }
  showDeleteModal.value = false
  deleteTarget.value = null
}

function viewDetail(id: string) {
  router.push(`/activities/${id}`)
}

function getTypeColor(type: string | null): string {
  const colors: Record<string, string> = {
    'PVP竞技': 'bg-red-500/20 text-red-300 border-red-500/30',
    '建筑比赛': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    '生存挑战': 'bg-green-500/20 text-green-300 border-green-500/30'
  }
  return colors[type || ''] || 'bg-purple-500/20 text-purple-300 border-purple-500/30'
}
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
          <CalendarDays :size="24" class="text-white" />
        </div>
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-white">活动管理</h1>
          <p class="text-white/60 text-sm">管理毒薯服的所有活动</p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <div class="relative flex-1">
          <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索活动名称或类型..."
            class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
          />
        </div>
        <PixelButton variant="primary" size="md" @click="openAddModal">
          <Plus :size="18" />
          新增活动
        </PixelButton>
      </div>

      <div class="bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-white/10">
                <th class="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">活动</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">类型</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">日期</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">分组</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-white/60 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr
                v-for="activity in paginatedActivities"
                :key="activity.id"
                class="hover:bg-white/[0.03] transition-colors duration-200"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                      <img
                        v-if="activity.cover_image"
                        :src="activity.cover_image"
                        :alt="activity.name"
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center">
                        <Calendar :size="20" class="text-white/60" />
                      </div>
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-white truncate">{{ activity.name }}</p>
                      <p class="text-sm text-white/50 truncate">{{ activity.description || '暂无描述' }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                    :class="getTypeColor(activity.activity_type)"
                  >
                    {{ activity.activity_type || '未分类' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-white/80">
                  {{ formatDate(activity.activity_date) }}
                </td>
                <td class="px-6 py-4">
                  <span v-if="activity.has_groups" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    已分组
                  </span>
                  <span v-else class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-500/30">
                    未分组
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="viewDetail(activity.id)"
                      class="p-2 rounded-lg text-white/60 hover:text-blue-300 hover:bg-blue-500/10 transition-all duration-200"
                      title="查看"
                    >
                      <Eye :size="18" />
                    </button>
                    <button
                      @click="openEditModal(activity)"
                      class="p-2 rounded-lg text-white/60 hover:text-green-300 hover:bg-green-500/10 transition-all duration-200"
                      title="编辑"
                    >
                      <Edit :size="18" />
                    </button>
                    <button
                      @click="openDeleteModal(activity)"
                      class="p-2 rounded-lg text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                      title="删除"
                    >
                      <Trash2 :size="18" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="filteredActivities.length === 0" class="py-16 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <Calendar :size="28" class="text-white/30" />
          </div>
          <p class="text-white/50">暂无活动</p>
        </div>

        <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-white/10">
          <p class="text-sm text-white/50">
            共 {{ filteredActivities.length }} 条记录
          </p>
          <div class="flex items-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft :size="18" />
            </button>
            <span class="px-3 py-1 text-sm text-white/80">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showFormModal"
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          @click.self="closeFormModal"
        >
          <div class="w-full max-w-2xl bg-[#1a2744] rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <h3 class="text-lg font-bold text-white">
                {{ isEditMode ? '编辑活动' : '新增活动' }}
              </h3>
              <button
                @click="closeFormModal"
                class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <X :size="20" />
              </button>
            </div>
            <div class="flex border-b border-white/10 px-6 flex-shrink-0">
              <button
                v-for="tab in [
                  { key: 'basic', label: '基本信息' },
                  { key: 'content', label: '活动详情' },
                  { key: 'rules', label: '活动规则' },
                  { key: 'rewards', label: '活动奖励' }
                ]"
                :key="tab.key"
                @click="activeTab = tab.key as typeof activeTab"
                class="px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px"
                :class="activeTab === tab.key
                  ? 'text-green-400 border-green-500'
                  : 'text-white/60 border-transparent hover:text-white/80'"
              >
                {{ tab.label }}
              </button>
            </div>
            <div class="p-6 space-y-4 overflow-y-auto flex-1">
              <!-- 基本信息 -->
              <div v-show="activeTab === 'basic'" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-white/80 mb-2">活动名称</label>
                  <input
                    v-model="formData.name"
                    type="text"
                    placeholder="请输入活动名称"
                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-white/80 mb-2">活动描述</label>
                  <textarea
                    v-model="formData.description"
                    rows="3"
                    placeholder="简短描述活动内容"
                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 resize-none"
                  ></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-white/80 mb-2">活动日期</label>
                    <input
                      v-model="formData.activity_date"
                      type="date"
                      class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-white/80 mb-2">活动类型</label>
                    <select
                      v-model="formData.activity_type"
                      class="w-full px-4 py-3 bg-[#1a2744] border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]"
                    >
                      <option value="生存挑战" class="bg-[#1a2744] text-white">生存挑战</option>
                      <option value="PVP竞技" class="bg-[#1a2744] text-white">PVP竞技</option>
                      <option value="建筑比赛" class="bg-[#1a2744] text-white">建筑比赛</option>
                      <option value="其他活动" class="bg-[#1a2744] text-white">其他活动</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-white/80 mb-2">封面图片</label>
                  <input
                    ref="coverFileInputRef"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleCoverFileSelect"
                  />
                  <div
                    @click="triggerCoverFileInput"
                    class="aspect-video rounded-xl overflow-hidden bg-white/5 border-2 border-dashed border-white/20 cursor-pointer hover:border-green-500/50 transition-all duration-200 flex items-center justify-center"
                  >
                    <div v-if="formData.cover_image" class="w-full h-full">
                      <img :src="formData.cover_image" alt="封面预览" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="text-center py-8">
                      <Upload :size="40" class="mx-auto mb-3 text-white/30" />
                      <p class="text-white/60 mb-1">点击上传封面图片</p>
                      <p class="text-white/40 text-xs">支持 JPG、PNG、GIF 格式，最大 5MB</p>
                    </div>
                  </div>
                  <p v-if="coverUploadError" class="text-red-400 text-sm mt-2">{{ coverUploadError }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <button
                    @click="formData.has_groups = !formData.has_groups"
                    class="relative w-12 h-6 rounded-full transition-colors duration-200"
                    :class="formData.has_groups ? 'bg-green-500' : 'bg-white/20'"
                  >
                    <span
                      class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200"
                      :class="formData.has_groups ? 'left-7' : 'left-1'"
                    ></span>
                  </button>
                  <span class="text-sm text-white/80">是否分组</span>
                </div>
              </div>
              <!-- 活动详情 -->
              <div v-show="activeTab === 'content'" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-white/80 mb-2">
                    活动详情内容
                    <span class="text-white/40 font-normal ml-2">支持 Markdown 语法</span>
                  </label>
                  <textarea
                    v-model="formData.content"
                    rows="15"
                    placeholder="详细介绍活动内容...
支持 Markdown 语法：
## 小标题
- 列表项
**粗体文字**
*斜体文字*"
                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 resize-none font-mono text-sm"
                  ></textarea>
                </div>
              </div>
              <!-- 活动规则 -->
              <div v-show="activeTab === 'rules'" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-white/80 mb-2">
                    活动规则
                    <span class="text-white/40 font-normal ml-2">支持 Markdown 语法</span>
                  </label>
                  <textarea
                    v-model="formData.rules"
                    rows="15"
                    placeholder="1. 第一条规则
2. 第二条规则
3. 第三条规则..."
                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 resize-none font-mono text-sm"
                  ></textarea>
                </div>
              </div>
              <!-- 活动奖励 -->
              <div v-show="activeTab === 'rewards'" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-white/80 mb-2">
                    活动奖励
                    <span class="text-white/40 font-normal ml-2">支持 Markdown 语法</span>
                  </label>
                  <textarea
                    v-model="formData.rewards"
                    rows="15"
                    placeholder="🏆 第一名：xxx 奖励
🥈 第二名：xxx 奖励
🥉 第三名：xxx 奖励
🎁 参与奖：xxx 奖励"
                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 resize-none font-mono text-sm"
                  ></textarea>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
              <PixelButton variant="ghost" size="md" @click="closeFormModal">
                取消
              </PixelButton>
              <PixelButton variant="primary" size="md" :loading="isUploadingCover" @click="saveActivity">
                {{ isEditMode ? '保存修改' : '创建活动' }}
              </PixelButton>
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
              确定要删除活动「{{ deleteTarget?.name }}」吗？此操作不可撤销。
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
