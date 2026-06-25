<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Github, Heart, Sparkles } from 'lucide-vue-next'
import PotatoIcon from '@/components/icons/PotatoIcon.vue'

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer bg-dark-surface border-t-2 border-pixel-border mt-auto">
    <div class="container mx-auto px-4 py-8">
      <!-- 主要内容 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- Logo和描述 -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <div class="relative w-12 h-12">
              <div class="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl transform rotate-6 shadow-lg shadow-amber-500/30"></div>
              <div class="absolute inset-1 bg-gradient-to-br from-amber-300 to-amber-500 rounded-xl flex items-center justify-center">
                <PotatoIcon size="md" />
              </div>
              <Sparkles class="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
            </div>
            <div class="flex flex-col">
              <span class="text-lg font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-green-400 bg-clip-text text-transparent">
                毒薯服
              </span>
              <span class="text-xs text-white/60 -mt-0.5">MC活动纪念</span>
            </div>
          </div>
          <p class="text-sm text-white/60 leading-relaxed">
            记录Minecraft服务器活动的精彩瞬间，保存每一位玩家的珍贵回忆。
          </p>
        </div>

        <!-- 快速链接 -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-pixel text-white uppercase tracking-wider">
            快速链接
          </h3>
          <div class="flex flex-col gap-2">
            <RouterLink
              to="/activities"
              class="text-sm text-white/60 hover:text-grass-green transition-colors"
            >
              活动列表
            </RouterLink>
            <RouterLink
              to="/members"
              class="text-sm text-white/60 hover:text-grass-green transition-colors"
            >
              成员库
            </RouterLink>
            <RouterLink
              to="/scoreboard"
              class="text-sm text-white/60 hover:text-grass-green transition-colors"
            >
              积分排行榜
            </RouterLink>
            <RouterLink
              to="/special-records"
              class="text-sm text-white/60 hover:text-grass-green transition-colors"
            >
              特殊榜单
            </RouterLink>
            <RouterLink
              to="/forum"
              class="text-sm text-white/60 hover:text-grass-green transition-colors"
            >
              论坛交流
            </RouterLink>
          </div>
        </div>

        <!-- 联系信息 -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-pixel text-white uppercase tracking-wider">
            关于我们
          </h3>
          <p class="text-sm text-white/60 leading-relaxed">
            这是一个由玩家社区维护的纪念网站，记录我们共同的游戏时光。
          </p>
          <div class="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              class="text-white/60 hover:text-grass-green transition-colors"
            >
              <Github :size="20" />
            </a>
          </div>
        </div>
      </div>

      <!-- 底部版权信息 -->
      <div class="border-t border-pixel-border pt-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-xs text-white/50 font-pixel">
            © {{ currentYear }} MC服务器活动纪念网站
          </p>
          <p class="text-xs text-white/50 flex items-center gap-2">
            用
            <Heart :size="14" class="text-redstone-red" />
            制作
          </p>
        </div>
      </div>
    </div>

    <!-- 像素装饰 -->
    <div class="pixel-decoration">
      <div class="pixel-row pixel-row-1"></div>
      <div class="pixel-row pixel-row-2"></div>
      <div class="pixel-row pixel-row-3"></div>
    </div>
  </footer>
</template>

<style scoped>
/* Footer样式 */
.footer {
  position: relative;
  overflow: hidden;
}

/* Logo动画 */
.pixel-logo {
  display: grid;
  grid-template-columns: repeat(2, 8px);
  grid-template-rows: repeat(2, 8px);
  gap: 2px;
}

.pixel-block {
  background: #2D5016;
  box-shadow:
    inset -1px -1px 0 rgba(0, 0, 0, 0.5),
    inset 1px 1px 0 rgba(255, 255, 255, 0.1);
}

/* 像素装饰 */
.pixel-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  display: flex;
  gap: 4px;
}

.pixel-row {
  height: 2px;
  background: rgba(255, 255, 255, 0.05);
}

.pixel-row-1 {
  width: 20%;
  margin-left: 10%;
}

.pixel-row-2 {
  width: 30%;
}

.pixel-row-3 {
  width: 20%;
  margin-right: 10%;
}

/* Minecraft配色 */
.bg-dark-surface {
  background-color: #1a1a2e;
}

.text-grass-green {
  color: #2D5016;
}

.text-redstone-red {
  color: #E74C3C;
}

.border-pixel-border {
  border-color: rgba(255, 255, 255, 0.1);
}

/* 像素字体 */
.font-pixel {
  font-family: 'Press Start 2P', 'VT323', monospace;
}
</style>