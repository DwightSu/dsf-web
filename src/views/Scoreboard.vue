<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Trophy, Medal, Star, Crown, Flame, TrendingUp, Calendar, Users } from 'lucide-vue-next'
import { useMemberStore } from '@/stores/members'
import { mockActivities, mockGroupMembers, mockGroups } from '@/mock'
import { getScoreRecords, getMemberTotalScore } from '@/utils/storage'
import type { Member, ScoreRecord } from '@/types/database'
import { formatDate } from '@/utils/format'

const memberStore = useMemberStore()

const loading = ref(true)
const selectedPeriod = ref<'all' | 'month' | 'year'>('all')

onMounted(() => {
  setTimeout(() => (loading.value = false), 500)
})

// 计算每个成员的活动参与次数和积分
interface ScoreboardEntry {
  member: Member
  activityCount: number
  totalScore: number
  rank: number
}

const scoreboardData = computed<ScoreboardEntry[]>(() => {
  const entries: ScoreboardEntry[] = []
  const allMembers = memberStore.allMembers

  allMembers.forEach(member => {
    // 计算活动参与次数
    const memberGroupMembers = mockGroupMembers.filter(gm => gm.member_id === member.id)
    const activityIds = new Set(memberGroupMembers.map(gm => {
      const group = mockGroups.find(g => g.id === gm.group_id)
      return group?.activity_id
    }).filter(Boolean))

    // 计算积分（从存储中获取）
    const storedScore = getMemberTotalScore(member.id)

    // 基础积分：每次活动 +10 分
    const baseScore = activityIds.size * 10
    const totalScore = baseScore + storedScore

    entries.push({
      member,
      activityCount: activityIds.size,
      totalScore,
      rank: 0
    })
  })

  // 按积分排序
  const sorted = entries.sort((a, b) => b.totalScore - a.totalScore)

  // 计算排名
  sorted.forEach((entry, index) => {
    entry.rank = index + 1
  })

  return sorted
})

// 前三名
const topThree = computed(() => scoreboardData.value.slice(0, 3))

// 其他排名（4-20）
const otherRanks = computed(() => scoreboardData.value.slice(3, 20))

// 获取排名样式
function getRankStyle(rank: number) {
  if (rank === 1) return { bg: 'from-yellow-400 to-amber-500', icon: Crown, text: '冠军', glow: 'shadow-yellow-500/50' }
  if (rank === 2) return { bg: 'from-gray-300 to-gray-400', icon: Medal, text: '亚军', glow: 'shadow-gray-400/50' }
  if (rank === 3) return { bg: 'from-amber-600 to-amber-700', icon: Medal, text: '季军', glow: 'shadow-amber-600/50' }
  return { bg: 'from-green-400 to-emerald-500', icon: Star, text: '', glow: '' }
}

// 获取排名徽章颜色
function getRankBadgeClass(rank: number): string {
  if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
  if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800'
  if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
  if (rank <= 10) return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
  return 'bg-gray-200 text-gray-600'
}

// 统计数据
const stats = computed(() => [
  { label: '参与玩家', value: scoreboardData.value.filter(e => e.activityCount > 0).length, icon: Users, color: 'text-amber-500' },
  { label: '总积分', value: scoreboardData.value.reduce((sum, e) => sum + e.totalScore, 0), icon: Star, color: 'text-yellow-500' },
  { label: '最高积分', value: scoreboardData.value[0]?.totalScore || 0, icon: Trophy, color: 'text-green-500' },
  { label: '活动场次', value: mockActivities.length, icon: Calendar, color: 'text-blue-500' }
])
</script>

