import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由配置
const routes: RouteRecordRaw[] = [
  // 公开页面
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页',
      requiresAuth: false
    }
  },
  {
    path: '/activities',
    name: 'Activities',
    component: () => import('@/views/Activities.vue'),
    meta: {
      title: '活动列表',
      requiresAuth: false
    }
  },
  {
    path: '/activities/:id',
    name: 'ActivityDetail',
    component: () => import('@/views/ActivityDetail.vue'),
    meta: {
      title: '活动详情',
      requiresAuth: false
    }
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('@/views/Members.vue'),
    meta: {
      title: '成员库',
      requiresAuth: false
    }
  },
  {
    path: '/members/:id',
    name: 'MemberDetail',
    component: () => import('@/views/MemberDetail.vue'),
    meta: {
      title: '成员详情',
      requiresAuth: false
    }
  },
  {
    path: '/scoreboard',
    name: 'Scoreboard',
    component: () => import('@/views/Scoreboard.vue'),
    meta: {
      title: '积分排行榜',
      requiresAuth: false
    }
  },
  {
    path: '/special-records',
    name: 'SpecialRecords',
    component: () => import('@/views/SpecialRecords.vue'),
    meta: {
      title: '特殊榜单',
      requiresAuth: false
    }
  },
  {
    path: '/forum',
    name: 'Forum',
    component: () => import('@/views/Forum.vue'),
    meta: {
      title: '论坛',
      requiresAuth: false
    }
  },
  {
    path: '/forum/post/:id',
    name: 'PostDetail',
    component: () => import('@/views/PostDetail.vue'),
    meta: {
      title: '帖子详情',
      requiresAuth: false
    }
  },

  // 需要登录的页面
  {
    path: '/forum/create',
    name: 'CreatePost',
    component: () => import('@/views/CreatePost.vue'),
    meta: {
      title: '发布帖子',
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      title: '个人中心',
      requiresAuth: true
    }
  },

  // 登录/注册页面
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false,
      guestOnly: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: {
      title: '注册',
      requiresAuth: false,
      guestOnly: true
    }
  },

  // 管理后台（需要管理员权限）
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/Dashboard.vue'),
    meta: {
      title: '管理后台',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/views/admin/UserManagement.vue'),
    meta: {
      title: '用户管理',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/activities',
    name: 'AdminActivities',
    component: () => import('@/views/admin/ActivityManagement.vue'),
    meta: {
      title: '活动管理',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/images',
    name: 'AdminImages',
    component: () => import('@/views/admin/ImageManagement.vue'),
    meta: {
      title: '图片管理',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/content',
    name: 'AdminContent',
    component: () => import('@/views/admin/ContentReview.vue'),
    meta: {
      title: '内容审核',
      requiresAuth: true,
      requiresAdmin: true
    }
  },

  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '页面未找到',
      requiresAuth: false
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0, behavior: 'smooth' }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 设置页面标题
  const title = to.meta.title as string
  document.title = title ? `${title} - MC活动纪念` : 'MC活动纪念'

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      // 未登录，跳转到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      // 不是管理员，跳转到首页
      next('/')
      return
    }
  }

  // 检查是否是仅游客页面（已登录用户不能访问）
  if (to.meta.guestOnly && authStore.isLoggedIn) {
    next('/')
    return
  }

  next()
})

export default router