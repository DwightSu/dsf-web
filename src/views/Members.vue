<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Users, Search, User, Calendar, Trophy, ChevronLeft, ChevronRight, Tag, X, Sparkles, Shield, Star } from 'lucide-vue-next'
import PixelButton from '@/components/common/PixelButton.vue'
import { mockGroups, mockGroupMembers, mockActivities } from '@/mock'
import { formatDate } from '@/utils/format'
import type { Member } from '@/types/database'
import { useMemberStore } from '@/stores/members'

const memberStore = useMemberStore()

const loading = ref(true)
const searchQuery = ref('')
const selectedTags = ref<string[]>([])
const currentPage = ref(1)
const pageSize = 12

// 预设标签列表
const availableTags = computed(() => {
  const tagSet = new Set<string>()
  memberStore.allMembers.forEach(m => {
    m.tags?.forEach(tag => tagSet.add(tag))
  })
  return Array.from(tagSet).sort()
})

function toggleTag(tag: string) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  } else {
    selectedTags.value.push(tag)
  }
  currentPage.value = 1
}

function clearTags() {
  selectedTags.value = []
}

function getActivityCount(memberId: string): number {
  const memberTeams = getMemberTeams(memberId)
  const activityIds = [...new Set(memberTeams.map(t => t.activity_id))]
  return activityIds.length
}

function getMemberTeams(memberId: string) {
  const gmList = mockGroupMembers.filter(gm => gm.member_id === memberId)
  const groupIds = gmList.map(gm => gm.group_id)
  return mockGroups.filter(g => groupIds.includes(g.id))
}

function maskQQNumber(qq: string | null): string {
  if (!qq) return '未知'
  if (qq.length <= 6) return qq
  return qq.slice(0, 3) + '***' + qq.slice(-3)
}

function getMemberRole(member: Member): string {
  if (member.tags?.includes('管理员')) return '管理员'
  if (member.tags?.includes('大佬')) return '大佬'
  if (member.tags?.includes('萌新')) return '萌新'
  return '成员'
}

function getRoleTagClass(role: string): { bg: string; border: string; text: string } {
  switch (role) {
    case '管理员':
      return { bg: 'from-red-500/20 to-rose-600/20', border: 'border-red-500/30', text: 'text-red-300' }
    case '大佬':
      return { bg: 'from-amber-500/20 to-orange-600/20', border: 'border-amber-500/30', text: 'text-amber-300' }
    case '萌新':
      return { bg: 'from-blue-500/20 to-indigo-600/20', border: 'border-blue-500/30', text: 'text-blue-300' }
    default:
      return { bg: 'from-emerald-500/20 to-green-600/20', border: 'border-emerald-500/30', text: 'text-emerald-300' }
  }
}

function getTagColor(tag: string): { bg: string; border: string; text: string } {
  const tagLower = tag.toLowerCase()
  if (tagLower === '管理员') return { bg: 'from-red-500/20 to-rose-600/20', border: 'border-red-500/30', text: 'text-red-300' }
  if (tagLower === '大佬') return { bg: 'from-amber-500/20 to-orange-600/20', border: 'border-amber-500/30', text: 'text-amber-300' }
  if (tagLower === '萌新') return { bg: 'from-blue-500/20 to-indigo-600/20', border: 'border-blue-500/30', text: 'text-blue-300' }
  if (['建筑', '生存', '红石', 'PVP', '探索', '收藏', '竞技'].includes(tag)) {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      '建筑': { bg: 'from-purple-500/20 to-violet-600/20', border: 'border-purple-500/30', text: 'text-purple-300' },
      '生存': { bg: 'from-emerald-500/20 to-green-600/20', border: 'border-emerald-500/30', text: 'text-emerald-300' },
      '红石': { bg: 'from-red-500/20 to-orange-600/20', border: 'border-red-500/30', text: 'text-red-300' },
      'PVP': { bg: 'from-red-600/20 to-rose-600/20', border: 'border-red-600/30', text: 'text-red-400' },
      '探索': { bg: 'from-cyan-500/20 to-blue-600/20', border: 'border-cyan-500/30', text: 'text-cyan-300' },
      '收藏': { bg: 'from-pink-500/20 to-rose-600/20', border: 'border-pink-500/30', text: 'text-pink-300' },
      '竞技': { bg: 'from-orange-500/20 to-amber-600/20', border: 'border-orange-500/30', text: 'text-orange-300' }
    }
    return colors[tag] || { bg: 'from-gray-500/20 to-gray-600/20', border: 'border-gray-500/30', text: 'text-gray-300' }
  }
  return { bg: 'from-gray-500/20 to-gray-600/20', border: 'border-gray-500/30', text: 'text-gray-300' }
}

const filteredMembers = computed(() => {
  let result = [...memberStore.allMembers]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(m =>
      m.nickname.toLowerCase().includes(query) ||
      m.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }

  if (selectedTags.value.length > 0) {
    result = result.filter(m =>
      selectedTags.value.every(tag => m.tags?.includes(tag))
    )
  }

  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredMembers.value.length / pageSize)))

const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredMembers.value.slice(start, end)
})

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function prevPage() {
  goToPage(currentPage.value - 1)
}

