<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Users, Search, User, Calendar, Trophy, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { mockMembers, mockGroups, mockGroupMembers, mockActivities } from '@/mock'
import { formatDate } from '@/utils/format'
import type { Member, Group } from '@/types/database'

const loading = ref(true)
const searchQuery = ref('')
const selectedTeam = ref<string>('all')
const currentPage = ref(1)
const pageSize = 8

const teams = computed(() => {
  const teamMap = new Map<string, string>()
  mockGroups.forEach(g => {
    teamMap.set(g.id, g.name)
  })
  return Array.from(teamMap.entries()).map(([id, name]) => ({ id, name }))
})

function getMemberTeams(memberId: string): Group[] {
  const gmList = mockGroupMembers.filter(gm => gm.member_id === memberId)
  const groupIds = gmList.map(gm => gm.group_id)
  return mockGroups.filter(g => groupIds.includes(g.id))
}

function getActivityCount(memberId: string): number {
  const memberTeams = getMemberTeams(memberId)
  const activityIds = [...new Set(memberTeams.map(t => t.activity_id))]
  return activityIds.length
}

function maskQQNumber(qq: string | null): string {
  if (!qq) return '未知'
  if (qq.length <= 6) return qq
  return qq.slice(0, 3) + '***' + qq.slice(-3)
}

function getMemberRole(member: Member): string {
  if (member.notes?.includes('管理员')) return '管理员'
  if (member.notes?.includes('大师') || member.notes?.includes('专家') || member.notes?.includes('高手')) return '大佬'
  if (member.notes?.includes('萌新')) return '萌新'
  return '成员'
}

function getRoleTagClass(role: string): string {
  switch (role) {
    case '管理员':
      return 'mc-tag-red'
    case '大佬':
      return 'mc-tag-gold'
    case '萌新':
      return 'mc-tag-blue'
    default:
      return 'mc-tag-green'
  }
}

const filteredMembers = computed(() => {
  let result = [...mockMembers]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(m =>
      m.nickname.toLowerCase().includes(query)
    )
  }

  if (selectedTeam.value !== 'all') {
    const memberIdsInTeam = mockGroupMembers
      .filter(gm => gm.group_id === selectedTeam.value)
      .map(gm => gm.member_id)
    result = result.filter(m => memberIdsInTeam.includes(m.id))
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
  <div class="members-page min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <div class="page-header text-center mb-10 animate-slide-down">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-grass-green)] to-[var(--color-grass-green-light)] mb-4 shadow-lg animate-bounce-soft">
          <Users :size="32" class="text-white" />
        </div>
        <h1 class="text-4xl font-bold mb-3">
          <span class="text-gradient-green">成员</span>
          <span class="text-gradient-gold">库</span>
        </h1>
        <p class="text-white/60 text-lg">
          毒薯服的小伙伴们
        </p>
      </div>

      <div class="search-filter-section mb-8 animate-slide-up">
        <div class="mc-card p-5">
          <div class="flex flex-col lg:flex-row gap-4">
            <div class="flex-1 mc-input-group">
              <Search :size="20" class="input-icon" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索成员昵称..."
                class="mc-input"
              />
            </div>

            <div class="flex gap-2 flex-wrap">
              <button
                @click="selectedTeam = 'all'; currentPage = 1"
                :class="[
                  'mc-btn text-sm',
                  selectedTeam === 'all' ? 'mc-btn-primary' : 'mc-btn-ghost'
                ]"
              >
                <Users :size="16" />
                全部
              </button>
              <button
                v-for="team in teams"
                :key="team.id"
                @click="selectedTeam = team.id; currentPage = 1"
                :class="[
                  'mc-btn text-sm',
                  selectedTeam === team.id ? 'mc-btn-primary' : 'mc-btn-ghost'
                ]"
              >
                {{ team.name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-[var(--color-grass-green)] border-t-transparent rounded-full animate-spin"></div>
          <p class="text-white/60">加载成员数据...</p>
        </div>
      </div>

      <div v-else-if="filteredMembers.length > 0">
        <div class="text-white/50 text-sm mb-4 text-center">
          共找到 <span class="text-grass-green-light font-semibold">{{ filteredMembers.length }}</span> 位小伙伴
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
          <RouterLink
            v-for="(member, index) in paginatedMembers"
            :key="member.id"
            :to="`/members/${member.id}`"
            class="member-card block animate-scale-in"
            :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <div class="mc-card p-5 h-full group">
              <div class="flex flex-col items-center text-center">
                <div class="relative mb-4">
                  <div class="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-grass-green)]/20 to-[var(--color-gold-yellow)]/20 flex items-center justify-center mc-avatar group-hover:animate-pulse-glow">
                    <User :size="36" class="text-grass-green-light" />
                  </div>
                  <div class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-gold-yellow)] to-[var(--color-gold-yellow-light)] flex items-center justify-center shadow-md border-2 border-[var(--color-bg-card)]">
                    <Trophy :size="14" class="text-white" />
                  </div>
                </div>

                <h3 class="text-lg font-bold text-white mb-2 group-hover:text-grass-green-light transition-colors">
                  {{ member.nickname }}
                </h3>

                <div :class="['mc-tag mb-3', getRoleTagClass(getMemberRole(member))]">
                  {{ getMemberRole(member) }}
                </div>

                <div class="w-full space-y-2 text-sm">
                  <div class="flex items-center justify-between text-white/60">
                    <span class="flex items-center gap-1.5">
                      <User :size="14" class="text-sky-blue-light" />
                      QQ号
                    </span>
                    <span class="text-white/80 font-mono">{{ maskQQNumber(member.qq_number) }}</span>
                  </div>

                  <div class="flex items-center justify-between text-white/60">
                    <span class="flex items-center gap-1.5">
                      <Calendar :size="14" class="text-grass-green-light" />
                      加入
                    </span>
                    <span class="text-white/80">{{ formatDate(member.created_at) }}</span>
                  </div>

                  <div class="flex items-center justify-between text-white/60">
                    <span class="flex items-center gap-1.5">
                      <Trophy :size="14" class="text-gold-yellow-light" />
                      活动
                    </span>
                    <span class="text-white/80">{{ getActivityCount(member.id) }} 场</span>
                  </div>
                </div>

                <div v-if="getMemberTeams(member.id).length > 0" class="w-full mt-4 pt-3 border-t border-white/10">
                  <div class="text-xs text-white/50 mb-2">所属小组</div>
                  <div class="flex flex-wrap gap-1.5 justify-center">
                    <span
                      v-for="team in getMemberTeams(member.id)"
                      :key="team.id"
                      class="mc-tag mc-tag-green text-xs"
                    >
                      {{ team.name }}
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
              'mc-btn !p-2.5',
              currentPage === 1 ? 'mc-btn-ghost opacity-50 cursor-not-allowed' : 'mc-btn-ghost'
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
                'mc-btn !w-10 !h-10 !p-0',
                currentPage === page ? 'mc-btn-primary' : 'mc-btn-ghost'
              ]"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            :class="[
              'mc-btn !p-2.5',
              currentPage === totalPages ? 'mc-btn-ghost opacity-50 cursor-not-allowed' : 'mc-btn-ghost'
            ]"
          >
            <ChevronRight :size="20" />
          </button>
        </div>
      </div>

      <div v-else class="text-center py-20 animate-scale-in">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-4">
          <Users :size="40" class="text-white/20" />
        </div>
        <p class="text-white/60 text-lg mb-2">没有找到匹配的成员</p>
        <p class="text-white/40 text-sm">试试其他搜索条件吧</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.member-card {
  text-decoration: none;
}

