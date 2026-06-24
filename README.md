# MC服务器活动纪念网站

一个基于Minecraft像素风格的服务器活动纪念网站，记录活动历程、参与玩家和精彩瞬间。

## 功能特点

### 🎮 Minecraft像素风格设计
- 像素化按钮和卡片设计
- Minecraft方块旋转加载动画
- 粒子背景和方块装饰动画
- 像素字体 (Press Start 2P)
- Minecraft配色（草地绿、钻石蓝、金块黄、红石红）

### 👥 用户系统
- 用户注册和登录（支持QQ号）
- 普通用户和管理员角色区分
- 游客只能查看，登录用户可评论和发帖
- 管理员可管理用户、活动、图片和内容审核

### 📅 活动管理
- 活动列表和详情展示
- 支持分组活动
- 小组管理和成员分配
- 图片画廊展示
- 评论区互动

### 👤 成员库
- 成员信息管理
- QQ号记录
- 参与活动历史追踪
- 小组分配记录

### 💬 论坛系统
- 帖子发布和浏览
- Markdown支持
- 标签系统
- 评论和回复功能
- 内容审核机制

### 🎨 精美动效
- 页面过渡动画
- 卡片悬停效果
- 粒子浮动动画
- 方块旋转动画
- 滚动视差效果

## 技术栈

### 前端
- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **UI**: TailwindCSS
- **动画**: GSAP + CSS动画
- **图标**: Lucide Vue
- **类型**: TypeScript

### 后端
- **BaaS平台**: Supabase
  - PostgreSQL 数据库
  - 身份认证服务
  - Row Level Security

### 部署
- **前端托管**: GitHub Pages
- **图片存储**: GitHub仓库

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置Supabase

1. 访问 [Supabase](https://supabase.com) 创建项目
2. 在SQL Editor中执行数据库迁移（参考 `.trae/documents/tech-architecture.md`）
3. 复制 `.env.example` 为 `.env` 并填写配置：
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5173/

### 4. 构建生产版本
```bash
npm run build
```

预览生产构建：
```bash
npm run preview
```

## 项目结构

```
dsf_web/
├── src/
│   ├── api/              # API封装
│   │   ├── supabase.ts
│   │   ├── auth.ts
│   │   ├── activities.ts
│   │   ├── members.ts
│   │   ├── posts.ts
│   │   ├── comments.ts
│   │   └── images.ts
│   ├── components/
│   │   ├── common/       # 通用组件
│   │   │   ├── PixelButton.vue
│   │   │   ├── PixelCard.vue
│   │   │   ├── Modal.vue
│   │   │   ├── LoadingSpinner.vue
│   │   │   ├── Avatar.vue
│   │   │   └── PixelInput.vue
│   │   └── layout/       # 布局组件
│   │       ├── Navbar.vue
│   │       └── Footer.vue
│   ├── views/            # 页面组件
│   │   ├── Home.vue
│   │   ├── Activities.vue
│   │   ├── ActivityDetail.vue
│   │   ├── Members.vue
│   │   ├── MemberDetail.vue
│   │   ├── Forum.vue
│   │   ├── PostDetail.vue
│   │   ├── CreatePost.vue
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   ├── Profile.vue
│   │   ├── NotFound.vue
│   │   └── admin/
│   │       ├── Dashboard.vue
│   │       ├── UserManagement.vue
│   │       ├── ActivityManagement.vue
│   │       ├── ImageManagement.vue
│   │       └── ContentReview.vue
│   ├── stores/           # Pinia状态管理
│   │   ├── auth.ts
│   │   └── activities.ts
│   ├── router/           # 路由配置
│   │   └── index.ts
│   ├── types/            # TypeScript类型定义
│   │   ├── database.ts
│   │   ├── activity.ts
│   │   ├── member.ts
│   │   └── post.ts
│   ├── utils/            # 工具函数
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── storage.ts
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── public/
│   └── assets/
│       └── images/       # 图片存储目录
│           └── activities/   # 活动图片
├── .env.example          # 环境变量示例
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── PROGRESS.md           # 开发进度追踪
```

## 图片资源

- **图片目录**: `D:\Dwight\dsf_web\photo`
- **图片数量**: 27张
- **用途**: 活动照片展示

## 页面路由

| 路由 | 页面 | 权限 |
|------|------|------|
| `/` | 首页 | 公开 |
| `/activities` | 活动列表 | 公开 |
| `/activities/:id` | 活动详情 | 公开 |
| `/members` | 成员库 | 公开 |
| `/members/:id` | 成员详情 | 公开 |
| `/forum` | 论坛 | 公开 |
| `/forum/post/:id` | 帖子详情 | 公开 |
| `/forum/create` | 发帖 | 需登录 |
| `/login` | 登录 | 公开 |
| `/register` | 注册 | 公开 |
| `/profile` | 个人中心 | 需登录 |
| `/admin` | 管理后台 | 仅管理员 |
| `/admin/users` | 用户管理 | 仅管理员 |
| `/admin/activities` | 活动管理 | 仅管理员 |
| `/admin/images` | 图片管理 | 仅管理员 |
| `/admin/content` | 内容审核 | 仅管理员 |

## 部署到GitHub Pages

1. **创建GitHub仓库**
2. **推送代码**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```
3. **配置GitHub Pages**
   - 在仓库设置中启用GitHub Pages
   - 选择 `gh-pages` 分支
4. **添加环境变量**
   - 在仓库设置中添加 Secrets：
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
5. **配置GitHub Actions**
   - 创建 `.github/workflows/deploy.yml`（已配置）

## 开发指南

### 代码规范
- 使用 TypeScript
- 遵循 Vue 3 Composition API
- 组件文件使用 PascalCase 命名
- 样式使用 TailwindCSS
- 遵循 Minecraft 像素风格设计

### 提交规范
- 使用语义化提交信息
- 功能开发使用 feature 分支
- 修复bug使用 fix 分支

## 注意事项

- ⚠️ 需要配置 Supabase 才能使用完整功能
- ⚠️ 图片上传需要配置存储桶
- ⚠️ 部署前确保环境变量已正确配置
- ⚠️ 建议使用 Node.js v18+

## 许可证

MIT License

## 作者

MC服务器社区

## 最后更新

2026-06-23

---

**享受Minecraft风格的网页体验！🎮**