<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Github, Calendar, Users, Trophy, MessageSquare, BookOpen } from 'lucide-vue-next'

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
    <div class="container mx-auto px-4 py-12 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <div class="lg:col-span-2 flex flex-col gap-5">
          <div class="flex items-center gap-4">
            <div class="relative w-14 h-14 flex items-center justify-center">
              <img src="/assets/images/poison-potato.svg" alt="毒薯服logo" class="w-14 h-14" style="image-rendering: pixelated; image-rendering: crisp-edges;" />
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
        </div>
      </div>

      <div class="border-t border-white/5 pt-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-xs text-white/40">
            © {{ currentYear }} 毒薯服 MC服务器活动纪念网站
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
}
</style>
