import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Activity, ActivityInsert, Group, GroupInsert } from '@/types/database'
import type { ActivityWithDetails, ActivityFilter } from '@/types/activity'
import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  createGroup,
  updateGroup,
  deleteGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  getActivityTypes,
  getActivityYears
} from '@/api/activities'
import { cacheActivities, getCachedActivities } from '@/utils/storage'

export const useActivityStore = defineStore('activity', () => {
  // 状态
  const activities = ref<Activity[]>([])
  const currentActivity = ref<ActivityWithDetails | null>(null)
  const activityTypes = ref<string[]>([])
  const activityYears = ref<number[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 筛选条件
  const filter = ref<ActivityFilter>({
    year: undefined,
    type: undefined,
    search: undefined
  })

  // 计算属性
  const filteredActivities = computed(() => {
    let result = activities.value

    if (filter.value.year) {
      result = result.filter(a =>
        new Date(a.activity_date).getFullYear() === filter.value.year
      )
    }

    if (filter.value.type) {
      result = result.filter(a => a.activity_type === filter.value.type)
    }

    if (filter.value.search) {
      const search = filter.value.search.toLowerCase()
      result = result.filter(a =>
        a.name.toLowerCase().includes(search)
      )
    }

    return result
  })

  // 加载活动列表
  async function loadActivities(useCache = true) {
    loading.value = true
    error.value = null

    try {
      // 尝试使用缓存
      if (useCache) {
        const cached = getCachedActivities()
        if (cached && Array.isArray(cached)) {
          activities.value = cached as Activity[]
          loading.value = false
          return
        }
      }

      const { data, error: fetchError } = await getActivities(filter.value)

      if (fetchError) {
        error.value = fetchError.message
        return
      }

      activities.value = data || []

      // 缓存数据
      if (data) {
        cacheActivities(data)
      }
    } catch (err) {
      error.value = '加载活动列表失败'
      console.error('Failed to load activities:', err)
    } finally {
      loading.value = false
    }
  }

  // 加载单个活动详情
  async function loadActivityById(id: string) {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await getActivityById(id)

      if (fetchError) {
        error.value = fetchError.message
        return false
      }

      currentActivity.value = data
      return true
    } catch (err) {
      error.value = '加载活动详情失败'
      console.error('Failed to load activity:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // 创建活动
  async function createNewActivity(activity: ActivityInsert) {
    loading.value = true
    error.value = null

    try {
      const { data, error: createError } = await createActivity(activity)

      if (createError) {
        error.value = createError.message
        return null
      }

      if (data) {
        activities.value.unshift(data)
        return data
      }

      return null
    } catch (err) {
      error.value = '创建活动失败'
      console.error('Failed to create activity:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // 更新活动
  async function updateExistingActivity(id: string, updates: Partial<Activity>) {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await updateActivity(id, updates)

      if (updateError) {
        error.value = updateError.message
        return false
      }

      if (data) {
        const index = activities.value.findIndex(a => a.id === id)
        if (index !== -1) {
          activities.value[index] = data
        }

        if (currentActivity.value?.id === id) {
          currentActivity.value = { ...currentActivity.value, ...data } as ActivityWithDetails
        }
      }

      return true
    } catch (err) {
      error.value = '更新活动失败'
      console.error('Failed to update activity:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // 删除活动
  async function deleteExistingActivity(id: string) {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await deleteActivity(id)

      if (deleteError) {
        error.value = deleteError.message
        return false
      }

      activities.value = activities.value.filter(a => a.id !== id)

      if (currentActivity.value?.id === id) {
        currentActivity.value = null
      }

      return true
    } catch (err) {
      error.value = '删除活动失败'
      console.error('Failed to delete activity:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // 创建小组
  async function createNewGroup(group: GroupInsert) {
    loading.value = true
    error.value = null

    try {
      const { data, error: createError } = await createGroup(group)

      if (createError) {
        error.value = createError.message
        return null
      }

      return data
    } catch (err) {
      error.value = '创建小组失败'
      console.error('Failed to create group:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // 加载活动类型和年份
  async function loadFilters() {
    try {
      const [typesResult, yearsResult] = await Promise.all([
        getActivityTypes(),
        getActivityYears()
      ])

      activityTypes.value = typesResult.data || []
      activityYears.value = yearsResult.data || []
    } catch (err) {
      console.error('Failed to load filters:', err)
    }
  }

  // 设置筛选条件
  function setFilter(newFilter: ActivityFilter) {
    filter.value = { ...filter.value, ...newFilter }
  }

  // 清除筛选条件
  function clearFilter() {
    filter.value = {
      year: undefined,
      type: undefined,
      search: undefined
    }
  }

  // 清除当前活动
  function clearCurrentActivity() {
    currentActivity.value = null
  }

  // 清除错误
  function clearError() {
    error.value = null
  }

  return {
    // 状态
    activities,
    currentActivity,
    activityTypes,
    activityYears,
    loading,
    error,
    filter,

    // 计算属性
    filteredActivities,

    // 方法
    loadActivities,
    loadActivityById,
    createNewActivity,
    updateExistingActivity,
    deleteExistingActivity,
    createNewGroup,
    loadFilters,
    setFilter,
    clearFilter,
    clearCurrentActivity,
    clearError
  }
})