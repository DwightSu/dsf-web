// 工具函数

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// 合并 Tailwind CSS 类名
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化日期
export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = new Date(date)

  if (format === 'short') {
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  if (format === 'long') {
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  if (format === 'relative') {
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 7) {
      return formatDate(date, 'short')
    }
    if (days > 0) {
      return `${days}天前`
    }
    if (hours > 0) {
      return `${hours}小时前`
    }
    if (minutes > 0) {
      return `${minutes}分钟前`
    }
    return '刚刚'
  }

  return d.toLocaleDateString('zh-CN')
}

// 格式化数字
export function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }
  return num.toString()
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证QQ号格式
export function isValidQQNumber(qq: string): boolean {
  const qqRegex = /^[1-9]\d{4,10}$/
  return qqRegex.test(qq)
}

// 生成随机颜色
export function generateRandomColor(): string {
  const colors = [
    '#4AEDD9', // 钻石蓝
    '#FFD700', // 金块黄
    '#2D5016', // 草地绿
    '#8B4513', // 泥土棕
    '#708090', // 石头灰
    '#E74C3C', // 红石红
    '#9B59B6', // 紫水晶紫
    '#3498DB'  // 水蓝
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 获取默认头像URL
export function getDefaultAvatar(seed: string): string {
  const color = generateRandomColor()
  return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}&backgroundColor=${color.slice(1)}`
}

// 延迟函数
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// 图片懒加载
export function lazyLoadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = url
    img.onload = () => resolve(url)
    img.onerror = reject
  })
}

// 截断文本
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}