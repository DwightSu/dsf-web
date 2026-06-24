<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Calendar, Search, Users, Filter, X, ChevronLeft, ChevronRight, Sparkles, Clock, ArrowUpDown } from 'lucide-vue-next'
import { mockActivities, mockGroups, mockGroupMembers } from '@/mock'
import { formatDate } from '@/utils/format'
import type { Activity } from '@/types/database'
import { getCustomActivities } from '@/utils/storage'

const loading = ref(false)
const searchQuery = ref('')
const selectedType = ref<string>('')
const sortOrder = ref<'desc' | 'asc'>('desc')
const currentPage = ref(1)
const itemsPerPage = 6

// 合并mock数据和本地存储的自定义活动
const allActivities = computed(() => {
  return [...mockActivities, ...(getCustomActivities() as Activity[])]
})

const activityTypes = computed(() => {
  const types = [...new Set(allActivities.value.map(a => a.activity_type).filter(Boolean))]
  return types as string[]
})

const filteredActivities = computed(() => {
  let result = [...allActivities.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(a =>
      a.name.toLowerCase().includes(query) ||
      (a.description && a.description.toLowerCase().includes(query))
    )
  }

  if (selectedType.value) {
    result = result.filter(a => a.activity_type === selectedType.value)
  }

  result.sort((a, b) => {
    const dateA = new Date(a.activity_date).getTime()
    const dateB = new Date(b.activity_date).getTime()
    return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB
  })

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredActivities.value.length / itemsPerPage)
})

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredActivities.value.slice(start, end)
})

function getParticipantCount(activityId: string): number {
  const groups = mockGroups.filter(g => g.activity_id === activityId)
  const groupIds = groups.map(g => g.id)
  const members = mockGroupMembers.filter(gm => groupIds.includes(gm.group_id))
  const uniqueMemberIds = [...new Set(members.map(m => m.member_id))]
  return uniqueMemberIds.length
}

function clearFilters() {
  searchQuery.value = ''
  selectedType.value = ''
  currentPage.value = 1
}

