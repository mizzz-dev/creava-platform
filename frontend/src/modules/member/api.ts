import { createMockMemberDashboardData } from './mock'
import { loadMemberPreferences, saveMemberPreferences } from './storage'
import type { MemberDashboardData, MemberPreferences } from './types'

export async function getMemberDashboard(isMember: boolean): Promise<MemberDashboardData> {
  const mock = createMockMemberDashboardData(isMember)
  const saved = loadMemberPreferences()

  if (saved) {
    mock.preferences = saved
  }

  return mock
}

export async function updateMemberPreferences(preferences: MemberPreferences): Promise<MemberPreferences> {
  saveMemberPreferences(preferences)
  return preferences
}
