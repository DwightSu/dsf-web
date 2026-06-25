import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockMembers } from '@/mock'
import {
  getCustomMembers,
  saveCustomMember,
  updateCustomMember as updateCustomMemberStorage,
  deleteCustomMember as deleteCustomMemberStorage,
  checkCustomMemberExists
} from '@/utils/storage'
import type { Member, MemberInsert } from '@/types/database'

function generateMemberId(): string {
  return 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

export const useMemberStore = defineStore('members', () => {
  const refreshKey = ref(0)

  const allMembers = computed<Member[]>(() => {
    void refreshKey.value
    const customMembers = getCustomMembers() as Member[]
    return [...customMembers, ...mockMembers]
  })

  const memberCount = computed(() => allMembers.value.length)

  function refresh() {
    refreshKey.value++
  }

  function getMemberById(id: string): Member | undefined {
    return allMembers.value.find(m => m.id === id)
  }

  function getMembersBySearch(search?: string): Member[] {
    if (!search) return allMembers.value
    const query = search.toLowerCase()
    return allMembers.value.filter(m =>
      m.nickname.toLowerCase().includes(query)
    )
  }

  function checkMemberExists(qqNumber: string): boolean {
    if (mockMembers.some(m => m.qq_number === qqNumber)) {
      return true
    }
    return checkCustomMemberExists(qqNumber)
  }

  function addMember(memberData: MemberInsert & { id?: string }): Member {
    const newMember: Member = {
      id: memberData.id || generateMemberId(),
      nickname: memberData.nickname,
      qq_number: memberData.qq_number || null,
      avatar_url: memberData.avatar_url || null,
      notes: memberData.notes || null,
      tags: memberData.tags || [],
      created_at: new Date().toISOString()
    }
    saveCustomMember(newMember)
    refresh()
    return newMember
  }

  function updateMember(id: string, updates: Partial<Member>): boolean {
    const success = updateCustomMemberStorage(id, updates)
    if (success) {
      refresh()
    }
    return success
  }

  function deleteMember(id: string): boolean {
    const success = deleteCustomMemberStorage(id)
    if (success) {
      refresh()
    }
    return success
  }

  return {
    allMembers,
    memberCount,
    refresh,
    getMemberById,
    getMembersBySearch,
    checkMemberExists,
    addMember,
    updateMember,
    deleteMember
  }
})
