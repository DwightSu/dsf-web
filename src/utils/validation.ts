// 验证工具函数

import { isValidEmail, isValidQQNumber } from './format'

export interface ValidationResult {
  valid: boolean
  message: string
}

// 验证用户名
export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { valid: false, message: '用户名不能为空' }
  }
  if (username.length < 3) {
    return { valid: false, message: '用户名至少需要3个字符' }
  }
  if (username.length > 20) {
    return { valid: false, message: '用户名不能超过20个字符' }
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字和下划线' }
  }
  return { valid: true, message: '' }
}

// 验证昵称
export function validateNickname(nickname: string): ValidationResult {
  if (!nickname) {
    return { valid: false, message: '昵称不能为空' }
  }
  if (nickname.length < 2) {
    return { valid: false, message: '昵称至少需要2个字符' }
  }
  if (nickname.length > 50) {
    return { valid: false, message: '昵称不能超过50个字符' }
  }
  return { valid: true, message: '' }
}

// 验证QQ号
export function validateQQNumber(qqNumber: string): ValidationResult {
  if (!qqNumber) {
    return { valid: false, message: 'QQ号不能为空' }
  }
  if (!isValidQQNumber(qqNumber)) {
    return { valid: false, message: '请输入有效的QQ号（5-11位数字）' }
  }
  return { valid: true, message: '' }
}

// 验证邮箱
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { valid: false, message: '邮箱不能为空' }
  }
  if (!isValidEmail(email)) {
    return { valid: false, message: '请输入有效的邮箱地址' }
  }
  return { valid: true, message: '' }
}

// 验证密码
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, message: '密码不能为空' }
  }
  if (password.length < 6) {
    return { valid: false, message: '密码至少需要6个字符' }
  }
  if (password.length > 100) {
    return { valid: false, message: '密码不能超过100个字符' }
  }
  return { valid: true, message: '' }
}

// 验证确认密码
export function validateConfirmPassword(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword) {
    return { valid: false, message: '请确认密码' }
  }
  if (password !== confirmPassword) {
    return { valid: false, message: '两次输入的密码不一致' }
  }
  return { valid: true, message: '' }
}

// 验证活动名称
export function validateActivityName(name: string): ValidationResult {
  if (!name) {
    return { valid: false, message: '活动名称不能为空' }
  }
  if (name.length > 200) {
    return { valid: false, message: '活动名称不能超过200个字符' }
  }
  return { valid: true, message: '' }
}

// 验证帖子标题
export function validatePostTitle(title: string): ValidationResult {
  if (!title) {
    return { valid: false, message: '帖子标题不能为空' }
  }
  if (title.length > 200) {
    return { valid: false, message: '帖子标题不能超过200个字符' }
  }
  return { valid: true, message: '' }
}

// 验证帖子简介
export function validatePostSummary(summary: string | null | undefined): ValidationResult {
  if (!summary) {
    return { valid: true, message: '' }
  }
  if (summary.length > 200) {
    return { valid: false, message: '帖子简介不能超过200个字符' }
  }
  return { valid: true, message: '' }
}

// 验证帖子内容
export function validatePostContent(content: string): ValidationResult {
  if (!content) {
    return { valid: false, message: '帖子内容不能为空' }
  }
  if (content.length > 50000) {
    return { valid: false, message: '帖子内容不能超过50000个字符' }
  }
  return { valid: true, message: '' }
}

// 验证评论内容
export function validateCommentContent(content: string): ValidationResult {
  if (!content) {
    return { valid: false, message: '评论内容不能为空' }
  }
  if (content.length > 500) {
    return { valid: false, message: '评论内容不能超过500个字符' }
  }
  return { valid: true, message: '' }
}

// 验证注册表单
export function validateRegisterForm(formData: {
  username: string
  nickname: string
  qqNumber: string
  email: string
  password: string
  confirmPassword: string
}): ValidationResult[] {
  return [
    validateUsername(formData.username),
    validateNickname(formData.nickname),
    validateQQNumber(formData.qqNumber),
    validateEmail(formData.email),
    validatePassword(formData.password),
    validateConfirmPassword(formData.password, formData.confirmPassword)
  ]
}

// 验证登录表单
export function validateLoginForm(formData: {
  email: string
  password: string
}): ValidationResult[] {
  return [
    validateEmail(formData.email),
    validatePassword(formData.password)
  ]
}