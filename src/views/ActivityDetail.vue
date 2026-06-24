<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar, Users, ArrowLeft, Image as ImageIcon, ChevronLeft, ChevronRight, X, Clock, BookOpen, ScrollText, Trophy } from 'lucide-vue-next'
import { mockActivities, mockMembers, mockImages, mockGroupMembers, mockGroups } from '@/mock'
import { formatDate } from '@/utils/format'
import type { Activity, Group, Member, GroupMember, Image as ImageType } from '@/types/database'
import { getCustomActivities, getCustomImages } from '@/utils/storage'

const route = useRoute()
const router = useRouter()

const activity = ref<Activity | null>(null)
const activityGroups = ref<Group[]>([])
const activityImages = ref<ImageType[]>([])
const imageModalOpen = ref(false)
const currentImageIndex = ref(0)
const isLoaded = ref(false)

const activityId = computed(() => route.params.id as string)

function loadActivity() {
  const id = activityId.value
  
  // 合并mock数据和本地存储的自定义活动
  const allActivities = [...mockActivities, ...(getCustomActivities() as Activity[])]
  const allImages = [...mockImages, ...(getCustomImages() as ImageType[])]
  
  const found = allActivities.find(a => a.id === id)
  if (!found) {
    activity.value = null
    isLoaded.value = true
    return
  }
  activity.value = found

  const groups = mockGroups.filter(g => g.activity_id === id)
  activityGroups.value = groups.map(g => ({
    ...g,
    group_members: mockGroupMembers
      .filter(gm => gm.group_id === g.id)
      .map(gm => ({
        ...gm,
        members: mockMembers.find(m => m.id === gm.member_id)
      })) as GroupMember[]
  }))

  activityImages.value = allImages.filter(img => img.activity_id === id)
  isLoaded.value = true
}

const allMembers = computed(() => {
  if (!activity.value?.has_groups) {
    return mockMembers.slice(0, 12)
  }
  const memberIds = new Set<string>()
  activityGroups.value.forEach(g => {
    g.group_members?.forEach(gm => {
      if (gm.member_id) memberIds.add(gm.member_id)
    })
  })
  return mockMembers.filter(m => memberIds.has(m.id))
})

const participantCount = computed(() => allMembers.value.length)

