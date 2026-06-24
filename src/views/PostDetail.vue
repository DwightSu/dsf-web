<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, Calendar, MessageSquare, ArrowLeft, Users } from 'lucide-vue-next'
import PixelCard from '@/components/common/PixelCard.vue'
import PixelButton from '@/components/common/PixelButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { getMockPostDetail } from '@/mock'
import { formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const postDetail = ref<any>(null)

// 加载帖子详情
function loadPost() {
  const id = route.params.id as string
  loading.value = true

  setTimeout(() => {
    postDetail.value = getMockPostDetail(id)
    loading.value = false
  }, 300)
}

// Markdown渲染
function renderMarkdown(text: string): string {
  if (!text) return ''
  
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gm, '<h3 style="font-size: 1rem; font-weight: bold; color: white; margin: 1rem 0 0.5rem 0;">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="font-size: 1.25rem; font-weight: bold; color: white; margin: 1rem 0 0.5rem 0;">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="font-size: 1.5rem; font-weight: bold; color: white; margin: 1rem 0 0.5rem 0;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: white; font-weight: bold;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="color: rgba(255,255,255,0.8); font-style: italic;">$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background: rgba(26,26,46,0.8); padding: 2px 6px; color: #4AEDD9; font-size: 0.875rem;">$1</code>')
    .replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #4AEDD9; padding-left: 1rem; margin: 0.5rem 0; color: rgba(255,255,255,0.7); font-style: italic;">$1</blockquote>')
    .replace(/^- (.*$)/gm, '<li style="margin-left: 1.5rem; color: rgba(255,255,255,0.8); list-style: disc;">$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li style="margin-left: 1.5rem; color: rgba(255,255,255,0.8); list-style: decimal;">$1</li>')
    .replace(/\n\n/g, '</p><p style="color: rgba(255,255,255,0.7); margin: 0.5rem 0;">')
    .replace(/\n/g, '<br>')
  
  if (!html.startsWith('<')) {
    html = '<p style="color: rgba(255,255,255,0.7); margin: 0.5rem 0;">' + html + '</p>'
  }
  
  return html
}

onMounted(() => {
  loadPost()
})
</script>

<template>
  <div class="post-detail-page py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <PixelButton variant="ghost" size="sm" @click="router.back()">
          <ArrowLeft :size="16" />
          返回
        </PixelButton>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" text="加载帖子中..." />
      </div>

      <!-- 帖子不存在 -->
      <div v-else-if="!postDetail" class="text-center py-16">
        <p class="text-white/60 font-pixel">帖子不存在或已被删除</p>
      </div>

      <!-- 帖子详情 -->
      <div v-else>
        <!-- 帖子标题区 -->
        <div class="post-header mb-8">
          <h1 class="text-2xl md:text-3xl font-pixel text-white mb-4">
            {{ postDetail.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-4">
            <!-- 作者 -->
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-grass-green/30 flex items-center justify-center">
                <Users :size="12" class="text-grass-green" />
              </div>
              <span class="text-diamond-blue">{{ postDetail.profiles?.nickname || '匿名' }}</span>
            </div>
            <!-- 时间 -->
            <div class="flex items-center gap-1">
              <Calendar :size="14" />
              {{ formatDate(postDetail.created_at) }}
            </div>
            <!-- 浏览量 -->
            <div class="flex items-center gap-1">
              <Eye :size="14" />
              {{ postDetail.views || 0 }} 浏览
            </div>
          </div>

          <!-- 标签 -->
          <div v-if="postDetail.tags && postDetail.tags.length > 0" class="flex flex-wrap gap-2">
            <span
              v-for="tag in postDetail.tags"
              :key="tag"
              class="px-2 py-1 bg-diamond-blue/10 text-diamond-blue text-xs"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- 帖子内容 -->
        <div class="post-content mb-8">
          <PixelCard padding="lg">
            <div
              class="prose-content text-sm leading-relaxed"
              v-html="renderMarkdown(postDetail.content || '')"
            ></div>
          </PixelCard>
        </div>

        <!-- 评论区 -->
        <div class="comments-section">
          <h2 class="text-xl font-pixel text-white mb-4">
            <span class="text-grass-green">评论</span>
            <span class="text-sm text-white/40 ml-2">({{ postDetail.comments?.length || 0 }})</span>
          </h2>

          <PixelCard padding="lg">
            <!-- 评论列表 -->
            <div v-if="postDetail.comments && postDetail.comments.length > 0" class="comments-list space-y-4">
              <div
                v-for="comment in postDetail.comments"
                :key="comment.id"
                class="comment-item pb-4 border-b border-white/10 last:border-0 last:pb-0"
              >
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-full bg-grass-green/30 flex items-center justify-center flex-shrink-0">
                    <Users :size="16" class="text-grass-green" />
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="font-pixel text-sm text-white">
                        {{ comment.profiles?.nickname || '匿名' }}
                      </span>
                      <span class="text-xs text-white/40">
                        {{ formatDate(comment.created_at) }}
                      </span>
                    </div>
                    <p class="text-sm text-white/70">
                      {{ comment.content }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 空评论 -->
            <div v-else class="text-center py-8">
              <MessageSquare :size="32" class="text-white/20 mx-auto mb-2" />
              <p class="text-white/40 text-sm">暂无评论，快来抢沙发吧！</p>
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-pixel {
  font-family: 'Press Start 2P', 'VT323', monospace;
}

.text-grass-green {
  color: #2D5016;
}

.text-diamond-blue {
  color: #4AEDD9;
}

.bg-grass-green\/30 {
  background-color: rgba(45, 80, 22, 0.3);
}

.bg-diamond-blue\/10 {
  background-color: rgba(74, 237, 217, 0.1);
}

.prose-content :deep(h1),
.prose-content :deep(h2),
.prose-content :deep(h3) {
  font-family: 'Press Start 2P', 'VT323', monospace;
}
</style>