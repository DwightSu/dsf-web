<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Calendar, Users, ArrowLeft, Image as ImageIcon, ChevronLeft, ChevronRight, X, Clock,
  BookOpen, ScrollText, Trophy, Edit, Save, Upload, Trash2, Plus, Search, UserPlus,
  Settings, UserMinus, MessageCircle, Send, ImagePlus
} from 'lucide-vue-next'
import { mockActivities, mockMembers, mockImages, mockGroupMembers, mockGroups } from '@/mock'
import { formatDate } from '@/utils/format'
import type { Activity, Group, Member, GroupMember, Image as ImageType, Comment } from '@/types/database'
import {
  getCustomActivities, getCustomImages, saveCustomImage, deleteCustomImage,
  getCustomGroups, getCustomGroupMembers, saveCustomGroup, deleteCustomGroup,
  addCustomGroupMember, removeCustomGroupMember, getCustomActivityMembers,
  getCustomActivityMembersByActivity,
  addCustomActivityMember, removeCustomActivityMember, updateCustomActivity,
  getCustomCommentsByActivity, saveCustomComment
} from '@/utils/storage'
import { useAuthStore } from '@/stores/auth'
import PixelButton from '@/components/common/PixelButton.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activity = ref<Activity | null>(null)
const activityImages = ref<ImageType[]>([])
const imageModalOpen = ref(false)
const currentImageIndex = ref(0)
const isLoaded = ref(false)

const activityId = computed(() => route.params.id as string)

const isEditing = ref(false)
const activeEditTab = ref<'basic' | 'content' | 'rules' | 'rewards' | 'images' | 'members'>('basic')
const editForm = ref({
  name: '',
  description: '',
  activity_date: '',
  activity_type: '',
  has_groups: false,
  cover_image: '',
  content: '',
  rules: '',
  rewards: ''
})

const showImageUploadModal = ref(false)
const imageUploadForm = ref({
  url: '',
  description: ''
})
const imageUploadError = ref('')
const imageFileInputRef = ref<HTMLInputElement | null>(null)
const isUploadingImage = ref(false)

// 封面图上传相关
const coverUploadError = ref('')
const coverFileInputRef = ref<HTMLInputElement | null>(null)
const isUploadingCover = ref(false)

const showMemberSelectModal = ref(false)
const memberSearchQuery = ref('')
const selectedGroupId = ref('')
const showGroupAddModal = ref(false)
const newGroupName = ref('')

// 评论相关
const activityComments = ref<Comment[]>([])
const newComment = ref('')
const isSubmittingComment = ref(false)

// 追踪已移除的成员ID（用于非分组模式）
const removedMemberIds = ref<Set<string>>(new Set())
// 追踪已移除的小组成员ID（用于分组模式）
const removedGroupMemberIds = ref<Set<string>>(new Set())
// 成员刷新计数器，用于触发响应式更新
const memberRefreshKey = ref(0)

// 评论相关
const allMembers = computed(() => {
  return mockMembers
})

const filteredMembers = computed(() => {
  if (!memberSearchQuery.value) return allMembers.value
  const q = memberSearchQuery.value.toLowerCase()
  return allMembers.value.filter(m =>
    m.nickname.toLowerCase().includes(q) ||
    (m.qq_number || '').includes(q)
  )
})

const activityGroups = computed(() => {
  if (!activity.value) return []
  void memberRefreshKey.value

  const allGroups = [...mockGroups, ...(getCustomGroups() as Group[])]
  const allGroupMembers = [...mockGroupMembers, ...(getCustomGroupMembers() as GroupMember[])]

  const groups = allGroups.filter(g => g.activity_id === activity.value?.id)
  return groups.map(g => ({
    ...g,
    group_members: allGroupMembers
      .filter(gm => gm.group_id === g.id)
      .filter(gm => !removedGroupMemberIds.value.has(gm.id))
      .map(gm => ({
        ...gm,
        members: mockMembers.find(m => m.id === gm.member_id)
      })) as GroupMember[]
  }))
})

