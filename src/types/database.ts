// 数据库类型定义 - 基于 Supabase 表结构

export interface Profile {
  id: string
  username: string
  qq_number: string
  nickname: string
  avatar_url: string | null
  role: 'user' | 'admin'
  status: 'active' | 'disabled'
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  name: string
  description: string | null
  activity_date: string
  activity_type: string | null
  has_groups: boolean
  cover_image: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  groups?: Group[]
  images?: Image[]
}

export interface Group {
  id: string
  activity_id: string
  name: string
  score: number
  description: string | null
  created_at: string
  group_members?: GroupMember[]
}

export interface Member {
  id: string
  nickname: string
  qq_number: string | null
  avatar_url: string | null
  notes: string | null
  created_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  member_id: string
  joined_at: string
  members?: Member
}

export interface Image {
  id: string
  activity_id: string
  url: string
  description: string | null
  uploaded_by: string | null
  created_at: string
}

export interface Post {
  id: string
  title: string
  content: string
  author_id: string | null
  views: number
  tags: string[] | null
  status: 'published' | 'hidden'
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'nickname' | 'avatar_url'>
}

export interface Comment {
  id: string
  target_type: 'activity' | 'post'
  target_id: string
  content: string
  author_id: string | null
  status: 'visible' | 'hidden'
  created_at: string
  profiles?: Pick<Profile, 'nickname' | 'avatar_url'>
}

// 插入类型
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>
export type ActivityInsert = Omit<Activity, 'id' | 'created_at' | 'updated_at' | 'groups' | 'images'>
export type GroupInsert = Omit<Group, 'id' | 'created_at' | 'group_members'>
export type MemberInsert = Omit<Member, 'id' | 'created_at'>
export type GroupMemberInsert = Omit<GroupMember, 'id' | 'joined_at'>
export type ImageInsert = Omit<Image, 'id' | 'created_at'>
export type PostInsert = Omit<Post, 'id' | 'views' | 'created_at' | 'updated_at' | 'profiles'>
export type CommentInsert = Omit<Comment, 'id' | 'created_at' | 'profiles'>