<script setup lang="ts">
import { ref, computed } from 'vue'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-vue-next'

interface Props {
  modelValue: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '搜索...',
  size: 'md',
  disabled: false,
  clearable: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
  clear: []
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)

const inputClasses = computed(() => {
  const sizeClasses = {
    sm: ['text-xs', 'px-2', 'py-1', 'min-h-[32px]'],
    md: ['text-sm', 'px-3', 'py-2', 'min-h-[40px]'],
    lg: ['text-base', 'px-4', 'py-3', 'min-h-[48px]']
  }

  const baseClasses = [
    'pixel-input',
    'w-full',
    'bg-dark-surface',
    'border-2',
    'border-pixel-border',
    'text-white',
    'placeholder-white/50',
    'outline-none',
    'transition-all',
    'duration-200',
    'font-pixel'
  ]

  if (isFocused.value) {
    baseClasses.push('border-grass-green', 'shadow-pixel-input-focus')
  }

  if (props.disabled) {
    baseClasses.push('opacity-50', 'cursor-not-allowed')
  }

  return cn(baseClasses, sizeClasses[props.size])
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleSearch() {
  emit('search', props.modelValue)
}

function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

function handleFocus() {
  isFocused.value = true
}

function handleBlur() {
  isFocused.value = false
}
</script>

<template>
  <div class="relative flex items-center">
    <!-- 搜索图标 -->
    <Search
      :size="size === 'sm' ? 14 : size === 'md' ? 16 : 18"
      class="absolute left-3 text-white/50"
    />

    <!-- 输入框 -->
    <input
      ref="inputRef"
      :class="inputClasses"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      type="text"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keyup.enter="handleSearch"
    />

    <!-- 清除按钮 -->
    <button
      v-if="clearable && modelValue"
      class="absolute right-3 text-white/50 hover:text-white transition-colors"
      @click="handleClear"
    >
      <X :size="size === 'sm' ? 14 : size === 'md' ? 16 : 18" />
    </button>
  </div>
</template>

<style scoped>
/* 像素输入框样式 */
.pixel-input {
  box-shadow:
    2px 2px 0 rgba(0, 0, 0, 0.5),
    inset -1px -1px 0 rgba(0, 0, 0, 0.3),
    inset 1px 1px 0 rgba(255, 255, 255, 0.05);
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}

.shadow-pixel-input-focus {
  box-shadow:
    2px 2px 0 rgba(0, 0, 0, 0.5),
    0 0 10px rgba(45, 80, 22, 0.3),
    inset -1px -1px 0 rgba(0, 0, 0, 0.3),
    inset 1px 1px 0 rgba(255, 255, 255, 0.05);
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

/* 像素字体 */
.font-pixel {
  font-family: 'Press Start 2P', 'VT323', monospace;
}
</style>