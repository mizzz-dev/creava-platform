/**
 * ユーザーロール定義
 * 認証プロバイダのクレームで管理する
 */
export type UserRole = 'guest' | 'free' | 'member' | 'premium' | 'admin'

export type MemberPlan = 'free' | 'paid' | 'premium'

export type MembershipStatus = 'non_member' | 'member' | 'grace' | 'canceled' | 'expired' | 'suspended'

export type AccountStatus = 'active' | 'pending' | 'restricted' | 'suspended' | 'deleted_like'

export type InternalRole = 'user' | 'support' | 'moderator' | 'admin' | 'super_admin'

export type ContractStatus =
  | 'active'
  | 'grace'
  | 'cancel_scheduled'
  | 'canceled'
  | 'expired'

/**
 * 認証クレームの拡張項目
 */
export interface UserPublicMetadata {
  role: UserRole
  memberPlan?: MemberPlan
  contractStatus?: ContractStatus
  membershipStatus?: MembershipStatus
  accountStatus?: AccountStatus
  internalRole?: InternalRole
  accessLevel?: 'public' | 'logged_in' | 'member' | 'premium' | 'admin'
  emailVerified?: boolean
}

/**
 * アプリ内で使用するユーザー情報
 */
export interface AppUser {
  id: string
  email: string | null
  role: UserRole
  memberPlan: MemberPlan
  contractStatus: ContractStatus
  membershipStatus: MembershipStatus
  accountStatus: AccountStatus
  internalRole: InternalRole
  accessLevel: 'public' | 'logged_in' | 'member' | 'premium' | 'admin'
  emailVerified: boolean
}
