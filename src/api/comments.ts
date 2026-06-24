// 评论 API

import { supabase } from './supabase'
import type { Comment, CommentInsert } from '@/types/database'
import type { CommentWithAuthor } from '@/types/post'

// 获取评论列表
export async function getComments(targetType: 'activity' | 'post', targetId: string) {
  const { data, error } = await supabase
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
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('status', 'visible')
    .order('created_at', { ascending: true })

  return { data: data as CommentWithAuthor[], error }
}

// 创建评论
export async function createComment(comment: CommentInsert) {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
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
    .single()

  return { data: data as CommentWithAuthor, error }
}

// 删除评论
export async function deleteComment(id: string) {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)

  return { error }
}

// 隐藏评论（管理员操作）
export async function hideComment(id: string) {
  const { error } = await supabase
    .from('comments')
    .update({ status: 'hidden' })
    .eq('id', id)

  return { error }
}

// 获取用户的评论
export async function getUserComments(userId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      target_type,
      target_id,
      content,
      status,
      created_at
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })

  return { data: data as Comment[], error }
}

// 获取评论统计
export async function getCommentStats(targetType: 'activity' | 'post', targetId: string) {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('status', 'visible')

  return { count: count || 0, error }
}

// 获取待审核的评论（管理员用）
export async function getPendingComments() {
  const { data, error } = await supabase
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
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return { data: data as CommentWithAuthor[], error }
}

// 获取已隐藏的评论（管理员用）
export async function getHiddenComments() {
  const { data, error } = await supabase
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
    .eq('status', 'hidden')
    .order('created_at', { ascending: false })

  return { data: data as CommentWithAuthor[], error }
}

// 审核评论通过
export async function approveComment(id: string) {
  const { data, error } = await supabase
    .from('comments')
    .update({ status: 'visible' })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// 恢复评论
export async function restoreComment(id: string) {
  const { data, error } = await supabase
    .from('comments')
    .update({ status: 'visible' })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}