<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Home, Search, MapPin } from 'lucide-vue-next'
import PixelCard from '@/components/common/PixelCard.vue'
import PixelButton from '@/components/common/PixelButton.vue'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="not-found-page min-h-screen flex items-center justify-center py-16">
    <div class="container mx-auto px-4 text-center">
      <!-- Minecraft像素风格404 -->
      <div class="not-found-content">
        <!-- 像素方块装饰 -->
        <div class="pixel-blocks mb-8">
          <div class="block grass-block"></div>
          <div class="block dirt-block"></div>
          <div class="block stone-block"></div>
          <div class="block diamond-block"></div>
          <div class="block redstone-block"></div>
        </div>

        <!-- 404数字 - Minecraft风格 -->
        <div class="pixel-text mb-8">
          <span class="text-4 pixel-digit">4</span>
          <span class="text-0 pixel-digit">0</span>
          <span class="text-4 pixel-digit">4</span>
        </div>

        <!-- 错误信息 -->
        <PixelCard variant="outlined" padding="lg" class="max-w-md mx-auto mb-8">
          <div class="text-center">
            <div class="flex justify-center mb-4">
              <MapPin :size="48" class="text-redstone-red" />
            </div>
            <h1 class="text-xl font-pixel text-white mb-4">
              <span class="text-grass-green">页面</span>未找到
            </h1>
            <p class="text-white/60 mb-2">
              你似乎迷失在了Minecraft的世界中...
            </p>
            <p class="text-sm text-white/40">
              这个区块尚未被开采，或者已经被删除
            </p>
          </div>
        </PixelCard>

        <!-- 搜索提示 -->
        <div class="search-hint mb-8">
          <PixelCard padding="md">
            <div class="flex items-center justify-center gap-2 text-white/50">
              <Search :size="16" />
              <span class="text-sm">尝试搜索或返回首页</span>
            </div>
          </PixelCard>
        </div>

        <!-- 返回首页按钮 -->
        <PixelButton variant="primary" size="lg" @click="goHome">
          <Home :size="16" />
          返回首页
        </PixelButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  background: 
    linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.1) 2px,
      rgba(0, 0, 0, 0.1) 4px
    );
  background-size: 100% 100%, 4px 4px;
}

/* 像素方块装饰 */
.pixel-blocks {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.block {
  width: 32px;
  height: 32px;
  box-shadow:
    2px 2px 0 rgba(0, 0, 0, 0.5),
    inset -1px -1px 0 rgba(0, 0, 0, 0.3),
    inset 1px 1px 0 rgba(255, 255, 255, 0.2);
  animation: float 2s ease-in-out infinite;
}

.block:nth-child(1) { animation-delay: 0s; }
.block:nth-child(2) { animation-delay: 0.2s; }
.block:nth-child(3) { animation-delay: 0.4s; }
.block:nth-child(4) { animation-delay: 0.6s; }
.block:nth-child(5) { animation-delay: 0.8s; }

.grass-block {
  background: linear-gradient(180deg, #2D5016 0%, #1A3A0D 50%, #3D2817 50%, #2A1F12 100%);
}

.dirt-block {
  background: linear-gradient(180deg, #8B4513 0%, #654321 50%, #4A3219 50%, #3D2817 100%);
}

.stone-block {
  background: linear-gradient(180deg, #808080 0%, #606060 30%, #505050 70%, #404040 100%);
}

.diamond-block {
  background: linear-gradient(135deg, #4AEDD9 0%, #3ADDC9 50%, #2CBDBA 100%);
  animation: float 2s ease-in-out infinite, sparkle 1.5s ease-in-out infinite;
}

.redstone-block {
  background: linear-gradient(180deg, #E74C3C 0%, #C0392B 50%, #922B21 100%);
  animation: float 2s ease-in-out infinite, glow 1.5s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes sparkle {
  0%, 100% { box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5), 0 0 10px rgba(74, 237, 217, 0.5); }
  50% { box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5), 0 0 20px rgba(74, 237, 217, 0.8); }
}

@keyframes glow {
  0%, 100% { box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5), 0 0 10px rgba(231, 76, 60, 0.5); }
  50% { box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5), 0 0 20px rgba(231, 76, 60, 0.8); }
}

/* 像素数字 */
.pixel-text {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.pixel-digit {
  font-family: 'Press Start 2P', 'VT323', monospace;
  text-shadow: 
    4px 4px 0 rgba(0, 0, 0, 0.8),
    -1px -1px 0 rgba(255, 255, 255, 0.1);
  animation: pixel-pulse 2s ease-in-out infinite;
}

.text-4:nth-child(1) { color: #4AEDD9; animation-delay: 0s; }
.text-0:nth-child(2) { color: #FFD700; animation-delay: 0.3s; }
.text-4:nth-child(3) { color: #E74C3C; animation-delay: 0.6s; }

@keyframes pixel-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.font-pixel {
  font-family: 'Press Start 2P', 'VT323', monospace;
}

.text-grass-green {
  color: #2D5016;
}

.text-redstone-red {
  color: #E74C3C;
}
</style>
