// Mock数据 - 用于演示和开发测试

import type { Activity, Group, Member, Post, Comment } from '@/types/database'
import { getCustomPosts, getCustomPostCommentsByPost, incrementPostViews } from '@/utils/storage'

// 成员数据
export const mockMembers: Member[] = [
  { id: 'm1', nickname: '史蒂夫', qq_number: '123456789', avatar_url: null, notes: '服务器老玩家', tags: ['建筑', 'PVP', '大佬'], created_at: '2024-01-15T00:00:00Z' },
  { id: 'm2', nickname: '苦力怕', qq_number: '234567890', avatar_url: null, notes: '建筑大师', tags: ['建筑', '生存', '大佬'], created_at: '2024-02-20T00:00:00Z' },
  { id: 'm3', nickname: '末影人', qq_number: '345678901', avatar_url: null, notes: '红石专家', tags: ['红石', '建筑', '大佬'], created_at: '2024-03-10T00:00:00Z' },
  { id: 'm4', nickname: '钻石剑', qq_number: '456789012', avatar_url: null, notes: 'PVP高手', tags: ['PVP', '竞技', '大佬'], created_at: '2024-04-05T00:00:00Z' },
  { id: 'm5', nickname: '金苹果', qq_number: '567890123', avatar_url: null, notes: '生存达人', tags: ['生存', '探索'], created_at: '2024-05-12T00:00:00Z' },
  { id: 'm6', nickname: '附魔台', qq_number: '678901234', avatar_url: null, notes: '收集狂', tags: ['收藏', '生存'], created_at: '2024-06-18T00:00:00Z' },
  { id: 'm7', nickname: '铁傀儡', qq_number: '789012345', avatar_url: null, notes: '管理员', tags: ['管理员', 'PVP', '建筑'], created_at: '2024-07-22T00:00:00Z' },
  { id: 'm8', nickname: '雪傀儡', qq_number: '890123456', avatar_url: null, notes: '萌新一枚', tags: ['萌新'], created_at: '2024-08-30T00:00:00Z' },
  { id: 'm9', nickname: '岩浆怪', qq_number: '901234567', avatar_url: null, notes: '下界探险者', tags: ['下界', '探索', '生存'], created_at: '2024-09-15T00:00:00Z' },
  { id: 'm10', nickname: '史莱姆', qq_number: '012345678', avatar_url: null, notes: '可爱担当', tags: ['收藏', '建筑'], created_at: '2024-10-01T00:00:00Z' },
  { id: 'm11', nickname: '凋零骷髅', qq_number: '112345678', avatar_url: null, notes: '刷怪塔建造者', tags: ['建筑', '红石', '大佬'], created_at: '2024-11-11T00:00:00Z' },
  { id: 'm12', nickname: '恶魂', qq_number: '223456789', avatar_url: null, notes: '建筑爱好者', tags: ['建筑', '生存'], created_at: '2024-12-25T00:00:00Z' }
]

// 小组数据
export const mockGroups: Group[] = [
  { id: 'g1', activity_id: 'a1', name: '红队', score: 850, description: '火焰小队，速度制胜', created_at: '2025-01-20T00:00:00Z' },
  { id: 'g2', activity_id: 'a1', name: '蓝队', score: 920, description: '寒冰战队，稳扎稳打', created_at: '2025-01-20T00:00:00Z' },
  { id: 'g3', activity_id: 'a1', name: '绿队', score: 780, description: '绿叶战队，生命力强', created_at: '2025-01-20T00:00:00Z' },
  { id: 'g4', activity_id: 'a2', name: 'Alpha小组', score: 0, description: '', created_at: '2025-03-15T00:00:00Z' },
  { id: 'g5', activity_id: 'a2', name: 'Beta小组', score: 0, description: '', created_at: '2025-03-15T00:00:00Z' }
]

