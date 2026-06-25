<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  MessageSquare,
  Search,
  Eye,
  MessageCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  Newspaper,
  User,
  ArrowRight
} from 'lucide-vue-next'
import PixelButton from '@/components/common/PixelButton.vue'
import { getAllPosts, getPostCommentCount, getPostAuthor } from '@/mock'
import { formatDate } from '@/utils/format'
import { useAuthStore } from '@/stores/auth'
import type { Post } from '@/types/database'

const authStore = useAuthStore()
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('all')
const sortBy = ref<'latest' | 'comments' | 'views'>('latest')
const currentPage = ref(1)
const pageSize = 5

const categories = [
  { id: 'all', name: '全部', icon: Newspaper, color: 'green' },
  { id: 'activity', name: '活动心得', icon: TrendingUp, color: 'gold' },
  { id: 'building', name: '建筑展示', icon: MessageSquare, color: 'blue' },
  { id: 'help', name: '求助问答', icon: MessageCircle, color: 'red' },
  { id: 'chat', name: '闲聊灌水', icon: MessageSquare, color: 'purple' }
]

const sortOptions = [
  { id: 'latest', name: '最新发布', icon: Clock },
  { id: 'comments', name: '最多评论', icon: MessageCircle },
  { id: 'views', name: '最多浏览', icon: Eye }
]

function getPostCategory(post: Post): string {
  const tags = post.tags || []
  const tagStr = tags.join(',').toLowerCase()

  if (tagStr.includes('起床战争') || tagStr.includes('赛事') || tagStr.includes('生存挑战') || tagStr.includes('活动')) {
    return 'activity'
  }
  if (tagStr.includes('建筑') || tagStr.includes('中式') || tagStr.includes('作品')) {
    return 'building'
  }
  if (tagStr.includes('教程') || tagStr.includes('技巧') || tagStr.includes('指南') || tagStr.includes('新手')) {
    return 'help'
  }
  return 'chat'
}

function getCategoryColorClass(category: string): string {
  switch (category) {
    case 'activity':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    case 'building':
      return 'bg-sky-500/20 text-sky-300 border-sky-500/30'
    case 'help':
      return 'bg-red-500/20 text-red-300 border-red-500/30'
    case 'chat':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    default:
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  }
}

function getCategoryName(category: string): string {
  const cat = categories.find(c => c.id === category)
  return cat?.name || '其他'
}

