<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Users, Calendar, ArrowLeft, Trophy, Tag, X, Plus, Edit2, Trash2, ChevronRight, MessageSquare, Clock, Shield, Star, User } from 'lucide-vue-next'
import PixelButton from '@/components/common/PixelButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { mockGroupMembers, mockGroups, mockActivities } from '@/mock'
import { formatDate } from '@/utils/format'
import { useMemberStore } from '@/stores/members'
import type { Member } from '@/types/database'

const memberStore = useMemberStore()

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const member = ref<Member | null>(null)
const memberActivities = ref<any[]>([])
const isEditing = ref(false)
const editTags = ref<string[]>([])
const newTag = ref('')
const showAddTag = ref(false)

// 可用的预设标签
const availableTags = ['建筑', 'PVP', '生存', '红石', '大佬', '萌新', '管理员', '探索', '收藏', '竞技', '下界']

function loadMember() {
  const id = route.params.id as string
  loading.value = true

  setTimeout(() => {
    member.value = memberStore.getMemberById(id) || null

    if (member.value) {
      // 获取成员参与的活动
      const gmList = mockGroupMembers.filter(gm => gm.member_id === id)
      const groupIds = gmList.map(gm => gm.group_id)
      const groups = mockGroups.filter(g => groupIds.includes(g.id))
      const activityIds = [...new Set(groups.map(g => g.activity_id))]

      memberActivities.value = activityIds.map(aid => {
        const activity = mockActivities.find(a => a.id === aid)
        const group = groups.find(g => g.activity_id === aid)
        return {
          id: aid,
          name: activity?.name || '',
          activity_date: activity?.activity_date || '',
          group_name: group?.name || '',
          cover_image: activity?.cover_image || ''
        }
      }).sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())

      editTags.value = [...(member.value.tags || [])]
    }

    loading.value = false
  }, 300)
}

function startEditing() {
  if (member.value) {
    editTags.value = [...(member.value.tags || [])]
    isEditing.value = true
  }
}

function cancelEditing() {
  isEditing.value = false
  if (member.value) {
    editTags.value = [...(member.value.tags || [])]
  }
}

function saveTags() {
  if (member.value) {
    memberStore.updateMember(member.value.id, { tags: editTags.value })
    member.value.tags = [...editTags.value]
    isEditing.value = false
  }
}

function removeTag(tag: string) {
  editTags.value = editTags.value.filter(t => t !== tag)
}

function addExistingTag(tag: string) {
  if (!editTags.value.includes(tag)) {
    editTags.value.push(tag)
  }
}

