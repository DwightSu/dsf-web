<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  AlertTriangle,
  Award,
  Ban,
  Star,
  Shield,
  Skull,
  BookOpen,
  Users,
  Calendar,
  Plus,
  X,
  Search,
  Filter
} from 'lucide-vue-next'
import { useMemberStore } from '@/stores/members'
import { useAuthStore } from '@/stores/auth'
import { getSpecialRecords, addSpecialRecord, deleteSpecialRecord } from '@/utils/storage'
import type { Member, SpecialRecord } from '@/types/database'
import { formatDate } from '@/utils/format'

const memberStore = useMemberStore()
const authStore = useAuthStore()

const loading = ref(true)
const searchQuery = ref('')
const selectedType = ref<string>('all')
const showAddModal = ref(false)

// 新记录表单
const newRecord = ref({
  member_id: '',
  record_type: 'special' as SpecialRecord['record_type'],
  title: '',
  description: ''
})

onMounted(() => {
  setTimeout(() => (loading.value = false), 500)
})

// 特殊记录类型定义
const recordTypes = [
  { value: 'all', label: '全部', icon: BookOpen, color: 'text-gray-400' },
  { value: 'jail', label: '毒薯监狱', icon: Skull, color: 'text-red-500' },
  { value: 'achievement', label: '成就记录', icon: Award, color: 'text-yellow-500' },
  { value: 'award', label: '荣誉奖项', icon: Star, color: 'text-green-500' },
  { value: 'punishment', label: '惩罚记录', icon: Ban, color: 'text-orange-500' },
  { value: 'special', label: '特殊事件', icon: Shield, color: 'text-purple-500' }
]

// 获取所有特殊记录
const allRecords = computed<SpecialRecord[]>(() => {
  return getSpecialRecords() as SpecialRecord[]
})

// 过滤后的记录
const filteredRecords = computed(() => {
  let result = allRecords.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(r =>
      r.title.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query)
    )
  }

  if (selectedType.value !== 'all') {
    result = result.filter(r => r.record_type === selectedType.value)
  }

  return result
})

// 获取记录类型信息
function getRecordTypeInfo(type: SpecialRecord['record_type']) {
  return recordTypes.find(t => t.value === type) || recordTypes[5]
}

// 获取成员信息
function getMember(memberId: string): Member | undefined {
  return memberStore.getMemberById(memberId)
}

// 添加新记录
async function handleAddRecord() {
  if (!newRecord.value.member_id || !newRecord.value.title || !newRecord.value.description) {
    return
  }

  const record: SpecialRecord = {
    id: 'sr' + Date.now(),
    member_id: newRecord.value.member_id,
    record_type: newRecord.value.record_type,
    title: newRecord.value.title,
    description: newRecord.value.description,
    related_activity_id: null,
    created_at: new Date().toISOString()
  }

  addSpecialRecord(record)
  showAddModal.value = false

  // 重置表单
  newRecord.value = {
    member_id: '',
    record_type: 'special',
    title: '',
    description: ''
  }
}

// 删除记录
function handleDeleteRecord(id: string) {
  if (confirm('确定要删除这条记录吗？')) {
    deleteSpecialRecord(id)
  }
}

// 统计数据
const stats = computed(() => [
  { label: '记录总数', value: allRecords.value.length, icon: BookOpen, color: 'text-blue-500' },
  { label: '监狱记录', value: allRecords.value.filter(r => r.record_type === 'jail').length, icon: Skull, color: 'text-red-500' },
  { label: '成就记录', value: allRecords.value.filter(r => r.record_type === 'achievement').length, icon: Award, color: 'text-yellow-500' },
  { label: '荣誉奖项', value: allRecords.value.filter(r => r.record_type === 'award').length, icon: Star, color: 'text-green-500' }
])
</script>

