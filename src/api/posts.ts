// 论坛帖子 API

import { supabase } from './supabase'
import type { Post, PostInsert } from '@/types/database'
import type { PostDetail, PostFilter, PostWithAuthor } from '@/types/post'

// 获取所有帖子
export async function getPosts(filter?: PostFilter) {
  let query = supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      author_id,
      views,
      tags,
      status,
      created_at,
      updated_at,
      profiles (
        nickname,
        avatar_url
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (filter?.tag) {
    query = query.contains('tags', [filter.tag])
  }

  if (filter?.search) {
    query = query.ilike('title', `%${filter.search}%`)
  }

  if (filter?.author) {
    query = query.eq('author_id', filter.author)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error }
  }

  // 获取每个帖子的评论数
  const postsWithCount = await Promise.all(
    (data || []).map(async (post) => {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('target_type', 'post')
        .eq('target_id', post.id)
        .eq('status', 'visible')

      return {
        ...post,
        comment_count: count || 0
      } as PostWithAuthor
    })
  )

  return { data: postsWithCount, error: null }
}

// 获取单个帖子详情
export async function getPostById(id: string) {
  // 获取帖子基本信息
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      author_id,
      views,
      tags,
      status,
      created_at,
      updated_at,
      profiles (
        nickname,
        avatar_url
      )
    `)
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (postError) {
    return { data: null, error: postError }
  }

  // 获取帖子评论
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select(`
      id,
      target_type,
      target_id,
      content,
      author_id,
      status,
      created_at,
      profiles (
        nickname,
        avatar_url
      )
    `)
    .eq('target_type', 'post')
    .eq('target_id', id)
    .eq('status', 'visible')
    .order('created_at', { ascending: true })

  if (commentsError) {
    return { data: post, error: commentsError }
  }

  // 增加浏览量
  await supabase
    .from('posts')
    .update({ views: post.views + 1 })
    .eq('id', id)

  const postDetail: PostDetail = {
    ...post,
    comments: comments || []
  }

  return { data: postDetail, error: null }
}

// 创建帖子
export async function createPost(post: PostInsert) {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single()

  return { data: data as Post, error }
}

// 更新帖子
export async function updatePost(id: string, updates: Partial<Post>) {
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data: data as Post, error }
}

// 删除帖子
export async function deletePost(id: string) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  return { error }
}

// 获取所有标签
export async function getTags() {
  const { data, error } = await supabase
    .from('posts')
    .select('tags')
    .not('tags', 'is', null)
    .eq('status', 'published')

  if (error) {
    return { data: [], error }
  }

  // 提取所有唯一标签
  const allTags = data.flatMap(item => item.tags || [])
  const uniqueTags = [...new Set(allTags)]

  return { data: uniqueTags as string[], error: null }
}

// 获取用户的帖子
export async function getUserPosts(userId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      views,
      tags,
      status,
      created_at,
      updated_at
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })

  return { data: data as Post[], error }
}

// 获取待审核的帖子（管理员用）
export async function getPendingPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      author_id,
      views,
      tags,
      status,
      created_at,
      updated_at,
      profiles (
        id,
        nickname,
        avatar_url
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return { data: data as (Post & { profiles: { id: string; nickname: string; avatar_url: string | null } })[], error }
}

// 获取已隐藏的帖子（管理员用）
export async function getHiddenPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      content,
      author_id,
      views,
      tags,
      status,
      created_at,
      updated_at,
      profiles (
        id,
        nickname,
        avatar_url
      )
    `)
    .eq('status', 'hidden')
    .order('updated_at', { ascending: false })

  return { data: data as (Post & { profiles: { id: string; nickname: string; avatar_url: string | null } })[], error }
}

// 审核帖子通过
export async function approvePost(id: string) {
  const { data, error } = await supabase
    .from('posts')
    .update({ status: 'published' })
    .eq('id', id)
    .select()
    .single()

  return { data: data as Post, error }
}

// 隐藏帖子
export async function rejectPost(id: string) {
  const { data, error } = await supabase
    .from('posts')
    .update({ status: 'hidden' })
    .eq('id', id)
    .select()
    .single()

  return { data: data as Post, error }
}