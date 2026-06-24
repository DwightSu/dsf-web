// 活动相关类型定义

import type { Activity, Group, Image, Comment, GroupMember } from './database'

export interface ActivityWithDetails extends Omit<Activity, 'groups'> {
  groups: GroupWithMembers[]
  images: Image[]
  comments?: Comment[]
}

export interface GroupWithMembers extends Omit<Group, 'group_members'> {
  group_members: GroupMemberWithMember[]
}

export interface GroupMemberWithMember extends Omit<GroupMember, 'members'> {
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