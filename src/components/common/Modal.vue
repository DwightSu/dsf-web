<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'
import PixelButton from './PixelButton.vue'

interface Props {
  open: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  title: '',
  size: 'md',
  closable: true,
  closeOnOverlay: true,
  closeOnEscape: true
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  close: []
}>()

const modalRef = ref<HTMLDivElement | null>(null)

// 监听打开状态，控制滚动条
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// 处理ESC键关闭
function handleEscape(event: KeyboardEvent) {
  if (props.open && props.closeOnEscape && event.key === 'Escape') {
    closeModal()
  }
}

// 处理点击遮罩层关闭
function handleOverlayClick(event: MouseEvent) {
  if (props.closeOnOverlay && event.target === modalRef.value) {
    closeModal()
  }
}

// 关闭模态框
function closeModal() {
  emit('update:open', false)
  emit('close')
}

// 挂载和卸载时添加/移除事件监听
onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})

// 计算模态框尺寸类
const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        ref="modalRef"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        @click="handleOverlayClick"
      >
        <!-- 模态框内容 -->
        <div
          :class="[
            'pixel-modal',
            'relative',
            'w-full',
            sizeClasses[size],
            'bg-dark-surface',
            'border-2',
            'border-pixel-border',
            'shadow-pixel-modal',
            'overflow-hidden'
          ]"
          @click.stop
        >
          <!-- 像素装饰角 -->
          <div class="pixel-corner pixel-corner-tl"></div>
          <div class="pixel-corner pixel-corner-tr"></div>
          <div class="pixel-corner pixel-corner-bl"></div>
          <div class="pixel-corner pixel-corner-br"></div>

          <!-- 头部 -->
          <div v-if="title || closable" class="flex items-center justify-between p-4 border-b border-pixel-border">
            <h2 v-if="title" class="text-lg font-pixel text-white">
              {{ title }}
            </h2>
            <PixelButton
              v-if="closable"
              variant="ghost"
              size="sm"
              class="!p-1 !min-h-[32px]"
              @click="closeModal"
            >
              <X :size="16" />
            </PixelButton>
          </div>

          <!-- 内容区域 -->
          <div class="p-4 overflow-y-auto max-h-[70vh]">
            <slot />
          </div>

          <!-- 底部 -->
          <div v-if="$slots.footer" class="p-4 border-t border-pixel-border">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .pixel-modal,
.modal-leave-to .pixel-modal {
  transform: scale(0.9) translateY(20px);
}

/* 像素模态框样式 */
.pixel-modal {
  box-shadow:
    8px 8px 0 rgba(0, 0, 0, 0.5),
    inset -4px -4px 0 rgba(0, 0, 0, 0.3),
    inset 4px 4px 0 rgba(255, 255, 255, 0.05);
}

.shadow-pixel-modal {
  box-shadow:
    8px 8px 0 rgba(0, 0, 0, 0.5),
    inset -4px -4px 0 rgba(0, 0, 0, 0.3),
    inset 4px 4px 0 rgba(255, 255, 255, 0.05);
}

/* 像素装饰角 */
.pixel-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, transparent 50%, rgba(255, 255, 255, 0.1) 50%);
}

.pixel-corner-tl {
  top: 0;
  left: 0;
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

/* 深色背景 */
.bg-dark-surface {
  background-color: #1a1a2e;
}

.border-pixel-border {
  border-color: rgba(255, 255, 255, 0.1);
}

/* 像素字体 */
.font-pixel {
  font-family: 'Press Start 2P', 'VT323', monospace;
}
</style>