function getExcerpt(content: string, maxLen: number = 100): string {
  const plain = content.replace(/[#*\n]/g, ' ').replace(/\s+/g, ' ').trim()
  return plain.length > maxLen ? plain.slice(0, maxLen) + '...' : plain
}

function getAvatarUrl(nickname: string): string {
  const colors = [
    '#5CB85C', '#5BC0DE', '#F0AD4E', '#D9534F',
    '#9B59B6', '#3498DB', '#1ABC9C', '#E67E22'
  ]
  const colorIndex = nickname.charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex]
  const initial = nickname.charAt(0).toUpperCase()

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${bgColor}dd;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="100" fill="url(#grad)"/>
      <text x="100" y="100" text-anchor="middle" dominant-baseline="central"
            fill="white" font-size="80" font-weight="bold" font-family="Arial, sans-serif">
        ${initial}
      </text>
    </svg>
  `
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg.trim())))
}

const filteredPosts = computed(() => {
  let result = [...getAllPosts()]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.title.toLowerCase().includes(query) ||
      (p.content && p.content.toLowerCase().includes(query))
    )
  }

  if (selectedCategory.value !== 'all') {
    result = result.filter(p => getPostCategory(p) === selectedCategory.value)
  }

  switch (sortBy.value) {
    case 'latest':
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
    case 'comments':
      result.sort((a, b) => getPostCommentCount(b.id) - getPostCommentCount(a.id))
      break
    case 'views':
      result.sort((a, b) => (b.views || 0) - (a.views || 0))
      break
  }

  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPosts.value.length / pageSize)))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredPosts.value.slice(start, end)
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

function selectCategory(categoryId: string) {
  selectedCategory.value = categoryId
  currentPage.value = 1
}

function changeSort(sort: 'latest' | 'comments' | 'views') {
  sortBy.value = sort
  currentPage.value = 1
}

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<template>
  <div class="forum-page min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-5xl">
      <div class="page-header text-center mb-10 animate-slide-down">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-400 mb-4 shadow-lg shadow-emerald-500/30 animate-bounce-soft">
          <MessageSquare :size="32" class="text-white" />
        </div>
        <h1 class="text-4xl font-bold mb-3">
          <span class="bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-transparent">论坛</span>
          <span class="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">交流</span>
        </h1>
        <p class="text-white/60 text-lg">
          与毒薯服小伙伴们分享心得
        </p>
      </div>

      <div class="search-filter-section mb-8 animate-slide-up">
        <div class="rounded-2xl p-5 bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-white/10 shadow-lg backdrop-blur-sm">
          <div class="flex flex-col lg:flex-row gap-4 mb-5">
            <div class="flex-1 relative">
              <Search :size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索帖子标题或内容..."
                class="w-full pl-12 pr-4 py-3 bg-slate-700/50 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 focus:bg-slate-700/80 transition-all"
              />
            </div>

            <div v-if="authStore.isLoggedIn" class="flex-shrink-0">
              <RouterLink to="/forum/create">
                <button class="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
                  <Plus :size="18" />
                  <span>发布帖子</span>
                  <ArrowRight :size="16" class="opacity-0 group-hover:opacity-100 -ml-2 group-hover:ml-0 transition-all duration-300" />
                </button>
              </RouterLink>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex flex-wrap gap-2">
              <span class="text-sm text-white/50 self-center mr-1">分类:</span>
              <button
                v-for="category in categories"
                :key="category.id"
                @click="selectCategory(category.id)"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 border',
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-emerald-500 to-lime-400 text-white border-transparent shadow-lg shadow-emerald-500/30 scale-105'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                ]"
              >
                <component :is="category.icon" :size="16" />
                {{ category.name }}
              </button>
            </div>

            <div class="flex flex-wrap gap-2 items-center">
              <span class="text-sm text-white/50 mr-1">排序:</span>
              <button
                v-for="option in sortOptions"
                :key="option.id"
                @click="changeSort(option.id as 'latest' | 'comments' | 'views')"
                :class="[
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5',
                  sortBy === option.id
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                ]"
              >
                <component :is="option.icon" :size="14" />
                {{ option.name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-white/60">加载帖子中...</p>
        </div>
      </div>

      <div v-else-if="filteredPosts.length > 0">
        <div class="text-white/50 text-sm mb-4">
          共找到 <span class="text-emerald-400 font-semibold">{{ filteredPosts.length }}</span> 篇帖子
        </div>

        <div class="posts-list space-y-4 mb-8">
          <RouterLink
            v-for="(post, index) in paginatedPosts"
            :key="post.id"
            :to="`/forum/post/${post.id}`"
            class="post-card block animate-scale-in"
            :style="{ animationDelay: `${index * 0.08}s` }"
          >
            <div class="group rounded-2xl p-5 bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-white/10 shadow-lg backdrop-blur-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 hover:border-emerald-500/50 transition-all duration-300">
              <div class="flex gap-4">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-emerald-400 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all">
                    <img
                      :src="getAvatarUrl(getPostAuthor(post.id).nickname)"
                      :alt="getPostAuthor(post.id).nickname"
                      class="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h3 class="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {{ post.title }}
                    </h3>
                    <span
                      :class="[
                        'px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0',
                        getCategoryColorClass(getPostCategory(post))
                      ]"
                    >
                      {{ getCategoryName(getPostCategory(post)) }}
                    </span>
                  </div>

                  <p class="text-white/60 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {{ post.summary || getExcerpt(post.content || '') }}
                  </p>

                  <div class="flex flex-wrap items-center gap-4 text-xs">
                    <span class="flex items-center gap-1.5 text-white/50">
                      <User :size="14" class="text-emerald-400" />
                      <span class="text-white/70">{{ getPostAuthor(post.id).nickname }}</span>
                    </span>
                    <span class="flex items-center gap-1.5 text-white/50">
                      <Clock :size="14" class="text-sky-400" />
                      <span>{{ formatDate(post.created_at) }}</span>
                    </span>
                    <span class="flex items-center gap-1.5 text-white/50">
                      <MessageCircle :size="14" class="text-amber-400" />
                      <span>{{ getPostCommentCount(post.id) }} 评论</span>
                    </span>
                    <span class="flex items-center gap-1.5 text-white/50">
                      <Eye :size="14" class="text-purple-400" />
                      <span>{{ post.views || 0 }} 浏览</span>
                    </span>
                  </div>

                  <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-1.5 mt-3">
                    <span
                      v-for="tag in post.tags.slice(0, 4)"
                      :key="tag"
                      class="px-2 py-0.5 bg-white/5 text-white/50 rounded-md text-xs hover:bg-white/10 transition-colors"
                    >
                      #{{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>

        <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 animate-slide-up">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              currentPage === 1
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-white/10 text-white/70 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 border border-white/10'
            ]"
          >
            <ChevronLeft :size="20" />
          </button>

          <div class="flex gap-1.5">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all border',
                currentPage === page
                  ? 'bg-gradient-to-r from-emerald-500 to-lime-400 text-white border-transparent shadow-lg shadow-emerald-500/30'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
              ]"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              currentPage === totalPages
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-white/10 text-white/70 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 border border-white/10'
            ]"
          >
            <ChevronRight :size="20" />
          </button>
        </div>
      </div>

      <div v-else class="text-center py-20 animate-scale-in">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-4">
          <MessageSquare :size="40" class="text-white/20" />
        </div>
        <p class="text-white/60 text-lg mb-2">没有找到相关帖子</p>
        <p class="text-white/40 text-sm">换个关键词或分类试试吧</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.animate-bounce-soft {
  animation: bounce-soft 2s ease-in-out infinite;
}

@keyframes bounce-soft {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.animate-scale-in {
  animation: scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes scale-in {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes slide-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-down {
  animation: slide-down 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes slide-down {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.post-card {
  text-decoration: none;
}
</style>
