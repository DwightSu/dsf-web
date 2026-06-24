// 图片 API

import { supabase } from './supabase'
import type { Image, ImageInsert } from '@/types/database'

// 获取活动的图片列表
export async function getActivityImages(activityId: string) {
  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('activity_id', activityId)
    .order('created_at', { ascending: true })

  return { data: data as Image[], error }
}

// 上传图片（添加图片记录）
export async function createImage(image: ImageInsert) {
  const { data, error } = await supabase
    .from('images')
    .insert(image)
    .select()
    .single()

  return { data: data as Image, error }
}

// 删除图片记录
export async function deleteImage(id: string) {
  const { error } = await supabase
    .from('images')
    .delete()
    .eq('id', id)

  return { error }
}

// 更新图片描述
export async function updateImageDescription(id: string, description: string) {
  const { data, error } = await supabase
    .from('images')
    .update({ description })
    .eq('id', id)
    .select()
    .single()

  return { data: data as Image, error }
}

// 批量创建图片
export async function createImagesBatch(images: ImageInsert[]) {
  const { data, error } = await supabase
    .from('images')
    .insert(images)
    .select()

  return { data: data as Image[], error }
}

// 获取图片统计
export async function getImageStats(activityId: string) {
  const { count, error } = await supabase
    .from('images')
    .select('*', { count: 'exact', head: true })
    .eq('activity_id', activityId)

  return { count: count || 0, error }
}

// 获取所有图片（管理员用）
export async function getAllImages() {
  const { data, error } = await supabase
    .from('images')
    .select(`
      *,
      activities (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  return { data: data as (Image & { activities: { id: string; name: string } })[], error }
}

// 上传图片文件到存储桶
export async function uploadImageFile(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  return { data, error }
}

// 获取图片公开URL
export function getImageUrl(path: string) {
  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(path)

  return data.publicUrl
}

// 删除图片文件
export async function deleteImageFile(path: string) {
  const { error } = await supabase.storage
    .from('images')
    .remove([path])

  return { error }
}