// 小组成员关联
export const mockGroupMembers = [
  { id: 'gm1', group_id: 'g1', member_id: 'm1', joined_at: '2025-01-20T00:00:00Z' },
  { id: 'gm2', group_id: 'g1', member_id: 'm2', joined_at: '2025-01-20T00:00:00Z' },
  { id: 'gm3', group_id: 'g1', member_id: 'm3', joined_at: '2025-01-20T00:00:00Z' },
  { id: 'gm4', group_id: 'g1', member_id: 'm4', joined_at: '2025-01-20T00:00:00Z' },
  { id: 'gm5', group_id: 'g2', member_id: 'm5', joined_at: '2025-01-20T00:00:00Z' },
  { id: 'gm6', group_id: 'g2', member_id: 'm6', joined_at: '2025-01-20T00:00:00Z' },
  { id: 'gm7', group_id: 'g2', member_id: 'm7', joined_at: '2025-01-20T00:00:00Z' },
  { id: 'gm8', group_id: 'g2', member_id: 'm8', joined_at: '2025-01-20T00:00:00Z' },
  { id: 'gm9', group_id: 'g3', member_id: 'm9', joined_at: '2025-01-20T00:00:00Z' },
  { id: 'gm10', group_id: 'g3', member_id: 'm10', joined_at: '2025-01-20T00:00:00Z' },
  { id: 'gm11', group_id: 'g3', member_id: 'm11', joined_at: '2025-01-20T00:00:00Z' },
  { id: 'gm12', group_id: 'g3', member_id: 'm12', joined_at: '2025-01-20T00:00:00Z' },
  { id: 'gm13', group_id: 'g4', member_id: 'm1', joined_at: '2025-03-15T00:00:00Z' },
  { id: 'gm14', group_id: 'g4', member_id: 'm3', joined_at: '2025-03-15T00:00:00Z' },
  { id: 'gm15', group_id: 'g4', member_id: 'm5', joined_at: '2025-03-15T00:00:00Z' },
  { id: 'gm16', group_id: 'g5', member_id: 'm2', joined_at: '2025-03-15T00:00:00Z' },
  { id: 'gm17', group_id: 'g5', member_id: 'm4', joined_at: '2025-03-15T00:00:00Z' },
  { id: 'gm18', group_id: 'g5', member_id: 'm6', joined_at: '2025-03-15T00:00:00Z' }
]