function openImageModal(index: number) {
  currentImageIndex.value = index
  imageModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

function closeImageModal() {
  imageModalOpen.value = false
  document.body.style.overflow = ''
}

function prevImage() {
  const len = activityImages.value.length
  currentImageIndex.value = (currentImageIndex.value - 1 + len) % len
}

function nextImage() {
  const len = activityImages.value.length
  currentImageIndex.value = (currentImageIndex.value + 1) % len
}

function getMemberAvatar(member: Member | undefined): string {
  if (member?.avatar_url) return member.avatar_url
  const seed = member?.nickname || 'user'
  const colors = ['5CB85C', 'F0AD4E', '5BC0DE', 'D9534F', '9B59B6', 'B87333']
  const colorIndex = seed.charCodeAt(0) % colors.length
  return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${colors[colorIndex]}`
}

function getActivityTypeColor(type: string | null): string {
  const typeColors: Record<string, string> = {
    'PVP竞技': 'from-red-500 to-orange-500',
    '建筑比赛': 'from-blue-500 to-cyan-500',
    '生存挑战': 'from-green-500 to-emerald-500'
  }
  return typeColors[type || ''] || 'from-purple-500 to-pink-500'
}

function renderMarkdown(text: string | null | undefined): string {
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
  loadActivity()
})
</script>

<template>
  <div class="activity-detail min-h-screen">
    <div class="relative h-72 md:h-96 lg:h-[420px] overflow-hidden">
      <div class="absolute inset-0">
        <img
          v-if="activity?.cover_image"
          :src="activity.cover_image"
          :alt="activity.name"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full bg-gradient-to-br from-green-600 via-emerald-500 to-yellow-500"></div>
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-[#1a2744] via-[#1a2744]/60 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-[#1a2744]/80 via-transparent to-transparent"></div>

      <button
        class="absolute top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
        @click="router.back()"
      >
        <ArrowLeft :size="20" />
        <span class="font-medium">返回</span>
      </button>

      <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10">
        <div class="max-w-5xl mx-auto">
          <div
            v-if="activity?.activity_type"
            class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r text-white text-sm font-medium mb-4 shadow-lg"
            :class="getActivityTypeColor(activity?.activity_type)"
          >
            <Clock :size="14" />
            {{ activity.activity_type }}
          </div>
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
            {{ activity?.name || '加载中...' }}
          </h1>
          <div class="flex flex-wrap items-center gap-4 md:gap-6">
            <div class="flex items-center gap-2 text-white/90">
              <div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Calendar :size="18" class="text-yellow-300" />
              </div>
              <div>
                <p class="text-xs text-white/70">活动日期</p>
                <p class="font-semibold">{{ activity ? formatDate(activity.activity_date) : '--' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 text-white/90">
              <div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Users :size="18" class="text-green-300" />
              </div>
              <div>
                <p class="text-xs text-white/70">参与人数</p>
                <p class="font-semibold">{{ participantCount }} 人</p>
              </div>
            </div>
            <div v-if="activity?.has_groups" class="flex items-center gap-2 text-white/90">
              <div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Users :size="18" class="text-orange-300" />
              </div>
              <div>
                <p class="text-xs text-white/70">分组情况</p>
                <p class="font-semibold">{{ activityGroups.length }} 个小组</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-10">
      <div v-if="isLoaded && !activity" class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-28 h-28 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mb-6">
          <ImageIcon :size="48" class="text-white/40" />
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">活动不存在</h2>
        <p class="text-white/60 mb-8">该活动可能已被删除或不存在</p>
        <button
          class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
          @click="router.back()"
        >
          返回上一页
        </button>
      </div>

      <template v-else-if="activity && isLoaded">
        <section class="mb-10 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
              <Users :size="20" class="text-white" />
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-white">活动介绍</h2>
          </div>
          <p class="text-white/80 leading-relaxed text-base md:text-lg">
            {{ activity.description || '暂无活动介绍' }}
          </p>
        </section>

        <!-- 活动详情 -->
        <section v-if="activity.content" class="mb-10 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <BookOpen :size="20" class="text-white" />
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-white">活动详情</h2>
          </div>
          <div class="prose-content text-white/80 leading-relaxed text-base" v-html="renderMarkdown(activity.content)"></div>
        </section>

        <!-- 活动规则 -->
        <section v-if="activity.rules" class="mb-10 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <ScrollText :size="20" class="text-white" />
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-white">活动规则</h2>
          </div>
          <div class="prose-content text-white/80 leading-relaxed text-base" v-html="renderMarkdown(activity.rules)"></div>
        </section>

        <!-- 活动奖励 -->
        <section v-if="activity.rewards" class="mb-10 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/25">
              <Trophy :size="20" class="text-white" />
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-white">活动奖励</h2>
          </div>
          <div class="prose-content text-white/80 leading-relaxed text-base" v-html="renderMarkdown(activity.rewards)"></div>
        </section>

        <section class="mb-10">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/25">
              <Users :size="20" class="text-white" />
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-white">
              {{ activity.has_groups ? '小组与成员' : '参与成员' }}
            </h2>
            <span class="px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm">
              {{ participantCount }} 人
            </span>
          </div>

          <div v-if="activity.has_groups && activityGroups.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div
              v-for="(group, groupIndex) in activityGroups"
              :key="group.id"
              class="bg-gradient-to-br from-white/[0.08] to-white/[0.03] rounded-2xl p-5 border border-white/10 hover:border-green-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/10 hover:-translate-y-1"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    :class="[
                      groupIndex === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      groupIndex === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      groupIndex === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                      'bg-gradient-to-br from-blue-500 to-cyan-500'
                    ]"
                  >
                    {{ groupIndex + 1 }}
                  </div>
                  <div>
                    <h3 class="font-bold text-white text-lg">{{ group.name }}</h3>
                    <p v-if="group.score && group.score > 0" class="text-sm text-yellow-400 font-semibold">
                      {{ group.score }} 分
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-white/60 text-xs">成员</p>
                  <p class="text-white font-bold">{{ group.group_members?.length || 0 }}</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="gm in group.group_members"
                  :key="gm.id"
                  class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-green-500/30 transition-all duration-300 group/member"
                >
                  <img
                    :src="getMemberAvatar(gm.members)"
                    :alt="gm.members?.nickname || '成员'"
                    class="w-7 h-7 rounded-full object-cover transition-all duration-300 group-hover/member:ring-2 group-hover/member:ring-green-400 group-hover/member:ring-offset-2 group-hover/member:ring-offset-[#1a2744]"
                  />
                  <span class="text-sm text-white/80 whitespace-nowrap">
                    {{ gm.members?.nickname || '未知成员' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="bg-gradient-to-br from-white/[0.08] to-white/[0.03] rounded-2xl p-6 md:p-8 border border-white/10">
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div
                v-for="member in allMembers"
                :key="member.id"
                class="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-white/5 transition-all duration-300 group/member"
              >
                <img
                  :src="getMemberAvatar(member)"
                  :alt="member.nickname"
                  class="w-14 h-14 rounded-full object-cover transition-all duration-300 group-hover/member:scale-110 group-hover/member:ring-2 group-hover/member:ring-green-400 group-hover/member:ring-offset-2 group-hover/member:ring-offset-[#1a2744]"
                />
                <span class="text-sm text-white/80 font-medium text-center break-all">
                  {{ member.nickname }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section v-if="activityImages.length > 0" class="mb-10">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <ImageIcon :size="20" class="text-white" />
            </div>
            <h2 class="text-xl md:text-2xl font-bold text-white">活动图片</h2>
            <span class="px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm">
              {{ activityImages.length }} 张
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            <div
              v-for="(img, index) in activityImages"
              :key="img.id"
              class="relative aspect-square rounded-xl overflow-hidden cursor-pointer group/img"
              @click="openImageModal(index)"
            >
              <img
                :src="img.url"
                :alt="img.description || `图片${index + 1}`"
                class="w-full h-full object-cover transition-all duration-500 group-hover/img:scale-110"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-all duration-300"></div>
              <div class="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover/img:translate-y-0 transition-transform duration-300">
                <p v-if="img.description" class="text-white text-sm font-medium line-clamp-2">
                  {{ img.description }}
                </p>
              </div>
            </div>
          </div>
        </section>
      </template>

      <div v-else class="flex flex-col items-center justify-center py-20">
        <div class="w-16 h-16 border-4 border-white/10 border-t-green-500 rounded-full animate-spin mb-4"></div>
        <p class="text-white/60">加载中...</p>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="imageModalOpen"
          class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          @click.self="closeImageModal"
        >
          <button
            class="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 z-10"
            @click="closeImageModal"
          >
            <X :size="24" />
          </button>
          <button
            class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 z-10"
            @click.stop="prevImage"
          >
            <ChevronLeft :size="28" />
          </button>
          <button
            class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 z-10"
            @click.stop="nextImage"
          >
            <ChevronRight :size="28" />
          </button>
          <div class="max-w-[90vw] max-h-[80vh] flex flex-col items-center">
            <img
              :src="activityImages[currentImageIndex]?.url"
              :alt="activityImages[currentImageIndex]?.description || '图片'"
              class="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
            />
            <div class="mt-4 text-center">
              <p v-if="activityImages[currentImageIndex]?.description" class="text-white font-medium mb-2">
                {{ activityImages[currentImageIndex]?.description }}
              </p>
              <p class="text-white/50 text-sm">
                {{ currentImageIndex + 1 }} / {{ activityImages.length }}
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
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

.modal-enter-from img,
.modal-leave-to img {
  transform: scale(0.9);
}
</style>