function loadActivity() {
  const id = activityId.value

  const allActivities = [...mockActivities, ...(getCustomActivities() as Activity[])]
  const allImages = [...mockImages, ...(getCustomImages() as ImageType[])]

  const found = allActivities.find(a => a.id === id)
  if (!found) {
    activity.value = null
    isLoaded.value = true
    return
  }
  activity.value = found

  activityImages.value = allImages.filter(img => img.activity_id === id)

  // 加载评论
  loadComments()

  isLoaded.value = true
}

const allMembersList = computed(() => {
  if (!activity.value?.has_groups) {
    // 引用 memberRefreshKey 以触发响应式更新
    void memberRefreshKey.value
    const customMembers = getCustomActivityMembersByActivity(activityId.value) as Array<{ member_id: string }>
    const customMemberIds = new Set(customMembers.map(m => m.member_id))

    const defaultMembers = mockMembers.slice(0, 12)
    const customMembersData = mockMembers.filter(m => customMemberIds.has(m.id))

    return [...defaultMembers, ...customMembersData]
      .filter(m => !removedMemberIds.value.has(m.id))
      .map(m => ({
        ...m,
        canDelete: true
      }))
  }
  const memberIds = new Set<string>()
  activityGroups.value.forEach(g => {
    g.group_members?.forEach(gm => {
      if (gm.member_id) memberIds.add(gm.member_id)
    })
  })
  return mockMembers.filter(m => memberIds.has(m.id))
})

const participantCount = computed(() => {
  if (!activity.value?.has_groups) {
    return allMembersList.value.length
  }
  let count = 0
  activityGroups.value.forEach(g => {
    count += g.group_members?.length || 0
  })
  return count
})

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

function startEdit() {
  if (!activity.value) return
  editForm.value = {
    name: activity.value.name,
    description: activity.value.description || '',
    activity_date: activity.value.activity_date,
    activity_type: activity.value.activity_type || '生存挑战',
    has_groups: activity.value.has_groups,
    cover_image: activity.value.cover_image || '',
    content: activity.value.content || '',
    rules: activity.value.rules || '',
    rewards: activity.value.rewards || ''
  }
  isEditing.value = true
  activeEditTab.value = 'basic'
}

function cancelEdit() {
  isEditing.value = false
}

function saveEdit() {
  if (!activity.value) return

  const updates = {
    name: editForm.value.name,
    description: editForm.value.description,
    activity_date: editForm.value.activity_date,
    activity_type: editForm.value.activity_type,
    has_groups: editForm.value.has_groups,
    cover_image: editForm.value.cover_image || null,
    content: editForm.value.content || null,
    rules: editForm.value.rules || null,
    rewards: editForm.value.rewards || null,
    updated_at: new Date().toISOString()
  }

  activity.value = { ...activity.value, ...updates }
  updateCustomActivity(activity.value.id, updates)
  isEditing.value = false
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
    editForm.value.cover_image = e.target?.result as string
    isUploadingCover.value = false
  }
  reader.onerror = () => {
    coverUploadError.value = '图片读取失败'
    isUploadingCover.value = false
  }
  reader.readAsDataURL(file)
}

function triggerImageFileInput() {
  imageFileInputRef.value?.click()
}

function handleImageFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    imageUploadError.value = '请选择图片文件'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    imageUploadError.value = '图片大小不能超过 5MB'
    return
  }

  isUploadingImage.value = true
  imageUploadError.value = ''

  const reader = new FileReader()
  reader.onload = (e) => {
    imageUploadForm.value.url = e.target?.result as string
    isUploadingImage.value = false
  }
  reader.onerror = () => {
    imageUploadError.value = '图片读取失败'
    isUploadingImage.value = false
  }
  reader.readAsDataURL(file)
}

function openImageUploadModal() {
  imageUploadForm.value = { url: '', description: '' }
  imageUploadError.value = ''
  showImageUploadModal.value = true
}

