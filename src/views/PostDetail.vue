<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, MessageSquare, ArrowLeft, Users, Edit, Save, X, Share2, Tag, ChevronRight } from 'lucide-vue-next'
import { getMockPostDetail } from '@/mock'
import { formatDate } from '@/utils/format'
import { useAuthStore } from '@/stores/auth'
import { getPostImageById } from '@/utils/storage'

const authStore = useAuthStore()

const isEditing = ref(false)
const editTitle = ref('')
const editContent = ref('')
const editTags = ref('')

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const postDetail = ref<any>(null)

function loadPost() {
  const id = route.params.id as string
  loading.value = true

  setTimeout(() => {
    postDetail.value = getMockPostDetail(id)
    loading.value = false
  }, 300)
}

function resolveImageReferences(text: string): string {
  return text.replace(/!\[([^\]]*)\]\(img:([^)]+)\)/g, (match, alt, imageId) => {
    const image = getPostImageById(imageId)
    if (image) {
      return `![${alt}](${image.data})`
    }
    return match
  })
}

function renderMarkdown(text: string): string {
  if (!text) return ''
  
  const resolvedText = resolveImageReferences(text)
  const lines = resolvedText.split('\n')
  const result: string[] = []
  let inUnorderedList = false
  let inOrderedList = false
  
  lines.forEach(line => {
    line = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    
    if (/!\[([^\]]*)\]\(([^)]+)\)/.test(line)) {
      closeLists()
      line = line.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 0.75rem; margin: 1.5rem 0; box-shadow: 0 4px 16px rgba(0,0,0,0.3);" />')
      result.push(line)
    } else if (/^###\s+/.test(line)) {
      closeLists()
      result.push(line.replace(/^###\s+(.*)$/, '<h3 style="font-size: 1.125rem; font-weight: 700; color: #fff; margin: 1.5rem 0 0.75rem 0; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">$1</h3>'))
    } else if (/^##\s+/.test(line)) {
      closeLists()
      result.push(line.replace(/^##\s+(.*)$/, '<h2 style="font-size: 1.5rem; font-weight: 700; color: #fff; margin: 2rem 0 1rem 0; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">$1</h2>'))
    } else if (/^#\s+/.test(line)) {
      closeLists()
      result.push(line.replace(/^#\s+(.*)$/, '<h1 style="font-size: 1.75rem; font-weight: 700; color: #fff; margin: 2rem 0 1rem 0; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1);">$1</h1>'))
    } else if (/^>\s+/.test(line)) {
      closeLists()
      result.push(line.replace(/^>\s+(.*)$/, '<blockquote style="border-left: 4px solid #4AEDD9; padding-left: 1.25rem; margin: 1rem 0; color: rgba(255,255,255,0.7); font-style: italic; background: rgba(74, 237, 217, 0.05); padding-top: 0.5rem; padding-bottom: 0.5rem; border-radius: 0 0.5rem 0.5rem 0;">$1</blockquote>'))
    } else if (/^-\s+/.test(line)) {
      if (!inUnorderedList) {
        if (inOrderedList) closeLists()
        result.push('<ul style="margin: 1rem 0; padding-left: 1.75rem;">')
        inUnorderedList = true
      }
      result.push(line.replace(/^-\s+(.*)$/, '<li style="color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;">$1</li>'))
    } else if (/^\d+\.\s+/.test(line)) {
      if (!inOrderedList) {
        if (inUnorderedList) closeLists()
        result.push('<ol style="margin: 1rem 0; padding-left: 1.75rem;">')
        inOrderedList = true
      }
      result.push(line.replace(/^\d+\.\s+(.*)$/, '<li style="color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;">$1</li>'))
    } else if (line.trim() === '') {
      closeLists()
    } else {
      closeLists()
      let processedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #4AEDD9; font-weight: 700;">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em style="color: rgba(255,255,255,0.8); font-style: italic;">$1</em>')
        .replace(/`([^`]+)`/g, '<code style="background: rgba(74, 237, 217, 0.15); padding: 0.25rem 0.5rem; color: #4AEDD9; font-size: 0.875rem; border-radius: 0.375rem; font-family: monospace;">$1</code>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #4AEDD9; text-decoration: underline;" target="_blank">$1</a>')
      result.push('<p style="color: rgba(255,255,255,0.75); margin: 1rem 0; line-height: 1.8;">' + processedLine + '</p>')
    }
  })
  
  closeLists()
  
  function closeLists() {
    if (inUnorderedList) {
      result.push('</ul>')
      inUnorderedList = false
    }
    if (inOrderedList) {
      result.push('</ol>')
      inOrderedList = false
    }
  }
  
  return result.join('\n')
}

function getAvatarColor(nickname: string): string {
  const colors = [
    'bg-emerald-500', 'bg-cyan-500', 'bg-amber-500', 'bg-red-500',
    'bg-purple-500', 'bg-blue-500', 'bg-teal-500', 'bg-orange-500'
  ]
  return colors[nickname.charCodeAt(0) % colors.length]
}

function getAvatarInitial(nickname: string): string {
  return nickname.charAt(0).toUpperCase()
}

function startEdit() {
  if (!postDetail.value) return
  editTitle.value = postDetail.value.title
  editContent.value = postDetail.value.content
  editTags.value = (postDetail.value.tags || []).join(', ')
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

function saveEdit() {
  if (!postDetail.value) return
  const tagsArray = editTags.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)
  postDetail.value.title = editTitle.value
  postDetail.value.content = editContent.value
  postDetail.value.tags = tagsArray
  isEditing.value = false
}

function sharePost() {
  if (navigator.share) {
    navigator.share({
      title: postDetail.value?.title || '',
      text: postDetail.value?.title || '',
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
    alert('链接已复制到剪贴板')
  }
}

onMounted(() => {
  loadPost()
})
</script>

<template>
  <div class="post-detail-page min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="mb-6 animate-fade-in">
        <button @click="router.back()" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all group">
          <ArrowLeft :size="18" class="group-hover:-translate-x-1 transition-transform" />
          返回论坛
        </button>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-white/60">加载帖子中...</p>
        </div>
      </div>

      <div v-else-if="!postDetail" class="text-center py-20 animate-scale-in">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-4">
          <MessageSquare :size="40" class="text-white/20" />
        </div>
        <p class="text-white/60 text-lg mb-2">帖子不存在或已被删除</p>
        <button @click="router.push('/forum')" class="px-6 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all">
          返回论坛
        </button>
      </div>

      <div v-else class="space-y-6 animate-slide-up">
        <div class="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-white/10 shadow-lg backdrop-blur-sm">
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div class="flex-1">
              <h1 v-if="!isEditing" class="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                {{ postDetail.title }}
              </h1>
              <input v-else v-model="editTitle" type="text" class="flex-1 text-2xl md:text-3xl font-bold text-white bg-white/5 border-2 border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 w-full" placeholder="请输入帖子标题" />
              
              <div class="flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-3">
                  <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-bold', getAvatarColor(postDetail.profiles?.nickname || '匿名')]">
                    {{ getAvatarInitial(postDetail.profiles?.nickname || '匿名') }}
                  </div>
                  <div>
                    <div class="font-semibold text-white">{{ postDetail.profiles?.nickname || '匿名' }}</div>
                    <div class="text-xs text-white/50">{{ formatDate(postDetail.created_at) }}</div>
                  </div>
                </div>
                
                <div class="hidden md:flex items-center gap-6 text-sm text-white/50">
                  <div class="flex items-center gap-1.5">
                    <Eye :size="16" class="text-sky-400" />
                    <span>{{ postDetail.views || 0 }} 浏览</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <MessageSquare :size="16" class="text-amber-400" />
                    <span>{{ postDetail.comments?.length || 0 }} 评论</span>
                  </div>
                </div>
                
                <div class="flex items-center gap-2 ml-auto">
                  <button v-if="authStore.isAdmin && !isEditing" @click="startEdit" class="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-300 rounded-xl hover:bg-amber-500/30 transition-all">
                    <Edit :size="16" />
                    编辑
                  </button>
                  <button @click="sharePost" class="flex items-center gap-2 px-4 py-2 bg-white/5 text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-all">
                    <Share2 :size="16" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="postDetail.tags && postDetail.tags.length > 0" class="flex flex-wrap gap-2">
            <span v-for="tag in postDetail.tags" :key="tag" class="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-300 text-sm rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer group">
              <Tag :size="12" class="group-hover:rotate-12 transition-transform" />
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-white/10 shadow-lg backdrop-blur-sm">
          <div v-if="!isEditing" class="prose-content" v-html="renderMarkdown(postDetail.content || '')"></div>
          
          <div v-else class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-white/80 mb-2">内容</label>
              <textarea v-model="editContent" rows="15" class="w-full bg-slate-700/50 border-2 border-white/10 rounded-xl text-white placeholder-white/40 px-4 py-3 focus:outline-none focus:border-emerald-500 resize-none font-mono text-sm" placeholder="支持 Markdown 语法..." />
            </div>
            <div>
              <label class="block text-sm font-semibold text-white/80 mb-2">标签（用逗号分隔）</label>
              <input v-model="editTags" type="text" class="w-full bg-slate-700/50 border-2 border-white/10 rounded-xl text-white placeholder-white/40 px-4 py-3 focus:outline-none focus:border-emerald-500" placeholder="例如: 建筑, 生存, PVP" />
            </div>
            <div class="flex justify-end gap-3">
              <button @click="cancelEdit" class="px-6 py-2.5 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all font-medium">
                取消
              </button>
              <button @click="saveEdit" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                <Save :size="16" />
                保存修改
              </button>
            </div>
          </div>
        </div>

        <div class="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-white/10 shadow-lg backdrop-blur-sm">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare :size="20" class="text-emerald-400" />
              评论
              <span class="text-sm font-normal text-white/40">({{ postDetail.comments?.length || 0 }})</span>
            </h2>
            <button v-if="authStore.isLoggedIn" class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all text-sm font-medium">
              发表评论
              <ChevronRight :size="16" />
            </button>
          </div>

          <div v-if="postDetail.comments && postDetail.comments.length > 0" class="space-y-4">
            <div v-for="(comment, index) in postDetail.comments" :key="comment.id" class="flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all animate-fade-in" :style="{ animationDelay: `${index * 0.05}s` }">
              <div class="flex-shrink-0">
                <div :class="['w-10 h-10 rounded-full flex items-center justify-center text-white font-bold', getAvatarColor(comment.profiles?.nickname || '匿名')]">
                  {{ getAvatarInitial(comment.profiles?.nickname || '匿名') }}
                </div>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="font-semibold text-white">{{ comment.profiles?.nickname || '匿名' }}</span>
                  <span class="text-xs text-white/40">{{ formatDate(comment.created_at) }}</span>
                </div>
                <p class="text-sm text-white/75 leading-relaxed">{{ comment.content }}</p>
                <div class="flex items-center gap-4 mt-3">
                  <button class="text-xs text-white/40 hover:text-amber-400 transition-colors flex items-center gap-1">
                    <MessageSquare :size="12" />
                    回复
                  </button>
                  <button class="text-xs text-white/40 hover:text-red-400 transition-colors">
                    举报
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <MessageSquare :size="32" class="text-white/20" />
            </div>
            <p class="text-white/50">暂无评论，快来抢沙发吧！</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fade-in 0.4s ease-out both;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-slide-up {
  animation: slide-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes slide-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.animate-scale-in {
  animation: scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes scale-in {
  0% { opacity: 0; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.prose-content :deep(h1),
.prose-content :deep(h2),
.prose-content :deep(h3) {
  font-family: inherit;
}

.prose-content :deep(pre) {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