<template>
  <div class="scoreboard-page min-h-screen py-8 px-4">
    <!-- 页面标题 -->
    <div class="max-w-6xl mx-auto mb-8">
      <div class="text-center mb-6">
        <h1 class="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <Trophy class="w-10 h-10 text-yellow-500" />
          积分排行榜
          <Trophy class="w-10 h-10 text-yellow-500" />
        </h1>
        <p class="text-gray-400">参与活动，积累积分，争夺荣耀！</p>
      </div>

      <!-- 统计数据 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div v-for="stat in stats" :key="stat.label"
             class="mc-card p-4 text-center">
          <component :is="stat.icon" class="w-6 h-6 mx-auto mb-2" :class="stat.color" />
          <div class="text-2xl font-bold text-white">{{ stat.value }}</div>
          <div class="text-sm text-gray-400">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- 前三名展示 -->
    <div class="max-w-6xl mx-auto mb-12">
      <div class="flex justify-center items-end gap-4 md:gap-8">
        <!-- 第二名 -->
        <div v-if="topThree[1]" class="flex-1 max-w-xs">
          <div class="mc-card p-6 text-center transform scale-95 hover:scale-100 transition-transform"
               :class="getRankStyle(2).glow">
            <div class="relative mb-4">
              <div class="w-20 h-20 mx-auto rounded-full overflow-hidden border-4"
                   :class="getRankBadgeClass(2)">
                <img v-if="topThree[1].member.avatar_url"
                     :src="topThree[1].member.avatar_url"
                     :alt="topThree[1].member.nickname"
                     class="w-full h-full object-cover" />
                <div v-else class="w-full h-full bg-gray-600 flex items-center justify-center">
                  <Users class="w-10 h-10 text-gray-400" />
                </div>
              </div>
              <div class="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
                   :class="getRankBadgeClass(2)">
                <span class="text-sm font-bold">2</span>
              </div>
            </div>
            <h3 class="text-xl font-bold text-white mb-1">{{ topThree[1].member.nickname }}</h3>
            <p class="text-gray-400 text-sm mb-3">{{ topThree[1].activityCount }} 次活动</p>
            <div class="flex items-center justify-center gap-2">
              <component :is="getRankStyle(2).icon" class="w-5 h-5 text-gray-400" />
              <span class="text-2xl font-bold text-gray-300">{{ topThree[1].totalScore }}</span>
              <span class="text-gray-400 text-sm">积分</span>
            </div>
            <p class="text-xs text-gray-500 mt-2">{{ getRankStyle(2).text }}</p>
          </div>
        </div>

        <!-- 第一名 -->
        <div v-if="topThree[0]" class="flex-1 max-w-xs">
          <div class="mc-card p-8 text-center transform scale-105 hover:scale-110 transition-transform shadow-xl"
               :class="getRankStyle(1).glow">
            <div class="relative mb-4">
              <Crown class="w-12 h-12 mx-auto text-yellow-500 mb-2 animate-pulse" />
              <div class="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-yellow-500 shadow-lg shadow-yellow-500/50">
                <img v-if="topThree[0].member.avatar_url"
                     :src="topThree[0].member.avatar_url"
                     :alt="topThree[0].member.nickname"
                     class="w-full h-full object-cover" />
                <div v-else class="w-full h-full bg-gray-600 flex items-center justify-center">
                  <Users class="w-12 h-12 text-gray-400" />
                </div>
              </div>
              <div class="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/50">
                <span class="text-lg font-bold text-white">1</span>
              </div>
            </div>
            <h3 class="text-2xl font-bold text-white mb-1">{{ topThree[0].member.nickname }}</h3>
            <p class="text-gray-400 text-sm mb-3">{{ topThree[0].activityCount }} 次活动</p>
            <div class="flex items-center justify-center gap-2">
              <Flame class="w-6 h-6 text-yellow-500 animate-pulse" />
              <span class="text-3xl font-bold text-yellow-500">{{ topThree[0].totalScore }}</span>
              <span class="text-gray-400 text-sm">积分</span>
            </div>
            <p class="text-sm text-yellow-500 mt-2 font-semibold">{{ getRankStyle(1).text }}</p>
          </div>
        </div>

        <!-- 第三名 -->
        <div v-if="topThree[2]" class="flex-1 max-w-xs">
          <div class="mc-card p-6 text-center transform scale-95 hover:scale-100 transition-transform"
               :class="getRankStyle(3).glow">
            <div class="relative mb-4">
              <div class="w-20 h-20 mx-auto rounded-full overflow-hidden border-4"
                   :class="getRankBadgeClass(3)">
                <img v-if="topThree[2].member.avatar_url"
                     :src="topThree[2].member.avatar_url"
                     :alt="topThree[2].member.nickname"
                     class="w-full h-full object-cover" />
                <div v-else class="w-full h-full bg-gray-600 flex items-center justify-center">
                  <Users class="w-10 h-10 text-gray-400" />
                </div>
              </div>
              <div class="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
                   :class="getRankBadgeClass(3)">
                <span class="text-sm font-bold">3</span>
              </div>
            </div>
            <h3 class="text-xl font-bold text-white mb-1">{{ topThree[2].member.nickname }}</h3>
            <p class="text-gray-400 text-sm mb-3">{{ topThree[2].activityCount }} 次活动</p>
            <div class="flex items-center justify-center gap-2">
              <component :is="getRankStyle(3).icon" class="w-5 h-5 text-amber-600" />
              <span class="text-2xl font-bold text-amber-600">{{ topThree[2].totalScore }}</span>
              <span class="text-gray-400 text-sm">积分</span>
            </div>
            <p class="text-xs text-gray-500 mt-2">{{ getRankStyle(3).text }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 其他排名列表 -->
    <div class="max-w-6xl mx-auto">
      <div class="mc-card overflow-hidden">
        <div class="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp class="w-5 h-5 text-green-500" />
            完整排名
          </h2>
          <span class="text-sm text-gray-400">共 {{ scoreboardData.length }} 位玩家</span>
        </div>

        <div class="divide-y divide-gray-700">
          <RouterLink v-for="entry in otherRanks" :key="entry.member.id"
                      :to="`/members/${entry.member.id}`"
                      class="flex items-center gap-4 p-4 hover:bg-gray-700/50 transition-colors">
            <!-- 排名 -->
            <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                 :class="getRankBadgeClass(entry.rank)">
              {{ entry.rank }}
            </div>

            <!-- 头像 -->
            <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-600">
              <img v-if="entry.member.avatar_url"
                   :src="entry.member.avatar_url"
                   :alt="entry.member.nickname"
                   class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <Users class="w-6 h-6 text-gray-400" />
              </div>
            </div>

            <!-- 信息 -->
            <div class="flex-1">
              <h3 class="font-semibold text-white">{{ entry.member.nickname }}</h3>
              <p class="text-sm text-gray-400">{{ entry.activityCount }} 次活动参与</p>
            </div>

            <!-- 积分 -->
            <div class="text-right">
              <div class="text-xl font-bold text-green-500">{{ entry.totalScore }}</div>
              <div class="text-xs text-gray-400">积分</div>
            </div>
          </RouterLink>
        </div>

        <!-- 空状态 -->
        <div v-if="scoreboardData.length === 0" class="p-8 text-center text-gray-400">
          <Trophy class="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>暂无积分数据，快去参加活动吧！</p>
        </div>
      </div>
    </div>

    <!-- 积分规则说明 -->
    <div class="max-w-6xl mx-auto mt-8">
      <div class="mc-card p-6">
        <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Star class="w-5 h-5 text-yellow-500" />
          积分规则
        </h3>
        <div class="grid md:grid-cols-2 gap-4 text-gray-300">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <span class="text-green-500 font-bold">+10</span>
            </div>
            <div>
              <p class="font-medium">参与活动</p>
              <p class="text-sm text-gray-400">每次活动参与获得 10 积分</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <span class="text-yellow-500 font-bold">+5</span>
            </div>
            <div>
              <p class="font-medium">获胜奖励</p>
              <p class="text-sm text-gray-400">活动获胜额外获得 5 积分</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span class="text-blue-500 font-bold">+3</span>
            </div>
            <div>
              <p class="font-medium">活跃贡献</p>
              <p class="text-sm text-gray-400">论坛发帖、评论获得 3 积分</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span class="text-purple-500 font-bold">+?</span>
            </div>
            <div>
              <p class="font-medium">特殊奖励</p>
              <p class="text-sm text-gray-400">管理员可手动添加额外积分</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scoreboard-page {
  background: linear-gradient(135deg, #1a2744 0%, #243447 50%, #1a2744 100%);
}
</style>