<template>
  <div class="special-records-page min-h-screen py-8 px-4">
    <!-- 页面标题 -->
    <div class="max-w-6xl mx-auto mb-8">
      <div class="text-center mb-6">
        <h1 class="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <BookOpen class="w-10 h-10 text-purple-500" />
          特殊榜单
          <BookOpen class="w-10 h-10 text-purple-500" />
        </h1>
        <p class="text-gray-400">记录服务器中的特殊事件与荣誉成就</p>
      </div>

      <!-- 统计数据 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div v-for="stat in stats" :key="stat.label"
             class="mc-card p-4 text-center">
          <component :is="stat.icon" class="w-6 h-6 mx-auto mb-2" :class="stat.color" />
          <div class="text-2xl font-bold text-white">{{ stat.value }}</div>
          <div class="text-sm text-gray-400">{{ stat.label }}</div>
        </div>
      </div>

      <!-- 筛选和搜索 -->
      <div class="mc-card p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-center justify-between">
          <!-- 类型筛选 -->
          <div class="flex flex-wrap gap-2">
            <button v-for="type in recordTypes" :key="type.value"
                    @click="selectedType = type.value"
                    :class="[
                      'px-4 py-2 rounded-lg flex items-center gap-2 transition-all',
                      selectedType === type.value
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    ]">
              <component :is="type.icon" class="w-4 h-4" :class="type.color" />
              {{ type.label }}
            </button>
          </div>

          <!-- 搜索框 -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="searchQuery"
                   type="text"
                   placeholder="搜索记录..."
                   class="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none" />
          </div>

          <!-- 添加按钮（管理员） -->
          <button v-if="authStore.isAdmin"
                  @click="showAddModal = true"
                  class="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all">
            <Plus class="w-4 h-4" />
            添加记录
          </button>
        </div>
      </div>
    </div>

    <!-- 记录列表 -->
    <div class="max-w-6xl mx-auto">
      <div class="space-y-4">
        <div v-for="record in filteredRecords" :key="record.id"
             class="mc-card p-6 hover:shadow-xl transition-all">
          <div class="flex items-start gap-4">
            <!-- 类型图标 -->
            <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                 :class="{
                   'bg-red-500/20': record.record_type === 'jail',
                   'bg-yellow-500/20': record.record_type === 'achievement',
                   'bg-green-500/20': record.record_type === 'award',
                   'bg-orange-500/20': record.record_type === 'punishment',
                   'bg-purple-500/20': record.record_type === 'special'
                 }">
              <component :is="getRecordTypeInfo(record.record_type).icon"
                         class="w-6 h-6"
                         :class="getRecordTypeInfo(record.record_type).color" />
            </div>

            <!-- 内容 -->
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2 py-1 rounded text-xs font-medium"
                      :class="{
                        'bg-red-500/20 text-red-400': record.record_type === 'jail',
                        'bg-yellow-500/20 text-yellow-400': record.record_type === 'achievement',
                        'bg-green-500/20 text-green-400': record.record_type === 'award',
                        'bg-orange-500/20 text-orange-400': record.record_type === 'punishment',
                        'bg-purple-500/20 text-purple-400': record.record_type === 'special'
                      }">
                  {{ getRecordTypeInfo(record.record_type).label }}
                </span>
                <span class="text-xs text-gray-400">{{ formatDate(record.created_at) }}</span>
              </div>

              <h3 class="text-lg font-bold text-white mb-2">{{ record.title }}</h3>
              <p class="text-gray-300 mb-3">{{ record.description }}</p>

              <!-- 相关成员 -->
              <div v-if="getMember(record.member_id)" class="flex items-center gap-2">
                <RouterLink :to="`/members/${record.member_id}`"
                            class="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                  <div class="w-6 h-6 rounded-full overflow-hidden bg-gray-600">
                    <img v-if="getMember(record.member_id)?.avatar_url"
                         :src="getMember(record.member_id)?.avatar_url"
                         class="w-full h-full object-cover" />
                    <Users v-else class="w-full h-full p-1 text-gray-400" />
                  </div>
                  <span class="text-sm text-gray-300">{{ getMember(record.member_id)?.nickname }}</span>
                </RouterLink>
              </div>
            </div>

            <!-- 删除按钮（管理员） -->
            <button v-if="authStore.isAdmin"
                    @click="handleDeleteRecord(record.id)"
                    class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="删除记录">
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredRecords.length === 0" class="mc-card p-8 text-center">
          <BookOpen class="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
          <p class="text-gray-400">暂无相关记录</p>
        </div>
      </div>
    </div>

    <!-- 添加记录弹窗 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="mc-card p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-white">添加特殊记录</h2>
          <button @click="showAddModal = false"
                  class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleAddRecord" class="space-y-4">
          <!-- 选择成员 -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">相关成员</label>
            <select v-model="newRecord.member_id"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none">
              <option value="">请选择成员</option>
              <option v-for="member in memberStore.allMembers" :key="member.id" :value="member.id">
                {{ member.nickname }}
              </option>
            </select>
          </div>

          <!-- 记录类型 -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">记录类型</label>
            <select v-model="newRecord.record_type"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none">
              <option value="jail">毒薯监狱</option>
              <option value="achievement">成就记录</option>
              <option value="award">荣誉奖项</option>
              <option value="punishment">惩罚记录</option>
              <option value="special">特殊事件</option>
            </select>
          </div>

          <!-- 标题 -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">标题</label>
            <input v-model="newRecord.title"
                   type="text"
                   placeholder="例如：因违规进入毒薯监狱"
                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none" />
          </div>

          <!-- 描述 -->
          <div>
            <label class="block text-sm text-gray-400 mb-2">详细描述</label>
            <textarea v-model="newRecord.description"
                      placeholder="请输入详细描述..."
                      rows="4"
                      class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none resize-none"></textarea>
          </div>

          <!-- 提交按钮 -->
          <button type="submit"
                  class="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
            确认添加
          </button>
        </form>
      </div>
    </div>

    <!-- 说明卡片 -->
    <div class="max-w-6xl mx-auto mt-8">
      <div class="mc-card p-6">
        <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Shield class="w-5 h-5 text-purple-500" />
          记录类型说明
        </h3>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-300">
          <div class="flex items-start gap-3">
            <Skull class="w-5 h-5 text-red-500" />
            <div>
              <p class="font-medium text-red-400">毒薯监狱</p>
              <p class="text-sm text-gray-400">记录因违规被关入监狱的事件</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Award class="w-5 h-5 text-yellow-500" />
            <div>
              <p class="font-medium text-yellow-400">成就记录</p>
              <p class="text-sm text-gray-400">记录玩家达成的特殊成就</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Star class="w-5 h-5 text-green-500" />
            <div>
              <p class="font-medium text-green-400">荣誉奖项</p>
              <p class="text-sm text-gray-400">记录获得的荣誉和奖项</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Ban class="w-5 h-5 text-orange-500" />
            <div>
              <p class="font-medium text-orange-400">惩罚记录</p>
              <p class="text-sm text-gray-400">记录受到的惩罚措施</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Shield class="w-5 h-5 text-purple-500" />
            <div>
              <p class="font-medium text-purple-400">特殊事件</p>
              <p class="text-sm text-gray-400">其他值得记录的特殊事件</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.special-records-page {
  background: linear-gradient(135deg, #1a2744 0%, #243447 50%, #1a2744 100%);
}
</style>