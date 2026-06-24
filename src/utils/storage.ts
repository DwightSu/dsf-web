// 本地存储工具函数

const STORAGE_PREFIX = 'mc_activity_'

// 存储键名
export const STORAGE_KEYS = {
  USER: STORAGE_PREFIX + 'user',
  TOKEN: STORAGE_PREFIX + 'token',
  THEME: STORAGE_PREFIX + 'theme',
  LANGUAGE: STORAGE_PREFIX + 'language',
  LAST_VISIT: STORAGE_PREFIX + 'last_visit',
  CACHE_ACTIVITIES: STORAGE_PREFIX + 'cache_activities',
  CACHE_MEMBERS: STORAGE_PREFIX + 'cache_members'
}

// 获取存储项
export function getStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key)
    if (!item) return null
    return JSON.parse(item) as T
  } catch {
    return null
  }
}

// 设置存储项
export function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    console.warn('Failed to save to localStorage')
  }
}

// 移除存储项
export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    console.warn('Failed to remove from localStorage')
  }
}

// 清除所有存储项
export function clearStorage(): void {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch {
    console.warn('Failed to clear localStorage')
  }
}

// 获取用户信息
export function getStoredUser(): { id: string; role: string } | null {
  return getStorage(STORAGE_KEYS.USER)
}

// 设置用户信息
export function setStoredUser(user: { id: string; role: string }): void {
  setStorage(STORAGE_KEYS.USER, user)
}

// 移除用户信息
export function removeStoredUser(): void {
  removeStorage(STORAGE_KEYS.USER)
  removeStorage(STORAGE_KEYS.TOKEN)
}

// 获取主题
export function getStoredTheme(): 'light' | 'dark' | null {
  return getStorage<'light' | 'dark'>(STORAGE_KEYS.THEME)
}

// 设置主题
export function setStoredTheme(theme: 'light' | 'dark'): void {
  setStorage(STORAGE_KEYS.THEME, theme)
}

// 获取上次访问时间
export function getLastVisit(): string | null {
  return getStorage<string>(STORAGE_KEYS.LAST_VISIT)
}

// 设置上次访问时间
export function setLastVisit(): void {
  setStorage(STORAGE_KEYS.LAST_VISIT, new Date().toISOString())
}

// 缓存活动数据
export function cacheActivities(activities: unknown[]): void {
  setStorage(STORAGE_KEYS.CACHE_ACTIVITIES, {
    data: activities,
    timestamp: Date.now()
  })
}

// 获取缓存的活动数据（有效期1小时）
export function getCachedActivities(): unknown[] | null {
  const cached = getStorage<{ data: unknown[]; timestamp: number }>(STORAGE_KEYS.CACHE_ACTIVITIES)
  if (!cached) return null

  // 缓存有效期1小时
  if (Date.now() - cached.timestamp > 3600000) {
    removeStorage(STORAGE_KEYS.CACHE_ACTIVITIES)
    return null
  }

  return cached.data
}