// 图片数据
export const mockImages = [
  // 活动1的图片 (9张)
  { id: 'img1', activity_id: 'a1', url: '/assets/images/activities/activity1/image1.png', description: '活动开始前的集体合影', uploaded_by: null, created_at: '2025-01-20T10:00:00Z' },
  { id: 'img2', activity_id: 'a1', url: '/assets/images/activities/activity1/image2.png', description: '红蓝绿三队对峙', uploaded_by: null, created_at: '2025-01-20T11:30:00Z' },
  { id: 'img3', activity_id: 'a1', url: '/assets/images/activities/activity1/image3.png', description: '比赛进行中', uploaded_by: null, created_at: '2025-01-20T14:00:00Z' },
  { id: 'img4', activity_id: 'a1', url: '/assets/images/activities/activity1/image4.jpeg', description: '红队进攻瞬间', uploaded_by: null, created_at: '2025-01-20T15:20:00Z' },
  { id: 'img5', activity_id: 'a1', url: '/assets/images/activities/activity1/image5.jpeg', description: '蓝队防守基地', uploaded_by: null, created_at: '2025-01-20T16:45:00Z' },
  { id: 'img6', activity_id: 'a1', url: '/assets/images/activities/activity1/image6.jpeg', description: '绿队偷袭成功', uploaded_by: null, created_at: '2025-01-20T17:30:00Z' },
  { id: 'img7', activity_id: 'a1', url: '/assets/images/activities/activity1/image7.jpeg', description: '精彩击杀瞬间', uploaded_by: null, created_at: '2025-01-20T18:15:00Z' },
  { id: 'img8', activity_id: 'a1', url: '/assets/images/activities/activity1/image8.jpeg', description: '颁奖典礼', uploaded_by: null, created_at: '2025-01-20T20:00:00Z' },
  { id: 'img9', activity_id: 'a1', url: '/assets/images/activities/activity1/image9.jpeg', description: '大合影留念', uploaded_by: null, created_at: '2025-01-20T21:00:00Z' },

  // 活动2的图片 (9张)
  { id: 'img10', activity_id: 'a2', url: '/assets/images/activities/activity2/image10.jpeg', description: '建筑大赛开始', uploaded_by: null, created_at: '2025-03-15T09:00:00Z' },
  { id: 'img11', activity_id: 'a2', url: '/assets/images/activities/activity2/image11.jpeg', description: '选手们紧张建造中', uploaded_by: null, created_at: '2025-03-15T11:00:00Z' },
  { id: 'img12', activity_id: 'a2', url: '/assets/images/activities/activity2/image12.jpeg', description: '精美的建筑作品', uploaded_by: null, created_at: '2025-03-15T14:00:00Z' },
  { id: 'img13', activity_id: 'a2', url: '/assets/images/activities/activity2/image13.jpeg', description: '城堡建筑细节', uploaded_by: null, created_at: '2025-03-15T15:30:00Z' },
  { id: 'img14', activity_id: 'a2', url: '/assets/images/activities/activity2/image14.jpeg', description: '像素艺术作品', uploaded_by: null, created_at: '2025-03-15T16:45:00Z' },
  { id: 'img15', activity_id: 'a2', url: '/assets/images/activities/activity2/image15.jpeg', description: '现代化建筑', uploaded_by: null, created_at: '2025-03-15T17:30:00Z' },
  { id: 'img16', activity_id: 'a2', url: '/assets/images/activities/activity2/image16.jpeg', description: '东方风格建筑', uploaded_by: null, created_at: '2025-03-15T18:15:00Z' },
  { id: 'img17', activity_id: 'a2', url: '/assets/images/activities/activity2/image17.jpeg', description: '评委会打分中', uploaded_by: null, created_at: '2025-03-15T19:00:00Z' },
  { id: 'img18', activity_id: 'a2', url: '/assets/images/activities/activity2/image18.jpeg', description: '获奖选手合影', uploaded_by: null, created_at: '2025-03-15T21:00:00Z' },

  // 活动3的图片 (9张)
  { id: 'img19', activity_id: 'a3', url: '/assets/images/activities/activity3/image19.png', description: '生存挑战赛前准备', uploaded_by: null, created_at: '2025-06-01T08:00:00Z' },
  { id: 'img20', activity_id: 'a3', url: '/assets/images/activities/activity3/image20.png', description: '第一天的庇护所', uploaded_by: null, created_at: '2025-06-01T18:00:00Z' },
  { id: 'img21', activity_id: 'a3', url: '/assets/images/activities/activity3/image21.png', description: '挖矿大丰收', uploaded_by: null, created_at: '2025-06-02T12:00:00Z' },
  { id: 'img22', activity_id: 'a3', url: '/assets/images/activities/activity3/image22.png', description: '探索废弃矿井', uploaded_by: null, created_at: '2025-06-02T16:00:00Z' },
  { id: 'img23', activity_id: 'a3', url: '/assets/images/activities/activity3/image23.png', description: '第一次下界探险', uploaded_by: null, created_at: '2025-06-03T10:00:00Z' },
  { id: 'img24', activity_id: 'a3', url: '/assets/images/activities/activity3/image24.png', description: '与猪灵交易', uploaded_by: null, created_at: '2025-06-03T14:00:00Z' },
  { id: 'img25', activity_id: 'a3', url: '/assets/images/activities/activity3/image25.png', description: '末地传送门激活', uploaded_by: null, created_at: '2025-06-04T10:00:00Z' },
  { id: 'img26', activity_id: 'a3', url: '/assets/images/activities/activity3/image26.png', description: '挑战末影龙', uploaded_by: null, created_at: '2025-06-04T15:00:00Z' },
  { id: 'img27', activity_id: 'a3', url: '/assets/images/activities/activity3/image27.png', description: '胜利归来大合影', uploaded_by: null, created_at: '2025-06-05T20:00:00Z' }
]

// 活动数据
export const mockActivities: Activity[] = [
  {
    id: 'a1',
    name: '第一届BedWars起床战争大赛',
    description: '服务器首届起床战争大赛，三队对决，争夺最终胜利！玩家们展现了出色的PVP技巧和团队协作能力。蓝队凭借出色的防守和战术安排获得了冠军。',
    activity_date: '2025-01-20',
    activity_type: 'PVP竞技',
    has_groups: true,
    cover_image: '/assets/images/activities/activity1/image1.png',
    created_by: null,
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-20T22:00:00Z'
  },
  {
    id: 'a2',
    name: '春季建筑创意大赛',
    description: '以"春天"为主题的建筑创意大赛，选手们在限定时间内展现了惊人的创造力。从现代建筑到东方古典，从像素艺术到自然景观，每一件作品都令人惊叹。',
    activity_date: '2025-03-15',
    activity_type: '建筑比赛',
    has_groups: true,
    cover_image: '/assets/images/activities/activity2/image12.jpeg',
    created_by: null,
    created_at: '2025-03-01T00:00:00Z',
    updated_at: '2025-03-15T22:00:00Z'
  },
  {
    id: 'a3',
    name: '五天极限生存挑战',
    description: '5天极限生存挑战，从一无所有到屠龙通关！玩家们需要在有限时间内发展科技、探索下界、收集材料，最终挑战末影龙。这是一场对生存技巧和耐力的终极考验。',
    activity_date: '2025-06-01',
    activity_type: '生存挑战',
    has_groups: false,
    cover_image: '/assets/images/activities/activity3/image19.png',
    created_by: null,
    created_at: '2025-05-20T00:00:00Z',
    updated_at: '2025-06-05T22:00:00Z'
  }
]