function addNewTag() {
  const tag = newTag.value.trim()
  if (tag && !editTags.value.includes(tag)) {
    editTags.value.push(tag)
    newTag.value = ''
  }
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

function getMemberRole(): string {
  if (member.value?.tags?.includes('管理员')) return '管理员'
  if (member.value?.tags?.includes('大佬')) return '大佬'
  if (member.value?.tags?.includes('萌新')) return '萌新'
  return '成员'
}

onMounted(() => {
  loadMember()
})
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <!-- Back Button -->
      <div class="mb-6">
        <button
          @click="router.back()"
          class="group inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white/80 hover:text-white hover:bg-white/[0.08] hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 active:translate-y-0"
        >
          <div class="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
            <ArrowLeft :size="18" class="text-emerald-400" />
          </div>
          <span class="font-medium">返回成员库</span>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" text="加载成员信息..." />
      </div>

      <!-- Member Not Found -->
      <div v-else-if="!member" class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
          <Users :size="48" class="text-white/20" />
        </div>
        <p class="text-white/60 text-lg">成员不存在</p>
      </div>

      <!-- Member Detail -->
      <div v-else class="space-y-6">
        <!-- Profile Card -->
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-transparent rounded-3xl"></div>
          <div class="relative bg-white/[0.03] rounded-3xl border border-white/10 overflow-hidden">
            <!-- Banner -->
            <div class="relative h-40 overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/30 via-green-500/20 to-emerald-600/10"></div>
              <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent"></div>
            </div>

            <!-- Profile Content -->
            <div class="relative px-6 pb-6 -mt-16">
              <div class="flex flex-col md:flex-row items-center md:items-end gap-4 mb-6">
                <!-- Avatar -->
                <div class="w-32 h-32 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30 border-4 border-white/20">
                  <User :size="56" class="text-white" />
                </div>

                <!-- Basic Info -->
                <div class="flex-1 text-center md:text-left">
                  <h1 class="text-3xl font-bold text-white mb-2">
                    {{ member.nickname }}
                  </h1>
                  <div class="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <span
                      class="px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md"
                      :class="getRoleTagClass(getMemberRole()).bg + ' ' + getRoleTagClass(getMemberRole()).border + ' ' + getRoleTagClass(getMemberRole()).text"
                    >
                      {{ getMemberRole() }}
                    </span>
                    <span class="text-white/50 text-sm flex items-center gap-1">
                      <Calendar :size="14" />
                      加入于 {{ formatDate(member.created_at) }}
                    </span>
                  </div>
                </div>

                <!-- Edit Button -->
                <button
                  v-if="!isEditing"
                  @click="startEditing"
                  class="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Edit2 :size="16" />
                  编辑标签
                </button>
              </div>

              <!-- Tags Section -->
              <div class="bg-white/[0.02] rounded-2xl border border-white/10 p-5">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-semibold text-white/60 flex items-center gap-2">
                    <Tag :size="16" />
                    成员标签
                  </h3>
                  <span class="text-xs text-white/40">{{ editTags.length }} 个标签</span>
                </div>

                <!-- Viewing Mode -->
                <div v-if="!isEditing">
                  <div v-if="member.tags && member.tags.length > 0" class="flex flex-wrap gap-2">
                    <span
                      v-for="tag in member.tags"
                      :key="tag"
                      class="px-4 py-2 rounded-xl text-sm font-medium border"
                      :class="getTagColor(tag).bg + ' ' + getTagColor(tag).border + ' ' + getTagColor(tag).text"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <p v-else class="text-white/40 text-sm">暂无标签</p>
                </div>

                <!-- Editing Mode -->
                <div v-else class="space-y-4">
                  <!-- Current Tags -->
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="tag in editTags"
                      :key="tag"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                    >
                      {{ tag }}
                      <button @click="removeTag(tag)" class="hover:text-white transition-colors">
                        <X :size="14" />
                      </button>
                    </span>
                  </div>

                  <!-- Add Existing Tags -->
                  <div>
                    <p class="text-xs text-white/50 mb-2">从预设标签添加：</p>
                    <div class="flex flex-wrap gap-2">
                      <button
                        v-for="tag in availableTags.filter(t => !editTags.includes(t))"
                        :key="tag"
                        @click="addExistingTag(tag)"
                        class="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
                      >
                        <Plus :size="12" class="inline mr-1" />
                        {{ tag }}
                      </button>
                    </div>
                  </div>

                  <!-- Add Custom Tag -->
                  <div class="flex gap-2">
                    <input
                      v-model="newTag"
                      type="text"
                      placeholder="输入自定义标签..."
                      class="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 transition-all"
                      @keyup.enter="addNewTag"
                    />
                    <button
                      @click="addNewTag"
                      :disabled="!newTag.trim()"
                      class="px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <Plus :size="18" />
                    </button>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      @click="cancelEditing"
                      class="px-5 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
                    >
                      取消
                    </button>
                    <button
                      @click="saveTags"
                      class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                    >
                      保存修改
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white/[0.03] rounded-2xl border border-white/10 p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Calendar :size="20" class="text-emerald-400" />
              </div>
              <div>
                <p class="text-white/50 text-xs">加入时间</p>
                <p class="text-white font-semibold">{{ formatDate(member.created_at) }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white/[0.03] rounded-2xl border border-white/10 p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Trophy :size="20" class="text-amber-400" />
              </div>
              <div>
                <p class="text-white/50 text-xs">参与活动</p>
                <p class="text-white font-semibold">{{ memberActivities.length }} 场</p>
              </div>
            </div>
          </div>

          <div class="bg-white/[0.03] rounded-2xl border border-white/10 p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Tag :size="20" class="text-purple-400" />
              </div>
              <div>
                <p class="text-white/50 text-xs">标签数量</p>
                <p class="text-white font-semibold">{{ member.tags?.length || 0 }} 个</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="member.notes" class="bg-white/[0.03] rounded-2xl border border-white/10 p-6">
          <h3 class="text-sm font-semibold text-white/60 flex items-center gap-2 mb-4">
            <MessageSquare :size="16" />
            备注信息
          </h3>
          <p class="text-white/80 leading-relaxed">
            {{ member.notes }}
          </p>
        </div>

        <!-- Activities -->
        <div>
          <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Trophy :size="20" class="text-amber-400" />
            参与的活动
          </h3>

          <div v-if="memberActivities.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RouterLink
              v-for="act in memberActivities"
              :key="act.id"
              :to="`/activities/${act.id}`"
              class="block group"
            >
              <div class="bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden hover:border-emerald-500/30 transition-all duration-300 group-hover:-translate-y-1">
                <div class="flex gap-4 p-4">
                  <div class="w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                    <img
                      v-if="act.cover_image"
                      :src="act.cover_image"
                      :alt="act.name"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                      <Trophy :size="24" class="text-white/30" />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-white font-semibold mb-2 group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {{ act.name }}
                    </h4>
                    <div class="flex items-center gap-4 text-sm text-white/50">
                      <span class="flex items-center gap-1">
                        <Calendar :size="14" />
                        {{ formatDate(act.activity_date) }}
                      </span>
                    </div>
                  </div>
                  <ChevronRight :size="20" class="text-white/30 group-hover:text-emerald-400 transition-colors self-center" />
                </div>
              </div>
            </RouterLink>
          </div>

          <div v-else class="bg-white/[0.03] rounded-2xl border border-white/10 p-12 text-center">
            <Calendar :size="40" class="text-white/20 mx-auto mb-3" />
            <p class="text-white/50">暂无活动记录</p>
          </div>
        </div>
      </div>
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
</style>
