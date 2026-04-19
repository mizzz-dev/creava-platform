# Logto認証基盤統一 実装計画・差分メモ（2026-04-19）

## 1. 現在の認証分断ポイント
- frontend env が `VITE_LOGTO_APP_ID_MAIN/STORE/FC` を持ち、サイト別app分割を前提にした設定だった。
- auth storage key が `logto_${SITE_TYPE}` でサイト別 namespace になっていた。
- 会員判定で `role` を直接参照する箇所が多く、`membershipStatus` を主語にできていなかった。
- runbook が「別SPA app推奨」の記述を含み、単一認証基盤方針とズレていた。

## 2. 統一時の主課題
- 既存トークン/claims との後方互換を保ちつつ `membershipStatus` へ寄せる。
- callback / logout URI は複数維持しながら app id は統一する。
- role ベースの既存UI判定を急激に壊さず、段階的に status ベースへ移す。

## 3. user status に寄せる情報
- `accountStatus`: active / pending / restricted / suspended / deleted_like
- `membershipStatus`: non_member / member / grace / canceled / expired / suspended
- `membershipPlan`, `accessLevel`, `linkedProviders`, `sourceSite`, `firstLoginAt`, `lastLoginAt`
- internal操作権限は `internalRole` と API permission へ限定

## 4. role / permission と membership の責務分離
- membership 判定は `membershipStatus` を正とする。
- role は internal 操作（admin/support/moderator）用途を中心に扱う。
- API の認可は permission / scope で最終判定し、UI出し分けと混同しない。

## 5. 移行時に壊れると危険な箇所
- redirect/callback URI 不整合によるログイン不能。
- 旧 claims（role/memberPlan/contractStatus）のみを返すユーザーの会員誤判定。
- app-user enum 変更時の既存値不整合。

## 6. ブランチ名
- `feature/unified-logto-auth-and-user-status`

## 7. 実装順
1. auth app id / storage key を統一
2. claims 正規化で membershipStatus/accountStatus を導入
3. 会員導線ガードを status 優先に変更
4. app-user enum と backend正規化を互換付きで更新
5. env.example / runbook / migration doc を更新

## 8. 既知残課題
- main/store/fc 全画面の role 判定を status 判定へ全面移行する追加PRが必要。
- Logto custom claims に `membershipStatus/accountStatus/internalRole` を安定供給する運用整備が必要。

## 9. 仮定
- 現行Logto tenant は単一で、サブドメイン別にユーザープールが分離されていない。
- 既存claimsは段階的に新claimsへ移行されるため、当面は fallback 判定が必要。
- account center は `auth.mizzz.jp` 配下で共通導線として運用可能。