function toggleSortOrder() {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function getTypeTagColor(type: string | null): string {
  const colorMap: Record<string, string> = {
    'PVP竞技': 'bg-red-500/20 text-red-300 border-red-500/30',
    '建筑比赛': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    '生存挑战': 'bg-green-500/20 text-green-300 border-green-500/30'
  }
  return colorMap[type || ''] || 'bg-purple-500/20 text-purple-300 border-purple-500/30'
}

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-12 animate-slide-up">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
          <Sparkles class="w-4 h-4 text-green-400" />
          <span class="text-sm text-green-300 font-medium">毒薯服精彩活动</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold mb-4">
          <span class="bg-gradient-to-r from-green-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
            活动列表
          </span>
        </h1>
        <p class="text-gray-300 text-lg max-w-2xl mx-auto">
          记录毒薯服每一次精彩活动，与小伙伴们共同创造美好回忆
        </p>
      </div>

      <div class="mb-10 animate-slide-up" style="animation-delay: 0.1s;">
        <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-xl">
          <div class="flex flex-col lg:flex-row gap-4">
            <div class="flex-1 relative">
              <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索活动名称或描述..."
                class="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300"
              />
            </div>

            <div class="flex flex-wrap gap-3 items-center">
              <div class="flex items-center gap-2">
                <Filter class="w-4 h-4 text-gray-400" />
                <span class="text-sm text-gray-300">类型:</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  @click="selectedType = ''; currentPage = 1"
                  :class="[
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border',
                    selectedType === ''
                      ? 'bg-green-500/20 text-green-300 border-green-500/40'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  ]"
                >
                  全部
                </button>
                <button
                  v-for="type in activityTypes"
                  :key="type"
                  @click="selectedType = type; currentPage = 1"
                  :class="[
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border',
                    selectedType === type
                      ? 'bg-green-500/20 text-green-300 border-green-500/40'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  ]"
                >
                  {{ type }}
                </button>
              </div>

              <button
                @click="toggleSortOrder"
                class="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-all duration-300"
              >
                <ArrowUpDown class="w-4 h-4" />
                <span class="text-sm">{{ sortOrder === 'desc' ? '最新优先' : '最早优先' }}</span>
              </button>

              <button
                v-if="searchQuery || selectedType"
                @click="clearFilters"
                class="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 hover:bg-red-500/20 transition-all duration-300"
              >
                <X class="w-4 h-4" />
                <span class="text-sm">清除筛选</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div class="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-400">加载活动中...</p>
        </div>
      </div>

      <div v-else-if="paginatedActivities.length > 0" class="animate-fade-in">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RouterLink
            v-for="(activity, index) in paginatedActivities"
            :key="activity.id"
            :to="`/activities/${activity.id}`"
            class="group block animate-slide-up"
            :style="{ animationDelay: `${index * 0.08}s` }"
          >
            <div class="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 shadow-lg hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 hover:-translate-y-2 hover:border-green-500/30">
              <div class="relative aspect-video overflow-hidden">
                <img
                  v-if="activity.cover_image"
                  :src="activity.cover_image"
                  :alt="activity.name"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div v-else class="w-full h-full bg-gradient-to-br from-green-600/30 to-amber-600/30 flex items-center justify-center">
                  <Calendar class="w-16 h-16 text-white/30" />
                </div>

                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div class="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span
                    :class="[
                      'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm',
                      getTypeTagColor(activity.activity_type)
                    ]"
                  >
                    {{ activity.activity_type || '活动' }}
                  </span>
                  <span
                    v-if="activity.has_groups"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-sm"
                  >
                    分组对战
                  </span>
                </div>

                <div class="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full text-white text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <Clock class="w-4 h-4" />
                  <span>查看详情</span>
                </div>
              </div>

              <div class="p-6">
                <h3 class="text-xl font-bold text-white mb-3 leading-tight group-hover:text-green-300 transition-colors duration-300">
                  {{ activity.name }}
                </h3>

                <div class="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-400">
                  <div class="flex items-center gap-1.5">
                    <Calendar class="w-4 h-4 text-green-400" />
                    <span>{{ formatDate(activity.activity_date, 'long') }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <Users class="w-4 h-4 text-amber-400" />
                    <span>{{ getParticipantCount(activity.id) }} 人参与</span>
                  </div>
                </div>

                <p class="text-gray-300 text-sm leading-relaxed line-clamp-3">
                  {{ activity.description || '暂无活动描述' }}
                </p>

                <div class="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span class="text-xs text-gray-500">点击查看更多精彩内容</span>
                  <ChevronRight class="w-5 h-5 text-gray-500 group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </div>
          </RouterLink>
        </div>

        <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-12">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            :class="[
              'p-2.5 rounded-xl transition-all duration-300',
              currentPage === 1
                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                : 'bg-white/5 text-gray-300 hover:bg-green-500/20 hover:text-green-300 border border-white/10 hover:border-green-500/30'
            ]"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>

          <div class="flex items-center gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'min-w-[44px] h-11 px-3 rounded-xl font-semibold transition-all duration-300 border',
                currentPage === page
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-transparent shadow-lg shadow-green-500/25'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              ]"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            :class="[
              'p-2.5 rounded-xl transition-all duration-300',
              currentPage === totalPages
                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                : 'bg-white/5 text-gray-300 hover:bg-green-500/20 hover:text-green-300 border border-white/10 hover:border-green-500/30'
            ]"
          >
            <ChevronRight class="w-5 h-5" />
          </button>
        </div>

        <div class="text-center mt-4 text-sm text-gray-500">
          共 {{ filteredActivities.length }} 个活动 · 第 {{ currentPage }} / {{ totalPages }} 页
        </div>
      </div>

      <div v-else class="text-center py-20 animate-fade-in">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
          <Search class="w-12 h-12 text-gray-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-300 mb-2">没有找到匹配的活动</h3>
        <p class="text-gray-500 mb-6">试试其他搜索词或清除筛选条件</p>
        <button
          @click="clearFilters"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:-translate-y-0.5"
        >
          <X class="w-4 h-4" />
          清除筛选条件
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
