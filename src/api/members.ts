// 成员 API

import { supabase } from './supabase'
import type { Member, MemberInsert } from '@/types/database'
import type { MemberWithActivities, MemberFilter } from '@/types/member'

// 获取所有成员
export async function getMembers(filter?: MemberFilter) {
  let query = supabase
    .from('members')
    .select('*')
    .order('nickname', { ascending: true })

  if (filter?.search) {
    query = query.ilike('nickname', `%${filter.search}%`)
  }

  if (filter?.qq_number) {
    query = query.eq('qq_number', filter.qq_number)
  }

  const { data, error } = await query

  return { data: data as Member[], error }
}

// 获取单个成员详情（包含参与的活动）
export async function getMemberById(id: string) {
  // 获取成员基本信息
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()

  if (memberError) {
    return { data: null, error: memberError }
  }

  // 获取成员参与的活动
  const { data: groupMembers, error: groupError } = await supabase
    .from('group_members')
    .select(`
      id,
      group_id,
      groups (
        id,
        name,
        activity_id,
        activities (
          id,
          name,
          activity_date
        )
      )
    `)
    .eq('member_id', id)

  if (groupError) {
    return { data: member as Member, error: groupError }
  }

  // 组装活动数据
  const activities = groupMembers.map(gm => ({
    activity_id: gm.groups.activity_id,
    activity_name: gm.groups.activities.name,
    activity_date: gm.groups.activities.activity_date,
    group_name: gm.groups.name
  }))

  const memberWithActivities: MemberWithActivities = {
    ...member,
    activities
  }

  return { data: memberWithActivities, error: null }
}

// 创建成员
export async function createMember(member: MemberInsert) {
  const { data, error } = await supabase
    .from('members')
    .insert(member)
    .select()
    .single()

  return { data: data as Member, error }
}

// 更新成员
export async function updateMember(id: string, updates: Partial<Member>) {
  const { data, error } = await supabase
    .from('members')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data: data as Member, error }
}

// 删除成员
export async function deleteMember(id: string) {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id)

  return { error }
}

// 检查成员是否存在（通过QQ号）
export async function checkMemberExists(qqNumber: string) {
  const { data, error } = await supabase
    .from('members')
    .select('id')
    .eq('qq_number', qqNumber)
    .single()

  return { exists: !!data, error }
}

// 获取成员统计信息
export async function getMemberStats(id: string) {
  const { count, error } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('member_id', id)

  return { count: count || 0, error }
}

// 批量创建成员
export async function createMembersBatch(members: MemberInsert[]) {
  const { data, error } = await supabase
    .from('members')
    .insert(members)
    .select()

  return { data: data as Member[], error }
}