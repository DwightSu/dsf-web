<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Github, Heart, Sparkles, Calendar, Users, Trophy, MessageSquare, BookOpen } from 'lucide-vue-next'

const currentYear = new Date().getFullYear()

const quickLinks = [
  { path: '/activities', label: '活动列表', icon: Calendar },
  { path: '/members', label: '成员库', icon: Users },
  { path: '/scoreboard', label: '积分排行榜', icon: Trophy },
  { path: '/special-records', label: '特殊榜单', icon: BookOpen },
  { path: '/forum', label: '论坛交流', icon: MessageSquare }
]
</script>

<template>
  <footer class="footer mt-auto">
    <div class="footer-bg-decoration">
      <div class="floating-block block-1"></div>
      <div class="floating-block block-2"></div>
      <div class="floating-block block-3"></div>
      <div class="floating-block block-4"></div>
      <div class="floating-block block-5"></div>
    </div>

    <div class="container mx-auto px-4 py-12 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <div class="lg:col-span-2 flex flex-col gap-5">
          <div class="flex items-center gap-4">
            <div class="relative w-14 h-14">
              <div class="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl transform rotate-6 shadow-lg shadow-amber-500/30"></div>
              <div class="absolute inset-1 bg-gradient-to-br from-amber-300 to-amber-500 rounded-xl flex items-center justify-center">
                <span class="text-white text-2xl">🥔</span>
              </div>
              <Sparkles class="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
            <div class="flex flex-col">
              <span class="text-xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-green-400 bg-clip-text text-transparent">
                毒薯服
              </span>
              <span class="text-sm text-white/60 -mt-0.5">MC活动纪念</span>
            </div>
          </div>
          <p class="text-sm text-white/60 leading-relaxed max-w-md">
            记录Minecraft服务器活动的精彩瞬间，保存每一位玩家的珍贵回忆。
            这是一个由玩家社区维护的纪念网站，记录我们共同的游戏时光。
          </p>
          <div class="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all duration-300 hover:-translate-y-0.5"
            >
              <Github :size="20" />
            </a>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <span class="w-1 h-4 rounded-full bg-gradient-to-b from-green-400 to-emerald-500"></span>
            快速链接
          </h3>
          <div class="flex flex-col gap-2">
            <RouterLink
              v-for="link in quickLinks"
              :key="link.path"
              :to="link.path"
              class="flex items-center gap-2 text-sm text-white/60 hover:text-green-400 transition-all duration-300 hover:translate-x-1 group"
            >
              <component :is="link.icon" :size="14" class="text-white/40 group-hover:text-green-400 transition-colors" />
              {{ link.label }}
            </RouterLink>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <span class="w-1 h-4 rounded-full bg-gradient-to-b from-amber-400 to-orange-500"></span>
            关于我们
          </h3>
          <p class="text-sm text-white/60 leading-relaxed">
            这是一个由玩家社区维护的纪念网站，记录我们共同的游戏时光。
          </p>
          <div class="mt-2 p-4 rounded-xl bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/10">
            <p class="text-xs text-white/50">
              💚 用爱与热情打造
            </p>
          </div>
        </div>
      </div>

      <div class="border-t border-white/5 pt-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-xs text-white/40">
            © {{ currentYear }} 毒薯服 MC服务器活动纪念网站
          </p>
          <p class="text-xs text-white/40 flex items-center gap-1.5">
            用
            <Heart :size="12" class="text-red-400 fill-red-400/30" />
            制作
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, transparent 0%, rgba(26, 26, 46, 0.8) 30%, rgba(26, 26, 46, 0.95) 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.footer-bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.floating-block {
  position: absolute;
  width: 8px;
  height: 8px;
  opacity: 0.15;
  border-radius: 2px;
  animation: float 8s ease-in-out infinite;
}

.block-1 {
  left: 10%;
  bottom: 20%;
  background: linear-gradient(180deg, #2D5016 0%, #1A3A0D 100%);
  animation-delay: 0s;
}

.block-2 {
  left: 30%;
  bottom: 40%;
  background: linear-gradient(180deg, #4AEDD9 0%, #3ADDC9 100%);
  animation-delay: 1.5s;
  width: 6px;
  height: 6px;
}

.block-3 {
  left: 50%;
  bottom: 15%;
  background: linear-gradient(180deg, #FFD700 0%, #DAA520 100%);
  animation-delay: 3s;
  width: 10px;
  height: 10px;
}

.block-4 {
  left: 70%;
  bottom: 35%;
  background: linear-gradient(180deg, #E74C3C 0%, #C0392B 100%);
  animation-delay: 4.5s;
  width: 7px;
  height: 7px;
}

.block-5 {
  left: 85%;
  bottom: 25%;
  background: linear-gradient(180deg, #808080 0%, #606060 100%);
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.15;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.3;
  }
}
</style>
