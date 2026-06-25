<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Calendar,
  Users,
  MessageSquare,
  ArrowRight,
  Image as ImageIcon,
  Sparkles,
  PartyPopper,
  Crown,
  Heart
} from 'lucide-vue-next'
import { mockActivities, mockPosts, mockImages } from '@/mock'
import { formatDate } from '@/utils/format'
import { useMemberStore } from '@/stores/members'
import PotatoIcon from '@/components/icons/PotatoIcon.vue'

const memberStore = useMemberStore()

const heroVisible = ref(false)
const statsVisible = ref(false)
const quickLinksVisible = ref(false)
const activitiesVisible = ref(false)
const featuresVisible = ref(false)
const ctaVisible = ref(false)

onMounted(() => {
  heroVisible.value = true
  statsVisible.value = true
  quickLinksVisible.value = true
  activitiesVisible.value = true
  featuresVisible.value = true
  ctaVisible.value = true
})

const latestActivities = computed(() => {
  return [...mockActivities]
    .sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())
    .slice(0, 3)
})

const stats = computed(() => [
  { label: '活动总数', value: mockActivities.length, icon: PartyPopper, color: 'from-green-400 to-emerald-500' },
  { label: '参与玩家', value: memberStore.memberCount, icon: Users, color: 'from-amber-400 to-orange-500' },
  { label: '精彩瞬间', value: mockImages.length, icon: ImageIcon, color: 'from-yellow-400 to-amber-500' },
  { label: '论坛帖子', value: mockPosts.length, icon: MessageSquare, color: 'from-lime-400 to-green-500' }
])

const quickLinks = [
  {
    path: '/activities',
    title: '活动列表',
    icon: Calendar,
    description: '查看所有精彩活动记录',
    gradient: 'from-green-400 to-emerald-500',
    bgGradient: 'from-green-50 to-emerald-100'
  },
  {
    path: '/members',
    title: '成员库',
    icon: Users,
    description: '认识每一位毒薯服玩家',
    gradient: 'from-amber-400 to-orange-500',
    bgGradient: 'from-amber-50 to-orange-100'
  },
  {
    path: '/forum',
    title: '论坛交流',
    icon: MessageSquare,
    description: '分享心得，交流经验',
    gradient: 'from-yellow-400 to-amber-500',
    bgGradient: 'from-yellow-50 to-amber-100'
  }
]

const features = [
  {
    icon: Calendar,
    title: '活动记录',
    description: '详细记录每次活动的时间、参与者和精彩瞬间，留住每一段美好回忆',
    gradient: 'from-green-400 to-emerald-500'
  },
  {
    icon: Users,
    title: '成员库',
    description: '建立玩家档案，追踪每位成员的活动参与历史，见证共同成长',
    gradient: 'from-amber-400 to-orange-500'
  },
  {
    icon: ImageIcon,
    title: '图片画廊',
    description: '精美的图片展示系统，保存活动的珍贵照片，随时回味精彩时刻',
    gradient: 'from-yellow-400 to-amber-500'
  },
  {
    icon: MessageSquare,
    title: '论坛交流',
    description: '分享心得体会，与其他玩家互动交流，打造温馨的社区氛围',
    gradient: 'from-lime-400 to-green-500'
  }
]

interface FloatingEmoji {
  emoji: string
  top: string
  left?: string
  right?: string
  delay: string
  duration: string
  size: string
}

const floatingEmojis: FloatingEmoji[] = []
</script>