// 帖子数据
export const mockPosts: Post[] = [
  {
    id: 'p1',
    title: '第一届起床战争赛后回顾 - 蓝队冠军之路',
    summary: '恭喜蓝队获得第一届起床战争大赛的冠军！作为蓝队队长，分享我们获胜的战术安排和关键瞬间。',
    content: '恭喜蓝队获得第一届起床战争大赛的冠军！\n\n作为蓝队的队长，我想和大家分享一下我们获胜的一些心得。\n\n## 战术安排\n\n我们采用了"稳扎稳打"的战术，前期重点发展经济，中期开始压制对手。\n\n## 关键瞬间\n\n1. 红队第一次进攻被我们成功防守\n2. 绿队的偷袭让我们损失了一些资源\n3. 最后一波进攻中，史蒂夫的关键击杀决定了胜负\n\n感谢所有队友的付出，也感谢红队和绿队带来的精彩对决！',
    author_id: null,
    views: 256,
    tags: ['起床战争', '赛事回顾', '蓝队'],
    status: 'published',
    created_at: '2025-01-21T10:30:00Z',
    updated_at: '2025-01-21T10:30:00Z'
  },
  {
    id: 'p2',
    title: '建筑大赛作品分享 - 我的中式庭院',
    summary: '这次建筑大赛我做了一个中式庭院，参考苏州园林设计风格，讲究移步换景，曲径通幽。',
    content: '大家好！这次建筑大赛我做了一个中式庭院，虽然没有拿到名次，但还是想分享给大家。\n\n### 设计理念\n\n参考了苏州园林的设计风格，讲究移步换景，曲径通幽。\n\n### 用到的方块\n\n- 石砖和石台阶做主体\n- 木头做柱子和窗框\n- 瓦片做屋顶\n- 灯笼做装饰\n\n欢迎大家提意见！',
    author_id: null,
    views: 189,
    tags: ['建筑比赛', '作品展示', '中式建筑'],
    status: 'published',
    created_at: '2025-03-16T14:20:00Z',
    updated_at: '2025-03-16T14:20:00Z'
  },
  {
    id: 'p3',
    title: '极限生存挑战的一些小技巧分享',
    summary: '刚结束了五天生存挑战，给大家分享一些实用的生存技巧，包括第一天最重要的事、挖矿技巧和下界探索心得。',
    content: '刚结束了五天生存挑战，给大家分享一些实用的生存技巧。\n\n## 第一天最重要的事\n\n1. 先撸树，做工具\n2. 找一个合适的地方建庇护所\n3. 尽早下矿挖铁矿\n\n## 挖矿技巧\n\n- 鱼骨挖矿法效率最高\n- 带够火把\n- 注意听怪的声音\n\n## 下界探索\n\n- 一定要带方块铺路\n- 金锭可以和猪灵交易\n- 小心岩浆怪\n\n希望对大家有帮助！',
    author_id: null,
    views: 342,
    tags: ['生存挑战', '技巧分享', '新手向'],
    status: 'published',
    created_at: '2025-06-06T09:15:00Z',
    updated_at: '2025-06-06T09:15:00Z'
  },
  {
    id: 'p4',
    title: '服务器新玩家生存指南',
    summary: '欢迎来到我们的MC服务器！作为老玩家，给新人们一些开始游戏的建议和服务器规则介绍。',
    content: '欢迎来到我们的MC服务器！作为一个老玩家，给新人们一些建议。\n\n## 开始游戏\n\n- 先选好你的出生地附近建家\n- 记得设置家的坐标\n- 有问题可以在群里问\n\n## 服务器规则\n\n1. 不要破坏别人的建筑\n2. PVP需要双方同意\n3. 禁止使用作弊客户端\n\n祝大家游戏愉快！',
    author_id: null,
    views: 567,
    tags: ['新手教程', '服务器规则', '指南'],
    status: 'published',
    created_at: '2025-02-10T16:45:00Z',
    updated_at: '2025-02-10T16:45:00Z'
  },
  {
    id: 'p5',
    title: '我的红石自动农场教程',
    summary: '分享一个全自动小麦农场的设计，效率很高！介绍所需材料和红石电路原理。',
    content: '今天给大家分享一个全自动小麦农场的设计，效率很高！\n\n## 所需材料\n\n- 活塞若干\n- 红石粉\n- 红石比较器\n- 漏斗和箱子\n- 水和小麦种子\n\n## 原理\n\n利用红石电路控制活塞定时收割，漏斗自动收集。\n\n具体的建造过程我会在下次直播中演示，敬请关注！',
    author_id: null,
    views: 278,
    tags: ['红石', '教程', '自动化'],
    status: 'published',
    created_at: '2025-04-20T11:00:00Z',
    updated_at: '2025-04-20T11:00:00Z'
  }
]

