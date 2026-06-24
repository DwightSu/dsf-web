<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  User,
  Hash,
  Shield,
  Calendar,
  Camera,
  Edit3,
  Key,
  Lock,
  Save,
  Eye,
  EyeOff,
  Check,
  X,
  LogOut,
  Settings,
  Sparkles
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { validateNickname, validatePassword, validateConfirmPassword } from '@/utils/validation'

const router = useRouter()
const authStore = useAuthStore()

const fileInputRef = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(null)
const isUploadingAvatar = ref(false)

const isEditingNickname = ref(false)
const nicknameInput = ref('')
const nicknameError = ref('')
const isSavingNickname = ref(false)

const showPasswordForm = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const passwordErrors = ref<{
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}>({})
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isChangingPassword = ref(false)

const toast = ref<{ show: boolean; type: 'success' | 'error'; message: string }>({
  show: false,
  type: 'success',
  message: ''
})

const isAdmin = computed(() => authStore.user?.role === 'admin')

const formattedDate = computed(() => {
  if (!authStore.user?.created_at) return '-'
  const date = new Date(authStore.user.created_at)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

function showToast(type: 'success' | 'error', message: string) {
  toast.value = { show: true, type, message }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

function triggerAvatarUpload() {
  fileInputRef.value?.click()
}

function handleAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const validTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!validTypes.includes(file.type)) {
    showToast('error', '只支持 JPG、PNG、GIF 格式的图片')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const maxSize = 200
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      avatarPreview.value = canvas.toDataURL('image/png')
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

async function saveAvatar() {
  if (!avatarPreview.value) return

  isUploadingAvatar.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    authStore.updateAvatar(avatarPreview.value)
    avatarPreview.value = null
    showToast('success', '头像更新成功！')
  } catch (error) {
    showToast('error', '头像更新失败，请稍后重试')
  } finally {
    isUploadingAvatar.value = false
  }
}

function cancelAvatarEdit() {
  avatarPreview.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function startEditNickname() {
  nicknameInput.value = authStore.user?.nickname || ''
  nicknameError.value = ''
  isEditingNickname.value = true
}

function cancelEditNickname() {
  isEditingNickname.value = false
  nicknameInput.value = ''
  nicknameError.value = ''
}

async function saveNickname() {
  const validation = validateNickname(nicknameInput.value)
  if (!validation.valid) {
    nicknameError.value = validation.message
    return
  }

  isSavingNickname.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    authStore.updateUser({ nickname: nicknameInput.value })
    isEditingNickname.value = false
    nicknameError.value = ''
    showToast('success', '昵称修改成功！')
  } catch (error) {
    showToast('error', '昵称修改失败，请稍后重试')
  } finally {
    isSavingNickname.value = false
  }
}

function togglePasswordForm() {
  showPasswordForm.value = !showPasswordForm.value
  if (!showPasswordForm.value) {
    currentPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
    passwordErrors.value = {}
    showCurrentPassword.value = false
    showNewPassword.value = false
    showConfirmPassword.value = false
  }
}

async function handleChangePassword() {
  passwordErrors.value = {}

  if (!currentPassword.value) {
    passwordErrors.value.currentPassword = '请输入当前密码'
    return
  }

  const newPasswordValidation = validatePassword(newPassword.value)
  if (!newPasswordValidation.valid) {
    passwordErrors.value.newPassword = newPasswordValidation.message
    return
  }

  const confirmValidation = validateConfirmPassword(newPassword.value, confirmNewPassword.value)
  if (!confirmValidation.valid) {
    passwordErrors.value.confirmPassword = confirmValidation.message
    return
  }

  isChangingPassword.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    showToast('success', '密码修改成功！')
    togglePasswordForm()
  } catch (error) {
    showToast('error', '密码修改失败，请稍后重试')
  } finally {
    isChangingPassword.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="profile-page min-h-screen py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 mb-2">
          <Sparkles class="w-6 h-6 text-potato-gold" />
          <h1 class="text-3xl font-bold bg-gradient-to-r from-potato-gold to-grass-green bg-clip-text text-transparent">
            毒薯服个人中心
          </h1>
          <Sparkles class="w-6 h-6 text-grass-green" />
        </div>
        <p class="text-gray-500">管理你的账号信息和设置</p>
      </div>

      <div class="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div class="bg-gradient-to-r from-grass-green via-potato-gold to-potato-orange h-32 relative">
          <div class="absolute inset-0 bg-white/10"></div>
          <div class="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <div class="relative group">
              <div class="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                <img
                  :src="avatarPreview || authStore.user?.avatar_url || ''"
                  :alt="authStore.user?.nickname"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                @click="triggerAvatarUpload"
              >
                <Camera class="w-10 h-10 text-white" />
              </div>
              <input
                ref="fileInputRef"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                class="hidden"
                @change="handleAvatarChange"
              />
            </div>
          </div>
        </div>

        <div class="pt-20 pb-6 px-6">
          <div class="text-center mb-8">
            <div v-if="!isEditingNickname" class="flex items-center justify-center gap-2 mb-2">
              <h2 class="text-2xl font-bold text-gray-800">{{ authStore.user?.nickname }}</h2>
              <button
                class="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-grass-green"
                @click="startEditNickname"
              >
                <Edit3 class="w-4 h-4" />
              </button>
            </div>
            <div v-else class="mb-2">
              <div class="flex items-center justify-center gap-2 max-w-xs mx-auto">
                <input
                  v-model="nicknameInput"
                  type="text"
                  class="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-grass-green focus:outline-none focus:ring-4 focus:ring-grass-green/20 transition-all text-center"
                  placeholder="输入新昵称"
                  maxlength="50"
                  @keyup.enter="saveNickname"
                />
                <button
                  class="p-2 rounded-xl bg-grass-green text-white hover:bg-grass-green/90 transition-colors disabled:opacity-50"
                  :disabled="isSavingNickname"
                  @click="saveNickname"
                >
                  <Save v-if="!isSavingNickname" class="w-4 h-4" />
                  <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </button>
                <button
                  class="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                  @click="cancelEditNickname"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
              <p v-if="nicknameError" class="text-red-500 text-sm mt-2">{{ nicknameError }}</p>
            </div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm"
                 :class="isAdmin ? 'bg-potato-gold/20 text-potato-gold' : 'bg-gray-100 text-gray-600'">
              <Shield class="w-3.5 h-3.5" />
              {{ isAdmin ? '管理员' : '普通用户' }}
            </div>
          </div>

          <div v-if="avatarPreview" class="mb-6 p-4 bg-grass-green/5 rounded-2xl border border-grass-green/20">
            <p class="text-sm text-gray-600 mb-3 text-center">预览新头像</p>
            <div class="flex justify-center gap-3">
              <button
                class="px-4 py-2 rounded-xl bg-grass-green text-white text-sm font-medium hover:bg-grass-green/90 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center gap-2"
                :disabled="isUploadingAvatar"
                @click="saveAvatar"
              >
                <Check v-if="!isUploadingAvatar" class="w-4 h-4" />
                <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                保存头像
              </button>
              <button
                class="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-all flex items-center gap-2"
                @click="cancelAvatarEdit"
              >
                <X class="w-4 h-4" />
                取消
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <div class="info-item flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100/80 transition-colors">
              <div class="w-12 h-12 rounded-xl bg-grass-green/10 flex items-center justify-center flex-shrink-0">
                <Hash class="w-5 h-5 text-grass-green" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-500">QQ号</p>
                <p class="font-semibold text-gray-800 truncate">{{ authStore.user?.qq_number || '-' }}</p>
              </div>
            </div>

            <div class="info-item flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100/80 transition-colors">
              <div class="w-12 h-12 rounded-xl bg-potato-gold/10 flex items-center justify-center flex-shrink-0">
                <Shield class="w-5 h-5 text-potato-gold" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-500">角色</p>
                <p class="font-semibold text-gray-800">{{ isAdmin ? '管理员' : '普通用户' }}</p>
              </div>
            </div>

            <div class="info-item flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100/80 transition-colors">
              <div class="w-12 h-12 rounded-xl bg-potato-orange/10 flex items-center justify-center flex-shrink-0">
                <Calendar class="w-5 h-5 text-potato-orange" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-500">注册时间</p>
                <p class="font-semibold text-gray-800">{{ formattedDate }}</p>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <button
              class="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-gray-100 hover:border-grass-green/30 hover:bg-grass-green/5 transition-all group"
              @click="togglePasswordForm"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-grass-green/10 flex items-center justify-center transition-colors">
                  <Key class="w-5 h-5 text-gray-500 group-hover:text-grass-green transition-colors" />
                </div>
                <div class="text-left">
                  <p class="font-semibold text-gray-800">修改密码</p>
                  <p class="text-sm text-gray-500">更新你的登录密码</p>
                </div>
              </div>
              <div class="text-gray-400 group-hover:text-grass-green transition-colors">
                <Edit3 class="w-5 h-5" />
              </div>
            </button>

            <div
              v-if="showPasswordForm"
              class="mt-4 p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-fade-in"
            >
              <form @submit.prevent="handleChangePassword" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">当前密码</label>
                  <div class="relative">
                    <input
                      v-model="currentPassword"
                      :type="showCurrentPassword ? 'text' : 'password'"
                      class="w-full px-4 py-3 pl-11 pr-11 border-2 border-gray-200 rounded-xl focus:border-grass-green focus:outline-none focus:ring-4 focus:ring-grass-green/20 transition-all"
                      placeholder="输入当前密码"
                    />
                    <Key class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      @click="showCurrentPassword = !showCurrentPassword"
                    >
                      <component :is="showCurrentPassword ? EyeOff : Eye" class="w-5 h-5" />
                    </button>
                  </div>
                  <p v-if="passwordErrors.currentPassword" class="text-red-500 text-sm mt-1.5">
                    {{ passwordErrors.currentPassword }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">新密码</label>
                  <div class="relative">
                    <input
                      v-model="newPassword"
                      :type="showNewPassword ? 'text' : 'password'"
                      class="w-full px-4 py-3 pl-11 pr-11 border-2 border-gray-200 rounded-xl focus:border-grass-green focus:outline-none focus:ring-4 focus:ring-grass-green/20 transition-all"
                      placeholder="输入新密码"
                    />
                    <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      @click="showNewPassword = !showNewPassword"
                    >
                      <component :is="showNewPassword ? EyeOff : Eye" class="w-5 h-5" />
                    </button>
                  </div>
                  <p v-if="passwordErrors.newPassword" class="text-red-500 text-sm mt-1.5">
                    {{ passwordErrors.newPassword }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">确认新密码</label>
                  <div class="relative">
                    <input
                      v-model="confirmNewPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="w-full px-4 py-3 pl-11 pr-11 border-2 border-gray-200 rounded-xl focus:border-grass-green focus:outline-none focus:ring-4 focus:ring-grass-green/20 transition-all"
                      placeholder="再次输入新密码"
                      @keyup.enter="handleChangePassword"
                    />
                    <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <component :is="showConfirmPassword ? EyeOff : Eye" class="w-5 h-5" />
                    </button>
                  </div>
                  <p v-if="passwordErrors.confirmPassword" class="text-red-500 text-sm mt-1.5">
                    {{ passwordErrors.confirmPassword }}
                  </p>
                </div>

                <div class="flex gap-3 pt-2">
                  <button
                    type="button"
                    class="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
                    @click="togglePasswordForm"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    class="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-grass-green to-grass-green/80 text-white font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                    :disabled="isChangingPassword"
                  >
                    <Save v-if="!isChangingPassword" class="w-4 h-4" />
                    <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    确认修改
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-gray-100 space-y-3">
            <button
              v-if="isAdmin"
              class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-potato-gold/10 text-potato-gold font-medium hover:bg-potato-gold/20 transition-all"
              @click="$router.push('/admin')"
            >
              <Settings class="w-5 h-5" />
              管理后台
            </button>
            <button
              class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-500 font-medium hover:bg-red-100 transition-all"
              @click="handleLogout"
            >
              <LogOut class="w-5 h-5" />
              退出登录
            </button>
          </div>
        </div>
      </div>

      <div class="text-center mt-8">
        <p class="text-sm text-gray-400">
          🥔 毒薯服 Minecraft 服务器 · 与小伙伴们一起冒险！
        </p>
      </div>
    </div>

    <Transition name="toast">
      <div
        v-if="toast.show"
        class="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3"
        :class="toast.type === 'success' ? 'bg-grass-green text-white' : 'bg-red-500 text-white'"
      >
        <Check v-if="toast.type === 'success'" class="w-5 h-5" />
        <X v-else class="w-5 h-5" />
        <span class="font-medium">{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.profile-page {
  background: linear-gradient(135deg, #f0fdf4 0%, #fffbeb 50%, #fef3c7 100%);
  min-height: 100vh;
}

:deep(.grayscale) {
  filter: grayscale(100%);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.bg-grass-green {
  background-color: #5CB85C;
}

.text-grass-green {
  color: #5CB85C;
}

.border-grass-green {
  border-color: #5CB85C;
}

.bg-potato-gold {
  background-color: #F0AD4E;
}

.text-potato-gold {
  color: #F0AD4E;
}

.bg-potato-orange {
  background-color: #E67E22;
}

.text-potato-orange {
  color: #E67E22;
}

.from-grass-green {
  --tw-gradient-from: #5CB85C;
}

.via-potato-gold {
  --tw-gradient-via: #F0AD4E;
}

.to-potato-orange {
  --tw-gradient-to: #E67E22;
}

.to-grass-green\/80 {
  --tw-gradient-to: rgb(92 184 92 / 0.8);
}

.ring-grass-green\/20 {
  --tw-ring-color: rgb(92 184 92 / 0.2);
}

.bg-grass-green\/10 {
  background-color: rgb(92 184 92 / 0.1);
}

.bg-grass-green\/5 {
  background-color: rgb(92 184 92 / 0.05);
}

.border-grass-green\/20 {
  border-color: rgb(92 184 92 / 0.2);
}

.border-grass-green\/30 {
  border-color: rgb(92 184 92 / 0.3);
}

.bg-potato-gold\/10 {
  background-color: rgb(240 173 78 / 0.1);
}

.bg-potato-gold\/20 {
  background-color: rgb(240 173 78 / 0.2);
}

.bg-potato-orange\/10 {
  background-color: rgb(230 126 34 / 0.1);
}

.hover\:bg-grass-green\/90:hover {
  background-color: rgb(92 184 92 / 0.9);
}

.hover\:bg-grass-green\/20:hover {
  background-color: rgb(92 184 92 / 0.2);
}

.hover\:bg-grass-green\/5:hover {
  background-color: rgb(92 184 92 / 0.05);
}

.hover\:border-grass-green\/30:hover {
  border-color: rgb(92 184 92 / 0.3);
}

.hover\:text-grass-green:hover {
  color: #5CB85C;
}
</style>
