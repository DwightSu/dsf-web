<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Send, Eye, Edit3, ArrowLeft, MessageSquare, Tag, Type, Image } from 'lucide-vue-next'
import PixelButton from '@/components/common/PixelButton.vue'
import { useAuthStore } from '@/stores/auth'
import { validatePostTitle, validatePostSummary, validatePostContent } from '@/utils/validation'
import { saveCustomPost, savePostImage, type PostImage, getPostImageById } from '@/utils/storage'

const router = useRouter()
const authStore = useAuthStore()

const title = ref('')
const summary = ref('')
const content = ref('')
const tags = ref('')
const loading = ref(false)
const errors = ref<{ title?: string; summary?: string; content?: string }>({})
const isPreview = ref(false)
const pageLoaded = ref(false)
const imageUploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const MAX_SUMMARY_LENGTH = 200
const MAX_CONTENT_LENGTH = 50000
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const summaryLength = computed(() => summary.value.length)
const isSummaryOverLimit = computed(() => summaryLength.value > MAX_SUMMARY_LENGTH)

const contentLength = computed(() => content.value.length)
const contentLengthPercent = computed(() => Math.min((contentLength.value / MAX_CONTENT_LENGTH) * 100, 100))
const isOverLimit = computed(() => contentLength.value > MAX_CONTENT_LENGTH)
const isNearLimit = computed(() => contentLength.value > MAX_CONTENT_LENGTH * 0.8)

function generateImageId(): string {
  return 'post_img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas 上下文创建失败'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  if (file.size > MAX_IMAGE_SIZE) {
    alert(`图片大小不能超过 ${MAX_IMAGE_SIZE / 1024 / 1024}MB`)
    return
  }

  imageUploading.value = true

  try {
    const base64 = await compressImage(file, 1920, 0.88)

    const imageId = generateImageId()
    const postImage: PostImage = {
      id: imageId,
      data: base64,
      name: file.name,
      created_at: new Date().toISOString()
    }
    savePostImage(postImage)

    const imageMarkdown = `\n![${file.name}](img:${imageId})\n`
    content.value += imageMarkdown
  } catch (err) {
    alert('图片处理失败：' + (err as Error).message)
  } finally {
    imageUploading.value = false
    if (input) input.value = ''
  }
}

