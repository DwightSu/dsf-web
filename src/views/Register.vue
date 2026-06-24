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
    <div class="floating-decorations">
      <div class="deco deco-1">🥔</div>
      <div class="deco deco-2">✨</div>
      <div class="deco deco-3">🌟</div>
      <div class="deco deco-4">💚</div>
      <div class="deco deco-5">🥔</div>
      <div class="deco deco-6">🍃</div>
      <div class="deco deco-7">🌱</div>
    </div>

    <div class="register-container" :class="{ 'is-loaded': isLoaded }">
      <div class="brand-section">
        <div class="brand-logo animate-bounce-soft">
          <span class="potato-emoji">🥔</span>
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

.floating-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.deco {
  position: absolute;
  font-size: 28px;
  opacity: 0.15;
  animation: float 6s ease-in-out infinite;
}

.deco-1 {
  top: 8%;
  left: 10%;
  animation-delay: 0s;
  font-size: 42px;
}

.deco-2 {
  top: 15%;
  right: 10%;
  animation-delay: 1s;
  font-size: 26px;
}

.deco-3 {
  top: 55%;
  left: 6%;
  animation-delay: 2s;
  font-size: 34px;
}

.deco-4 {
  top: 70%;
  right: 10%;
  animation-delay: 1.5s;
  font-size: 30px;
}

.deco-5 {
  top: 35%;
  right: 6%;
  animation-delay: 3s;
  font-size: 38px;
}

.deco-6 {
  bottom: 12%;
  left: 18%;
  animation-delay: 2.5s;
  font-size: 32px;
}

.deco-7 {
  top: 45%;
  left: 12%;
  animation-delay: 4s;
  font-size: 28px;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.register-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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
  background: linear-gradient(135deg, rgba(92, 184, 92, 0.2), rgba(126, 211, 33, 0.2));
  border: 2px solid rgba(92, 184, 92, 0.3);
  border-radius: 24px;
  margin-bottom: 16px;
  box-shadow: 0 8px 32px rgba(92, 184, 92, 0.2);
}

.potato-emoji {
  font-size: 44px;
  display: block;
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
  animation: scale-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
}

@keyframes scale-in {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
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
