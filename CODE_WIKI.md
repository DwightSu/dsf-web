# MC服务器活动纪念网站 - Code Wiki

## 目录
- [1. 项目概述](#1-项目概述)
- [2. 整体架构](#2-整体架构)
- [3. 技术栈](#3-技术栈)
- [4. 项目结构](#4-项目结构)
- [5. 核心模块详解](#5-核心模块详解)
- [6. 关键类与函数](#6-关键类与函数)
- [7. 数据流与状态管理](#7-数据流与状态管理)
- [8. 路由系统](#8-路由系统)
- [9. 组件体系](#9-组件体系)
- [10. API层设计](#10-api层设计)
- [11. 工具函数库](#11-工具函数库)
- [12. 本地存储策略](#12-本地存储策略)
- [13. 类型系统](#13-类型系统)
- [14. 构建与部署](#14-构建与部署)
- [15. 开发指南](#15-开发指南)

---

## 1. 项目概述

### 1.1 项目定位
MC服务器活动纪念网站是一个基于Vue 3的现代化Web应用，用于记录和展示Minecraft服务器活动历程、参与玩家和精彩瞬间。采用Minecraft像素风格设计，提供活动管理、成员库、论坛交流等功能。

### 1.2 核心特性
- **像素风格UI**: Minecraft主题设计，像素化按钮、卡片和动画效果
- **用户系统**: 支持游客、普通用户、管理员三种角色
- **活动管理**: 活动展示、分组管理、图片画廊
- **成员库**: 成员信息管理、活动历史追踪
- **论坛系统**: 帖子发布、评论互动、内容审核
- **积分系统**: 积分排行榜、特殊记录榜单

### 1.3 技术亮点
- 采用Vue 3 Composition API + TypeScript
- Supabase BaaS平台提供后端服务
- Pinia状态管理 + LocalStorage缓存策略
- 响应式设计 + TailwindCSS样式系统
- GitHub Pages自动部署

---

## 2. 整体架构

### 2.1 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端应用层                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Vue 3 App   │  │  Vue Router  │  │    Pinia     │      │
│  │  (主应用)    │  │  (路由管理)  │  │  (状态管理)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Components  │  │    Views     │  │   Utils      │      │
│  │  (组件库)    │  │  (页面组件)  │  │  (工具函数)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                        API层                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth API    │  │ Activity API │  │   Post API   │      │
│  │  (认证接口)  │  │ (活动接口)   │  │  (帖子接口)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Supabase BaaS平台                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │ Auth Service │  │   Storage    │      │
│  │  (数据库)    │  │  (认证服务)  │  │  (文件存储)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    本地存储层                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ LocalStorage │  │   Cache      │  │  User Data   │      │
│  │  (持久化)    │  │  (数据缓存)  │  │  (用户信息)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 架构特点
- **前后端分离**: 前端Vue应用 + Supabase后端服务
- **状态管理**: Pinia集中式状态管理 + LocalStorage本地缓存
- **路由懒加载**: 按需加载页面组件，优化性能
- **类型安全**: TypeScript全覆盖，确保代码质量
- **响应式设计**: TailwindCSS + 自定义像素风格组件

---

## 3. 技术栈

### 3.1 核心框架
| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.4.15 | 前端框架，Composition API |
| TypeScript | ~5.3.3 | 类型系统，代码质量保障 |
| Vite | ^5.0.12 | 构建工具，开发服务器 |
| Vue Router | ^4.2.5 | 路由管理，页面导航 |
| Pinia | ^2.1.7 | 状态管理，数据共享 |

### 3.2 UI与样式
| 技术 | 版本 | 用途 |
|------|------|------|
| TailwindCSS | ^3.4.1 | CSS框架，响应式样式 |
| GSAP | ^3.12.5 | 动画库，交互效果 |
| Lucide Vue Next | ^0.511.0 | 图标库，UI图标 |
| clsx | ^2.1.1 | 类名合并工具 |
| tailwind-merge | ^3.3.0 | Tailwind类名冲突处理 |

### 3.3 后端服务
| 技术 | 版本 | 用途 |
|------|------|------|
| Supabase | ^2.39.0 | BaaS平台，数据库+认证+存储 |
| PostgreSQL | - | 关系型数据库，数据持久化 |

### 3.4 开发工具
| 技术 | 版本 | 用途 |
|------|------|------|
| ESLint | ^8.56.0 | 代码检查，规范约束 |
| TypeScript ESLint | ^7.0.1 | TS代码检查插件 |
| Vue TSC | ^1.8.27 | Vue类型检查 |
| PostCSS | ^8.4.35 | CSS处理工具 |
| Autoprefixer | ^10.4.17 | CSS自动前缀 |

---

## 4. 项目结构

### 4.1 目录树
```
/workspace/
├── .github/                    # GitHub配置
│   └── workflows/
│       └── deploy.yml          # 自动部署配置
├── .trae/                      # 项目文档
│   └── documents/
│       ├── prd.md              # 产品需求文档
│       └── tech-architecture.md # 技术架构文档
├── public/                     # 静态资源
│   └── assets/
│       └── images/
│           └── activities/     # 活动图片目录
├── src/                        # 源代码目录
│   ├── api/                    # API接口层
│   │   ├── supabase.ts         # Supabase客户端配置
│   │   ├── auth.ts             # 认证API
│   │   ├── activities.ts       # 活动API
│   │   ├── members.ts          # 成员API
│   │   ├── posts.ts            # 帖子API
│   │   ├── comments.ts         # 评论API
│   │   └── images.ts           # 图片API
│   ├── assets/                 # 静态资源
│   │   └ vue.svg               # Vue logo
│   ├── components/             # 组件库
│   │   ├── common/             # 通用组件
│   │   │   ├── Avatar.vue      # 头像组件
│   │   │   ├── LoadingSpinner.vue # 加载动画
│   │   │   ├── Modal.vue       # 模态框
│   │   │   ├── PixelButton.vue # 像素按钮
│   │   │   ├── PixelCard.vue   # 像素卡片
│   │   │   └── PixelInput.vue  # 像素输入框
│   │   └── layout/             # 布局组件
│   │   │   ├── Navbar.vue      # 导航栏
│   │   │   └── Footer.vue      # 页脚
│   │   └ Empty.vue             # 空状态组件
│   ├── composables/            # 组合式函数
│   │   └ useTheme.ts           # 主题管理
│   ├── lib/                    # 库文件
│   │   └ utils.ts              # 工具函数
│   ├── mock/                   # 模拟数据
│   │   └ index.ts              # Mock数据定义
│   ├── pages/                  # 页面组件（旧）
│   │   └ HomePage.vue          # 首页（旧版本）
│   ├── router/                 # 路由配置
│   │   └ index.ts              # 路由定义
│   ├── stores/                 # Pinia状态管理
│   │   ├── auth.ts             # 认证状态
│   │   ├── activities.ts       # 活动状态
│   │   └── members.ts          # 成员状态
│   ├── types/                  # TypeScript类型
│   │   ├── database.ts         # 数据库类型
│   │   ├── activity.ts         # 活动类型
│   │   ├── member.ts           # 成员类型
│   │   └ post.ts               # 帖子类型
│   ├── utils/                  # 工具函数
│   │   ├── format.ts           # 格式化工具
│   │   ├── storage.ts          # 存储工具
│   │   └ validation.ts         # 验证工具
│   ├── views/                  # 页面视图
│   │   ├── admin/              # 管理后台
│   │   │   ├── Dashboard.vue   # 管理首页
│   │   │   ├── UserManagement.vue # 用户管理
│   │   │   ├── ActivityManagement.vue # 活动管理
│   │   │   ├── ImageManagement.vue # 图片管理
│   │   │   └── ContentReview.vue # 内容审核
│   │   ├── Home.vue            # 首页
│   │   ├── Activities.vue      # 活动列表
│   │   ├── ActivityDetail.vue  # 活动详情
│   │   ├── Members.vue         # 成员库
│   │   ├── MemberDetail.vue    # 成员详情
│   │   ├── Forum.vue           # 论坛
│   │   ├── PostDetail.vue      # 帖子详情
│   │   ├── CreatePost.vue      # 发帖
│   │   ├── Login.vue           # 登录
│   │   ├── Register.vue        # 注册
│   │   ├── Profile.vue         # 个人中心
│   │   ├── Scoreboard.vue      # 积分榜
│   │   ├── SpecialRecords.vue  # 特殊榜单
│   │   └ NotFound.vue          # 404页面
│   ├── App.vue                 # 应用根组件
│   ├── main.ts                 # 应用入口
│   ├── style.css               # 全局样式
│   └── vite-env.d.ts           # Vite环境类型
├── .env.example                # 环境变量示例
├── .gitignore                  # Git忽略配置
├── index.html                  # HTML入口
├── package.json                # 项目配置
├── postcss.config.js           # PostCSS配置
├── tailwind.config.js          # Tailwind配置
├── tsconfig.json               # TypeScript配置
├── vite.config.ts              # Vite配置
├── README.md                   # 项目说明
└── PROGRESS.md                 # 开发进度
```

### 4.2 核心目录职责
- **src/api**: API接口封装，与Supabase交互
- **src/components**: 可复用UI组件库
- **src/stores**: Pinia状态管理，全局数据共享
- **src/router**: 路由配置，页面导航控制
- **src/views**: 页面级组件，业务逻辑实现
- **src/types**: TypeScript类型定义，类型安全保障
- **src/utils**: 工具函数库，通用逻辑封装

---

## 5. 核心模块详解

### 5.1 认证模块 (Auth Module)

#### 模块职责
- 用户注册、登录、登出
- 用户角色管理（游客、用户、管理员）
- 认证状态持久化
- 权限验证

#### 关键文件
- [src/api/auth.ts](file:///workspace/src/api/auth.ts): 认证API接口
- [src/stores/auth.ts](file:///workspace/src/stores/auth.ts): 认证状态管理

#### 核心功能
```typescript
// 注册流程
register(data: RegisterData) → Supabase signUp → 创建profile → 返回用户信息

// 登录流程
login(email, password) → Supabase signIn → 获取profile → 存储用户信息 → 返回AuthUser

// 权限验证
isAdmin(userId) → 查询profile.role → 返回boolean
```

#### 数据流
```
用户输入 → API层 → Supabase Auth → Profile表 → Store → LocalStorage → UI更新
```

### 5.2 活动模块 (Activity Module)

#### 模块职责
- 活动列表展示与筛选
- 活动详情查看
- 活动创建、更新、删除（管理员）
- 小组管理与成员分配
- 活动图片管理

#### 关键文件
- [src/api/activities.ts](file:///workspace/src/api/activities.ts): 活动API接口
- [src/stores/activities.ts](file:///workspace/src/stores/activities.ts): 活动状态管理
- [src/views/Activities.vue](file:///workspace/src/views/Activities.vue): 活动列表页面
- [src/views/ActivityDetail.vue](file:///workspace/src/views/ActivityDetail.vue): 活动详情页面

#### 核心功能
```typescript
// 获取活动列表
getActivities(filter) → Supabase查询 → 关联groups和members → 返回Activity[]

// 获取活动详情
getActivityById(id) → Supabase查询 → 关联groups/images/comments → 返回ActivityWithDetails

// 创建活动（管理员）
createActivity(activity) → Supabase insert → 返回Activity
```

#### 数据结构
```typescript
interface Activity {
  id: string
  name: string
  description: string | null
  activity_date: string
  activity_type: string | null
  has_groups: boolean
  cover_image: string | null
  groups?: Group[]      // 关联小组
  images?: Image[]      // 关联图片
}
```

### 5.3 成员模块 (Member Module)

#### 模块职责
- 成员信息管理
- 成员列表展示与搜索
- 成员活动历史追踪
- 小组成员分配

#### 关键文件
- [src/api/members.ts](file:///workspace/src/api/members.ts): 成员API接口
- [src/stores/members.ts](file:///workspace/src/stores/members.ts): 成员状态管理
- [src/views/Members.vue](file:///workspace/src/views/Members.vue): 成员库页面

#### 核心功能
```typescript
// 获取成员列表
getAllMembers() → Supabase查询 → 返回Member[]

// 创建成员
createMember(member) → Supabase insert → 返回Member

// 分配成员到小组
addMemberToGroup(groupMember) → Supabase insert → 关联group_members表
```

### 5.4 论坛模块 (Forum Module)

#### 模块职责
- 帖子发布与浏览
- 帖子评论互动
- 标签系统
- 内容审核（管理员）

#### 关键文件
- [src/api/posts.ts](file:///workspace/src/api/posts.ts): 帖子API接口
- [src/views/Forum.vue](file:///workspace/src/views/Forum.vue): 论坛页面
- [src/views/CreatePost.vue](file:///workspace/src/views/CreatePost.vue): 发帖页面

#### 核心功能
```typescript
// 获取帖子列表
getPosts(filter) → Supabase查询 → 关联profiles → 获取评论数 → 返回PostWithAuthor[]

// 创建帖子
createPost(post) → Supabase insert → 返回Post

// 增加浏览量
getPostById(id) → 查询帖子 → 获取评论 → 更新views → 返回PostDetail
```

### 5.5 管理后台模块 (Admin Module)

#### 模块职责
- 用户管理（角色设置、状态管理）
- 活动管理（创建、编辑、删除）
- 图片管理（上传、关联、删除）
- 内容审核（帖子、评论审核）

#### 关键文件
- [src/views/admin/Dashboard.vue](file:///workspace/src/views/admin/Dashboard.vue): 管理首页
- [src/views/admin/UserManagement.vue](file:///workspace/src/views/admin/UserManagement.vue): 用户管理
- [src/views/admin/ActivityManagement.vue](file:///workspace/src/views/admin/ActivityManagement.vue): 活动管理
- [src/views/admin/ImageManagement.vue](file:///workspace/src/views/admin/ImageManagement.vue): 图片管理
- [src/views/admin/ContentReview.vue](file:///workspace/src/views/admin/ContentReview.vue): 内容审核

---

## 6. 关键类与函数

### 6.1 核心类定义

#### AuthUser类
```typescript
// 文件: src/api/auth.ts
export interface AuthUser {
  id: string              // 用户ID
  email: string           // 邮箱
  role: 'user' | 'admin'  // 角色
  nickname: string        // 昵称
  qq_number: string       // QQ号
  avatar_url: string | null // 头像URL
}
```

#### Activity类
```typescript
// 文件: src/types/database.ts
export interface Activity {
  id: string                    // 活动ID
  name: string                  // 活动名称
  description: string | null    // 描述
  activity_date: string         // 活动日期
  activity_type: string | null  // 活动类型
  has_groups: boolean           // 是否分组
  cover_image: string | null    // 封面图片
  created_by: string | null     // 创建者ID
  created_at: string            // 创建时间
  updated_at: string            // 更新时间
  groups?: Group[]              // 关联小组
  images?: Image[]              // 关联图片
}
```

#### Member类
```typescript
// 文件: src/types/database.ts
export interface Member {
  id: string                    // 成员ID
  nickname: string              // 昵称
  qq_number: string | null      // QQ号
  avatar_url: string | null     // 头像URL
  notes: string | null          // 备注
  tags: string[]                // 标签
  created_at: string            // 创建时间
}
```

### 6.2 关键函数

#### 认证函数
```typescript
// src/api/auth.ts

// 用户注册
export async function register(data: RegisterData)
  → 调用Supabase signUp
  → 创建profile记录
  → 返回 { data, error }

// 用户登录
export async function login(email: string, password: string)
  → 调用Supabase signInWithPassword
  → 获取profile信息
  → 存储用户信息到LocalStorage
  → 返回 { data: AuthUser, error }

// 获取当前用户
export async function getCurrentUser(): Promise<AuthUser | null>
  → 获取Supabase auth.user
  → 查询profile表
  → 返回AuthUser或null

// 检查管理员权限
export async function isAdmin(userId: string): Promise<boolean>
  → 查询profile.role
  → 返回boolean
```

#### 活动函数
```typescript
// src/api/activities.ts

// 获取所有活动
export async function getActivities(filter?: ActivityFilter)
  → Supabase查询activities表
  → 关联查询groups和group_members
  → 应用筛选条件（年份、类型、搜索）
  → 返回 { data: Activity[], error }

// 获取单个活动详情
export async function getActivityById(id: string)
  → Supabase查询activities表
  → 关联查询groups、images
  → 返回 { data: ActivityWithDetails, error }

// 创建活动
export async function createActivity(activity: ActivityInsert)
  → Supabase insert到activities表
  → 返回 { data: Activity, error }

// 创建小组
export async function createGroup(group: GroupInsert)
  → Supabase insert到groups表
  → 返回 { data: Group, error }

// 添加成员到小组
export async function addMemberToGroup(groupMember: GroupMemberInsert)
  → Supabase insert到group_members表
  → 返回 { data, error }
```

#### 帖子函数
```typescript
// src/api/posts.ts

// 获取帖子列表
export async function getPosts(filter?: PostFilter)
  → Supabase查询posts表（status='published')
  → 关联查询profiles
  → 获取每个帖子的评论数
  → 应用筛选（标签、搜索、作者）
  → 返回 { data: PostWithAuthor[], error }

// 获取帖子详情
export async function getPostById(id: string)
  → 查询帖子基本信息
  → 查询帖子评论
  → 增加浏览量（views+1）
  → 返回 { data: PostDetail, error }

// 创建帖子
export async function createPost(post: PostInsert)
  → Supabase insert到posts表
  → 返回 { data: Post, error }
```

#### 工具函数
```typescript
// src/utils/format.ts

// 格式化日期
export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative')
  → 根据format参数返回不同格式的日期字符串
  → 'short': YYYY-MM-DD
  → 'long': YYYY年MM月DD日 星期X
  → 'relative': X天前/X小时前/刚刚

// 格式化数字
export function formatNumber(num: number)
  → 大于10000转换为"X万"
  → 否则返回原数字字符串

// 验证QQ号
export function isValidQQNumber(qq: string): boolean
  → 正则验证: /^[1-9]\d{4,10}$/
  → 返回boolean

// 合并CSS类名
export function cn(...inputs: ClassValue[])
  → 使用clsx和tailwind-merge合并类名
  → 处理Tailwind类名冲突
```

---

## 7. 数据流与状态管理

### 7.1 Pinia Store架构

#### AuthStore
```typescript
// src/stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<AuthUser | null>(null)       // 当前用户
  const loading = ref(false)                     // 加载状态
  const error = ref<string | null>(null)         // 错误信息
  const initialized = ref(false)                 // 初始化标志

  // 计算属性
  const isLoggedIn = computed(() => !!user.value)  // 是否登录
  const isAdmin = computed(() => user.value?.role === 'admin') // 是否管理员

  // 方法
  async function initialize()      // 初始化认证状态
  async function login()           // 登录
  async function register()        // 注册
  async function logout()          // 登出
  function updateUser()            // 更新用户信息
  function getAllUsers()           // 获取所有用户（管理员）
  function updateUserRole()        // 更新用户角色（管理员）
})
```

#### ActivityStore
```typescript
// src/stores/activities.ts
export const useActivityStore = defineStore('activity', () => {
  // 状态
  const activities = ref<Activity[]>([])           // 活动列表
  const currentActivity = ref<ActivityWithDetails | null>(null) // 当前活动
  const activityTypes = ref<string[]>([])          // 活动类型列表
  const activityYears = ref<number[]>([])          // 活动年份列表
  const loading = ref(false)                       // 加载状态
  const error = ref<string | null>(null)           // 错误信息
  const filter = ref<ActivityFilter>({})           // 篛选条件

  // 计算属性
  const filteredActivities = computed(() => {
    // 根据filter筛选activities
  })

  // 方法
  async function loadActivities()      // 加载活动列表
  async function loadActivityById()    // 加载单个活动
  async function createNewActivity()   // 创建活动
  async function updateExistingActivity() // 更新活动
  async function deleteExistingActivity() // 删除活动
  async function createNewGroup()      // 创建小组
  function setFilter()                 // 设置筛选条件
  function clearFilter()               // 清除筛选条件
})
```

### 7.2 数据流向

#### 用户认证流程
```
┌──────────┐
│ 用户输入 │
└──────────┘
     ↓
┌──────────┐
│ API层    │ auth.login(email, password)
└──────────┘
     ↓
┌──────────┐
│ Supabase │ Auth.signInWithPassword()
└──────────┘
     ↓
┌──────────┐
│ Profile表│ 查询用户profile
└──────────┘
     ↓
┌──────────┐
│ AuthStore│ 更新user状态
└──────────┘
     ↓
┌──────────┐
│LocalStorage│ 存储用户信息
└──────────┘
     ↓
┌──────────┐
│ UI更新   │ 导航栏显示用户信息
└──────────┘
```

#### 活动浏览流程
```
┌──────────┐
│ 页面加载 │ Activities.vue mounted
└──────────┘
     ↓
┌──────────┐
│ ActivityStore│ loadActivities()
└──────────┘
     ↓
┌──────────┐
│ 检查缓存 │ getCachedActivities()
└──────────┘
     ↓ (缓存不存在)
┌──────────┐
│ API层    │ getActivities()
└──────────┘
     ↓
┌──────────┐
│ Supabase │ 查询activities表
└──────────┘
     ↓
┌──────────┐
│ 关联查询 │ groups + group_members + members
└──────────┘
     ↓
┌──────────┐
│ Store更新│ activities.value = data
└──────────┘
     ↓
┌──────────┐
│ 缓存数据 │ cacheActivities(data)
└──────────┘
     ↓
┌──────────┐
│ UI渲染   │ 活动卡片列表
└──────────┘
```

### 7.3 状态同步策略
- **LocalStorage缓存**: 活动数据缓存1小时，减少API调用
- **实时更新**: Supabase实时订阅（可选）
- **乐观更新**: 本地先更新状态，API调用失败后回滚
- **错误处理**: API错误时显示错误信息，不阻塞UI

---

## 8. 路由系统

### 8.1 路由配置
```typescript
// src/router/index.ts

const routes: RouteRecordRaw[] = [
  // 公开页面
  { path: '/', name: 'Home', component: Home, meta: { requiresAuth: false } },
  { path: '/activities', name: 'Activities', component: Activities },
  { path: '/activities/:id', name: 'ActivityDetail', component: ActivityDetail },
  { path: '/members', name: 'Members', component: Members },
  { path: '/members/:id', name: 'MemberDetail', component: MemberDetail },
  { path: '/forum', name: 'Forum', component: Forum },
  { path: '/forum/post/:id', name: 'PostDetail', component: PostDetail },
  { path: '/scoreboard', name: 'Scoreboard', component: Scoreboard },
  { path: '/special-records', name: 'SpecialRecords', component: SpecialRecords },

  // 需登录页面
  { path: '/forum/create', name: 'CreatePost', component: CreatePost, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },

  // 登录/注册
  { path: '/login', name: 'Login', component: Login, meta: { guestOnly: true } },
  { path: '/register', name: 'Register', component: Register, meta: { guestOnly: true } },

  // 管理后台
  { path: '/admin', name: 'AdminDashboard', component: Dashboard, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/users', name: 'AdminUsers', component: UserManagement, meta: { requiresAdmin: true } },
  { path: '/admin/activities', name: 'AdminActivities', component: ActivityManagement },
  { path: '/admin/images', name: 'AdminImages', component: ImageManagement },
  { path: '/admin/content', name: 'AdminContent', component: ContentReview },

  // 404
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]
```

### 8.2 路由守卫
```typescript
// src/router/index.ts

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - MC活动纪念` : 'MC活动纪念'

  // 检查登录要求
  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }

    // 检查管理员权限
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      next('/')
      return
    }
  }

  // 检查游客专属页面
  if (to.meta.guestOnly && authStore.isLoggedIn) {
    next('/')
    return
  }

  next()
})
```

### 8.3 路由特性
- **懒加载**: 所有页面组件使用动态导入 `() => import('@/views/XXX.vue')`
- **路由元信息**: title、requiresAuth、requiresAdmin、guestOnly
- **滚动行为**: 支持锚点滚动、保存滚动位置
- **过渡动画**: 页面切换淡入淡出效果

---

## 9. 组件体系

### 9.1 组件分类

#### 通用组件 (Common Components)
- **PixelButton**: Minecraft像素风格按钮
  - 支持多种变体：primary、secondary、danger、success、ghost
  - 支持多种尺寸：sm、md、lg
  - 支持加载状态、禁用状态、块级按钮
  - 3D立体效果 + 悬停动画

- **PixelCard**: 像素风格卡片容器
  - 像素边框效果
  - 悬停阴影动画
  - 支持自定义内容

- **Modal**: 模态框组件
  - 支持自定义标题、内容
  - 确认/取消按钮
  - 背景遮罩 + 动画效果

- **LoadingSpinner**: 加载动画
  - Minecraft方块旋转动画
  - 像素风格设计

- **Avatar**: 头像组件
  - 支持图片URL或默认头像
  - 圆形/方形样式
  - 尺寸可配置

- **PixelInput**: 像素风格输入框
  - 像素边框
  - 支持前缀/后缀图标
  - 验证状态显示

#### 布局组件 (Layout Components)
- **Navbar**: 导航栏
  - 固定顶部定位
  - 响应式设计（桌面/移动端）
  - 用户信息显示
  - 管理员入口
  - 滚动时玻璃效果

- **Footer**: 页脚
  - 版权信息
  - 快捷链接
  - 社交图标

### 9.2 组件设计原则
- **单一职责**: 每个组件只负责一个功能
- **可复用性**: 通过props和slots实现高度可配置
- **类型安全**: TypeScript props定义
- **样式隔离**: Scoped CSS + TailwindCSS
- **像素风格**: 统一的Minecraft视觉风格

### 9.3 PixelButton组件详解
```vue
<!-- src/components/common/PixelButton.vue -->
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  block?: boolean
}

const buttonClasses = computed(() => {
  // 基础类名
  const baseClasses = ['pixel-button', 'shadow-pixel', 'hover:shadow-pixel-lg']

  // Minecraft配色
  const variantClasses = {
    primary: ['bg-grass-green', 'border-grass-green-dark'],
    secondary: ['bg-stone-gray', 'border-stone-gray-dark'],
    danger: ['bg-redstone-red', 'border-redstone-red-dark'],
    success: ['bg-diamond-blue', 'border-diamond-blue-dark']
  }

  return cn(baseClasses, variantClasses[props.variant])
})
</script>
```

---

## 10. API层设计

### 10.1 API架构
```
src/api/
├── supabase.ts      # Supabase客户端初始化
├── auth.ts          # 认证相关API
├── activities.ts    # 活动相关API
├── members.ts       # 成员相关API
├── posts.ts         # 帖子相关API
├── comments.ts      # 评论相关API
└── images.ts        # 图片相关API
```

### 10.2 Supabase客户端配置
```typescript
// src/api/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // 持久化会话
    autoRefreshToken: true,      // 自动刷新Token
    detectSessionInUrl: true     // 从URL检测会话
  }
})
```

### 10.3 API设计模式
- **统一返回格式**: `{ data, error }`
- **错误处理**: 捕获Supabase错误，返回友好错误信息
- **关联查询**: 使用Supabase的select关联查询
- **类型安全**: TypeScript类型定义所有API返回

### 10.4 典型API实现
```typescript
// src/api/activities.ts

export async function getActivities(filter?: ActivityFilter) {
  let query = supabase
    .from('activities')
    .select(`
      *,
      groups (
        id,
        name,
        score,
        description,
        group_members (
          id,
          member_id,
          members (
            id,
            nickname,
            qq_number,
            avatar_url
          )
        )
      )
    `)
    .order('activity_date', { ascending: false })

  // 应用筛选条件
  if (filter?.year) {
    query = query.gte('activity_date', `${filter.year}-01-01`)
                  .lte('activity_date', `${filter.year}-12-31`)
  }

  if (filter?.type) {
    query = query.eq('activity_type', filter.type)
  }

  if (filter?.search) {
    query = query.ilike('name', `%${filter.search}%`)
  }

  const { data, error } = await query
  return { data: data as Activity[], error }
}
```

---

## 11. 工具函数库

### 11.1 格式化工具 (src/utils/format.ts)

#### formatDate函数
```typescript
export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative')
  // 'short': 2024-01-15
  // 'long': 2024年1月15日 星期一
  // 'relative': 3天前 / 2小时前 / 刚刚
```

#### formatNumber函数
```typescript
export function formatNumber(num: number)
  // 15000 → "1.5万"
  // 999 → "999"
```

#### 验证函数
```typescript
export function isValidEmail(email: string): boolean
  // 正则验证邮箱格式

export function isValidQQNumber(qq: string): boolean
  // 正则验证QQ号: /^[1-9]\d{4,10}$/
```

#### CSS类名合并
```typescript
export function cn(...inputs: ClassValue[])
  // 使用clsx + tailwind-merge合并类名
  // 处理Tailwind类名冲突
```

### 11.2 存储工具 (src/utils/storage.ts)

#### LocalStorage封装
```typescript
// 基础操作
export function getStorage<T>(key: string): T | null
export function setStorage<T>(key: string, value: T): void
export function removeStorage(key: string): void
export function clearStorage(): void

// 用户信息存储
export function getStoredUser(): { id: string; role: string } | null
export function setStoredUser(user: { id: string; role: string }): void
export function removeStoredUser(): void

// 活动数据缓存
export function cacheActivities(activities: unknown[]): void
export function getCachedActivities(): unknown[] | null
  // 缓存有效期: 1小时
```

#### 自定义数据管理
```typescript
// 活动管理
export function getCustomActivities(): unknown[]
export function saveCustomActivity(activity: unknown): void
export function updateCustomActivity(id: string, updates: unknown): boolean
export function deleteCustomActivity(id: string): boolean

// 小组管理
export function getCustomGroups(): unknown[]
export function saveCustomGroup(group: unknown): void
export function deleteCustomGroup(id: string): boolean

// 成员管理
export function getCustomMembers(): unknown[]
export function saveCustomMember(member: unknown): void
export function deleteCustomMember(id: string): boolean

// 积分记录
export function getScoreRecords(): unknown[]
export function addScoreRecord(record: unknown): void
export function getMemberTotalScore(memberId: string): number
```

---

## 12. 本地存储策略

### 12.1 存储键名规范
```typescript
const STORAGE_PREFIX = 'mc_activity_'

export const STORAGE_KEYS = {
  USER: 'mc_activity_user',                    // 用户信息
  TOKEN: 'mc_activity_token',                  // 认证Token
  THEME: 'mc_activity_theme',                  // 主题设置
  CACHE_ACTIVITIES: 'mc_activity_cache_activities', // 活动缓存
  CACHE_MEMBERS: 'mc_activity_cache_members',  // 成员缓存
  CUSTOM_ACTIVITIES: 'mc_activity_custom_activities', // 自定义活动
  CUSTOM_GROUPS: 'mc_activity_custom_groups',  // 自定义小组
  CUSTOM_MEMBERS: 'mc_activity_custom_members', // 自定义成员
  SCORE_RECORDS: 'mc_activity_score_records',  // 积分记录
  SPECIAL_RECORDS: 'mc_activity_special_records' // 特殊记录
}
```

### 12.2 缓存策略
- **活动数据**: 缓存1小时，减少API调用
- **用户信息**: 持久化存储，登录状态保持
- **主题设置**: 持久化存储，用户偏好
- **自定义数据**: 本地创建的数据存储在LocalStorage

### 12.3 数据同步
- **读取优先级**: LocalStorage缓存 → Supabase API
- **写入策略**: API写入成功 → 更新LocalStorage缓存
- **错误处理**: API失败时使用本地数据，显示错误提示

---

## 13. 类型系统

### 13.1 数据库类型 (src/types/database.ts)

#### Profile类型
```typescript
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
```

#### Activity类型
```typescript
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
  content?: string | null
  rules?: string | null
  rewards?: string | null
  groups?: Group[]
  images?: Image[]
}
```

#### Member类型
```typescript
export interface Member {
  id: string
  nickname: string
  qq_number: string | null
  avatar_url: string | null
  notes: string | null
  tags: string[]
  created_at: string
}
```

#### Post类型
```typescript
export interface Post {
  id: string
  title: string
  summary?: string | null
  content: string
  author_id: string | null
  views: number
  tags: string[] | null
  status: 'published' | 'hidden'
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'nickname' | 'avatar_url'>
}
```

### 13.2 业务类型 (src/types/activity.ts)

#### ActivityWithDetails
```typescript
export interface ActivityWithDetails extends Omit<Activity, 'groups'> {
  groups: GroupWithMembers[]
  images: Image[]
  comments?: Comment[]
}
```

#### ActivityFilter
```typescript
export interface ActivityFilter {
  year?: number        // 年份筛选
  type?: string        // 类型筛选
  search?: string      // 搜索关键词
}
```

### 13.3 插入类型
```typescript
// 用于创建操作的类型，排除自动生成的字段
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>
export type ActivityInsert = Omit<Activity, 'id' | 'created_at' | 'updated_at' | 'groups' | 'images'>
export type MemberInsert = Omit<Member, 'id' | 'created_at'>
export type PostInsert = Omit<Post, 'id' | 'views' | 'created_at' | 'updated_at' | 'profiles'>
```

---

## 14. 构建与部署

### 14.1 构建配置

#### Vite配置 (vite.config.ts)
```typescript
export default defineConfig({
  base: '/dsf-web/',              // GitHub Pages基础路径
  build: {
    sourcemap: 'hidden'           // 生产环境隐藏sourcemap
  },
  plugins: [
    vue(),                        // Vue插件
    Inspector(),                  // Vue组件定位器
    traeBadgePlugin()             // TRAE徽章插件
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')  // @别名指向src目录
    }
  }
})
```

#### TypeScript配置 (tsconfig.json)
```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "composite": true,
    "strict": false,              // 关闭严格模式（开发阶段）
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"]          // @路径别名
    }
  },
  "include": ["src/**/*.ts", "src/**/*.vue", "api"]
}
```

#### TailwindCSS配置 (tailwind.config.js)
```javascript
export default {
  darkMode: "class",              // 暗黑模式通过class切换
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true                // 容器居中
    },
    extend: {}                    // 自定义扩展
  },
  plugins: []
}
```

### 14.2 构建脚本
```json
// package.json
{
  "scripts": {
    "dev": "vite",                // 开发服务器
    "build": "vue-tsc -b && vite build",  // 类型检查 + 构建
    "preview": "vite preview",    // 预览生产构建
    "check": "vue-tsc -b",        // TypeScript类型检查
    "lint": "eslint . --ext .ts,.vue",    // ESLint检查
    "lint:fix": "eslint . --ext .ts,.vue --fix"  // ESLint修复
  }
}
```

### 14.3 GitHub Actions部署
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]              # main分支触发部署

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - Checkout代码
      - Setup Node 22
      - npm ci安装依赖
      - npm run check类型检查
      - npm run build构建
      - Upload artifact上传构建产物

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - Deploy to GitHub Pages部署
```

### 14.4 环境变量
```bash
# .env.example
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SITE_TITLE=MC服务器活动纪念
VITE_SITE_DESCRIPTION=记录Minecraft服务器活动的精彩瞬间
```

---

## 15. 开发指南

### 15.1 本地开发流程

#### 1. 环境准备
```bash
# 克隆项目
git clone <repository-url>
cd dsf_web

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env填写Supabase配置
```

#### 2. Supabase配置
1. 访问 https://supabase.com 创建项目
2. 在SQL Editor执行数据库迁移脚本（参考tech-architecture.md）
3. 获取项目URL和Anon Key
4. 配置到.env文件

#### 3. 启动开发服务器
```bash
npm run dev
# 访问 http://localhost:5173/
```

### 15.2 代码规范

#### TypeScript规范
- 使用TypeScript编写所有代码
- 定义清晰的接口和类型
- 避免使用any类型
- 使用类型推断减少冗余类型声明

#### Vue组件规范
- 使用Composition API + `<script setup>`
- 组件文件使用PascalCase命名
- Props使用TypeScript定义
- 使用computed和watch响应式特性

#### 样式规范
- 优先使用TailwindCSS
- 自定义样式使用Scoped CSS
- 遵循Minecraft像素风格设计
- 使用CSS变量定义主题色

### 15.3 Git提交规范
```bash
# 功能开发
git checkout -b feature/活动管理优化
git commit -m "feat: 添加活动筛选功能"

# Bug修复
git checkout -b fix/登录验证错误
git commit -m "fix: 修复QQ号验证正则"

# 文档更新
git commit -m "docs: 更新API文档"

# 代码重构
git commit -m "refactor: 重构活动Store"
```

### 15.4 性能优化建议

#### 代码层面
- 使用路由懒加载
- 组件按需导入
- 使用v-if和v-show合理控制渲染
- 避免深层响应式对象

#### 数据层面
- 使用LocalStorage缓存
- 实现数据分页加载
- 图片懒加载
- 使用Supabase分页查询

#### UI层面
- 减少不必要的动画
- 使用CSS transform代替位置属性
- 避免频繁的DOM操作
- 使用虚拟滚动处理长列表

### 15.5 安全注意事项

#### 认证安全
- 使用Supabase内置JWT认证
- Token自动刷新机制
- 密码加密存储（Supabase处理）

#### 数据安全
- Supabase Row Level Security (RLS)
- 输入验证（QQ号、邮箱格式）
- XSS防护（Vue自动处理）
- CSRF防护（Supabase处理）

#### 文件上传安全
- 文件类型验证
- 文件大小限制
- 图片压缩处理
- 使用Supabase Storage

### 15.6 常见问题解决

#### Supabase连接问题
```bash
# 检查环境变量
echo $VITE_SUPABASE_URL

# 检查网络连接
curl $VITE_SUPABASE_URL

# 检查RLS策略
# 在Supabase Dashboard查看表权限
```

#### 路由问题
```typescript
// 检查路由守卫
router.beforeEach((to, from, next) => {
  console.log('Route:', to.path, 'Auth:', to.meta.requiresAuth)
  next()
})

// 检查路由配置
console.log(router.getRoutes())
```

#### 状态管理问题
```typescript
// 检查Store状态
const authStore = useAuthStore()
console.log('User:', authStore.user)
console.log('isLoggedIn:', authStore.isLoggedIn)

// 检查LocalStorage
console.log(localStorage.getItem('mc_activity_user'))
```

---

## 附录

### A. 项目依赖关系图
```
Vue 3
  ├── Vue Router (路由)
  ├── Pinia (状态管理)
  ├── TailwindCSS (样式)
  ├── GSAP (动画)
  ├── Lucide Vue Next (图标)
  └── Supabase JS (后端)

Supabase
  ├── PostgreSQL (数据库)
  ├── Auth Service (认证)
  └── Storage (文件存储)

开发工具
  ├── Vite (构建)
  ├── TypeScript (类型)
  ├── ESLint (检查)
  └── PostCSS (CSS处理)
```

### B. 数据库表关系
```
profiles (用户表)
  ↓ (auth.users关联)
  ├── posts (帖子表) [author_id]
  ├── comments (评论表) [author_id]
  └── activities (活动表) [created_by]

activities (活动表)
  ├── groups (小组表) [activity_id]
  └── images (图片表) [activity_id]

groups (小组表)
  └── group_members (小组成员表) [group_id]

members (成员表)
  └── group_members (小组成员表) [member_id]
```

### C. 页面路由映射
```
公开页面:
  / → Home.vue (首页)
  /activities → Activities.vue (活动列表)
  /activities/:id → ActivityDetail.vue (活动详情)
  /members → Members.vue (成员库)
  /members/:id → MemberDetail.vue (成员详情)
  /forum → Forum.vue (论坛)
  /forum/post/:id → PostDetail.vue (帖子详情)
  /scoreboard → Scoreboard.vue (积分榜)
  /special-records → SpecialRecords.vue (特殊榜单)

需登录页面:
  /forum/create → CreatePost.vue (发帖)
  /profile → Profile.vue (个人中心)

登录/注册:
  /login → Login.vue
  /register → Register.vue

管理后台:
  /admin → Dashboard.vue
  /admin/users → UserManagement.vue
  /admin/activities → ActivityManagement.vue
  /admin/images → ImageManagement.vue
  /admin/content → ContentReview.vue
```

### D. 关键文件索引
```
配置文件:
  - vite.config.ts (构建配置)
  - tsconfig.json (TypeScript配置)
  - tailwind.config.js (样式配置)
  - package.json (项目配置)
  - .env.example (环境变量示例)

核心代码:
  - src/main.ts (应用入口)
  - src/App.vue (根组件)
  - src/router/index.ts (路由配置)
  - src/api/supabase.ts (Supabase客户端)
  - src/stores/auth.ts (认证状态)
  - src/stores/activities.ts (活动状态)

类型定义:
  - src/types/database.ts (数据库类型)
  - src/types/activity.ts (活动类型)
  - src/types/member.ts (成员类型)
  - src/types/post.ts (帖子类型)

工具函数:
  - src/utils/format.ts (格式化工具)
  - src/utils/storage.ts (存储工具)
  - src/utils/validation.ts (验证工具)
  - src/lib/utils.ts (通用工具)
```

---

**文档版本**: v1.0
**最后更新**: 2026-06-25
**维护者**: MC服务器社区开发团队

---

本文档提供了MC服务器活动纪念网站的完整技术文档，涵盖项目架构、核心模块、关键代码、开发指南等内容。如有疑问或建议，请参考项目README或联系开发团队。