function triggerImageUpload() {
  fileInputRef.value?.click()
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
  
  let html = resolvedText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 0.5rem; margin: 1rem 0; box-shadow: 0 4px 12px rgba(0,0,0,0.3);" />')
    .replace(/^### (.*$)/gm, '<h3 style="font-size: 1.125rem; font-weight: bold; color: white; margin: 1rem 0 0.5rem 0;">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="font-size: 1.25rem; font-weight: bold; color: white; margin: 1rem 0 0.5rem 0;">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="font-size: 1.5rem; font-weight: bold; color: white; margin: 1rem 0 0.5rem 0;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: white; font-weight: bold;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="color: rgba(255,255,255,0.8); font-style: italic;">$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre style="background: rgba(26,26,46,0.8); padding: 0.75rem; border-radius: 0.5rem; overflow-x: auto; margin: 0.5rem 0; font-size: 0.875rem;"><code style="color: #4AEDD9;">$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background: rgba(26,26,46,0.8); padding: 2px 6px; color: #4AEDD9; font-size: 0.875rem; border-radius: 0.25rem;">$1</code>')
    .replace(/^> (.*$)/gm, '<blockquote style="border-left: 4px solid #4AEDD9; padding-left: 1rem; margin: 0.5rem 0; color: rgba(255,255,255,0.7); font-style: italic;">$1</blockquote>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #4AEDD9; text-decoration: underline;" target="_blank">$1</a>')
    .replace(/^- (.*$)/gm, '<li style="margin-left: 1.5rem; color: rgba(255,255,255,0.8); list-style: disc;">$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li style="margin-left: 1.5rem; color: rgba(255,255,255,0.8); list-style: decimal;">$1</li>')
    .replace(/\n\n/g, '</p><p style="color: rgba(255,255,255,0.7); margin: 0.5rem 0;">')
    .replace(/\n/g, '<br>')
  
  if (!html.startsWith('<')) {
    html = '<p style="color: rgba(255,255,255,0.7); margin: 0.5rem 0;">' + html + '</p>'
  }
  
  return html
}

const renderedContent = computed(() => renderMarkdown(content.value))

function generateId(): string {
  return 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

async function handleSubmit() {
  const titleValidation = validatePostTitle(title.value)
  const summaryValidation = validatePostSummary(summary.value)
  const contentValidation = validatePostContent(content.value)

  if (!titleValidation.valid) {
    errors.value.title = titleValidation.message
    return
  }

  if (!summaryValidation.valid) {
    errors.value.summary = summaryValidation.message
    return
  }

  if (!contentValidation.valid) {
    errors.value.content = contentValidation.message
    return
  }

  if (isSummaryOverLimit.value) {
    errors.value.summary = `简介超过 ${MAX_SUMMARY_LENGTH} 字符限制`
    return
  }

  if (isOverLimit.value) {
    errors.value.content = `内容超过 ${MAX_CONTENT_LENGTH} 字符限制，请删除部分内容`
    return
  }

  errors.value = {}
  loading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 500))

    const tagsArray = tags.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    const newPost = {
      id: generateId(),
      title: title.value,
      summary: summary.value || null,
      content: content.value,
      author_id: authStore.user?.id || null,
      author_nickname: authStore.user?.nickname || '匿名',
      author_avatar_url: authStore.user?.avatar_url || null,
      views: 0,
      tags: tagsArray,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    saveCustomPost(newPost)

    router.push(`/forum/post/${newPost.id}`)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  setTimeout(() => {
    pageLoaded.value = true
  }, 100)
})
</script>