function uploadImage() {
  if (!imageUploadForm.value.url) {
    imageUploadError.value = '请选择一张图片'
    return
  }

  const newImage: ImageType = {
    id: 'img' + Date.now(),
    activity_id: activityId.value,
    url: imageUploadForm.value.url,
    description: imageUploadForm.value.description || null,
    uploaded_by: null,
    created_at: new Date().toISOString()
  }
  activityImages.value.unshift(newImage)
  saveCustomImage(newImage)
  showImageUploadModal.value = false
}

function deleteImage(imageId: string) {
  activityImages.value = activityImages.value.filter(i => i.id !== imageId)
  deleteCustomImage(imageId)
}

function openMemberSelectModal(groupId?: string) {
  if (groupId) {
    selectedGroupId.value = groupId
  } else {
    selectedGroupId.value = ''
  }
  memberSearchQuery.value = ''
  showMemberSelectModal.value = true
}

function addMemberToGroup(memberId: string) {
  if (!selectedGroupId.value) return

  const allGroupMembers = [...mockGroupMembers, ...(getCustomGroupMembers() as GroupMember[])]
  const existingMember = allGroupMembers.find(
    gm => gm.group_id === selectedGroupId.value && gm.member_id === memberId
  )

  if (existingMember && removedGroupMemberIds.value.has(existingMember.id)) {
    removedGroupMemberIds.value.delete(existingMember.id)
    removedGroupMemberIds.value = new Set(removedGroupMemberIds.value)
    memberRefreshKey.value++
    return
  }

  const newMember: GroupMember = {
    id: 'gm' + Date.now(),
    group_id: selectedGroupId.value,
    member_id: memberId,
    joined_at: new Date().toISOString()
  }
  addCustomGroupMember(newMember)
  memberRefreshKey.value++
}

function addMemberToActivity(memberId: string) {
  const customMembers = getCustomActivityMembersByActivity(activityId.value) as Array<{ member_id: string }>
  if (customMembers.some(m => m.member_id === memberId)) {
    removedMemberIds.value.delete(memberId)
    removedMemberIds.value = new Set(removedMemberIds.value)
    memberRefreshKey.value++
    return
  }

  if (removedMemberIds.value.has(memberId)) {
    removedMemberIds.value.delete(memberId)
    removedMemberIds.value = new Set(removedMemberIds.value)
    addCustomActivityMember({
      id: 'am' + Date.now(),
      activity_id: activityId.value,
      member_id: memberId,
      joined_at: new Date().toISOString()
    })
    memberRefreshKey.value++
    return
  }

  addCustomActivityMember({
    id: 'am' + Date.now(),
    activity_id: activityId.value,
    member_id: memberId,
    joined_at: new Date().toISOString()
  })

  memberRefreshKey.value++
}

function removeMember(groupMemberId: string) {
  const customMembers = getCustomGroupMembers() as Array<{ id: string }>
  const customMemberIds = new Set(customMembers.map(m => m.id))

  if (customMemberIds.has(groupMemberId)) {
    removeCustomGroupMember(groupMemberId)
  }

  removedGroupMemberIds.value.add(groupMemberId)
  removedGroupMemberIds.value = new Set(removedGroupMemberIds.value)
  memberRefreshKey.value++
}

function removeActivityMember(memberId: string) {
  const customMembers = getCustomActivityMembersByActivity(activityId.value) as Array<{ member_id: string }>
  const customMemberIds = new Set(customMembers.map(m => m.member_id))

  if (customMemberIds.has(memberId)) {
    removeCustomActivityMember(activityId.value, memberId)
  }

  removedMemberIds.value.add(memberId)
  removedMemberIds.value = new Set(removedMemberIds.value)
  memberRefreshKey.value++
}

function openGroupAddModal() {
  newGroupName.value = ''
  showGroupAddModal.value = true
}

