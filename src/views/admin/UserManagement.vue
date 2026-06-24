<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  Users,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/utils/format'
import type { AuthUser } from '@/stores/auth'

const authStore = useAuthStore()

const users = ref<AuthUser[]>([])
const searchQuery = ref('')
const roleFilter = ref('all')
const currentPage = ref(1)
const pageSize = 8

const showDeleteModal = ref(false)
const showRoleModal = ref(false)
const selectedUser = ref<AuthUser | null>(null)
const targetRole = ref<'user' | 'admin'>('user')
const actionLoading = ref(false)

const filteredUsers = computed(() => {
  let result = [...users.value]

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(
      u =>
        u.nickname.toLowerCase().includes(query) ||
        u.qq_number.includes(query)
    )
  }

  if (roleFilter.value !== 'all') {
    result = result.filter(u => u.role === roleFilter.value)
  }

  return result
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredUsers.value.length / pageSize))
)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredUsers.value.slice(start, end)
})

const isCurrentUser = (userId: string) => {
  return authStore.user?.id === userId
}

function loadUsers() {
  users.value = authStore.getAllUsers()
}

function handleSearch() {
  currentPage.value = 1
}

function handleRoleFilterChange() {
  currentPage.value = 1
}

function openRoleModal(user: AuthUser, role: 'user' | 'admin') {
  selectedUser.value = user
  targetRole.value = role
  showRoleModal.value = true
}

async function confirmRoleChange() {
  if (!selectedUser.value) return
  actionLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    const success = authStore.updateUserRole(selectedUser.value.id, targetRole.value)
    if (success) {
      loadUsers()
    }
    showRoleModal.value = false
    selectedUser.value = null
  } finally {
    actionLoading.value = false
  }
}

function openDeleteModal(user: AuthUser) {
  if (isCurrentUser(user.id)) return
  selectedUser.value = user
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!selectedUser.value) return
  actionLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    const success = authStore.deleteUser(selectedUser.value.id)
    if (success) {
      loadUsers()
      if (paginatedUsers.value.length === 0 && currentPage.value > 1) {
        currentPage.value--
      }
    }
    showDeleteModal.value = false
    selectedUser.value = null
  } finally {
    actionLoading.value = false
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function goToPage(page: number) {
  currentPage.value = page
}

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i)
    } else if (current >= total - 2) {
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      for (let i = current - 2; i <= current + 2; i++) pages.push(i)
    }
  }

  return pages
})

onMounted(() => {
  loadUsers()
})

