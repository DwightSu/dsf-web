<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 初始化认证状态
onMounted(async () => {
  await authStore.initialize()
})
</script>

<template>
  <div class="app-container min-h-screen flex flex-col bg-dark-bg">
    <!-- 导航栏 -->
    <Navbar />

    <!-- 主内容区域 -->
    <main class="main-content flex-grow pt-16">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>

    <!-- 页脚 -->
    <Footer />
  </div>
</template>

<style>
/* 全局样式 */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

/* Minecraft配色 */
.bg-dark-bg {
  background-color: #0f0f23;
}

/* 像素字体 */
.font-pixel {
  font-family: 'Press Start 2P', 'VT323', monospace;
}

/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a2e;
}

::-webkit-scrollbar-thumb {
  background: #2D5016;
  border-radius: 0;
}

::-webkit-scrollbar-thumb:hover {
  background: #3D6B1E;
}

/* 全局选中文字样式 */
::selection {
  background: #2D5016;
  color: white;
}
</style>