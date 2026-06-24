<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Users, Calendar, ArrowLeft, MessageSquare } from 'lucide-vue-next'
import PixelCard from '@/components/common/PixelCard.vue'
import PixelButton from '@/components/common/PixelButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { mockMembers, mockGroupMembers, mockGroups, mockActivities } from '@/mock'
import { formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const member = ref<any>(null)
const memberActivities = ref<any[]>([])

// 加载成员详情
function loadMember() {
  const id = route.params.id as string
  loading.value = true

  setTimeout(() => {
    member.value = mockMembers.find(m => m.id === id) || null

    if (member.value) {
      // 获取成员参与的活动
      const gmList = mockGroupMembers.filter(gm => gm.member_id === id)
      const groupIds = gmList.map(gm => gm.group_id)
      const groups = mockGroups.filter(g => groupIds.includes(g.id))
      const activityIds = [...new Set(groups.map(g => g.activity_id))]

      memberActivities.value = activityIds.map(aid => {
        const activity = mockActivities.find(a => a.id === aid)
        const group = groups.find(g => g.activity_id === aid)
        return {
          id: aid,
          name: activity?.name || '',
          activity_date: activity?.activity_date || '',
          group_name: group?.name || '',
          cover_image: activity?.cover_image || ''
        }
      }).sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())
    }

    loading.value = false
  }, 300)
}

onMounted(() => {
  loadMember()
})
</script>

<template>
  <div class="member-detail-page py-8">
    <div class="container mx-auto px-4">
      <!-- 返回按钮 -->
      <div class="mb-6">
        <PixelButton variant="ghost" size="sm" @click="router.back()">
          <ArrowLeft :size="16" />
          返回
        </PixelButton>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" text="加载成员信息..." />
      </div>

      <!-- 成员不存在 -->
      <div v-else-if="!member" class="text-center py-16">
        <p class="text-white/60 font-pixel">成员不存在</p>
      </div>

      <!-- 成员详情 -->
      <div v-else class="max-w-4xl mx-auto">
        <!-- 成员信息卡 -->
        <div class="member-header mb-8">
          <PixelCard padding="lg">
            <div class="flex flex-col md:flex-row items-center gap-6">
              <!-- 头像 -->
              <div class="w-24 h-24 rounded-full bg-grass-green/30 flex items-center justify-center flex-shrink-0">
                <Users :size="40" class="text-grass-green" />
              </div>

              <!-- 信息 -->
              <div class="flex-1 text-center md:text-left">
                <h1 class="text-2xl font-pixel text-white mb-3">
                  {{ member.nickname }}
                </h1>
                <div class="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-white/60">
                  <div class="flex items-center gap-1">
                    <Calendar :size="14" class="text-diamond-blue" />
                    加入时间: {{ formatDate(member.created_at) }}
                  </div>
                  <div class="flex items-center gap-1">
                    <MessageSquare :size="14" class="text-gold-yellow" />
                    {{ memberActivities.length }} 场活动
                  </div>
                </div>
                <div v-if="member.notes" class="mt-4 text-sm text-white/70">
                  {{ member.notes }}
                </div>
              </div>
            </div>
          </PixelCard>
        </div>

        <!-- 参与的活动 -->
        <div class="member-activities">
          <h2 class="text-xl font-pixel text-white mb-4">
            <span class="text-grass-green">参与</span>的活动
          </h2>

          <div v-if="memberActivities.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RouterLink
              v-for="act in memberActivities"
              :key="act.id"
              :to="`/activities/${act.id}`"
              class="block"
            >
              <PixelCard hoverable clickable padding="md">
                <div class="flex gap-4">
                  <div class="w-20 h-20 flex-shrink-0 overflow-hidden">
                    <img
                      v-if="act.cover_image"
                      :src="act.cover_image"
                      :alt="act.name"
                      class="w-full h-full object-cover pixelated"
                    />
                    <div v-else class="w-full h-full bg-grass-green/20 flex items-center justify-center">
                      <Calendar :size="24" class="text-white/30" />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-pixel text-sm text-white mb-2 line-clamp-2">
                      {{ act.name }}
                    </h3>
                    <div class="text-xs text-white/50">
                      <div>{{ formatDate(act.activity_date) }}</div>
                      <div v-if="act.group_name" class="text-diamond-blue mt-1">
                        {{ act.group_name }}
                      </div>
                    </div>
                  </div>
                </div>
              </PixelCard>
            </RouterLink>
          </div>

          <div v-else class="text-center py-12">
            <Calendar :size="32" class="text-white/20 mx-auto mb-2" />
            <p class="text-white/40 text-sm">暂无活动记录</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-pixel {
  font-family: 'Press Start 2P', 'VT323', monospace;
}

.text-grass-green {
  color: #2D5016;
}

.text-diamond-blue {
  color: #4AEDD9;
}

.text-gold-yellow {
  color: #FFD700;
}

.bg-grass-green\/30 {
  background-color: rgba(45, 80, 22, 0.3);
}

.bg-grass-green\/20 {
  background-color: rgba(45, 80, 22, 0.2);
}

.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>