watch([searchQuery, roleFilter], () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="user-management min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8 text-center">
        <div class="inline-flex items-center gap-3 mb-3">
          <div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
            <Users class="w-6 h-6 text-white" />
          </div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
            毒薯服用户管理
          </h1>
        </div>
        <p class="text-gray-500">管理社区用户，设置角色权限</p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-orange-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div class="flex items-center gap-4">
            <div class="w-11 h-11 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
              <Users class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-sm text-gray-500">总用户数</p>
              <p class="text-2xl font-bold text-gray-800">{{ users.length }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-orange-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div class="flex items-center gap-4">
            <div class="w-11 h-11 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Shield class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-sm text-gray-500">管理员</p>
              <p class="text-2xl font-bold text-gray-800">{{ users.filter(u => u.role === 'admin').length }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-orange-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div class="flex items-center gap-4">
            <div class="w-11 h-11 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
              <UserCheck class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-sm text-gray-500">普通用户</p>
              <p class="text-2xl font-bold text-gray-800">{{ users.filter(u => u.role === 'user').length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 搜索和筛选栏 -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-orange-100 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1 relative">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索昵称或QQ号..."
              class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all duration-200"
              @input="handleSearch"
            />
          </div>
          <div class="flex gap-2">
            <button
              v-for="option in [
                { value: 'all', label: '全部' },
                { value: 'admin', label: '管理员' },
                { value: 'user', label: '普通用户' }
              ]"
              :key="option.value"
              @click="roleFilter = option.value; handleRoleFilterChange()"
              :class="[
                'px-5 py-3 rounded-xl font-medium transition-all duration-200',
                roleFilter === option.value
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- 用户列表卡片 -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
        <!-- 表格头部 -->
        <div class="bg-gradient-to-r from-orange-50 to-rose-50 px-6 py-4 border-b border-orange-100">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-gray-800 flex items-center gap-2">
              <span class="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              用户列表
            </h2>
            <span class="text-sm text-gray-500">
              共 {{ filteredUsers.length }} 条记录
            </span>
          </div>
        </div>

        <!-- 表格内容 -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50/50">
                <th class="text-left px-6 py-3 text-sm font-semibold text-gray-600">用户</th>
                <th class="text-left px-6 py-3 text-sm font-semibold text-gray-600">QQ号</th>
                <th class="text-left px-6 py-3 text-sm font-semibold text-gray-600">角色</th>
                <th class="text-left px-6 py-3 text-sm font-semibold text-gray-600">注册时间</th>
                <th class="text-right px-6 py-3 text-sm font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="user in paginatedUsers"
                :key="user.id"
                class="hover:bg-orange-50/50 transition-colors duration-200 group"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="relative">
                      <img
                        :src="user.avatar_url"
                        :alt="user.nickname"
                        class="w-10 h-10 rounded-xl object-cover shadow-sm"
                      />
                      <div
                        v-if="user.role === 'admin'"
                        class="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center"
                      >
                        <Shield class="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                    <div>
                      <p class="font-medium text-gray-800 flex items-center gap-2">
                        {{ user.nickname }}
                        <span v-if="isCurrentUser(user.id)" class="text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                          我
                        </span>
                      </p>
                      <p class="text-xs text-gray-400">ID: {{ user.id.slice(0, 12) }}...</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-gray-600 font-mono text-sm">{{ user.qq_number }}</span>
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
                      user.role === 'admin'
                        ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-600'
                    ]"
                  >
                    <Shield v-if="user.role === 'admin'" class="w-3 h-3" />
                    <UserCheck v-else class="w-3 h-3" />
                    {{ user.role === 'admin' ? '管理员' : '普通用户' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-gray-500 text-sm">{{ formatDate(user.created_at, 'long') }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      v-if="user.role !== 'admin'"
                      @click="openRoleModal(user, 'admin')"
                      class="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 hover:scale-105 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      title="设为管理员"
                    >
                      <Shield class="w-4 h-4" />
                    </button>
                    <button
                      v-else
                      @click="openRoleModal(user, 'user')"
                      class="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-105 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      title="设为普通用户"
                      :disabled="isCurrentUser(user.id)"
                      :class="{ 'opacity-50 cursor-not-allowed': isCurrentUser(user.id) }"
                    >
                      <ShieldOff class="w-4 h-4" />
                    </button>
                    <button
                      @click="openDeleteModal(user)"
                      :disabled="isCurrentUser(user.id)"
                      :class="[
                        'p-2 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100',
                        isCurrentUser(user.id)
                          ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                          : 'bg-rose-50 text-rose-600 hover:bg-rose-100 hover:scale-105'
                      ]"
                      title="删除用户"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 空状态 -->
          <div v-if="filteredUsers.length === 0" class="py-16 text-center">
            <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users class="w-10 h-10 text-gray-300" />
            </div>
            <p class="text-gray-400 mb-2">暂无匹配的用户</p>
            <p class="text-sm text-gray-300">换个搜索词试试吧~</p>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="filteredUsers.length > 0" class="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span class="text-sm text-gray-500">
              第 {{ currentPage }} / {{ totalPages }} 页，共 {{ filteredUsers.length }} 条
            </span>
            <div class="flex items-center gap-2">
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                :class="[
                  'p-2 rounded-lg transition-all duration-200',
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                ]"
              >
                <ChevronLeft class="w-4 h-4" />
              </button>

              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'w-9 h-9 rounded-lg font-medium text-sm transition-all duration-200',
                  currentPage === page
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-200'
                    : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                ]"
              >
                {{ page }}
              </button>

              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                :class="[
                  'p-2 rounded-lg transition-all duration-200',
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                ]"
              >
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 品牌标识 -->
      <div class="mt-8 text-center">
        <p class="text-sm text-gray-400">
          🥔 毒薯服 · 用心打造的 MC 社区
        </p>
      </div>
    </div>

    <!-- 角色修改确认弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showRoleModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          @click.self="showRoleModal = false"
        >
          <Transition name="scale">
            <div
              v-if="showRoleModal"
              class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div class="bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-4">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                  <Shield v-if="targetRole === 'admin'" class="w-5 h-5" />
                  <ShieldOff v-else class="w-5 h-5" />
                  {{ targetRole === 'admin' ? '设为管理员' : '设为普通用户' }}
                </h3>
              </div>
              <div class="p-6">
                <div v-if="selectedUser" class="text-center mb-6">
                  <img
                    :src="selectedUser.avatar_url"
                    :alt="selectedUser.nickname"
                    class="w-16 h-16 mx-auto mb-3 rounded-2xl shadow-md object-cover"
                  />
                  <p class="font-semibold text-gray-800">{{ selectedUser.nickname }}</p>
                  <p class="text-sm text-gray-500">QQ: {{ selectedUser.qq_number }}</p>
                  <p class="text-sm text-gray-400 mt-2">
                    当前角色：
                    <span :class="selectedUser.role === 'admin' ? 'text-orange-600' : 'text-gray-600'">
                      {{ selectedUser.role === 'admin' ? '管理员' : '普通用户' }}
                    </span>
                  </p>
                </div>
                <p class="text-sm text-gray-500 text-center mb-6">
                  确定要将该用户{{ targetRole === 'admin' ? '提升为管理员' : '降级为普通用户' }}吗？
                </p>
                <div class="flex gap-3">
                  <button
                    @click="showRoleModal = false"
                    :disabled="actionLoading"
                    class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    取消
                  </button>
                  <button
                    @click="confirmRoleChange"
                    :disabled="actionLoading"
                    class="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-200 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <template v-if="actionLoading">
                      <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      处理中
                    </template>
                    <template v-else>
                      确认
                    </template>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- 删除确认弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          @click.self="showDeleteModal = false"
        >
          <Transition name="scale">
            <div
              v-if="showDeleteModal"
              class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div class="bg-gradient-to-r from-rose-500 to-red-500 px-6 py-4">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                  <Trash2 class="w-5 h-5" />
                  删除用户
                </h3>
              </div>
              <div class="p-6">
                <div v-if="selectedUser" class="text-center mb-6">
                  <div class="w-16 h-16 mx-auto mb-3 bg-rose-100 rounded-2xl flex items-center justify-center">
                    <UserX class="w-8 h-8 text-rose-500" />
                  </div>
                  <p class="font-semibold text-gray-800">{{ selectedUser.nickname }}</p>
                  <p class="text-sm text-gray-500">QQ: {{ selectedUser.qq_number }}</p>
                </div>
                <p class="text-sm text-gray-500 text-center mb-2">
                  确定要删除该用户吗？
                </p>
                <p class="text-xs text-rose-500 text-center mb-6">
                  ⚠️ 此操作不可撤销
                </p>
                <div class="flex gap-3">
                  <button
                    @click="showDeleteModal = false"
                    :disabled="actionLoading"
                    class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    取消
                  </button>
                  <button
                    @click="confirmDelete"
                    :disabled="actionLoading"
                    class="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-rose-200 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <template v-if="actionLoading">
                      <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      删除中
                    </template>
                    <template v-else>
                      删除
                    </template>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
