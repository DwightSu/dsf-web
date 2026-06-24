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
  CACHE_MEMBERS: STORAGE_PREFIX + 'cache_members',
  CUSTOM_ACTIVITIES: STORAGE_PREFIX + 'custom_activities',
  CUSTOM_IMAGES: STORAGE_PREFIX + 'custom_images',
  CUSTOM_GROUPS: STORAGE_PREFIX + 'custom_groups',
  CUSTOM_GROUP_MEMBERS: STORAGE_PREFIX + 'custom_group_members',
  CUSTOM_ACTIVITY_MEMBERS: STORAGE_PREFIX + 'custom_activity_members',
  CUSTOM_COMMENTS: STORAGE_PREFIX + 'custom_comments'
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

// 自定义活动相关函数
export function getCustomActivities(): unknown[] {
  return getStorage<unknown[]>(STORAGE_KEYS.CUSTOM_ACTIVITIES) || []
}

export function saveCustomActivity(activity: unknown): void {
  const activities = getCustomActivities()
  activities.unshift(activity)
  setStorage(STORAGE_KEYS.CUSTOM_ACTIVITIES, activities)
}

export function updateCustomActivity(id: string, updates: unknown): boolean {
  const activities = getCustomActivities() as Array<{ id: string }>
  const index = activities.findIndex(a => a.id === id)
  if (index !== -1) {
    activities[index] = { ...activities[index], ...(updates as object) }
    setStorage(STORAGE_KEYS.CUSTOM_ACTIVITIES, activities)
    return true
  }
  return false
}

export function deleteCustomActivity(id: string): boolean {
  const activities = getCustomActivities() as Array<{ id: string }>
  const filtered = activities.filter(a => a.id !== id)
  setStorage(STORAGE_KEYS.CUSTOM_ACTIVITIES, filtered)
  return filtered.length !== activities.length
}

// 自定义图片相关函数
export function getCustomImages(): unknown[] {
  return getStorage<unknown[]>(STORAGE_KEYS.CUSTOM_IMAGES) || []
}

export function saveCustomImage(image: unknown): void {
  const images = getCustomImages()
  images.unshift(image)
  setStorage(STORAGE_KEYS.CUSTOM_IMAGES, images)
}

export function deleteCustomImage(id: string): boolean {
  const images = getCustomImages() as Array<{ id: string }>
  const filtered = images.filter(i => i.id !== id)
  setStorage(STORAGE_KEYS.CUSTOM_IMAGES, filtered)
  return filtered.length !== images.length
}

// 自定义小组相关函数
export function getCustomGroups(): unknown[] {
  return getStorage<unknown[]>(STORAGE_KEYS.CUSTOM_GROUPS) || []
}

export function getCustomGroupsByActivity(activityId: string): unknown[] {
  return getCustomGroups().filter((g: { activity_id: string }) => g.activity_id === activityId)
}

export function saveCustomGroup(group: unknown): void {
  const groups = getCustomGroups()
  groups.unshift(group)
  setStorage(STORAGE_KEYS.CUSTOM_GROUPS, groups)
}

export function updateCustomGroup(id: string, updates: unknown): boolean {
  const groups = getCustomGroups() as Array<{ id: string }>
  const index = groups.findIndex(g => g.id === id)
  if (index !== -1) {
    groups[index] = { ...groups[index], ...(updates as object) }
    setStorage(STORAGE_KEYS.CUSTOM_GROUPS, groups)
    return true
  }
  return false
}

export function deleteCustomGroup(id: string): boolean {
  const groups = getCustomGroups() as Array<{ id: string }>
  const filtered = groups.filter(g => g.id !== id)
  setStorage(STORAGE_KEYS.CUSTOM_GROUPS, filtered)
  // 同时删除相关的小组成员
  const members = getCustomGroupMembers().filter((gm: { group_id: string }) => gm.group_id !== id)
  setStorage(STORAGE_KEYS.CUSTOM_GROUP_MEMBERS, members)
  return filtered.length !== groups.length
}

// 自定义小组成员相关函数
export function getCustomGroupMembers(): unknown[] {
  return getStorage<unknown[]>(STORAGE_KEYS.CUSTOM_GROUP_MEMBERS) || []
}

export function getCustomGroupMembersByGroup(groupId: string): unknown[] {
  return getCustomGroupMembers().filter((gm: { group_id: string }) => gm.group_id === groupId)
}

export function addCustomGroupMember(member: unknown): void {
  const members = getCustomGroupMembers()
  members.push(member)
  setStorage(STORAGE_KEYS.CUSTOM_GROUP_MEMBERS, members)
}

export function removeCustomGroupMember(id: string): boolean {
  const members = getCustomGroupMembers() as Array<{ id: string }>
  const filtered = members.filter(m => m.id !== id)
  setStorage(STORAGE_KEYS.CUSTOM_GROUP_MEMBERS, filtered)
  return filtered.length !== members.length
}

// 活动参与成员（非分组模式）
export function getCustomActivityMembers(): unknown[] {
  return getStorage<unknown[]>(STORAGE_KEYS.CUSTOM_ACTIVITY_MEMBERS) || []
}

export function getCustomActivityMembersByActivity(activityId: string): unknown[] {
  return getCustomActivityMembers().filter((am: { activity_id: string }) => am.activity_id === activityId)
}

export function addCustomActivityMember(member: unknown): void {
  const members = getCustomActivityMembers()
  members.push(member)
  setStorage(STORAGE_KEYS.CUSTOM_ACTIVITY_MEMBERS, members)
}

export function removeCustomActivityMember(activityId: string, memberId: string): boolean {
  const members = getCustomActivityMembers() as Array<{ activity_id: string; member_id: string; id: string }>
  const filtered = members.filter(m => !(m.activity_id === activityId && m.member_id === memberId))
  setStorage(STORAGE_KEYS.CUSTOM_ACTIVITY_MEMBERS, filtered)
  return filtered.length !== members.length
}

// 自定义评论相关函数
export function getCustomComments(): unknown[] {
  return getStorage<unknown[]>(STORAGE_KEYS.CUSTOM_COMMENTS) || []
}

export function getCustomCommentsByActivity(activityId: string): unknown[] {
  return getCustomComments().filter((c: { target_type: string; target_id: string }) =>
    c.target_type === 'activity' && c.target_id === activityId
  )
}

export function saveCustomComment(comment: unknown): void {
  const comments = getCustomComments()
  comments.push(comment)
  setStorage(STORAGE_KEYS.CUSTOM_COMMENTS, comments)
}

export function deleteCustomComment(id: string): boolean {
  const comments = getCustomComments() as Array<{ id: string }>
  const filtered = comments.filter(c => c.id !== id)
  setStorage(STORAGE_KEYS.CUSTOM_COMMENTS, filtered)
  return filtered.length !== comments.length
}