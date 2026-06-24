// 认证 API

import { supabase } from './supabase'
import type { Profile, ProfileInsert } from '@/types/database'
import { setStoredUser, removeStoredUser } from '@/utils/storage'

export interface AuthUser {
  id: string
  email: string
  role: 'user' | 'admin'
  nickname: string
  qq_number: string
  avatar_url: string | null
}

export interface RegisterData {
  email: string
  password: string
  nickname: string
  qq_number: string
  username: string
}

// 注册
export async function register(data: RegisterData) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        nickname: data.nickname,
        qq_number: data.qq_number,
        username: data.username
      }
    }
  })

  if (authError) {
    return { data: null, error: authError }
  }

  // 创建用户profile
  if (authData.user) {
    const profileData: ProfileInsert = {
      username: data.username,
      qq_number: data.qq_number,
      nickname: data.nickname,
      avatar_url: null,
      role: 'user',
      status: 'active'
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ ...profileData, id: authData.user.id })

    if (profileError) {
      return { data: null, error: profileError }
    }
  }

  return { data: authData, error: null }
}

// 登录
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { data: null, error }
  }

  if (data.user) {
    // 获取用户profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profile) {
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || '',
        role: profile.role,
        nickname: profile.nickname,
        qq_number: profile.qq_number,
        avatar_url: profile.avatar_url
      }
      setStoredUser({ id: authUser.id, role: authUser.role })
      return { data: authUser, error: null }
    }
  }

  return { data: null, error: null }
}

// 登出
export async function logout() {
  const { error } = await supabase.auth.signOut()
  removeStoredUser()
  return { error }
}

// 获取当前用户
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return null
  }

  return {
    id: user.id,
    email: user.email || '',
    role: profile.role,
    nickname: profile.nickname,
    qq_number: profile.qq_number,
    avatar_url: profile.avatar_url
  }
}

// 更新用户信息
export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

// 检查是否为管理员
export async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return data?.role === 'admin'
}

// 监听认证状态变化
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event) => {
    if (event === 'SIGNED_IN') {
      const user = await getCurrentUser()
      callback(user)
    } else if (event === 'SIGNED_OUT') {
      callback(null)
    }
  })
}

// 获取所有用户（管理员用）
export async function getProfiles(filter?: { search?: string; role?: string; status?: string }) {
  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (filter?.search) {
    query = query.or(`nickname.ilike.%${filter.search}%,email.ilike.%${filter.search}%`)
  }

  if (filter?.role) {
    query = query.eq('role', filter.role)
  }

  if (filter?.status) {
    query = query.eq('status', filter.status)
  }

  const { data, error } = await query

  return { data: data as Profile[], error }
}

// 设置用户角色
export async function setUserRole(userId: string, role: 'user' | 'admin') {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()

  return { data: data as Profile, error }
}

// 设置用户状态
export async function setUserStatus(userId: string, status: 'active' | 'disabled') {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId)
    .select()
    .single()

  return { data: data as Profile, error }
}