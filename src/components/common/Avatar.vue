<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { getDefaultAvatar } from '@/utils/format'

interface Props {
  src?: string | null
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  rounded?: boolean
  bordered?: boolean
  seed?: string
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  alt: '头像',
  size: 'md',
  rounded: true,
  bordered: true,
  seed: ''
})

const avatarClasses = computed(() => {
  const sizeClasses = {
    xs: ['w-6', 'h-6'],
    sm: ['w-8', 'h-8'],
    md: ['w-12', 'h-12'],
    lg: ['w-16', 'h-16'],
    xl: ['w-24', 'h-24']
  }

  const baseClasses = [
    'pixel-avatar',
    'inline-block',
    'overflow-hidden',
    'bg-dark-surface',
    'border-2',
    'border-pixel-border',
    'shadow-pixel-avatar'
  ]

  if (props.rounded) {
    baseClasses.push('rounded-none') // Minecraft风格使用方形
  }

  if (props.bordered) {
    baseClasses.push('border-grass-green')
  }

  return cn(baseClasses, sizeClasses[props.size])
})

const avatarSrc = computed(() => {
  if (props.src) {
    return props.src
  }
  // 使用DiceBear生成像素风格头像
  return getDefaultAvatar(props.seed || props.alt)
})
</script>

<template>
  <div :class="avatarClasses">
    <img
      :src="avatarSrc"
      :alt="alt"
      class="w-full h-full object-cover pixelated"
      loading="lazy"
    />
  </div>
</template>

<style scoped>
/* 像素头像样式 */
.pixel-avatar {
  box-shadow:
    2px 2px 0 rgba(0, 0, 0, 0.5),
    inset -1px -1px 0 rgba(0, 0, 0, 0.3),
    inset 1px 1px 0 rgba(255, 255, 255, 0.1);
}

.shadow-pixel-avatar {
  box-shadow:
    2px 2px 0 rgba(0, 0, 0, 0.5),
    inset -1px -1px 0 rgba(0, 0, 0, 0.3),
    inset 1px 1px 0 rgba(255, 255, 255, 0.1);
}

/* 像素化图片效果 */
.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

/* 深色背景 */
.bg-dark-surface {
  background-color: #1a1a2e;
}

.border-pixel-border {
  border-color: rgba(255, 255, 255, 0.1);
}

.border-grass-green {
  border-color: #2D5016;
}
</style>