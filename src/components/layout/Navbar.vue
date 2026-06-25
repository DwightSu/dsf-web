<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { Menu, X, LogOut, Settings, Home, Calendar, Users, MessageSquare, Trophy, BookOpen } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isMenuOpen = ref(false)
const isScrolled = ref(false)

const navLinks = [
  { path: '/', label: '首页', icon: Home },
  { path: '/activities', label: '活动', icon: Calendar },
  { path: '/members', label: '成员库', icon: Users },
  { path: '/scoreboard', label: '积分榜', icon: Trophy },
  { path: '/special-records', label: '特殊榜单', icon: BookOpen },
  { path: '/forum', label: '论坛', icon: MessageSquare }
]

const adminLinks = [
  { path: '/admin', label: '管理后台', icon: Settings }
]

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

async function handleLogout() {
  await authStore.logout()
  router.push('/')
  closeMenu()
}

function isActive(path: string) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'glass shadow-lg border-b border-white/10' : 'bg-transparent'
    ]"
  >
    <nav class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-3 group" @click="closeMenu">
          <div class="relative w-10 h-10 flex items-center justify-center">
            <img src="/assets/images/poison-potato.svg" alt="毒薯服logo" class="w-10 h-10 pixelated" style="image-rendering: pixelated; image-rendering: crisp-edges;" />
          </div>
          <div class="flex flex-col">
            <span class="text-lg font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-green-400 bg-clip-text text-transparent">
              毒薯服
            </span>
            <span class="text-xs text-white/60 -mt-1">MC活动纪念</span>
          </div>
        </RouterLink>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-2">
          <RouterLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            :class="[
              'mc-nav-link flex items-center gap-2 text-sm font-medium',
              isActive(link.path) ? 'active' : ''
            ]"
          >
            <component :is="link.icon" :size="18" />
            {{ link.label }}
          </RouterLink>

          <div class="w-px h-6 bg-white/10 mx-2"></div>

          <RouterLink
            v-if="authStore.isAdmin"
            v-for="link in adminLinks"
            :key="link.path"
            :to="link.path"
            :class="[
              'mc-nav-link flex items-center gap-2 text-sm font-medium',
              isActive(link.path) ? 'active' : 'text-gold-yellow-light'
            ]"
          >
            <component :is="link.icon" :size="18" />
            {{ link.label }}
          </RouterLink>
        </div>

        <!-- User Actions -->
        <div class="hidden md:flex items-center gap-3">
          <div v-if="authStore.isLoggedIn" class="flex items-center gap-3">
            <RouterLink to="/profile" class="flex items-center gap-3 group">
              <div class="relative">
                <img
                  v-if="authStore.user?.avatar_url"
                  :src="authStore.user.avatar_url"
                  :alt="authStore.user.nickname"
                  class="w-9 h-9 rounded-full object-cover border-2 border-white/20 group-hover:border-green-400 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-green-500/30"
                />
                <div v-else class="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center border-2 border-white/20">
                  <span class="text-white text-sm font-bold">{{ authStore.user?.nickname?.charAt(0) }}</span>
                </div>
                <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium text-white group-hover:text-green-400 transition-colors">
                  {{ authStore.user?.nickname }}
                </span>
                <span v-if="authStore.isAdmin" class="text-xs text-amber-400 -mt-0.5">管理员</span>
              </div>
            </RouterLink>
            <button
              @click="handleLogout"
              class="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <LogOut :size="16" />
              登出
            </button>
          </div>

          <div v-else class="flex items-center gap-2">
            <button
              @click="router.push('/login')"
              class="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              登录
            </button>
            <button
              @click="router.push('/register')"
              class="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5"
            >
              注册
            </button>
          </div>
        </div>

        <!-- Mobile Menu Button -->
        <button
          class="md:hidden p-2.5 text-white rounded-xl hover:bg-white/10 transition-colors"
          @click="toggleMenu"
        >
          <Menu v-if="!isMenuOpen" :size="22" />
          <X v-else :size="22" />
        </button>
      </div>

      <!-- Mobile Menu -->
      <Transition name="slide">
        <div v-if="isMenuOpen" class="md:hidden mt-4 pb-4">
          <div class="flex flex-col gap-2 p-4 bg-gray-800/80 backdrop-blur-lg rounded-2xl border border-white/10">
            <RouterLink
              v-for="link in navLinks"
              :key="link.path"
              :to="link.path"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive(link.path)
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              ]"
              @click="closeMenu"
            >
              <component :is="link.icon" :size="20" />
              <span class="font-medium">{{ link.label }}</span>
            </RouterLink>

            <RouterLink
              v-if="authStore.isAdmin"
              v-for="link in adminLinks"
              :key="link.path"
              :to="link.path"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                isActive(link.path)
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-amber-400/80 hover:text-amber-400 hover:bg-amber-500/10'
              ]"
              @click="closeMenu"
            >
              <component :is="link.icon" :size="20" />
              <span class="font-medium">{{ link.label }}</span>
            </RouterLink>

            <div class="border-t border-white/10 my-2"></div>

            <div v-if="authStore.isLoggedIn" class="flex flex-col gap-2">
              <RouterLink
                to="/profile"
                class="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                @click="closeMenu"
              >
                <img
                  v-if="authStore.user?.avatar_url"
                  :src="authStore.user.avatar_url"
                  :alt="authStore.user.nickname"
                  class="w-10 h-10 rounded-full object-cover"
                />
                <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <span class="text-white font-bold">{{ authStore.user?.nickname?.charAt(0) }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="font-medium text-white">{{ authStore.user?.nickname }}</span>
                  <span v-if="authStore.isAdmin" class="text-xs text-amber-400">管理员</span>
                </div>
              </RouterLink>
              <button
                @click="handleLogout"
                class="w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <LogOut :size="18" />
                登出
              </button>
            </div>

            <div v-else class="flex flex-col gap-2">
              <button
                @click="router.push('/login'); closeMenu()"
                class="w-full px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 text-center font-medium"
              >
                登录
              </button>
              <button
                @click="router.push('/register'); closeMenu()"
                class="w-full px-4 py-3 text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 rounded-xl transition-all duration-200 font-medium shadow-lg shadow-green-500/25"
              >
                注册账号
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </nav>
  </header>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
