<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'diamond' | 'grass' | 'stone' | 'gold'
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default',
  text: '加载中...'
})

const spinnerClasses = computed(() => {
  const sizeClasses = {
    sm: ['w-4', 'h-4'],
    md: ['w-8', 'h-8'],
    lg: ['w-12', 'h-12']
  }

  return cn('pixel-spinner', 'inline-block', sizeClasses[props.size])
})

const colorClasses = computed(() => {
  const colors = {
    default: 'border-white',
    diamond: 'border-diamond-blue',
    grass: 'border-grass-green',
    stone: 'border-stone-gray',
    gold: 'border-gold-yellow'
  }

  return colors[props.variant]
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3">
    <!-- Minecraft风格的方块旋转加载动画 -->
    <div :class="spinnerClasses">
      <div class="pixel-block pixel-block-1" :class="colorClasses"></div>
      <div class="pixel-block pixel-block-2" :class="colorClasses"></div>
      <div class="pixel-block pixel-block-3" :class="colorClasses"></div>
      <div class="pixel-block pixel-block-4" :class="colorClasses"></div>
    </div>

    <!-- 加载文字 -->
    <p v-if="text" class="text-sm text-white/70 font-pixel animate-pulse">
      {{ text }}
    </p>
  </div>
</template>

<style scoped>
/* 像素加载动画 - Minecraft方块风格 */
.pixel-spinner {
  position: relative;
  animation: pixel-rotate 2s linear infinite;
}

.pixel-block {
  position: absolute;
  width: 40%;
  height: 40%;
  border: 2px solid;
  background: rgba(0, 0, 0, 0.3);
  box-shadow:
    inset -1px -1px 0 rgba(0, 0, 0, 0.5),
    inset 1px 1px 0 rgba(255, 255, 255, 0.1);
}

.pixel-block-1 {
  top: 0;
  left: 0;
  animation: pixel-pulse 0.5s ease-in-out infinite;
}

.pixel-block-2 {
  top: 0;
  right: 0;
  animation: pixel-pulse 0.5s ease-in-out infinite 0.125s;
}

.pixel-block-3 {
  bottom: 0;
  right: 0;
  animation: pixel-pulse 0.5s ease-in-out infinite 0.25s;
}

.pixel-block-4 {
  bottom: 0;
  left: 0;
  animation: pixel-pulse 0.5s ease-in-out infinite 0.375s;
}

@keyframes pixel-rotate {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(90deg); }
  50% { transform: rotate(180deg); }
  75% { transform: rotate(270deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pixel-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Minecraft配色 */
.border-diamond-blue {
  border-color: #4AEDD9;
}

.border-grass-green {
  border-color: #2D5016;
}

.border-stone-gray {
  border-color: #708090;
}

.border-gold-yellow {
  border-color: #FFD700;
}

/* 像素字体 */
.font-pixel {
  font-family: 'Press Start 2P', 'VT323', monospace;
}
</style>