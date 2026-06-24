// 活动 API

import { supabase } from './supabase'
import type { Activity, ActivityInsert, Group, GroupInsert, GroupMemberInsert } from '@/types/database'
import type { ActivityWithDetails, ActivityFilter } from '@/types/activity'

// 获取所有活动
export async function getActivities(filter?: ActivityFilter) {
  let query = supabase
    .from('activities')
    .select(`
      *,
      groups (
        id,
        name,
        score,
        description,
        group_members (
          id,
          member_id,
          members (
            id,
            nickname,
            qq_number,
            avatar_url
          )
        )
      )
    `)
    .order('activity_date', { ascending: false })

  if (filter?.year) {
    query = query.gte('activity_date', `${filter.year}-01-01`).lte('activity_date', `${filter.year}-12-31`)
  }

  if (filter?.type) {
    query = query.eq('activity_type', filter.type)
  }

  if (filter?.search) {
    query = query.ilike('name', `%${filter.search}%`)
  }

  const { data, error } = await query

  return { data: data as Activity[], error }
}

// 获取单个活动详情
export async function getActivityById(id: string) {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      groups (
        id,
        activity_id,
        name,
        score,
        description,
        group_members (
          id,
          group_id,
          member_id,
          joined_at,
          members (
            id,
            nickname,
            qq_number,
            avatar_url,
            notes
          )
        )
      ),
      images (
        id,
        activity_id,
        url,
        description,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  return { data: data as ActivityWithDetails, error }
}

// 创建活动
export async function createActivity(activity: ActivityInsert) {
  const { data, error } = await supabase
    .from('activities')
    .insert(activity)
    .select()
    .single()

  return { data: data as Activity, error }
}

// 更新活动
export async function updateActivity(id: string, updates: Partial<Activity>) {
  const { data, error } = await supabase
    .from('activities')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data: data as Activity, error }
}

// 删除活动
export async function deleteActivity(id: string) {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id)

  return { error }
}

// 创建小组
export async function createGroup(group: GroupInsert) {
  const { data, error } = await supabase
    .from('groups')
    .insert(group)
    .select()
    .single()

  return { data: data as Group, error }
}

// 更新小组
export async function updateGroup(id: string, updates: Partial<Group>) {
  const { data, error } = await supabase
    .from('groups')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data: data as Group, error }
}

// 删除小组
export async function deleteGroup(id: string) {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id)

  return { error }
}

// 添加成员到小组
export async function addMemberToGroup(groupMember: GroupMemberInsert) {
  const { data, error } = await supabase
    .from('group_members')
    .insert(groupMember)
    .select()
    .single()

  return { data, error }
}

// 从小组移除成员
export async function removeMemberFromGroup(groupId: string, memberId: string) {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('member_id', memberId)

  return { error }
}

// 获取活动类型列表
export async function getActivityTypes() {
  const { data, error } = await supabase
    .from('activities')
    .select('activity_type')
    .not('activity_type', 'is', null)

  if (error) {
    return { data: [], error }
  }

  // 提取唯一的类型
  const types = [...new Set(data.map(item => item.activity_type))]

  return { data: types as string[], error: null }
}

// 获取活动年份列表
export async function getActivityYears() {
  const { data, error } = await supabase
    .from('activities')
    .select('activity_date')
    .order('activity_date', { ascending: false })

  if (error) {
    return { data: [], error }
  }

  // 提取唯一的年份
  const years = [...new Set(data.map(item => new Date(item.activity_date).getFullYear()))]

  return { data: years as number[], error: null }
}

// 获取未分配到指定活动小组的成员
export async function getUnassignedMembers(activityId: string) {
  // 先获取该活动所有小组的成员ID
  const { data: groupMembers, error: gmError } = await supabase
    .from('group_members')
    .select('member_id')
    .eq('group_id', activityId)

  if (gmError) {
    return { data: [], error: gmError }
  }

  const assignedMemberIds = (groupMembers || []).map(gm => gm.member_id)

  // 获取所有成员
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('*')
    .order('nickname', { ascending: true })

  if (membersError) {
    return { data: [], error: membersError }
  }

  // 过滤掉已分配的成员
  const unassignedMembers = members?.filter(m => !assignedMemberIds.includes(m.id)) || []

  return { data: unassignedMembers, error: null }
}

// 获取小组的所有成员
export async function getGroupMembers(groupId: string) {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      id,
      member_id,
      joined_at,
      members (
        id,
        nickname,
        qq_number,
        avatar_url,
        notes
      )
    `)
    .eq('group_id', groupId)

  return { data, error }
}