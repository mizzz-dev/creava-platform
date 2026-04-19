import type { AppUser, ContractStatus, MemberPlan, MembershipStatus, UserRole } from '@/types'

export type VisibilityScope = 'public' | 'members' | 'premium'

export function canAccessByRole(role: UserRole, visibility: VisibilityScope): boolean {
  if (visibility === 'public') return true
  if (visibility === 'members') return role === 'member' || role === 'premium' || role === 'admin'
  return role === 'premium' || role === 'admin'
}

function isMemberByStatus(status: MembershipStatus): boolean {
  return status === 'member' || status === 'grace'
}

export function isMemberUser(user: Pick<AppUser, 'membershipStatus' | 'role'> | null | undefined): boolean {
  if (!user) return false
  return isMemberByStatus(user.membershipStatus) || user.role === 'admin'
}

export function isMembershipActive(status: ContractStatus): boolean {
  return status === 'active' || status === 'grace' || status === 'cancel_scheduled'
}

export function isMembershipActiveStatus(status: MembershipStatus): boolean {
  return status === 'member' || status === 'grace'
}

export function canAccessByPlan(plan: MemberPlan, visibility: VisibilityScope): boolean {
  if (visibility === 'public') return true
  if (visibility === 'members') return plan === 'paid' || plan === 'premium'
  return plan === 'premium'
}