<template>
  <div class="home-page min-h-screen bg-gradient-to-b from-green-50 via-amber-50 to-yellow-50">
    <!-- Hero区域 -->
    <section class="hero-section relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
      <!-- 背景渐变装饰 -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-green-300/40 rounded-full blur-3xl"></div>
        <div class="absolute -top-20 -right-20 w-80 h-80 bg-amber-300/40 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 -left-16 w-64 h-64 bg-yellow-300/30 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-1/4 w-72 h-72 bg-lime-300/30 rounded-full blur-3xl"></div>
      </div>

      <!-- Hero内容 -->
      <div class="container mx-auto px-4 relative z-10">
        <div
          :class="[
            'text-center max-w-4xl mx-auto transition-all duration-1000',
            heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          ]"
        >
          <!-- 徽章 -->
          <div class="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 rounded-full border border-green-200 shadow-lg mb-8">
            <Sparkles class="w-5 h-5 text-amber-500" />
            <span class="text-sm font-semibold text-green-700">Minecraft 服务器活动纪念</span>
          </div>

          <!-- 主标题 -->
          <h1 class="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span class="bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 bg-clip-text text-transparent">毒薯服</span>
          </h1>

          <!-- 副标题 -->
          <p class="text-xl md:text-2xl text-green-800 font-medium mb-4">
            Minecraft 服务器活动纪念
          </p>

          <!-- 标语 -->
          <p class="text-lg md:text-xl text-green-600/80 mb-12 max-w-2xl mx-auto">
            记录每一次冒险，珍藏每一份回忆
          </p>

          <!-- CTA按钮 -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <RouterLink
              to="/activities"
              class="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40 transition-shadow duration-200"
            >
              <Calendar class="w-5 h-5" />
              <span>查看活动</span>
              <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </RouterLink>
            <RouterLink
              to="/forum"
              class="group inline-flex items-center gap-3 px-8 py-4 bg-white/80 text-green-700 font-bold rounded-2xl border-2 border-green-200 shadow-lg hover:border-green-400 hover:bg-white transition-all duration-200"
            >
              <MessageSquare class="w-5 h-5" />
              <span>进入论坛</span>
            </RouterLink>
          </div>
        </div>

        <!-- 统计数据卡片 -->
        <div
          :class="[
            'grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto transition-all duration-1000 delay-300',
            statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          ]"
        >
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="group bg-white/80 rounded-2xl p-5 md:p-6 text-center border border-white/60 shadow-xl hover:shadow-2xl transition-shadow duration-200"
          >
            <div :class="['w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg', stat.color]">
              <component :is="stat.icon" class="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>
            <div class="text-3xl md:text-4xl font-extrabold text-gray-800 mb-1">{{ stat.value }}</div>
            <div class="text-sm md:text-base text-gray-600 font-medium">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 快捷入口区 -->
    <section class="quick-links-section py-20 md:py-28 relative">
      <div class="container mx-auto px-4">
        <div
          :class="[
            'text-center mb-12 md:mb-16 transition-all duration-700',
            quickLinksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          ]"
        >
          <h2 class="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            探索更多
          </h2>
          <p class="text-gray-500 text-lg max-w-xl mx-auto">
            发现毒薯服的精彩内容，开启你的冒险之旅
          </p>
        </div>

        <div
          :class="[
            'grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto transition-all duration-1000 delay-200',
            quickLinksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          ]"
        >
          <RouterLink
            v-for="link in quickLinks"
            :key="link.path"
            :to="link.path"
            class="group relative overflow-hidden rounded-3xl p-8 bg-white/80 border border-white/60 shadow-xl hover:shadow-2xl transition-shadow duration-200"
          >
            <div :class="['absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 bg-gradient-to-br transition-transform duration-500 group-hover:scale-150', link.gradient]"></div>
            <div class="relative z-10">
              <div :class="['w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg mb-5', link.gradient]">
                <component :is="link.icon" class="w-8 h-8 text-white" />
              </div>
              <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                {{ link.title }}
              </h3>
              <p class="text-gray-500 mb-5">
                {{ link.description }}
              </p>
              <div class="flex items-center gap-2 text-green-600 font-semibold">
                <span>立即前往</span>
                <ArrowRight class="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 最新活动区 -->
    <section class="activities-section py-20 md:py-28 bg-gradient-to-b from-transparent via-green-50/50 to-transparent relative">
      <div class="container mx-auto px-4">
        <div
          :class="[
            'flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 md:mb-16 gap-4 transition-all duration-700',
            activitiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          ]"
        >
          <div>
            <h2 class="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">
              最新活动
            </h2>
            <p class="text-gray-500">回顾最近的精彩活动瞬间</p>
          </div>
          <RouterLink
            to="/activities"
            class="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 font-semibold rounded-xl border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all duration-300"
          >
            <span>查看全部</span>
            <ArrowRight class="w-4 h-4" />
          </RouterLink>
        </div>

        <div
          :class="[
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 transition-all duration-1000 delay-200',
            activitiesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          ]"
        >
          <RouterLink
            v-for="activity in latestActivities"
            :key="activity.id"
            :to="`/activities/${activity.id}`"
            class="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100"
          >
            <!-- 活动封面 -->
            <div class="relative aspect-video overflow-hidden">
              <img
                v-if="activity.cover_image"
                :src="activity.cover_image"
                :alt="activity.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div v-else class="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <PartyPopper class="w-16 h-16 text-white/50" />
              </div>
              <!-- 渐变遮罩 -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <!-- 活动类型标签 -->
              <div v-if="activity.activity_type" class="absolute top-4 left-4 px-4 py-1.5 bg-white/90 backdrop-blur-sm text-sm font-bold text-green-700 rounded-full shadow-lg">
                {{ activity.activity_type }}
              </div>
              <!-- 分组标签 -->
              <div v-if="activity.has_groups" class="absolute top-4 right-4 px-4 py-1.5 bg-amber-400/90 backdrop-blur-sm text-sm font-bold text-white rounded-full shadow-lg">
                分组活动
              </div>
            </div>

            <!-- 活动信息 -->
            <div class="p-6">
              <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors leading-snug">
                {{ activity.name }}
              </h3>
              <div class="flex items-center gap-2 text-gray-500">
                <Calendar class="w-4 h-4 text-green-500" />
                <span class="text-sm font-medium">{{ formatDate(activity.activity_date, 'long') }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 网站特色区 -->
    <section class="features-section py-20 md:py-28 relative">
      <div class="container mx-auto px-4">
        <div
          :class="[
            'text-center mb-12 md:mb-16 transition-all duration-700',
            featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          ]"
        >
          <h2 class="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            网站特色
          </h2>
          <p class="text-gray-500 text-lg max-w-xl mx-auto">
            毒薯服为你提供全方位的活动纪念体验
          </p>
        </div>

        <div
          :class="[
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 transition-all duration-1000 delay-200',
            featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          ]"
        >
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="group bg-white/80 backdrop-blur-md rounded-3xl p-8 text-center border border-white/60 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
          >
            <div :class="['w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300', feature.gradient]">
              <component :is="feature.icon" class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-3">
              {{ feature.title }}
            </h3>
            <p class="text-gray-500 leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 行动号召区 -->
    <section class="cta-section py-20 md:py-28 relative overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-green-300/30 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-300/30 rounded-full blur-3xl"></div>
      </div>

      <div class="container mx-auto px-4 relative z-10">
        <div
          :class="[
            'max-w-4xl mx-auto bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-[2rem] md:rounded-[3rem] p-10 md:p-16 text-center text-white shadow-2xl shadow-green-500/30 transition-all duration-1000',
            ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          ]"
        >
          <!-- 装饰图标 -->
          <div class="flex items-center justify-center gap-4 mb-6">
            <PotatoIcon size="lg" />
            <Sparkles class="w-8 h-8 text-yellow-300 animate-pulse" />
            <PartyPopper class="w-8 h-8 text-yellow-200" />
          </div>

          <h2 class="text-3xl md:text-5xl font-extrabold mb-6">
            加入毒薯服大家庭
          </h2>
          <p class="text-lg md:text-xl text-green-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            毒薯服是一个充满爱与欢笑的 Minecraft 服务器社区。
            我们定期举办各种精彩活动，从 PVP 竞技到建筑比赛，从生存挑战到创造探索。
            每一位玩家都是我们大家庭的一员，每一次冒险都值得被铭记。
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <RouterLink
              to="/register"
              class="group inline-flex items-center gap-3 px-8 py-4 bg-white text-green-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <Heart class="w-5 h-5" />
              <span>立即加入</span>
            </RouterLink>
            <RouterLink
              to="/login"
              class="group inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-2xl border-2 border-white/40 hover:bg-white/30 hover:-translate-y-1 transition-all duration-300"
            >
              <Crown class="w-5 h-5" />
              <span>已有账号？登录</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.animate-float {
  animation: float ease-in-out infinite;
}
</style>
