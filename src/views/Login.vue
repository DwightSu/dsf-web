<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { Hash, Lock, LogIn } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { validateQQNumber, validatePassword } from '@/utils/validation'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const qqNumber = ref('')
const password = ref('')
const errors = ref<{ qqNumber?: string; password?: string }>({})
const isLoaded = ref(false)

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})

async function handleLogin() {
  const qqValidation = validateQQNumber(qqNumber.value)
  const passwordValidation = validatePassword(password.value)

  if (!qqValidation.valid) {
    errors.value.qqNumber = qqValidation.message
    return
  }

  if (!passwordValidation.valid) {
    errors.value.password = passwordValidation.message
    return
  }

  errors.value = {}

  const result = await authStore.login(qqNumber.value, password.value)

  if (result.success) {
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-container" :class="{ 'is-loaded': isLoaded }">
      <div class="brand-section">
        <div class="brand-logo">
          <img src="/assets/images/poison-potato.svg" alt="毒薯服logo" class="logo-img" />
        </div>
        <h1 class="brand-title">
          <span class="text-gradient-green">毒薯服</span>
        </h1>
        <p class="brand-subtitle">欢迎回来，小土豆！</p>
      </div>

      <div class="login-card mc-card">
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-header">
            <h2 class="form-title">登录账号</h2>
            <p class="form-desc">输入你的QQ号和密码继续</p>
          </div>

          <div class="form-group">
            <label class="form-label">QQ号</label>
            <div class="mc-input-group">
              <Hash :size="18" class="input-icon" />
              <input
                v-model="qqNumber"
                type="text"
                class="mc-input"
                placeholder="请输入QQ号"
                @input="errors.qqNumber = ''"
              />
            </div>
            <p v-if="errors.qqNumber" class="error-message">
              {{ errors.qqNumber }}
            </p>
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <div class="mc-input-group">
              <Lock :size="18" class="input-icon" />
              <input
                v-model="password"
                type="password"
                class="mc-input"
                placeholder="请输入密码"
                @keyup.enter="handleLogin"
                @input="errors.password = ''"
              />
            </div>
            <p v-if="errors.password" class="error-message">
              {{ errors.password }}
            </p>
          </div>

          <p v-if="authStore.error" class="error-message error-alert">
            {{ authStore.error }}
          </p>

          <button
            type="submit"
            class="mc-btn mc-btn-primary login-btn"
            :disabled="authStore.loading"
          >
            <template v-if="authStore.loading">
              <svg class="spin-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
              </svg>
              登录中...
            </template>
            <template v-else>
              <LogIn :size="18" />
              登录
            </template>
          </button>

          <div class="register-link">
            还没有账号？
            <RouterLink to="/register" class="link-text">
              立即注册
            </RouterLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1a2744 0%, #243447 50%, #1a2744 100%);
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
}

.login-container.is-loaded {
  opacity: 1;
  transform: translateY(0);
}

.brand-section {
  text-align: center;
  margin-bottom: 28px;
}

.brand-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  position: relative;
}

.logo-img {
  width: 80px;
  height: 80px;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

.brand-title {
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
}

.brand-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
}

.login-card {
  padding: 36px 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-header {
  text-align: center;
  margin-bottom: 4px;
}

.form-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 6px 0;
}

.form-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-left: 2px;
}

.error-message {
  font-size: 12px;
  color: var(--color-redstone-red-light);
  margin: 4px 2px 0;
  padding: 8px 12px;
  background: rgba(217, 83, 79, 0.1);
  border: 1px solid rgba(217, 83, 79, 0.2);
  border-radius: var(--radius-sm);
  animation: shake 0.4s ease-in-out;
}

.error-alert {
  text-align: center;
  margin-top: 4px;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

.login-btn {
  width: 100%;
  padding: 14px 24px;
  font-size: 15px;
  font-weight: 700;
  margin-top: 8px;
  border-radius: var(--radius-md);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

.spin-icon {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.register-link {
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.link-text {
  color: var(--color-grass-green-light);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.link-text:hover {
  color: var(--color-grass-green);
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    padding: 28px 24px;
  }

  .brand-title {
    font-size: 26px;
  }

  .brand-logo {
    width: 68px;
    height: 68px;
    border-radius: 20px;
  }

  .potato-emoji {
    font-size: 36px;
  }
}
</style>
