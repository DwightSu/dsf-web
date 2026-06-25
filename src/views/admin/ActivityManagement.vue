<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, Plus, Edit, Trash2, Search, X, CalendarDays, Eye, Upload, Sparkles, Clock, Users, Trophy, ChevronRight, MapPin } from 'lucide-vue-next'
import PixelButton from '@/components/common/PixelButton.vue'
import { mockActivities } from '@/mock'
import { formatDate } from '@/utils/format'
import type { Activity } from '@/types/database'
import { getCustomActivities, saveCustomActivity, updateCustomActivity, deleteCustomActivity } from '@/utils/storage'

const router = useRouter()

const searchQuery = ref('')
const selectedActivity = ref<Activity | null>(null)

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
      (a.activity_type || '').toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q)
    )
  }
  return result.sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())
})

function getTypeColor(type: string | null): { bg: string; border: string; text: string; gradient: string } {
  const colors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
    'PVP竞技': { 
      bg: 'from-red-500/20 to-rose-600/20', 
      border: 'border-red-500/30', 
      text: 'text-red-300',
      gradient: 'from-red-500 to-rose-500'
    },
    '建筑比赛': { 
      bg: 'from-blue-500/20 to-indigo-600/20', 
      border: 'border-blue-500/30', 
      text: 'text-blue-300',
      gradient: 'from-blue-500 to-indigo-500'
    },
    '生存挑战': { 
      bg: 'from-emerald-500/20 to-green-600/20', 
      border: 'border-emerald-500/30', 
      text: 'text-emerald-300',
      gradient: 'from-emerald-500 to-green-500'
    },
    '其他活动': { 
      bg: 'from-purple-500/20 to-violet-600/20', 
      border: 'border-purple-500/30', 
      text: 'text-purple-300',
      gradient: 'from-purple-500 to-violet-500'
    }
  }
  return colors[type || '其他活动'] || colors['其他活动']
}

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
    deleteCustomActivity(id)
  }
  showDeleteModal.value = false
  deleteTarget.value = null
}