<template>
  <div class="create-post-page min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <div v-if="!pageLoaded" class="flex justify-center py-20">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-white/60">加载中...</p>
        </div>
      </div>

      <div v-else class="animate-fade-in">
        <div class="mb-6">
          <button
            @click="router.back()"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowLeft :size="18" />
            返回
          </button>
        </div>

        <div class="page-header text-center mb-10 animate-slide-down">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-lime-400 mb-4 shadow-lg shadow-emerald-500/30 animate-bounce-soft">
            <MessageSquare :size="32" class="text-white" />
          </div>
          <h1 class="text-4xl font-bold mb-3">
            <span class="bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-transparent">发布</span>
            <span class="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">帖子</span>
          </h1>
          <p class="text-white/60 text-lg">
            分享你的想法和心得
          </p>
        </div>

        <div class="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-white/10 shadow-lg backdrop-blur-sm animate-slide-up">
          <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
            <div>
              <label class="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                <Type :size="16" class="text-emerald-400" />
                标题
              </label>
              <input
                v-model="title"
                type="text"
                class="w-full pl-4 pr-4 py-3 bg-slate-700/50 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 focus:bg-slate-700/80 transition-all"
                placeholder="输入帖子标题..."
              />
              <p v-if="errors.title" class="text-red-400 text-sm mt-2 flex items-center gap-1">
                {{ errors.title }}
              </p>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <MessageSquare :size="16" class="text-purple-400" />
                  简介
                </label>
                <span
                  class="text-xs"
                  :class="isSummaryOverLimit ? 'text-red-400' : 'text-white/40'"
                >
                  {{ summaryLength }} / {{ MAX_SUMMARY_LENGTH }}
                </span>
              </div>
              <textarea
                v-model="summary"
                rows="2"
                class="w-full px-4 py-3 bg-slate-700/50 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-slate-700/80 transition-all resize-none"
                placeholder="一句话介绍帖子内容，会显示在论坛列表中..."
                :maxlength="MAX_SUMMARY_LENGTH + 50"
              ></textarea>
              <p v-if="errors.summary" class="text-red-400 text-sm mt-2 flex items-center gap-1">
                {{ errors.summary }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                <Tag :size="16" class="text-amber-400" />
                标签（用逗号分隔）
              </label>
              <input
                v-model="tags"
                type="text"
                class="w-full pl-4 pr-4 py-3 bg-slate-700/50 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 focus:bg-slate-700/80 transition-all"
                placeholder="例如: 建筑, 生存, PVP"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <Edit3 :size="16" class="text-sky-400" />
                  内容
                </label>
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="isPreview = false"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5',
                      !isPreview
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    ]"
                  >
                    <Edit3 :size="14" />
                    编辑
                  </button>
                  <button
                    type="button"
                    @click="isPreview = true"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5',
                      isPreview
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    ]"
                  >
                    <Eye :size="14" />
                    预览
                  </button>
                </div>
              </div>

              <div v-if="!isPreview">
                <textarea
                  v-model="content"
                  rows="12"
                  :class="[
                    'w-full bg-slate-700/50 border-2 rounded-xl text-white placeholder-white/40 px-4 py-3 focus:outline-none focus:bg-slate-700/80 transition-all resize-none font-mono text-sm',
                    isOverLimit
                      ? 'border-red-500 focus:border-red-400'
                      : isNearLimit
                      ? 'border-amber-500/50 focus:border-amber-400'
                      : 'border-white/10 focus:border-emerald-500'
                  ]"
                  placeholder="支持 Markdown 语法：**粗体**、*斜体*、`代码`、# 标题、- 列表、[链接](url)、![图片](url)..."
                />
                <div class="mt-2">
                  <div class="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      :class="[
                        'h-full transition-all duration-300',
                        isOverLimit
                          ? 'bg-red-500'
                          : isNearLimit
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      ]"
                      :style="{ width: contentLengthPercent + '%' }"
                    ></div>
                  </div>
                </div>
                <div class="flex items-center justify-between mt-2">
                  <p class="text-xs text-white/40">
                    支持 Markdown 语法：**粗体**、*斜体*、`代码`、# 标题、- 列表、[链接](url)、![图片](url)
                  </p>
                  <div class="flex items-center gap-3">
                    <span
                      :class="[
                        'text-xs font-medium',
                        isOverLimit
                          ? 'text-red-400'
                          : isNearLimit
                          ? 'text-amber-400'
                          : 'text-white/50'
                      ]"
                    >
                      {{ contentLength }} / {{ MAX_CONTENT_LENGTH }}
                    </span>
                    <button
                      type="button"
                      @click="triggerImageUpload"
                      :disabled="imageUploading || isOverLimit"
                      :class="[
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        isOverLimit
                          ? 'bg-white/5 text-white/30 cursor-not-allowed'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50'
                      ]"
                    >
                      <Image :size="14" :class="{ 'animate-pulse': imageUploading }" />
                      {{ imageUploading ? '处理中...' : '上传图片' }}
                    </button>
                    <input
                      ref="fileInputRef"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="handleImageUpload"
                    />
                  </div>
                </div>
              </div>

              <div v-else class="min-h-[300px] bg-slate-700/50 border-2 border-white/10 rounded-xl p-4 overflow-auto">
                <div v-if="content" v-html="renderedContent" class="prose prose-invert max-w-none text-sm leading-relaxed"></div>
                <div v-else class="text-white/40 text-center py-12">
                  暂无内容预览
                </div>
              </div>
              <p v-if="errors.content" class="text-red-400 text-sm mt-2">
                {{ errors.content }}
              </p>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                @click="router.back()"
                class="px-6 py-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all font-medium"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <Send :size="18" />
                <span v-if="!loading">发布帖子</span>
                <span v-else>发布中...</span>
              </button>
            </div>
          </form>
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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

.animate-slide-up {
  animation: slide-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;
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
</style>
