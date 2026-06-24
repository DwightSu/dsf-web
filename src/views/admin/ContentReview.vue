<script setup lang="ts">
import { ref, computed } from 'vue'
import { MessageSquare, Search, Check, X, Eye, ChevronLeft, ChevronRight, AlertCircle, FileText, MessageCircle, Clock } from 'lucide-vue-next'
import { mockPosts, mockComments, mockPostAuthors, mockCommentAuthors } from '@/mock'
import { formatDate } from '@/utils/format'
import type { Post, Comment } from '@/types/database'

type ReviewStatus = 'pending' | 'approved' | 'rejected'
type TabType = 'posts' | 'comments'

interface PostWithReview extends Post {
  review_status: ReviewStatus
  author_nickname: string
  author_avatar: string | null
}

interface CommentWithReview extends Comment {
  review_status: ReviewStatus
  author_nickname: string
  author_avatar: string | null
  post_title: string
}

const activeTab = ref<TabType>('posts')
const searchQuery = ref('')
const statusFilter = ref<'all' | ReviewStatus>('all')
const currentPage = ref(1)
const pageSize = 5

const posts = ref<PostWithReview[]>([])
const comments = ref<CommentWithReview[]>([])

const showDetailModal = ref(false)
const detailType = ref<'post' | 'comment'>('post')
const selectedItem = ref<PostWithReview | CommentWithReview | null>(null)

const showConfirmModal = ref(false)
const confirmAction = ref<'approve' | 'reject'>('approve')
const confirmItem = ref<PostWithReview | CommentWithReview | null>(null)
const confirmType = ref<'post' | 'comment'>('post')

function initData() {
  posts.value = mockPosts.map((post, index) => ({
    ...post,
    review_status: (index < 2 ? 'pending' : index < 4 ? 'approved' : 'rejected') as ReviewStatus,
    author_nickname: mockPostAuthors[post.id]?.nickname || '匿名用户',
    author_avatar: mockPostAuthors[post.id]?.avatar_url || null
  }))

  comments.value = mockComments
    .filter(c => c.target_type === 'post')
    .map((comment, index) => ({
      ...comment,
      review_status: (index < 3 ? 'pending' : index < 7 ? 'approved' : 'rejected') as ReviewStatus,
      author_nickname: mockCommentAuthors[comment.id]?.nickname || '匿名用户',
      author_avatar: mockCommentAuthors[comment.id]?.avatar_url || null,
      post_title: mockPosts.find(p => p.id === comment.target_id)?.title || '未知帖子'
    }))
}

initData()