function nextPage() {
  goToPage(currentPage.value + 1)
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 400)
})
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="relative mb-8">
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-transparent rounded-3xl"></div>
        <div class="relative flex flex-col md:flex-row md:items-center gap-4 p-6 md:p-8">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-xl shadow-emerald-500/30 animate-pulse">
            <Users :size="32" class="text-white" />
          </div>
          <div class="flex-1">
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
              成员库
            </h1>
            <p class="text-white/60 text-lg">毒薯服全体成员</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-2xl font-bold text-white">{{ filteredMembers.length }}</p>
              <p class="text-white/50 text-sm">位成员</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white/[0.03] rounded-2xl border border-white/10 p-6 mb-8">
        <!-- Search -->
        <div class="relative max-w-xl mb-6">
          <Search :size="20" class="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索成员昵称或标签..."
            class="w-full pl-14 pr-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
          />
        </div>

        <!-- Tags Filter -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-white/60 flex items-center gap-2">
              <Tag :size="16" />
              标签筛选
            </h3>
            <button
              v-if="selectedTags.length > 0"
              @click="clearTags"
              class="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <X :size="14" />
              清除筛选
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in availableTags"
              :key="tag"
              @click="toggleTag(tag)"
              class="px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200"
              :class="[
                selectedTags.includes(tag)
                  ? getTagColor(tag).bg + ' ' + getTagColor(tag).border + ' ' + getTagColor(tag).text
                  : 'bg-white/[0.03] border-white/10 text-white/60 hover:border-white/20 hover:text-white'
              ]"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <!-- Active Filters -->
        <div v-if="selectedTags.length > 0" class="mt-4 pt-4 border-t border-white/10">
          <p class="text-sm text-white/50 mb-2">当前筛选：</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in selectedTags"
              :key="tag"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
            >
              {{ tag }}
              <button @click="toggleTag(tag)" class="hover:text-white transition-colors">
                <X :size="14" />
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-white/60">加载成员数据...</p>
        </div>
      </div>

      <!-- Members Grid -->
      <div v-else-if="filteredMembers.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <RouterLink
          v-for="(member, index) in paginatedMembers"
          :key="member.id"
          :to="`/members/${member.id}`"
          class="block group animate-scale-in"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div class="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-2xl border border-white/10 overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-2 h-full">
            <!-- Cover -->
            <div class="relative h-32 overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-transparent"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400/30 to-green-500/30 flex items-center justify-center backdrop-blur-md border-2 border-white/20">
                  <User :size="36" class="text-white/80" />
                </div>
              </div>
              
              <!-- Role Badge -->
              <div class="absolute top-3 right-3">
                <span
                  class="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md"
                  :class="getRoleTagClass(getMemberRole(member)).bg + ' ' + getRoleTagClass(getMemberRole(member)).border + ' ' + getRoleTagClass(getMemberRole(member)).text"
                >
                  {{ getMemberRole(member) }}
                </span>
              </div>

              <!-- Quick Stats -->
              <div class="absolute bottom-3 left-3 flex gap-2">
                <span class="px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-xs text-white/80 flex items-center gap-1">
                  <Calendar :size="12" />
                  {{ formatDate(member.created_at).slice(0, 7) }}
                </span>
                <span class="px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-xs text-white/80 flex items-center gap-1">
                  <Trophy :size="12" />
                  {{ getActivityCount(member.id) }}场
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-5">
              <h3 class="text-lg font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors truncate">
                {{ member.nickname }}
              </h3>
              <p class="text-white/40 text-sm mb-3 font-mono">
                QQ: {{ maskQQNumber(member.qq_number) }}
              </p>

              <!-- Tags -->
              <div v-if="member.tags && member.tags.length > 0" class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in member.tags.slice(0, 3)"
                  :key="tag"
                  class="px-2 py-0.5 rounded-md text-xs"
                  :class="getTagColor(tag).bg + ' ' + getTagColor(tag).text"
                >
                  {{ tag }}
                </span>
                <span v-if="member.tags.length > 3" class="px-2 py-0.5 rounded-md text-xs bg-white/10 text-white/50">
                  +{{ member.tags.length - 3 }}
                </span>
              </div>

              <!-- Notes -->
              <p v-if="member.notes" class="mt-3 text-sm text-white/50 line-clamp-1">
                {{ member.notes }}
              </p>
            </div>
          </div>
        </RouterLink>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
          <Users :size="48" class="text-white/30" />
        </div>
        <h3 class="text-2xl font-bold text-white/80 mb-3">没有找到匹配的成员</h3>
        <p class="text-white/50 mb-6">试试其他搜索条件或标签组合</p>
        <button
          @click="searchQuery = ''; clearTags()"
          class="px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium hover:bg-emerald-500/30 transition-all"
        >
          清除所有筛选
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft :size="20" />
        </button>

        <div class="flex gap-1.5">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            class="w-10 h-10 rounded-lg text-sm font-medium transition-all"
            :class="currentPage === page
              ? 'bg-emerald-500 text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight :size="20" />
        </button>
      </div>

      <!-- Page Info -->
      <p v-if="totalPages > 1" class="text-center text-white/50 text-sm mt-4">
        第 {{ currentPage }} / {{ totalPages }} 页，共 {{ filteredMembers.length }} 位成员
      </p>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.animate-scale-in {
  animation: scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes scale-in {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}
</style>
