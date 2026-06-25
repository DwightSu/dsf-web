<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { 
  Users, Calendar, Image, MessageSquare, 
  ChevronRight, Eye, TrendingUp, 
  Sparkles, Settings, Shield
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useMemberStore } from '@/stores/members'
import { mockActivities, mockPosts, mockImages } from '@/mock'
import { formatDate } from '@/utils/format'

const memberStore = useMemberStore()

const authStore = useAuthStore()

const loading = ref(false)

const stats = computed(() => [
  { 
    label: '用户总数', 
    value: authStore.getAllUsers().length, 
    icon: Users, 
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400'
  },
  { 
    label: '活动总数', 
    value: mockActivities.length, 
    icon: Calendar, 
    color: 'from-green-400 to-green-600',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-400'
  },
  { 
    label: '图片总数', 
    value: mockImages.length, 
    icon: Image, 
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400'
  },
  { 
    label: '帖子总数', 
    value: mockPosts.length, 
    icon: MessageSquare, 
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400'
  }
])

const menuItems = [
  { 
    path: '/admin/users', 
    label: '用户管理', 
    icon: Users, 
    description: '管理用户账号和权限', 
    color: 'from-blue-500 to-cyan-500',
    bgHover: 'hover:bg-blue-500/10'
  },
  { 
    path: '/admin/activities', 
    label: '活动管理', 
    icon: Calendar, 
    description: '创建和管理活动', 
    color: 'from-green-500 to-emerald-500',
    bgHover: 'hover:bg-green-500/10'
  },
  { 
    path: '/admin/images', 
    label: '图片管理', 
    icon: Image, 
    description: '上传和管理活动图片', 
    color: 'from-amber-500 to-orange-500',
    bgHover: 'hover:bg-amber-500/10'
  },
  { 
    path: '/admin/content', 
    label: '内容审核', 
    icon: MessageSquare, 
    description: '审核帖子和评论', 
    color: 'from-rose-500 to-pink-500',
    bgHover: 'hover:bg-rose-500/10'
  }
]

const recentActivities = computed(() => {
  return [...mockActivities]
    .sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())
    .slice(0, 5)
})

function getActivityTypeColor(type: string) {
  const colors: Record<string, string> = {
    '生存挑战': 'bg-green-500/20 text-green-400 border-green-500/30',
    '建筑比赛': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'PVP竞技': 'bg-red-500/20 text-red-400 border-red-500/30',
    '其他活动': 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  }
  return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}
</script>

<template>
  <div class="admin-dashboard min-h-screen py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <!-- 页面标题 -->
      <div class="page-header mb-8 animate-slide-down">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Shield class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-green-400 bg-clip-text text-transparent">
              管理后台
            </h1>
            <p class="text-white/60 text-sm mt-0.5">
              毒薯服管理员控制台
            </p>
          </div>
        </div>
        <div class="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Sparkles class="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p class="text-white font-medium">
                欢迎回来，{{ authStore.user?.nickname || '管理员' }}！
              </p>
              <p class="text-white/50 text-sm">
                今天也是充满活力的一天，来看看服务器的最新动态吧 🥔
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 统计数据 -->
      <div class="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div
          v-for="(stat, index) in stats"
          :key="stat.label"
          class="stat-card group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-white/10 p-5 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:-translate-y-1 animate-scale-in"
          :style="{ animationDelay: `${index * 0.08}s` }"
        >
          <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500"
               :class="stat.color"
          ></div>
          <div class="relative z-10">
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-3', stat.bgColor]">
              <component :is="stat.icon" :class="['w-6 h-6', stat.textColor]" />
            </div>
            <div class="text-3xl font-bold text-white mb-1">{{ stat.value }}</div>
            <div class="text-sm text-white/50">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- 功能菜单 -->
      <div class="menu-section mb-8">
        <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Settings class="w-5 h-5 text-amber-400" />
          管理功能
        </h2>
        <div class="menu-grid grid grid-cols-1 md:grid-cols-2 gap-4">
          <RouterLink
            v-for="(item, index) in menuItems"
            :key="item.path"
            :to="item.path"
            class="menu-card group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-white/10 p-5 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:-translate-y-1 animate-slide-up"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="flex items-center gap-4">
              <div :class="['w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300', item.color]">
                <component :is="item.icon" class="w-7 h-7 text-white" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
                  {{ item.label }}
                </h3>
                <p class="text-sm text-white/50 mt-0.5">{{ item.description }}</p>
              </div>
              <ChevronRight class="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- 最新活动 -->
      <div class="recent-activities animate-slide-up" style="animation-delay: 0.4s">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp class="w-5 h-5 text-green-400" />
            最新活动
          </h2>
          <RouterLink 
            to="/admin/activities"
            class="text-sm text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
          >
            查看全部
            <ChevronRight class="w-4 h-4" />
          </RouterLink>
        </div>

        <div class="activities-list rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-white/10 overflow-hidden">
          <div v-if="recentActivities.length > 0" class="divide-y divide-white/5">
            <div
              v-for="(activity, index) in recentActivities"
              :key="activity.id"
              class="activity-item flex items-center justify-between p-4 hover:bg-white/5 transition-all duration-200 group"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Calendar :size="22" class="text-green-400" />
                </div>
                <div class="min-w-0">
                  <h3 class="font-semibold text-white text-sm truncate">{{ activity.name }}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span :class="['px-2 py-0.5 rounded-full text-xs border', getActivityTypeColor(activity.activity_type)]">
                    {{ activity.activity_type }}
                  </span>
                    <span class="text-xs text-white/40">{{ formatDate(activity.activity_date) }}</span>
                  </div>
                </div>
              </div>
              <RouterLink :to="`/activities/${activity.id}`">
                <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all">
                  <Eye :size="14" />
                  查看
                </span>
              </RouterLink>
            </div>
          </div>

          <div v-else class="p-8 text-center">
            <Calendar :size="48" class="text-white/20 mx-auto mb-3" />
            <p class="text-white/40">暂无活动</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.divide-y > * + * {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-slide-up {
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.animate-slide-down {
  animation: slideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.animate-scale-in {
  animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
}
</style>
