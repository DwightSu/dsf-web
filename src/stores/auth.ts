import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useMemberStore } from './members'

export interface AuthUser {
  id: string
  qq_number: string
  nickname: string
  role: 'user' | 'admin'
  created_at: string
  avatar_url?: string
}

interface StoredUser {
  id: string
  qq_number: string
  nickname: string
  password: string
  role: 'user' | 'admin'
  created_at: string
  avatar_url?: string
}

const USERS_KEY = 'mc_users'
const CURRENT_USER_KEY = 'mc_current_user'

function loadUsers(): StoredUser[] {
  try {
    const data = localStorage.getItem(USERS_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load users:', e)
  }
  return []
}

function saveUsers(users: StoredUser[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch (e) {
    console.error('Failed to save users:', e)
  }
}

function loadCurrentUser(): AuthUser | null {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load current user:', e)
  }
  return null
}

function saveCurrentUser(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(CURRENT_USER_KEY)
    }
  } catch (e) {
    console.error('Failed to save current user:', e)
  }
}

function generateId(): string {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

function getDefaultAvatar(nickname: string): string {
  const colors = [
    '#5CB85C', '#5BC0DE', '#F0AD4E', '#D9534F', 
    '#9B59B6', '#3498DB', '#1ABC9C', '#E67E22'
  ]
  const colorIndex = nickname.charCodeAt(0) % colors.length
  const bgColor = colors[colorIndex]
  const initial = nickname.charAt(0).toUpperCase()
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${bgColor}dd;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="100" fill="url(#grad)"/>
      <text x="100" y="100" text-anchor="middle" dominant-baseline="central" 
            fill="white" font-size="80" font-weight="bold" font-family="Arial, sans-serif">
        ${initial}
      </text>
    </svg>
  `
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg.trim())))
}

function initDefaultAdmin() {
  const users = loadUsers()
  if (users.length === 0) {
    const adminNick = '毒薯管理员'
    const userNick = '小土豆'
    
    const defaultAdmin: StoredUser = {
      id: 'user_admin',
      qq_number: '123456',
      nickname: adminNick,
      password: 'admin123',
      role: 'admin',
      created_at: new Date().toISOString(),
      avatar_url: getDefaultAvatar(adminNick)
    }
    const defaultUser: StoredUser = {
      id: 'user_demo',
      qq_number: '100001',
      nickname: userNick,
      password: '123456',
      role: 'user',
      created_at: new Date().toISOString(),
      avatar_url: getDefaultAvatar(userNick)
    }
    saveUsers([defaultAdmin, defaultUser])
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function initialize() {
    if (initialized.value) return

    loading.value = true
    initDefaultAdmin()

    const storedUser = loadCurrentUser()
    if (storedUser) {
      if (!storedUser.avatar_url) {
        storedUser.avatar_url = getDefaultAvatar(storedUser.nickname)
      }
      user.value = storedUser
    }

    initialized.value = true
    loading.value = false
  }

  async function login(qqNumber: string, password: string) {
    loading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 300))

      const users = loadUsers()
      const foundUser = users.find(u => u.qq_number === qqNumber)

      if (!foundUser) {
        error.value = '该QQ号未注册'
        return { success: false, error: '该QQ号未注册' }
      }

      if (foundUser.password !== password) {
        error.value = '密码错误'
        return { success: false, error: '密码错误' }
      }

      const avatar = foundUser.avatar_url || getDefaultAvatar(foundUser.nickname)
      
      const authUser: AuthUser = {
        id: foundUser.id,
        qq_number: foundUser.qq_number,
        nickname: foundUser.nickname,
        role: foundUser.role,
        created_at: foundUser.created_at,
        avatar_url: avatar
      }

      user.value = authUser
      saveCurrentUser(authUser)

      return { success: true }
    } catch (err) {
      error.value = '登录失败，请稍后重试'
      return { success: false, error: '登录失败，请稍后重试' }
    } finally {
      loading.value = false
    }
  }

  async function register(data: {
    password: string
    nickname: string
    qq_number: string
  }) {
    loading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const users = loadUsers()
      const existingUser = users.find(u => u.qq_number === data.qq_number)

      if (existingUser) {
        error.value = '该QQ号已注册'
        return { success: false, error: '该QQ号已注册' }
      }

      const avatar = getDefaultAvatar(data.nickname)

      const newUser: StoredUser = {
        id: generateId(),
        qq_number: data.qq_number,
        nickname: data.nickname,
        password: data.password,
        role: 'user',
        created_at: new Date().toISOString(),
        avatar_url: avatar
      }

      users.push(newUser)
      saveUsers(users)

      const memberStore = useMemberStore()
      memberStore.addMember({
        id: newUser.id,
        nickname: newUser.nickname,
        qq_number: newUser.qq_number,
        avatar_url: avatar,
        notes: '新加入的小伙伴',
        tags: ['萌新']
      })

      const authUser: AuthUser = {
        id: newUser.id,
        qq_number: newUser.qq_number,
        nickname: newUser.nickname,
        role: newUser.role,
        created_at: newUser.created_at,
        avatar_url: avatar
      }

      user.value = authUser
      saveCurrentUser(authUser)

      return { success: true }
    } catch (err) {
      error.value = '注册失败，请稍后重试'
      return { success: false, error: '注册失败，请稍后重试' }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true

    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      user.value = null
      saveCurrentUser(null)
    } catch (err) {
      console.error('Failed to logout:', err)
    } finally {
      loading.value = false
    }
  }

  function updateUser(updates: Partial<AuthUser>) {
    if (user.value) {
      user.value = { ...user.value, ...updates }
      saveCurrentUser(user.value)

      const users = loadUsers()
      const index = users.findIndex(u => u.id === user.value?.id)
      if (index !== -1 && user.value) {
        users[index] = {
          ...users[index],
          nickname: user.value.nickname,
          avatar_url: user.value.avatar_url
        }
        saveUsers(users)
      }
    }
  }

  function changePassword(currentPassword: string, newPassword: string): { success: boolean; error?: string } {
    if (!user.value) {
      return { success: false, error: '用户未登录' }
    }

    const users = loadUsers()
    const foundUser = users.find(u => u.id === user.value?.id)

    if (!foundUser) {
      return { success: false, error: '用户不存在' }
    }

    if (foundUser.password !== currentPassword) {
      return { success: false, error: '当前密码错误' }
    }

    foundUser.password = newPassword
    saveUsers(users)

    return { success: true }
  }

  function updateAvatar(avatarDataUrl: string) {
    updateUser({ avatar_url: avatarDataUrl })
  }

  function getAllUsers(): AuthUser[] {
    const users = loadUsers()
    return users.map(u => ({
      id: u.id,
      qq_number: u.qq_number,
      nickname: u.nickname,
      role: u.role,
      created_at: u.created_at,
      avatar_url: u.avatar_url || getDefaultAvatar(u.nickname)
    }))
  }

  function deleteUser(userId: string): boolean {
    if (userId === user.value?.id) return false
    
    const users = loadUsers()
    const filtered = users.filter(u => u.id !== userId)
    if (filtered.length === users.length) return false
    
    saveUsers(filtered)
    return true
  }

  function updateUserRole(userId: string, role: 'user' | 'admin'): boolean {
    const users = loadUsers()
    const index = users.findIndex(u => u.id === userId)
    if (index === -1) return false
    
    users[index].role = role
    saveUsers(users)
    
    if (userId === user.value?.id) {
      user.value.role = role
      saveCurrentUser(user.value)
    }
    
    return true
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    loading,
    error,
    initialized,
    isLoggedIn,
    isAdmin,
    initialize,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    updateAvatar,
    getAllUsers,
    deleteUser,
    updateUserRole,
    clearError
  }
})