const filteredPosts = computed(() => {
  let result = [...posts.value]
  if (statusFilter.value !== 'all') {
    result = result.filter(p => p.review_status === statusFilter.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.author_nickname.toLowerCase().includes(q)
    )
  }
  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const filteredComments = computed(() => {
  let result = [...comments.value]
  if (statusFilter.value !== 'all') {
    result = result.filter(c => c.review_status === statusFilter.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.content.toLowerCase().includes(q) ||
      c.author_nickname.toLowerCase().includes(q) ||
      c.post_title.toLowerCase().includes(q)
    )
  }
  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const totalPages = computed(() => {
  if (activeTab.value === 'posts') {
    return Math.ceil(filteredPosts.value.length / pageSize)
  }
  return Math.ceil(filteredComments.value.length / pageSize)
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  if (activeTab.value === 'posts') {
    return filteredPosts.value.slice(start, start + pageSize)
  }
  return filteredComments.value.slice(start, start + pageSize)
})

const pendingCount = computed(() => {
  if (activeTab.value === 'posts') {
    return posts.value.filter(p => p.review_status === 'pending').length
  }
  return comments.value.filter(c => c.review_status === 'pending').length
})

function viewDetail(item: PostWithReview | CommentWithReview, type: 'post' | 'comment') {
  selectedItem.value = item
  detailType.value = type
  showDetailModal.value = true
}

function openConfirm(action: 'approve' | 'reject', item: PostWithReview | CommentWithReview, type: 'post' | 'comment') {
  confirmAction.value = action
  confirmItem.value = item
  confirmType.value = type
  showConfirmModal.value = true
}

function executeAction() {
  if (!confirmItem.value) return
  
  if (confirmType.value === 'post') {
    const idx = posts.value.findIndex(p => p.id === confirmItem.value?.id)
    if (idx !== -1) {
      posts.value[idx].review_status = confirmAction.value === 'approve' ? 'approved' : 'rejected'
    }
  } else {
    const idx = comments.value.findIndex(c => c.id === confirmItem.value?.id)
    if (idx !== -1) {
      comments.value[idx].review_status = confirmAction.value === 'approve' ? 'approved' : 'rejected'
    }
  }
  
  showConfirmModal.value = false
  confirmItem.value = null
}

function getStatusText(status: ReviewStatus): string {
  const map: Record<ReviewStatus, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return map[status]
}

function getStatusClass(status: ReviewStatus): string {
  const map: Record<ReviewStatus, string> = {
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    approved: 'bg-green-500/20 text-green-300 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-300 border-red-500/30'
  }
  return map[status]
}

function getAvatar(url: string | null, name: string): string {
  if (url) return url
  const colors = ['5CB85C', 'F0AD4E', '5BC0DE', 'D9534F', '9B59B6', 'B87333']
  const colorIndex = name.charCodeAt(0) % colors.length
  return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name)}&backgroundColor=${colors[colorIndex]}`
}

function switchTab(tab: TabType) {
  activeTab.value = tab
  currentPage.value = 1
}
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
          <MessageSquare :size="24" class="text-white" />
        </div>
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-white">内容审核</h1>
          <p class="text-white/60 text-sm">审核论坛帖子和评论</p>
        </div>
      </div>

      <div class="flex gap-2 mb-6 p-1 bg-white/[0.03] rounded-xl border border-white/10">
        <button
          @click="switchTab('posts')"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200"
          :class="activeTab === 'posts' ? 'bg-white/10 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'"
        >
          <FileText :size="18" />
          帖子审核
          <span
            v-if="posts.filter(p => p.review_status === 'pending').length > 0"
            class="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30"
          >
            {{ posts.filter(p => p.review_status === 'pending').length }}
          </span>
        </button>
        <button
          @click="switchTab('comments')"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200"
          :class="activeTab === 'comments' ? 'bg-white/10 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'"
        >
          <MessageCircle :size="18" />
          评论审核
          <span
            v-if="comments.filter(c => c.review_status === 'pending').length > 0"
            class="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30"
          >
            {{ comments.filter(c => c.review_status === 'pending').length }}
          </span>
        </button>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <div class="relative flex-1">
          <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="activeTab === 'posts' ? '搜索帖子标题、内容或作者...' : '搜索评论内容、作者或帖子...'"
            class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all duration-200"
          />
        </div>
        <select
          v-model="statusFilter"
          class="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all duration-200 appearance-none cursor-pointer min-w-[140px]"
        >
          <option value="all">全部状态</option>
          <option value="pending">待审核</option>
          <option value="approved">已通过</option>
          <option value="rejected">已拒绝</option>
        </select>
      </div>

      <div class="space-y-4">
        <div
          v-for="item in paginatedData"
          :key="item.id"
          class="bg-white/[0.03] rounded-2xl border border-white/10 p-5 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/5"
        >
          <div class="flex items-start gap-4">
            <img
              :src="getAvatar(activeTab === 'posts' ? (item as PostWithReview).author_avatar : (item as CommentWithReview).author_avatar, activeTab === 'posts' ? (item as PostWithReview).author_nickname : (item as CommentWithReview).author_nickname)"
              :alt="activeTab === 'posts' ? (item as PostWithReview).author_nickname : (item as CommentWithReview).author_nickname"
              class="w-11 h-11 rounded-full object-cover flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3 mb-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-semibold text-white">
                    {{ activeTab === 'posts' ? (item as PostWithReview).author_nickname : (item as CommentWithReview).author_nickname }}
                  </span>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                    :class="getStatusClass(item.review_status)"
                  >
                    {{ getStatusText(item.review_status) }}
                  </span>
                </div>
                <div class="flex items-center gap-1 text-white/40 text-xs flex-shrink-0">
                  <Clock :size="14" />
                  {{ formatDate(item.created_at) }}
                </div>
              </div>

              <h3 v-if="activeTab === 'posts'" class="font-bold text-white text-lg mb-2">
                {{ (item as PostWithReview).title }}
              </h3>
              <p v-else class="text-xs text-white/50 mb-2">
                回复帖子：{{ (item as CommentWithReview).post_title }}
              </p>

              <p class="text-white/70 line-clamp-3 mb-4">
                {{ item.content }}
              </p>

              <div class="flex items-center justify-end gap-2">
                <button
                  @click="viewDetail(item, activeTab)"
                  class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <Eye :size="16" />
                  查看
                </button>
                <template v-if="item.review_status === 'pending'">
                  <button
                    @click="openConfirm('approve', item, activeTab)"
                    class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-300 hover:text-green-200 hover:bg-green-500/10 rounded-lg transition-all duration-200"
                  >
                    <Check :size="16" />
                    通过
                  </button>
                  <button
                    @click="openConfirm('reject', item, activeTab)"
                    class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  >
                    <X :size="16" />
                    拒绝
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="paginatedData.length === 0" class="py-20 text-center">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <AlertCircle :size="36" class="text-white/30" />
        </div>
        <p class="text-white/50">暂无内容</p>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-6">
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
          v-if="showDetailModal && selectedItem"
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          @click.self="showDetailModal = false"
        >
          <div class="w-full max-w-2xl bg-[#1a2744] rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <h3 class="text-lg font-bold text-white">
                {{ detailType === 'post' ? '帖子详情' : '评论详情' }}
              </h3>
              <button
                @click="showDetailModal = false"
                class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <X :size="20" />
              </button>
            </div>
            <div class="p-6 overflow-y-auto flex-1">
              <div class="flex items-center gap-3 mb-4">
                <img
                  :src="getAvatar(detailType === 'post' ? (selectedItem as PostWithReview).author_avatar : (selectedItem as CommentWithReview).author_avatar, detailType === 'post' ? (selectedItem as PostWithReview).author_nickname : (selectedItem as CommentWithReview).author_nickname)"
                  alt="头像"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p class="font-semibold text-white">
                    {{ detailType === 'post' ? (selectedItem as PostWithReview).author_nickname : (selectedItem as CommentWithReview).author_nickname }}
                  </p>
                  <p class="text-sm text-white/50">{{ formatDate(selectedItem.created_at) }}</p>
                </div>
                <span
                  class="ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                  :class="getStatusClass(selectedItem.review_status)"
                >
                  {{ getStatusText(selectedItem.review_status) }}
                </span>
              </div>

              <h4 v-if="detailType === 'post'" class="text-xl font-bold text-white mb-4">
                {{ (selectedItem as PostWithReview).title }}
              </h4>
              <p v-else class="text-sm text-white/50 mb-4">
                回复帖子：{{ (selectedItem as CommentWithReview).post_title }}
              </p>

              <div class="bg-white/[0.03] rounded-xl p-4 border border-white/10">
                <p class="text-white/80 whitespace-pre-wrap leading-relaxed">
                  {{ selectedItem.content }}
                </p>
              </div>

              <div v-if="detailType === 'post' && (selectedItem as PostWithReview).tags?.length" class="mt-4 flex flex-wrap gap-2">
                <span
                  v-for="tag in (selectedItem as PostWithReview).tags"
                  :key="tag"
                  class="px-3 py-1 text-xs rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 flex-shrink-0">
              <button
                @click="showDetailModal = false"
                class="px-5 py-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                关闭
              </button>
              <template v-if="selectedItem.review_status === 'pending'">
                <button
                  @click="openConfirm('approve', selectedItem, detailType); showDetailModal = false"
                  class="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  通过
                </button>
                <button
                  @click="openConfirm('reject', selectedItem, detailType); showDetailModal = false"
                  class="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  拒绝
                </button>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showConfirmModal"
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          @click.self="showConfirmModal = false"
        >
          <div class="w-full max-w-md bg-[#1a2744] rounded-2xl border border-white/10 shadow-2xl p-6 text-center">
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              :class="confirmAction === 'approve' ? 'bg-green-500/20' : 'bg-red-500/20'"
            >
              <Check v-if="confirmAction === 'approve'" :size="28" class="text-green-400" />
              <X v-else :size="28" class="text-red-400" />
            </div>
            <h3 class="text-xl font-bold text-white mb-2">
              确认{{ confirmAction === 'approve' ? '通过' : '拒绝' }}
            </h3>
            <p class="text-white/60 mb-6">
              确定要{{ confirmAction === 'approve' ? '通过' : '拒绝' }}这条{{ confirmType === 'post' ? '帖子' : '评论' }}吗？
            </p>
            <div class="flex items-center justify-center gap-3">
              <button
                @click="showConfirmModal = false"
                class="px-5 py-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                取消
              </button>
              <button
                @click="executeAction"
                class="px-5 py-2.5 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                :class="confirmAction === 'approve' ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/25' : 'bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-lg hover:shadow-red-500/25'"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
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
