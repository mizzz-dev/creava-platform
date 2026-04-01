import { useUser } from '@clerk/clerk-react'
import { toAppUser } from '@/lib/auth/clerk'
import type { AppUser } from '@/types'

export interface UseCurrentUserResult {
  /** 正規化済みのユーザー情報。未ログイン / 読み込み中は null */
  user: AppUser | null
  /** Clerk の認証状態の読み込みが完了しているか */
  isLoaded: boolean
  /** ログイン済みか */
  isSignedIn: boolean
}

const GUEST: UseCurrentUserResult = { user: null, isLoaded: true, isSignedIn: false }

/**
 * Clerk あり: 実際の認証状態を返す
 * Clerk なし（VITE_CLERK_PUBLISHABLE_KEY 未設定）: 常にゲスト状態を返す
 *
 * フック関数そのものをモジュール初期化時に切り替えることで
 * Rules of Hooks に違反せずに条件分岐を実現する。
 */
export const useCurrentUser: () => UseCurrentUserResult =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
    ? function useCurrentUser(): UseCurrentUserResult {
        const { user, isLoaded, isSignedIn } = useUser()

        if (!isLoaded) return { user: null, isLoaded: false, isSignedIn: false }
        if (!isSignedIn || !user) return { user: null, isLoaded: true, isSignedIn: false }

        return { user: toAppUser(user), isLoaded: true, isSignedIn: true }
      }
    : function useCurrentUserNoClerk(): UseCurrentUserResult {
        return GUEST
      }