function addGroup() {
  if (!newGroupName.value.trim()) return
  const newGroup: Group = {
    id: 'g' + Date.now(),
    activity_id: activityId.value,
    name: newGroupName.value,
    score: 0,
    description: null,
    created_at: new Date().toISOString()
  }
  saveCustomGroup(newGroup)
  showGroupAddModal.value = false
  memberRefreshKey.value++
}

function deleteGroup(groupId: string) {
  deleteCustomGroup(groupId)
  memberRefreshKey.value++
}

function loadComments() {
  // 合并 mock 评论和自定义评论
  const customComments = getCustomCommentsByActivity(activityId.value) as Comment[]

  // 这里可以添加 mock 评论的合并逻辑
  // 目前只使用自定义评论
  activityComments.value = customComments.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

function submitComment() {
  if (!newComment.value.trim() || !authStore.user) return

  const comment: Comment = {
    id: 'c' + Date.now(),
    target_type: 'activity',
    target_id: activityId.value,
    content: newComment.value.trim(),
    author_id: authStore.user.id,
    status: 'visible',
    created_at: new Date().toISOString(),
    profiles: {
      nickname: authStore.user.nickname || '匿名用户',
      avatar_url: null
    }
  }

  saveCustomComment(comment)
  newComment.value = ''
  loadComments()
}

function getCommentAuthorAvatar(authorId: string | null): string {
  if (!authorId) return getMemberAvatar(undefined)

  // 尝试从当前用户获取
  if (authStore.user?.id === authorId) {
    return authStore.user.avatar_url || getMemberAvatar({ nickname: authStore.user.nickname || 'user' } as Member)
  }

  // 尝试从成员库获取
  const member = mockMembers.find(m => m.id === authorId)
  if (member) {
    return getMemberAvatar(member)
  }

  return getMemberAvatar({ nickname: 'user' } as Member)
}

function getCommentAuthorName(comment: Comment): string {
  if (comment.profiles?.nickname) return comment.profiles.nickname
  if (!comment.author_id) return '匿名用户'

  if (authStore.user?.id === comment.author_id) {
    return authStore.user.nickname || '匿名用户'
  }
  const member = mockMembers.find(m => m.id === comment.author_id)
  return member?.nickname || '未知用户'
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

      <button
        v-if="authStore.isAdmin && !isEditing"
        class="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-500/80 border border-amber-400/50 text-white hover:bg-amber-500 transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm"
        @click="startEdit"
      >
        <Edit :size="18" />
        <span class="font-medium">编辑活动</span>
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
        <!-- 编辑模式标签页 -->
        <div v-if="isEditing" class="mb-8 bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden">
          <div class="flex border-b border-white/10 overflow-x-auto">
            <button
              v-for="tab in [
                { key: 'basic', label: '基本信息', icon: Settings },
                { key: 'content', label: '活动详情', icon: BookOpen },
                { key: 'rules', label: '活动规则', icon: ScrollText },
                { key: 'rewards', label: '活动奖励', icon: Trophy },
                { key: 'images', label: '活动图片', icon: ImageIcon },
                { key: 'members', label: '成员管理', icon: Users }
              ]"
              :key="tab.key"
              @click="activeEditTab = tab.key as typeof activeEditTab"
              class="flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px flex-shrink-0"
              :class="activeEditTab === tab.key
                ? 'text-green-400 border-green-500 bg-green-500/5'
                : 'text-white/60 border-transparent hover:text-white/80 hover:bg-white/5'"
            >
              <component :is="tab.icon" :size="18" />
              {{ tab.label }}
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- 基本信息 -->
            <div v-show="activeEditTab === 'basic'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-white/80 mb-2">封面图片</label>
                <input
                  ref="coverFileInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleCoverFileSelect"
                />
                <div
                  @click="triggerCoverFileInput"
                  class="relative w-full h-48 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-green-500/50 hover:bg-white/5 transition-all duration-200 overflow-hidden group"
                >
                  <div v-if="editForm.cover_image" class="w-full h-full">
                    <img :src="editForm.cover_image" alt="封面预览" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <p class="text-white font-medium">点击更换封面</p>
                    </div>
                  </div>
                  <div v-else class="w-full h-full flex flex-col items-center justify-center">
                    <ImagePlus :size="40" class="text-white/40 mb-2" />
                    <p class="text-white/60 mb-1">点击上传封面图片</p>
                    <p class="text-white/40 text-xs">支持 JPG、PNG 格式，最大 5MB</p>
                  </div>
                </div>
                <p v-if="coverUploadError" class="text-red-400 text-sm mt-2">{{ coverUploadError }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-white/80 mb-2">活动名称</label>
                <input
                  v-model="editForm.name"
                  type="text"
                  class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-white/80 mb-2">活动描述</label>
                <textarea
                  v-model="editForm.description"
                  rows="3"
                  class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 resize-none"
                ></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-white/80 mb-2">活动日期</label>
                  <input
                    v-model="editForm.activity_date"
                    type="date"
                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-white/80 mb-2">活动类型</label>
                  <select
                    v-model="editForm.activity_type"
                    class="w-full px-4 py-3 bg-[#1a2744] border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 cursor-pointer appearance-none"
                  >
                    <option value="生存挑战" class="bg-[#1a2744] text-white">生存挑战</option>
                    <option value="PVP竞技" class="bg-[#1a2744] text-white">PVP竞技</option>
                    <option value="建筑比赛" class="bg-[#1a2744] text-white">建筑比赛</option>
                    <option value="其他活动" class="bg-[#1a2744] text-white">其他活动</option>
                  </select>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <button
                  @click="editForm.has_groups = !editForm.has_groups"
                  class="relative w-12 h-6 rounded-full transition-colors duration-200"
                  :class="editForm.has_groups ? 'bg-green-500' : 'bg-white/20'"
                >
                  <span
                    class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200"
                    :class="editForm.has_groups ? 'left-7' : 'left-1'"
                  ></span>
                </button>
                <span class="text-sm text-white/80">是否分组</span>
              </div>
            </div>

            <!-- 活动详情 -->
            <div v-show="activeEditTab === 'content'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-white/80 mb-2">
                  活动详情内容
                  <span class="text-white/40 font-normal ml-2">支持 Markdown 语法</span>
                </label>
                <textarea
                  v-model="editForm.content"
                  rows="15"
                  class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 resize-none font-mono text-sm"
                  placeholder="详细介绍活动内容...&#10;支持 Markdown 语法：&#10;## 小标题&#10;- 列表项&#10;**粗体文字**"
                ></textarea>
              </div>
            </div>

            <!-- 活动规则 -->
            <div v-show="activeEditTab === 'rules'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-white/80 mb-2">
                  活动规则
                  <span class="text-white/40 font-normal ml-2">支持 Markdown 语法</span>
                </label>
                <textarea
                  v-model="editForm.rules"
                  rows="15"
                  class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 resize-none font-mono text-sm"
                  placeholder="1. 第一条规则&#10;2. 第二条规则&#10;3. 第三条规则..."
                ></textarea>
              </div>
            </div>

            <!-- 活动奖励 -->
            <div v-show="activeEditTab === 'rewards'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-white/80 mb-2">
                  活动奖励
                  <span class="text-white/40 font-normal ml-2">支持 Markdown 语法</span>
                </label>
                <textarea
                  v-model="editForm.rewards"
                  rows="15"
                  class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 resize-none font-mono text-sm"
                  placeholder="🏆 第一名：xxx 奖励&#10;🥈 第二名：xxx 奖励&#10;🥉 第三名：xxx 奖励"
                ></textarea>
              </div>
            </div>

            <!-- 活动图片 -->
            <div v-show="activeEditTab === 'images'" class="space-y-4">
              <div class="flex justify-between items-center">
                <p class="text-white/60 text-sm">共 {{ activityImages.length }} 张图片</p>
                <PixelButton variant="success" size="sm" @click="openImageUploadModal">
                  <Upload :size="16" />
                  上传图片
                </PixelButton>
              </div>
              <div v-if="activityImages.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <div
                  v-for="(img, index) in activityImages"
                  :key="img.id"
                  class="relative aspect-square rounded-xl overflow-hidden group"
                >
                  <img
                    :src="img.url"
                    :alt="img.description || `图片${index + 1}`"
                    class="w-full h-full object-cover"
                  />
                  <button
                    @click="deleteImage(img.id)"
                    class="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  >
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>
              <div v-else class="py-12 text-center text-white/50">
                <ImageIcon :size="48" class="mx-auto mb-3 text-white/20" />
                <p>暂无图片，点击上方按钮上传</p>
              </div>
            </div>

            <!-- 成员管理 -->
            <div v-show="activeEditTab === 'members'" class="space-y-4">
              <template v-if="editForm.has_groups">
                <div class="flex justify-between items-center">
                  <p class="text-white/60 text-sm">共 {{ activityGroups.length }} 个小组</p>
                  <PixelButton variant="primary" size="sm" @click="openGroupAddModal">
                    <Plus :size="16" />
                    新增小组
                  </PixelButton>
                </div>
                <div class="space-y-4">
                  <div
                    v-for="(group, groupIndex) in activityGroups"
                    :key="group.id"
                    class="bg-white/[0.03] rounded-xl border border-white/10 p-4"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
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
                          <h4 class="font-bold text-white">{{ group.name }}</h4>
                          <p class="text-xs text-white/50">{{ group.group_members?.length || 0 }} 人</p>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <button
                          @click="openMemberSelectModal(group.id)"
                          class="px-3 py-1.5 text-xs bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-1"
                        >
                          <UserPlus :size="14" />
                          添加成员
                        </button>
                        <button
                          @click="deleteGroup(group.id)"
                          class="px-3 py-1.5 text-xs bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <div
                        v-for="gm in group.group_members"
                        :key="gm.id"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 group/member"
                      >
                        <img
                          :src="getMemberAvatar(gm.members)"
                          :alt="gm.members?.nickname || '成员'"
                          class="w-6 h-6 rounded-full object-cover"
                        />
                        <span class="text-sm text-white/80">{{ gm.members?.nickname || '未知' }}</span>
                        <button
                          @click="removeMember(gm.id)"
                          class="w-6 h-6 rounded-full flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <X :size="14" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="flex justify-between items-center">
                  <p class="text-white/60 text-sm">共 {{ participantCount }} 位参与成员</p>
                  <PixelButton variant="primary" size="sm" @click="openMemberSelectModal()">
                    <UserPlus :size="16" />
                    添加成员
                  </PixelButton>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  <div
                    v-for="member in allMembersList"
                    :key="member.id"
                    class="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 group"
                  >
                    <img
                      :src="getMemberAvatar(member)"
                      :alt="member.nickname"
                      class="w-10 h-10 rounded-full object-cover"
                    />
                    <div class="flex-1 min-w-0">
                      <p class="font-medium text-white text-sm truncate">{{ member.nickname }}</p>
                    </div>
                    <button
                      
                      @click="removeActivityMember(member.id)"
                      class="text-white/40 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <UserMinus :size="16" />
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
            <PixelButton variant="ghost" size="md" @click="cancelEdit">
              取消
            </PixelButton>
            <PixelButton variant="primary" size="md" @click="saveEdit">
              <Save :size="16" />
              保存修改
            </PixelButton>
          </div>
        </div>

        <!-- 非编辑模式内容展示 -->
        <template v-else>
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

          <section v-if="activity.content" class="mb-10 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <BookOpen :size="20" class="text-white" />
              </div>
              <h2 class="text-xl md:text-2xl font-bold text-white">活动详情</h2>
            </div>
            <div class="prose-content text-white/80 leading-relaxed text-base" v-html="renderMarkdown(activity.content)"></div>
          </section>

          <section v-if="activity.rules" class="mb-10 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <ScrollText :size="20" class="text-white" />
              </div>
              <h2 class="text-xl md:text-2xl font-bold text-white">活动规则</h2>
            </div>
            <div class="prose-content text-white/80 leading-relaxed text-base" v-html="renderMarkdown(activity.rules)"></div>
          </section>

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
                  v-for="member in allMembersList"
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
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <ImageIcon :size="20" class="text-white" />
                </div>
                <h2 class="text-xl md:text-2xl font-bold text-white">活动图片</h2>
                <span class="px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm">
                  {{ activityImages.length }} 张
                </span>
              </div>
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

          <!-- 评论区域 -->
          <section class="mb-10">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <MessageCircle :size="20" class="text-white" />
              </div>
              <h2 class="text-xl md:text-2xl font-bold text-white">活动评论</h2>
              <span class="px-3 py-1 rounded-full bg-white/10 text-white/70 text-sm">
                {{ activityComments.length }} 条
              </span>
            </div>

            <!-- 评论输入框 -->
            <div v-if="authStore.user" class="bg-gradient-to-br from-white/[0.08] to-white/[0.03] rounded-2xl p-6 border border-white/10 mb-6">
              <div class="flex items-start gap-4">
                <img
                  :src="getCommentAuthorAvatar(authStore.user.id)"
                  :alt="authStore.user.nickname"
                  class="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div class="flex-1">
                  <textarea
                    v-model="newComment"
                    rows="3"
                    placeholder="发表评论...（登录后可评论）"
                    class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 resize-none"
                  ></textarea>
                  <div class="flex justify-end mt-3">
                    <PixelButton
                      variant="primary"
                      size="md"
                      :disabled="!newComment.trim() || isSubmittingComment"
                      :loading="isSubmittingComment"
                      @click="submitComment"
                    >
                      <Send :size="16" />
                      发布评论
                    </PixelButton>
                  </div>
                </div>
              </div>
            </div>

            <!-- 登录提示 -->
            <div v-else class="bg-gradient-to-br from-white/[0.08] to-white/[0.03] rounded-2xl p-8 border border-white/10 mb-6 text-center">
              <MessageCircle :size="40" class="mx-auto mb-3 text-white/30" />
              <p class="text-white/70 mb-4">登录后可发表评论</p>
              <RouterLink to="/login">
                <PixelButton variant="primary" size="md">
                  立即登录
                </PixelButton>
              </RouterLink>
            </div>

            <!-- 评论列表 -->
            <div v-if="activityComments.length > 0" class="space-y-4">
              <div
                v-for="comment in activityComments"
                :key="comment.id"
                class="bg-gradient-to-br from-white/[0.08] to-white/[0.03] rounded-2xl p-5 border border-white/10 hover:border-green-500/30 transition-all duration-300"
              >
                <div class="flex items-start gap-4">
                  <img
                    :src="getCommentAuthorAvatar(comment.author_id)"
                    :alt="getCommentAuthorName(comment)"
                    class="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 mb-2">
                      <h4 class="font-bold text-white">{{ getCommentAuthorName(comment) }}</h4>
                      <span class="text-xs text-white/50">{{ formatDate(comment.created_at, 'long') }}</span>
                    </div>
                    <p class="text-white/80 leading-relaxed">{{ comment.content }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="py-12 text-center text-white/50">
              <MessageCircle :size="48" class="mx-auto mb-3 text-white/20" />
              <p>暂无评论，来发表第一条评论吧</p>
            </div>
          </section>
        </template>
      </template>

      <div v-else class="flex flex-col items-center justify-center py-20">
        <div class="w-16 h-16 border-4 border-white/10 border-t-green-500 rounded-full animate-spin mb-4"></div>
        <p class="text-white/60">加载中...</p>
      </div>
    </div>

    <!-- 图片查看器 -->
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

    <!-- 图片上传弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showImageUploadModal"
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          @click.self="showImageUploadModal = false"
        >
          <div class="w-full max-w-lg bg-[#1a2744] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 class="text-lg font-bold text-white">上传活动图片</h3>
              <button
                @click="showImageUploadModal = false"
                class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <X :size="20" />
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-white/80 mb-2">图片</label>
                <input
                  ref="imageFileInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleImageFileSelect"
                />
                <div
                  @click="triggerImageFileInput"
                  class="aspect-video rounded-xl overflow-hidden bg-white/5 border-2 border-dashed border-white/20 cursor-pointer hover:border-green-500/50 transition-all duration-200 flex items-center justify-center"
                >
                  <div v-if="imageUploadForm.url" class="w-full h-full">
                    <img :src="imageUploadForm.url" alt="预览" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="text-center py-8">
                    <Upload :size="40" class="mx-auto mb-3 text-white/30" />
                    <p class="text-white/60 mb-1">点击选择本地图片</p>
                    <p class="text-white/40 text-xs">支持 JPG、PNG、GIF 格式，最大 5MB</p>
                  </div>
                </div>
                <p v-if="imageUploadError" class="text-red-400 text-sm mt-2">{{ imageUploadError }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-white/80 mb-2">图片描述（可选）</label>
                <input
                  v-model="imageUploadForm.description"
                  type="text"
                  placeholder="描述一下这张图片..."
                  class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                />
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
              <PixelButton variant="ghost" size="md" @click="showImageUploadModal = false">
                取消
              </PixelButton>
              <PixelButton variant="primary" size="md" :loading="isUploadingImage" @click="uploadImage">
                <Upload :size="16" />
                上传
              </PixelButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 成员选择弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showMemberSelectModal"
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          @click.self="showMemberSelectModal = false"
        >
          <div class="w-full max-w-lg bg-[#1a2744] rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <h3 class="text-lg font-bold text-white">选择成员</h3>
              <button
                @click="showMemberSelectModal = false"
                class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <X :size="20" />
              </button>
            </div>
            <div class="p-4 border-b border-white/10 flex-shrink-0">
              <div class="relative">
                <Search :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  v-model="memberSearchQuery"
                  type="text"
                  placeholder="搜索成员昵称或QQ号..."
                  class="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                />
              </div>
            </div>
            <div class="flex-1 overflow-y-auto p-4">
              <div class="space-y-2">
                <div
                  v-for="member in filteredMembers"
                  :key="member.id"
                  class="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                  @click="selectedGroupId ? addMemberToGroup(member.id) : addMemberToActivity(member.id)"
                >
                  <div class="flex items-center gap-3">
                    <img
                      :src="getMemberAvatar(member)"
                      :alt="member.nickname"
                      class="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p class="font-medium text-white">{{ member.nickname }}</p>
                      <p v-if="member.qq_number" class="text-xs text-white/50">
                        QQ: {{ member.qq_number }}
                      </p>
                    </div>
                  </div>
                  <button class="px-3 py-1.5 text-xs bg-green-500/20 text-green-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Plus :size="14" />
                    添加
                  </button>
                </div>
              </div>
              <div v-if="filteredMembers.length === 0" class="py-8 text-center text-white/50">
                未找到匹配的成员
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 新增小组弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showGroupAddModal"
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          @click.self="showGroupAddModal = false"
        >
          <div class="w-full max-w-md bg-[#1a2744] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 class="text-lg font-bold text-white">新增小组</h3>
              <button
                @click="showGroupAddModal = false"
                class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <X :size="20" />
              </button>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-white/80 mb-2">小组名称</label>
                <input
                  v-model="newGroupName"
                  type="text"
                  placeholder="请输入小组名称"
                  class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                />
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
              <PixelButton variant="ghost" size="md" @click="showGroupAddModal = false">
                取消
              </PixelButton>
              <PixelButton variant="primary" size="md" @click="addGroup">
                <Plus :size="16" />
                创建小组
              </PixelButton>
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

