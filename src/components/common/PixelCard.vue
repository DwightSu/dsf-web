<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  variant?: 'default' | 'outlined' | 'glass'
  hoverable?: boolean
  clickable?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  hoverable: true,
  clickable: false,
  padding: 'md'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const cardClasses = computed(() => {
  const baseClasses = [
    'pixel-card',
    'relative',
    'overflow-hidden',
    'transition-all',
    'duration-300'
  ]

  // 像素边框样式
  const variantClasses = {
    default: [
      'bg-dark-surface',
      'border-2',
      'border-pixel-border',
      'shadow-pixel-card'
    ],
    outlined: [
      'bg-transparent',
      'border-2',
      'border-pixel-border',
      'shadow-none'
    ],
    glass: [
      'bg-dark-surface/50',
      'backdrop-blur-sm',
      'border',
      'border-white/10',
      'shadow-pixel-card'
    ]
  }

  // 内边距
  const paddingClasses = {
    sm: ['p-3'],
    md: ['p-4'],
    lg: ['p-6'],
    none: ['p-0']
  }

  // 悬停效果
  if (props.hoverable) {
    baseClasses.push(
      'hover:border-grass-green',
      'hover:shadow-pixel-card-hover',
      'hover:-translate-y-1'
    )
  }

  // 点击效果
  if (props.clickable) {
    baseClasses.push('cursor-pointer')
  }

  return cn(baseClasses, variantClasses[props.variant], paddingClasses[props.padding])
})

function handleClick(event: MouseEvent) {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<template>
  <div
    :class="cardClasses"
    @click="handleClick"
  >
    <!-- 像素化装饰角 -->
    <div class="pixel-corner pixel-corner-tl"></div>
    <div class="pixel-corner pixel-corner-tr"></div>
    <div class="pixel-corner pixel-corner-bl"></div>
    <div class="pixel-corner pixel-corner-br"></div>

    <!-- 卡片内容 -->
    <slot />
  </div>
</template>

<style scoped>
/* 像素卡片样式 */
.pixel-card {
  position: relative;
  /* 像素化阴影 */
  box-shadow:
    4px 4px 0 rgba(0, 0, 0, 0.5),
    inset -2px -2px 0 rgba(0, 0, 0, 0.3),
    inset 2px 2px 0 rgba(255, 255, 255, 0.05);
}

.shadow-pixel-card {
  box-shadow:
    4px 4px 0 rgba(0, 0, 0, 0.5),
    inset -2px -2px 0 rgba(0, 0, 0, 0.3),
    inset 2px 2px 0 rgba(255, 255, 255, 0.05);
}

.shadow-pixel-card-hover {
  box-shadow:
    6px 6px 0 rgba(0, 0, 0, 0.5),
    0 0 20px rgba(45, 80, 22, 0.3),
    inset -2px -2px 0 rgba(0, 0, 0, 0.3),
    inset 2px 2px 0 rgba(255, 255, 255, 0.05);
}

/* 像素化边框 */
.border-pixel-border {
  border-color: rgba(255, 255, 255, 0.1);
}

/* 深色背景 */
.bg-dark-surface {
  background-color: #1a1a2e;
}

/* 像素装饰角 */
.pixel-corner {
  position: absolute;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.1) 50%);
}

.pixel-corner-tl {
  top: 0;
  left: 0;
  transform: rotate(0deg);
}

.pixel-corner-tr {
  top: 0;
  right: 0;
  transform: rotate(90deg);
}

.pixel-corner-bl {
  bottom: 0;
  left: 0;
  transform: rotate(-90deg);
}

.pixel-corner-br {
  bottom: 0;
  right: 0;
  transform: rotate(180deg);
}

/* 悬停时的边框发光 */
.hover\:border-grass-green:hover {
  border-color: #2D5016;
}
</style>