// 帖子作者信息
export const mockPostAuthors: Record<string, { nickname: string; avatar_url: string | null }> = {
  p1: { nickname: '史蒂夫', avatar_url: null },
  p2: { nickname: '苦力怕', avatar_url: null },
  p3: { nickname: '金苹果', avatar_url: null },
  p4: { nickname: '铁傀儡', avatar_url: null },
  p5: { nickname: '末影人', avatar_url: null }
}

// 评论数据
export const mockComments: Comment[] = [
  // 帖子1的评论
  { id: 'c1', target_type: 'post', target_id: 'p1', content: '恭喜蓝队！这场比赛太精彩了', author_id: null, status: 'visible', created_at: '2025-01-21T11:00:00Z' },
  { id: 'c2', target_type: 'post', target_id: 'p1', content: '红队虽败犹荣，下次一定赢回来！', author_id: null, status: 'visible', created_at: '2025-01-21T12:30:00Z' },
  { id: 'c3', target_type: 'post', target_id: 'p1', content: '绿队表示还会回来的', author_id: null, status: 'visible', created_at: '2025-01-21T14:15:00Z' },

  // 帖子2的评论
  { id: 'c4', target_type: 'post', target_id: 'p2', content: '好漂亮！能教我怎么做吗', author_id: null, status: 'visible', created_at: '2025-03-16T15:00:00Z' },
  { id: 'c5', target_type: 'post', target_id: 'p2', content: '我觉得这个设计很有创意，没拿到名次太可惜了', author_id: null, status: 'visible', created_at: '2025-03-16T16:20:00Z' },

  // 帖子3的评论
  { id: 'c6', target_type: 'post', target_id: 'p3', content: '学到了！谢谢分享', author_id: null, status: 'visible', created_at: '2025-06-06T10:30:00Z' },
  { id: 'c7', target_type: 'post', target_id: 'p3', content: '钓鱼其实也很重要，可以钓到好东西', author_id: null, status: 'visible', created_at: '2025-06-06T11:45:00Z' },
  { id: 'c8', target_type: 'post', target_id: 'p3', content: '萌新表示受益匪浅', author_id: null, status: 'visible', created_at: '2025-06-06T13:00:00Z' },

  // 活动1的评论
  { id: 'c9', target_type: 'activity', target_id: 'a1', content: '超精彩的活动！期待下一次', author_id: null, status: 'visible', created_at: '2025-01-22T09:00:00Z' },
  { id: 'c10', target_type: 'activity', target_id: 'a1', content: '参加了好开心，认识了很多新朋友', author_id: null, status: 'visible', created_at: '2025-01-22T10:30:00Z' },

  // 活动2的评论
  { id: 'c11', target_type: 'activity', target_id: 'a2', content: '建筑大赛太棒了，大佬们都太强了', author_id: null, status: 'visible', created_at: '2025-03-17T08:00:00Z' },

  // 活动3的评论
  { id: 'c12', target_type: 'activity', target_id: 'a3', content: '五天生存太刺激了，下次还要参加！', author_id: null, status: 'visible', created_at: '2025-06-07T10:00:00Z' },
  { id: 'c13', target_type: 'activity', target_id: 'a3', content: '末影龙那段真的燃', author_id: null, status: 'visible', created_at: '2025-06-07T12:00:00Z' }
]

