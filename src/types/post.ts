// 论坛帖子相关类型定义

import type { Post, Comment, Profile } from './database'

export interface PostWithAuthor extends Post {
  profiles: {
    nickname: string
    avatar_url: string | null
  }
  comment_count?: number
}

export interface PostDetail extends Post {
  profiles: {
    nickname: string
    avatar_url: string | null
  }
  comments: CommentWithAuthor[]
}

export interface CommentWithAuthor extends Comment {
  profiles: {
    nickname: string
    avatar_url: string | null
  }
}

export interface PostCard {
  id: string
  title: string
  author_nickname: string
  author_avatar: string | null
  created_at: string
  views: number
  comment_count: number
  tags: string[]
}

export interface PostFilter {
  tag?: string
  search?: string
  author?: string
}