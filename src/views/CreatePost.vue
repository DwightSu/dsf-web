<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Send, Eye, Edit3 } from 'lucide-vue-next'
import PixelCard from '@/components/common/PixelCard.vue'
import PixelButton from '@/components/common/PixelButton.vue'
import { createPost } from '@/api/posts'
import { useAuthStore } from '@/stores/auth'
import { validatePostTitle, validatePostContent } from '@/utils/validation'

const router = useRouter()
const authStore = useAuthStore()

const title = ref('')
const content = ref('')
const tags = ref('')
const loading = ref(false)
const errors = ref<{ title?: string; content?: string }>({})
const isPreview = ref(false)

// 简单的 Markdown 渲染函数
function renderMarkdown(text: string): string {
  if (!text) return ''
  
  let html = text
    // 转义 HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // 标题
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-pixel text-white mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-pixel text-white mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-pixel text-white mt-4 mb-2">$1</h1>')
    // 粗体
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
    // 斜体
    .replace(/\*(.*?)\*/g, '<em class="text-white/80 italic">$1</em>')
    // 代码块
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-dark-surface p-3 rounded overflow-x-auto my-2 text-sm"><code class="text-grass-green">$1</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, '<code class="bg-dark-surface px-1 text-diamond-blue text-sm">$1</code>')
    // 引用
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-diamond-blue pl-4 my-2 text-white/70 italic">$1</blockquote>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-diamond-blue underline hover:text-diamond-blue-light" target="_blank">$1</a>')
    // 列表
    .replace(/^- (.*$)/gm, '<li class="ml-4 text-white/80">$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 text-white/80 list-decimal">$1</li>')
    // 换行
    .replace(/\n\n/g, '</p><p class="text-white/70 my-2">')
    .replace(/\n/g, '<br>')
  
  // 包装在段落中
  if (!html.startsWith('<')) {
    html = '<p class="text-white/70 my-2">' + html + '</p>'
  }
  
  return html
}

const renderedContent = computed(() => renderMarkdown(content.value))

async function handleSubmit() {
  // 验证
  const titleValidation = validatePostTitle(title.value)
  const contentValidation = validatePostContent(content.value)

  if (!titleValidation.valid) {
    errors.value.title = titleValidation.message
    return
  }

  if (!contentValidation.valid) {
    errors.value.content = contentValidation.message
    return
  }

  errors.value = {}
  loading.value = true

  try {
    const tagsArray = tags.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    const { data, error } = await createPost({
      title: title.value,
      content: content.value,
      tags: tagsArray,
      author_id: authStore.user?.id,
      status: 'published'
    })

    if (error) {
      console.error('Failed to create post:', error)
      return
    }

    if (data) {
      router.push(`/forum/post/${data.id}`)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="create-post-page py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <h1 class="text-2xl font-pixel text-white mb-8">
        <span class="text-gold-yellow">发布</span>帖子
      </h1>

      <PixelCard padding="lg">
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
          <!-- 标题 -->
          <div>
            <label class="block text-sm font-pixel text-white mb-2">标题</label>
            <input
              v-model="title"
              type="text"
              class="w-full bg-dark-surface border-2 border-pixel-border text-white px-4 py-3 outline-none focus:border-grass-green"
              placeholder="输入帖子标题..."
            />
            <p v-if="errors.title" class="text-redstone-red text-sm mt-2">{{ errors.title }}</p>
          </div>

          <!-- 标签 -->
          <div>
            <label class="block text-sm font-pixel text-white mb-2">标签（用逗号分隔）</label>
            <input
              v-model="tags"
              type="text"
              class="w-full bg-dark-surface border-2 border-pixel-border text-white px-4 py-3 outline-none focus:border-grass-green"
              placeholder="例如: 建筑, 生存, PVP"
            />
          </div>

          <!-- 内容 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-pixel text-white">内容</label>
              <div class="flex gap-2">
                <PixelButton
                  :variant="!isPreview ? 'primary' : 'ghost'"
                  size="sm"
                  @click="isPreview = false"
                >
                  <Edit3 :size="14" />
                  编辑
                </PixelButton>
                <PixelButton
                  :variant="isPreview ? 'primary' : 'ghost'"
                  size="sm"
                  @click="isPreview = true"
                >
                  <Eye :size="14" />
                  预览
                </PixelButton>
              </div>
            </div>

            <!-- 编辑模式 -->
            <div v-if="!isPreview">
              <textarea
                v-model="content"
                rows="10"
                class="w-full bg-dark-surface border-2 border-pixel-border text-white px-4 py-3 outline-none focus:border-grass-green resize-none font-mono text-sm"
                placeholder="支持 Markdown 语法..."
              />
              <p class="text-xs text-white/50 mt-2">
                支持 Markdown 语法：**粗体**、*斜体*、`代码`、# 标题、- 列表、[链接](url)
              </p>
            </div>

            <!-- 预览模式 -->
            <div v-else class="min-h-[250px] bg-dark-surface border-2 border-pixel-border p-4 overflow-auto">
              <div v-if="content" v-html="renderedContent" class="prose prose-invert max-w-none"></div>
              <div v-else class="text-white/50 text-center py-8">
                暂无内容预览
              </div>
            </div>
            <p v-if="errors.content" class="text-redstone-red text-sm mt-2">{{ errors.content }}</p>
          </div>

          <!-- 提交按钮 -->
          <div class="flex justify-end gap-4">
            <PixelButton variant="ghost" @click="router.back()">
              取消
            </PixelButton>
            <PixelButton variant="primary" :loading="loading" @click="handleSubmit">
              <Send :size="16" />
              发布
            </PixelButton>
          </div>
        </form>
      </PixelCard>
    </div>
  </div>
</template>

<style scoped>
.bg-dark-surface {
  background-color: #1a1a2e;
}

.border-pixel-border {
  border-color: rgba(255, 255, 255, 0.1);
}

.border-grass-green {
  border-color: #2D5016;
}

.text-grass-green {
  color: #2D5016;
}

.text-diamond-blue {
  color: #4AEDD9;
}

.text-diamond-blue-light {
  color: #6AFFE9;
}

.text-gold-yellow {
  color: #FFD700;
}

.text-redstone-red {
  color: #E74C3C;
}

.font-pixel {
  font-family: 'Press Start 2P', 'VT323', monospace;
}
</style>