function viewDetail(id: string) {
  router.push(`/activities/${id}`)
}
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="relative mb-8">
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-transparent rounded-3xl"></div>
        <div class="relative flex flex-col md:flex-row md:items-center gap-4 p-6 md:p-8">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-pulse">
            <CalendarDays :size="32" class="text-white" />
          </div>
          <div class="flex-1">
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
              活动管理中心
            </h1>
            <p class="text-white/60 text-lg">规划精彩活动，凝聚团队力量</p>
          </div>
          <PixelButton variant="primary" size="lg" @click="openAddModal" class="shadow-xl shadow-emerald-500/20">
            <Sparkles :size="20" />
            创建活动
          </PixelButton>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-8">
        <div class="relative max-w-xl">
          <Search :size="20" class="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索活动名称、类型或描述..."
            class="w-full pl-14 pr-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 text-lg"
          />
        </div>
      </div>

      <!-- Activity Grid -->
      <div v-if="filteredActivities.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(activity, index) in filteredActivities"
          :key="activity.id"
          class="group relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] rounded-3xl border border-white/10 overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <!-- Cover Image -->
          <div class="relative h-48 overflow-hidden">
            <div v-if="activity.cover_image" class="w-full h-full">
              <img
                :src="activity.cover_image"
                :alt="activity.name"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>
            </div>
            <div v-else class="w-full h-full bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center">
              <Calendar :size="64" class="text-white/20" />
            </div>
            
            <!-- Type Badge -->
            <div class="absolute top-4 left-4">
              <span
                class="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md"
                :class="getTypeColor(activity.activity_type).bg + ' ' + getTypeColor(activity.activity_type).border + ' ' + getTypeColor(activity.activity_type).text"
              >
                {{ activity.activity_type || '其他' }}
              </span>
            </div>

            <!-- Quick Actions -->
            <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <button
                @click.stop="openEditModal(activity)"
                class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-emerald-500/50 transition-all duration-200"
              >
                <Edit :size="18" />
              </button>
              <button
                @click.stop="openDeleteModal(activity)"
                class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-red-400 hover:bg-red-500/50 transition-all duration-200"
              >
                <Trash2 :size="18" />
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-5">
            <h3 class="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors duration-300">
              {{ activity.name }}
            </h3>
            <p class="text-white/50 text-sm mb-4 line-clamp-2">
              {{ activity.description || '暂无描述' }}
            </p>

            <!-- Meta Info -->
            <div class="flex items-center gap-4 mb-4">
              <div class="flex items-center gap-2 text-white/60 text-sm">
                <Clock :size="16" class="text-emerald-400" />
                <span>{{ formatDate(activity.activity_date) }}</span>
              </div>
              <div v-if="activity.has_groups" class="flex items-center gap-2 text-white/60 text-sm">
                <Users :size="16" class="text-amber-400" />
                <span>已分组</span>
              </div>
            </div>

            <!-- Action Button -->
            <button
              @click="viewDetail(activity.id)"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 text-emerald-300 font-semibold hover:from-emerald-500/30 hover:to-green-500/30 hover:border-emerald-500/50 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
            >
              <Eye :size="18" />
              查看详情
              <ChevronRight :size="18" class="transition-transform duration-300 group-hover/btn:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-20 text-center">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
          <Calendar :size="48" class="text-white/30" />
        </div>
        <h3 class="text-2xl font-bold text-white/80 mb-3">暂无活动</h3>
        <p class="text-white/50 mb-6">创建你的第一个精彩活动吧</p>
        <PixelButton variant="primary" size="lg" @click="openAddModal">
          <Sparkles :size="20" />
          创建活动
        </PixelButton>
      </div>
    </div>

    <!-- Form Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showFormModal"
          class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          @click.self="closeFormModal"
        >
          <div class="w-full max-w-2xl bg-[#0f172a] rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <!-- Modal Header -->
            <div class="relative px-6 py-5 border-b border-white/10 flex-shrink-0">
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent"></div>
              <div class="relative flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                    <CalendarDays :size="20" class="text-white" />
                  </div>
                  <h3 class="text-xl font-bold text-white">
                    {{ isEditMode ? '编辑活动' : '创建新活动' }}
                  </h3>
                </div>
                <button
                  @click="closeFormModal"
                  class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200"
                >
                  <X :size="20" />
                </button>
              </div>
            </div>

            <!-- Tabs -->
            <div class="flex border-b border-white/10 px-6 flex-shrink-0">
              <button
                v-for="tab in [
                  { key: 'basic', label: '基本信息', icon: Calendar },
                  { key: 'content', label: '活动详情', icon: MapPin },
                  { key: 'rules', label: '活动规则', icon: Trophy },
                  { key: 'rewards', label: '活动奖励', icon: Sparkles }
                ]"
                :key="tab.key"
                @click="activeTab = tab.key as typeof activeTab"
                class="flex items-center gap-2 px-4 py-4 text-sm font-medium transition-all duration-200 border-b-2 -mb-px"
                :class="activeTab === tab.key
                  ? 'text-emerald-400 border-emerald-500'
                  : 'text-white/60 border-transparent hover:text-white/80'"
              >
                <component :is="tab.icon" :size="16" />
                {{ tab.label }}
              </button>
            </div>

            <!-- Modal Content -->
            <div class="p-6 space-y-5 overflow-y-auto flex-1">
              <!-- Basic Info -->
              <div v-show="activeTab === 'basic'" class="space-y-5">
                <div>
                  <label class="block text-sm font-semibold text-white/80 mb-2">活动名称</label>
                  <input
                    v-model="formData.name"
                    type="text"
                    placeholder="请输入活动名称"
                    class="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-white/80 mb-2">活动描述</label>
                  <textarea
                    v-model="formData.description"
                    rows="3"
                    placeholder="简短描述活动内容，让玩家快速了解"
                    class="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 resize-none"
                  ></textarea>
                </div>
                <div class="grid grid-cols-2 gap-5">
                  <div>
                    <label class="block text-sm font-semibold text-white/80 mb-2">活动日期</label>
                    <input
                      v-model="formData.activity_date"
                      type="date"
                      class="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-white/80 mb-2">活动类型</label>
                    <select
                      v-model="formData.activity_type"
                      class="w-full px-5 py-4 bg-[#0f172a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]"
                    >
                      <option value="生存挑战" class="bg-[#0f172a] text-white">生存挑战</option>
                      <option value="PVP竞技" class="bg-[#0f172a] text-white">PVP竞技</option>
                      <option value="建筑比赛" class="bg-[#0f172a] text-white">建筑比赛</option>
                      <option value="其他活动" class="bg-[#0f172a] text-white">其他活动</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-white/80 mb-2">封面图片</label>
                  <input
                    ref="coverFileInputRef"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleCoverFileSelect"
                  />
                  <div
                    @click="triggerCoverFileInput"
                    class="aspect-video rounded-2xl overflow-hidden bg-white/[0.03] border-2 border-dashed border-white/20 cursor-pointer hover:border-emerald-500/50 transition-all duration-300 flex items-center justify-center"
                  >
                    <div v-if="formData.cover_image" class="w-full h-full">
                      <img :src="formData.cover_image" alt="封面预览" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="text-center py-12">
                      <Upload :size="48" class="mx-auto mb-4 text-white/30" />
                      <p class="text-white/60 mb-2">点击上传封面图片</p>
                      <p class="text-white/40 text-sm">支持 JPG、PNG 格式，最大 5MB</p>
                    </div>
                  </div>
                  <p v-if="coverUploadError" class="text-red-400 text-sm mt-2">{{ coverUploadError }}</p>
                </div>
                <div class="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10">
                  <button
                    @click="formData.has_groups = !formData.has_groups"
                    class="relative w-14 h-7 rounded-full transition-colors duration-300"
                    :class="formData.has_groups ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-white/20'"
                  >
                    <span
                      class="absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg"
                      :class="formData.has_groups ? 'left-8' : 'left-1'"
                    ></span>
                  </button>
                  <div>
                    <span class="text-white font-medium">启用分组</span>
                    <p class="text-white/50 text-sm">开启后活动将支持队伍分组功能</p>
                  </div>
                </div>
              </div>

              <!-- Activity Content -->
              <div v-show="activeTab === 'content'" class="space-y-4">
                <div>
                  <label class="block text-sm font-semibold text-white/80 mb-2">
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
                    class="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 resize-none font-mono text-sm"
                  ></textarea>
                </div>
              </div>

              <!-- Activity Rules -->
              <div v-show="activeTab === 'rules'" class="space-y-4">
                <div>
                  <label class="block text-sm font-semibold text-white/80 mb-2">
                    活动规则
                    <span class="text-white/40 font-normal ml-2">支持 Markdown 语法</span>
                  </label>
                  <textarea
                    v-model="formData.rules"
                    rows="15"
                    placeholder="1. 参与资格
2. 评分标准
3. 违规处理..."
                    class="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 resize-none font-mono text-sm"
                  ></textarea>
                </div>
              </div>

              <!-- Activity Rewards -->
              <div v-show="activeTab === 'rewards'" class="space-y-4">
                <div>
                  <label class="block text-sm font-semibold text-white/80 mb-2">
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
                    class="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 resize-none font-mono text-sm"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex items-center justify-end gap-4 px-6 py-5 border-t border-white/10 bg-white/[0.02] flex-shrink-0">
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
            <h3 class="text-2xl font-bold text-white mb-3">确认删除活动</h3>
            <p class="text-white/60 mb-8">
              确定要删除「<span class="text-white font-semibold">{{ deleteTarget?.name }}</span>」吗？<br/>此操作不可撤销，所有相关数据将永久删除。
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

select option {
  background: #0f172a;
  color: white;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid > div {
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;
}
</style>