.mc-card {
  background: linear-gradient(145deg, var(--color-bg-card), var(--color-bg-secondary));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.mc-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(92, 184, 92, 0.2);
  border-color: var(--color-grass-green);
}

.mc-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-weight: 600;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.mc-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.mc-btn:hover::before {
  left: 100%;
}

.mc-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.mc-btn:active {
  transform: translateY(0);
}

.mc-btn-primary {
  background: linear-gradient(135deg, var(--color-grass-green), var(--color-grass-green-light));
  color: white;
}

.mc-btn-ghost {
  background: transparent;
  border: 2px solid var(--color-border-light);
  color: var(--color-text-secondary);
}

.mc-btn-ghost:hover:not(:disabled) {
  border-color: var(--color-grass-green);
  color: var(--color-grass-green-light);
  background: rgba(92, 184, 92, 0.1);
}

.mc-input {
  width: 100%;
  padding: 12px 16px;
  background: var(--color-bg-input);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: 14px;
  transition: all 0.25s ease;
  outline: none;
}

.mc-input:focus {
  border-color: var(--color-grass-green);
  box-shadow: 0 0 0 3px rgba(92, 184, 92, 0.2);
  background: var(--color-bg-card);
}

.mc-input::placeholder {
  color: var(--color-text-muted);
}

.mc-input-group {
  position: relative;
}

.mc-input-group .input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  transition: color 0.25s ease;
}

.mc-input-group:focus-within .input-icon {
  color: var(--color-grass-green);
}

.mc-input-group .mc-input {
  padding-left: 44px;
}

.mc-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.mc-tag:hover {
  transform: scale(1.05);
}

.mc-tag-green {
  background: rgba(92, 184, 92, 0.2);
  color: var(--color-grass-green-light);
  border: 1px solid rgba(92, 184, 92, 0.3);
}

.mc-tag-blue {
  background: rgba(91, 192, 222, 0.2);
  color: var(--color-sky-blue-light);
  border: 1px solid rgba(91, 192, 222, 0.3);
}

.mc-tag-gold {
  background: rgba(240, 173, 78, 0.2);
  color: var(--color-gold-yellow-light);
  border: 1px solid rgba(240, 173, 78, 0.3);
}

.mc-tag-red {
  background: rgba(217, 83, 79, 0.2);
  color: var(--color-redstone-red-light);
  border: 1px solid rgba(217, 83, 79, 0.3);
}

.mc-avatar {
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 3px solid var(--color-border-light);
  transition: all 0.3s ease;
  object-fit: cover;
}

.text-gradient-green {
  background: linear-gradient(135deg, var(--color-grass-green), var(--color-grass-green-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-gradient-gold {
  background: linear-gradient(135deg, var(--color-gold-yellow), var(--color-gold-yellow-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-grass-green-light {
  color: var(--color-grass-green-light);
}

.text-sky-blue-light {
  color: var(--color-sky-blue-light);
}

.text-gold-yellow-light {
  color: var(--color-gold-yellow-light);
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

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(92, 184, 92, 0.3), 0 0 10px rgba(92, 184, 92, 0.2);
  }
  50% {
    box-shadow: 0 0 15px rgba(92, 184, 92, 0.5), 0 0 30px rgba(92, 184, 92, 0.3);
  }
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
</style>