// 评论作者信息
export const mockCommentAuthors: Record<string, { nickname: string; avatar_url: string | null }> = {
  c1: { nickname: '钻石剑', avatar_url: null },
  c2: { nickname: '岩浆怪', avatar_url: null },
  c3: { nickname: '史莱姆', avatar_url: null },
  c4: { nickname: '雪傀儡', avatar_url: null },
  c5: { nickname: '附魔台', avatar_url: null },
  c6: { nickname: '雪傀儡', avatar_url: null },
  c7: { nickname: '恶魂', avatar_url: null },
  c8: { nickname: '史莱姆', avatar_url: null },
  c9: { nickname: '金苹果', avatar_url: null },
  c10: { nickname: '凋零骷髅', avatar_url: null },
  c11: { nickname: '史蒂夫', avatar_url: null },
  c12: { nickname: '苦力怕', avatar_url: null },
  c13: { nickname: '末影人', avatar_url: null }
}

// 获取活动详情（包含小组和图片）
export function getMockActivityDetail(id: string) {
  const activity = mockActivities.find(a => a.id === id)
  if (!activity) return null

  const groups = mockGroups.filter(g => g.activity_id === id)
  const groupsWithMembers = groups.map(g => ({
    ...g,
    group_members: mockGroupMembers
      .filter(gm => gm.group_id === g.id)
      .map(gm => ({
        ...gm,
        members: mockMembers.find(m => m.id === gm.member_id)
      }))
  }))

  const images = mockImages.filter(img => img.activity_id === id)

  return {
    ...activity,
    groups: groupsWithMembers,
    images
  }
}

// 获取活动的评论
export function getMockActivityComments(activityId: string) {
  return mockComments
    .filter(c => c.target_type === 'activity' && c.target_id === activityId)
    .map(c => ({
      ...c,
      profiles: mockCommentAuthors[c.id] || { nickname: '匿名', avatar_url: null }
    }))
}

// 获取帖子的评论
export function getMockPostComments(postId: string) {
  return mockComments
    .filter(c => c.target_type === 'post' && c.target_id === postId)
    .map(c => ({
      ...c,
      profiles: mockCommentAuthors[c.id] || { nickname: '匿名', avatar_url: null }
    }))
}

// 获取成员活动历史
export function getMockMemberActivities(memberId: string) {
  const memberGroupIds = mockGroupMembers
    .filter(gm => gm.member_id === memberId)
    .map(gm => gm.group_id)

  const memberGroups = mockGroups.filter(g => memberGroupIds.includes(g.id))
  const activityIds = [...new Set(memberGroups.map(g => g.activity_id))]

  return activityIds.map(aid => {
    const activity = mockActivities.find(a => a.id === aid)
    const group = memberGroups.find(g => g.activity_id === aid)
    return {
      activity_id: aid,
      activity_name: activity?.name || '',
      activity_date: activity?.activity_date || '',
      group_name: group?.name || ''
    }
  })
}

// 获取所有帖子（mock + 用户自定义）
export function getAllPosts(): Post[] {
  const customPosts = getCustomPosts() as Post[]
  return [...customPosts, ...mockPosts]
}

// 获取帖子作者信息（支持自定义帖子）
export function getPostAuthor(postId: string): { nickname: string; avatar_url: string | null } {
  const customPost = getCustomPosts().find((p: any) => p.id === postId) as any
  if (customPost && customPost.author_nickname) {
    return {
      nickname: customPost.author_nickname,
      avatar_url: customPost.author_avatar_url || null
    }
  }
  return mockPostAuthors[postId] || { nickname: '匿名', avatar_url: null }
}

// 获取帖子评论数
export function getPostCommentCount(postId: string): number {
  const mockCount = mockComments.filter(c => c.target_type === 'post' && c.target_id === postId).length
  const customComments = getCustomPostCommentsByPost(postId) as any[]
  return mockCount + customComments.length
}

// 获取帖子详情（支持自定义帖子）
export function getMockPostDetail(id: string) {
  const customPost = getCustomPosts().find((p: any) => p.id === id) as any
  if (customPost) {
    const author = {
      nickname: customPost.author_nickname || '匿名',
      avatar_url: customPost.author_avatar_url || null
    }
    const comments = getCustomPostCommentsByPost(id).map((c: any) => ({
      ...c,
      profiles: {
        nickname: c.author_nickname || '匿名',
        avatar_url: c.author_avatar_url || null
      }
    }))
    incrementPostViews(id)
    return {
      ...customPost,
      profiles: author,
      comments
    }
  }

  const post = mockPosts.find(p => p.id === id)
  if (!post) return null

  const author = mockPostAuthors[id] || { nickname: '匿名', avatar_url: null }
  const comments = getMockPostComments(id)

  return {
    ...post,
    profiles: author,
    comments
  }
}