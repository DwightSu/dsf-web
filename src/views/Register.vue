<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { User, Hash, Lock, UserPlus } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import {
  validatePassword,
  validateNickname,
  validateQQNumber,
  validateConfirmPassword
} from '@/utils/validation'
import PotatoIcon from '@/components/icons/PotatoIcon.vue'

const router = useRouter()
const authStore = useAuthStore()

const nickname = ref('')
const qqNumber = ref('')
const password = ref('')
const confirmPassword = ref('')
const errors = ref<{
  nickname?: string
  qqNumber?: string
  password?: string
  confirmPassword?: string
}>({})
const isLoaded = ref(false)

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true
  }, 100)
})

async function handleRegister() {
  const validations = [
    { key: 'nickname', result: validateNickname(nickname.value) },
    { key: 'qqNumber', result: validateQQNumber(qqNumber.value) },
    { key: 'password', result: validatePassword(password.value) },
    { key: 'confirmPassword', result: validateConfirmPassword(password.value, confirmPassword.value) }
  ]

  const hasErrors = validations.some(v => !v.result.valid)

  if (hasErrors) {
    validations.forEach(v => {
      if (!v.result.valid) {
        errors.value[v.key as keyof typeof errors.value] = v.result.message
      }
    })
    return
  }

  errors.value = {}

  const result = await authStore.register({
    nickname: nickname.value,
    qq_number: qqNumber.value,
    password: password.value
  })

  if (result.success) {
    router.push('/')
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-container" :class="{ 'is-loaded': isLoaded }">
      <div class="brand-section">
        <div class="brand-logo">
          <div class="logo-inner">
            <PotatoIcon size="xl" />
          </div>
        </div>
        <h1 class="brand-title">
          <span class="text-gradient-green">毒薯服</span>
        </h1>
        <p class="brand-subtitle">加入我们，开启你的冒险！</p>
      </div>

      <div class="register-card mc-card">
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-header">
            <h2 class="form-title">创建账号</h2>
            <p class="form-desc">填写信息，成为小土豆的一员</p>
          </div>

          <div class="form-group">
            <label class="form-label">昵称</label>
            <div class="mc-input-group">
              <User :size="18" class="input-icon" />
              <input
                v-model="nickname"
                type="text"
                class="mc-input"
                placeholder="请输入昵称"
                @input="errors.nickname = ''"
              />
            </div>
            <p v-if="errors.nickname" class="error-message">
              {{ errors.nickname }}
            </p>
          </div>

          <div class="form-group">
            <label class="form-label">QQ号 <span class="text-muted">(登录账号)</span></label>
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
                placeholder="请输入密码（至少6位）"
                @input="errors.password = ''"
              />
            </div>
            <p v-if="errors.password" class="error-message">
              {{ errors.password }}
            </p>
          </div>

          <div class="form-group">
            <label class="form-label">确认密码</label>
            <div class="mc-input-group">
              <Lock :size="18" class="input-icon" />
              <input
                v-model="confirmPassword"
                type="password"
                class="mc-input"
                placeholder="请再次输入密码"
                @keyup.enter="handleRegister"
                @input="errors.confirmPassword = ''"
              />
            </div>
            <p v-if="errors.confirmPassword" class="error-message">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <p v-if="authStore.error" class="error-message error-alert">
            {{ authStore.error }}
          </p>

          <button
            type="submit"
            class="mc-btn mc-btn-primary register-btn"
            :disabled="authStore.loading"
          >
            <template v-if="authStore.loading">
              <svg class="spin-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
              </svg>
              注册中...
            </template>
            <template v-else>
              <UserPlus :size="18" />
              立即注册
            </template>
          </button>

          <div class="login-link">
            已有账号？
            <RouterLink to="/login" class="link-text">
              立即登录
            </RouterLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1a2744 0%, #243447 50%, #1a2744 100%);
}

.register-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
}

.register-container.is-loaded {
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

.logo-inner {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
  border-radius: 24px;
  transform: rotate(6deg);
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
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

.register-card {
  padding: 36px 32px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
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

.text-muted {
  color: var(--color-text-muted);
  font-weight: 400;
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

.register-btn {
  width: 100%;
  padding: 14px 24px;
  font-size: 15px;
  font-weight: 700;
  margin-top: 8px;
  border-radius: var(--radius-md);
}

.register-btn:disabled {
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

.login-link {
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
  .register-card {
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
