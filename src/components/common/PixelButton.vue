<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const baseClasses = [
    'pixel-button',
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'font-pixel',
    'text-center',
    'uppercase',
    'tracking-wider',
    'transition-all',
    'duration-200',
    'border-2',
    'shadow-pixel',
    'hover:shadow-pixel-lg',
    'hover:-translate-y-0.5',
    'active:translate-y-0',
    'active:shadow-pixel-sm',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:hover:translate-y-0',
    'disabled:hover:shadow-pixel'
  ]

  if (props.block) {
    baseClasses.push('w-full')
  }

  // 尺寸样式
  const sizeClasses = {
    sm: ['text-xs', 'px-3', 'py-1.5', 'min-h-[32px]'],
    md: ['text-sm', 'px-4', 'py-2', 'min-h-[40px]'],
    lg: ['text-base', 'px-6', 'py-3', 'min-h-[48px]']
  }

  // 变体样式 - Minecraft风格配色
  const variantClasses = {
    primary: [
      'bg-grass-green',
      'border-grass-green-dark',
      'text-white',
      'hover:bg-grass-green-light'
    ],
    secondary: [
      'bg-stone-gray',
      'border-stone-gray-dark',
      'text-white',
      'hover:bg-stone-gray-light'
    ],
    danger: [
      'bg-redstone-red',
      'border-redstone-red-dark',
      'text-white',
      'hover:bg-redstone-red-light'
    ],
    success: [
      'bg-diamond-blue',
      'border-diamond-blue-dark',
      'text-white',
      'hover:bg-diamond-blue-light'
    ],
    ghost: [
      'bg-transparent',
      'border-grass-green',
      'text-grass-green',
      'hover:bg-grass-green/10'
    ]
  }

  return cn(baseClasses, sizeClasses[props.size], variantClasses[props.variant])
})

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- 加载动画 -->
    <span v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <span class="loading-spinner"></span>
    </span>

    <!-- 内容 -->
    <span :class="{ 'opacity-0': loading }" class="flex items-center gap-2">
      <slot />
    </span>
  </button>
</template>

<style scoped>
/* Minecraft像素风格按钮 */
.pixel-button {
  /* 使用像素字体 */
  font-family: 'Press Start 2P', 'VT323', monospace;
  /* 圆角像素边框效果 */
  border-radius: 0.75rem;
  box-shadow:
    4px 4px 0 rgba(0, 0, 0, 0.3),
    inset -2px -2px 0 rgba(0, 0, 0, 0.2),
    inset 2px 2px 0 rgba(255, 255, 255, 0.1);
}

.shadow-pixel {
  box-shadow:
    4px 4px 0 rgba(0, 0, 0, 0.3),
    inset -2px -2px 0 rgba(0, 0, 0, 0.2),
    inset 2px 2px 0 rgba(255, 255, 255, 0.1);
}

.shadow-pixel-lg {
  box-shadow:
    6px 6px 0 rgba(0, 0, 0, 0.3),
    inset -2px -2px 0 rgba(0, 0, 0, 0.2),
    inset 2px 2px 0 rgba(255, 255, 255, 0.1);
}

.shadow-pixel-sm {
  box-shadow:
    2px 2px 0 rgba(0, 0, 0, 0.3),
    inset -2px -2px 0 rgba(0, 0, 0, 0.2),
    inset 2px 2px 0 rgba(255, 255, 255, 0.1);
}

/* Minecraft配色 */
.bg-grass-green {
  background-color: #2D5016;
}
.bg-grass-green-light {
  background-color: #3D6B1E;
}
.border-grass-green {
  border-color: #2D5016;
}
.border-grass-green-dark {
  border-color: #1A3A0D;
}
.text-grass-green {
  color: #2D5016;
}

.bg-stone-gray {
  background-color: #708090;
}
.bg-stone-gray-light {
  background-color: #8A9AA8;
}
.border-stone-gray-dark {
  border-color: #5A6A78;
}

.bg-redstone-red {
  background-color: #E74C3C;
}
.bg-redstone-red-light {
  background-color: #FF5F4F;
}
.border-redstone-red-dark {
  border-color: #C0392B;
}

.bg-diamond-blue {
  background-color: #4AEDD9;
}
.bg-diamond-blue-light {
  background-color: #6AFFE9;
}
.border-diamond-blue-dark {
  border-color: #3ADDC9;
}

.bg-gold-yellow {
  background-color: #FFD700;
}
.border-gold-yellow-dark {
  border-color: #DAA520;
}

/* 加载动画 */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 像素字体 */
.font-pixel {
  font-family: 'Press Start 2P', 'VT323', monospace;
  letter-spacing: 0.05em;
}
</style>