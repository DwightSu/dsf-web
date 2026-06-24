// 成员相关类型定义

import type { Member, Activity } from './database'

export interface MemberWithActivities extends Member {
  activities: MemberActivity[]
}

export interface MemberActivity {
  activity_id: string
  activity_name: string
  activity_date: string
  group_name: string
}

export interface MemberCard {
  id: string
  nickname: string
  qq_number: string | null
  avatar_url: string | null
  activity_count: number
}

export interface MemberFilter {
  search?: string
  qq_number?: string
}