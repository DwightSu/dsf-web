// 活动相关类型定义

import type { Activity, Group, Image, Comment } from './database'

export interface ActivityWithDetails extends Activity {
  groups: GroupWithMembers[]
  images: Image[]
  comments?: Comment[]
}

export interface GroupWithMembers extends Group {
  group_members: GroupMemberWithMember[]
}

export interface GroupMemberWithMember {
  id: string
  group_id: string
  member_id: string
  joined_at: string
  members: {
    id: string
    nickname: string
    qq_number: string | null
    avatar_url: string | null
  }
}

export interface ActivityCard {
  id: string
  name: string
  cover_image: string | null
  activity_date: string
  activity_type: string | null
  participant_count: number
  group_count: number
}

export interface ActivityFilter {
  year?: number
  type?: string
  search?: string
}