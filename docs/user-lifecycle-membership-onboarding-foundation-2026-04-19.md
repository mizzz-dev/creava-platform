# 統一認証基盤を前提にした user lifecycle / onboarding / 会員導線整備（2026-04-19）

## 0. 前提
- Logto は main / store / fc で分離せず、単一認証基盤を使う。
- 会員状態は auth role ではなく business state（`membershipStatus` / `accountStatus` / `onboardingStatus`）で扱う。
- `logged-in-only` と `member-only` を分けて UI で表現する。

## 1. 現在の user lifecycle 課題
1. ログイン後体験がサイト横断で統一されておらず、状態別の次アクションが曖昧。
2. non_member / grace / suspended などの説明がページごとにばらつき、自己解決導線が弱い。
3. mypage で lifecycle を一目で確認できず、support 問い合わせ前の自己解決率が伸びにくい。
4. internal admin の user lookup に lifecycle stage が不足し、一次切り分けに時間がかかる。

## 2. user lifecycle / status 遷移設計

### 2.1 状態責務分離
- `accountStatus`: アカウント制御（active / restricted / suspended）
- `membershipStatus`: 会員状態（non_member / member / grace / expired / canceled / suspended）
- `onboardingStatus`: 初回体験進捗（not_started / in_progress / completed / skipped）
- `entitlementState`: 権利状態（none / eligible / active / limited / revoked）
- `lifecycleStage`: UI 導線で使う統合段階（guest / onboarding_user / active_member など）

### 2.2 lifecycleStage 導出ルール
1. accountStatus が suspended/restricted または membershipStatus=suspended → `suspended_user`
2. onboarding 未完了 → `onboarding_user`
3. member → `active_member`
4. grace → `grace_member`
5. expired/canceled → `inactive_member`
6. それ以外のログイン済み → `authenticated_non_member`

## 3. 実装内容

### 3.1 frontend
- `useCurrentUser` に lifecycle 正規化を追加。
- `UserLifecycleBanner` を main / store / fc / mypage に配置し、状態別 CTA を統一。
- Auth callback + user sync 連携で `first_login_detected` / `onboarding_start` を計測。
- mypage に account summary（accountStatus / membershipStatus / onboardingStatus / lifecycleStage）を追加。

### 3.2 backend
- `app-user` schema に lifecycle 追跡用属性（`lifecycleStage`, `entitlementState`, `joinedAt` など）を追加。
- `user-sync/me` と internal summary に `lifecycleSummary` を追加。
- internal user lookup でも `lifecycleStage` / `onboardingStatus` / `profileCompletionStatus` を返却。

### 3.3 計測イベント
- login_success
- first_login_detected
- onboarding_start
- membership_cta_click
- renewal_cta_click
- rejoin_cta_click
- account_summary_view
- status_banner_click
- profile_completion_click
- support_from_status_block

## 4. main / store / fc 状態別導線
- **main**: ゲスト/会員/猶予でバナーCTAを切り替え、ハブ導線を維持。
- **store**: 購買導線を邪魔せず、会員価値はバナーで補助説明。
- **fc**: non_member に入会価値、grace/expired に再開導線、suspended に support 導線を提示。

## 5. mypage / support / internal admin
- mypage: account summary を追加し「今の状態」と「次アクション」を可視化。
- support/internal: lifecycle summary を API 返却して root-cause を判断しやすくした。

## 6. env / GitHub Secrets / runtime
### frontend
- `VITE_USER_LIFECYCLE_ONBOARDING_ENABLED`
- `VITE_ONBOARDING_REMINDER_DAYS`

### backend
- `USER_LIFECYCLE_GRACE_NOTICE_DAYS`

> GitHub Secrets は runtime env への投入元として運用し、frontend ビルド時 secret と混同しない。

## 7. local / staging / production 確認手順
1. Logto でログインし callback 後に期待URLへ遷移すること。
2. `/api/user-sync/me` の `lifecycleSummary` で状態が取得できること。
3. main / store / fc / mypage の banner CTA が membershipStatus ごとに変わること。
4. internal admin の user lookup に lifecycleStage が表示されること。

## 8. よくあるトラブル
- **症状**: onboarding が開始されない  
  **確認**: `POST /api/user-sync/provision` の `reason` が `first_login` か、sessionStorage flag が保存されているか。
- **症状**: 会員なのに member CTA が出ない  
  **確認**: `membershipStatus` と `accountStatus` が期待値か。role 参照ではなく status 参照か。

## 9. 仮定
1. Logto custom claim に `onboardingState/profileCompletionState` を追加可能である。
2. subscription-record / entitlement-record は1ユーザーにつき最新が取得できる。
3. internal admin 利用者には `internal.user.read` 権限が付与済み。
4. onboarding の詳細入力 UI（興味カテゴリ等）は次PRで拡張する。
