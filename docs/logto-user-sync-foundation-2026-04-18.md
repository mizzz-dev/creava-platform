# Logto ユーザーデータ同期 / プロビジョニング基盤（2026-04-18）

- 更新日: 2026-04-18
- 対象: `mizzz.jp` / `store.mizzz.jp` / `fc.mizzz.jp`
- 目的: Logto identity と mizzz 業務データを責務分離しつつ、初回ログイン時の安全な app user プロビジョニングと運用導線を整備する。
- DNS: **既存 `auth.mizzz.jp` 利用前提では DNS変更不要**。

---

## 1. 現在の user 同期課題（調査）

1. frontend `useCurrentUser` は Logto claims を表示用途に正規化するだけで、app 側の永続 user と同期していない。
2. `/member` の account settings / notification / loyalty が `localStorage` 依存の箇所を含み、再ログイン時・端末跨ぎで一貫しない。
3. backend には `subscription-record` / `notification-preference` など断片はあるが、`logtoUserId` を真ん中に束ねる `app-user` ドメインがなかった。
4. support が `email` / `logtoUserId` / `appUserId` で横断検索する API がなく、調査が属人化しやすい。
5. Management API の運用方針（default tenant endpoint 利用）は docs にあるが、ユーザー同期処理自体の runbook が不足。

### 調査で確認した既存実装ポイント
- Logto claims 正規化: `frontend/src/lib/auth/logto.ts`
- current user 取得: `frontend/src/hooks/useCurrentUser.ts`
- member 情報取得元: `frontend/src/modules/member/api.ts`（Strapi + localStorage fallback）
- notification / CRM / loyalty 土台: `frontend/src/modules/notifications/*`, `frontend/src/modules/member/*`, `docs/*foundation*.md`
- backend 認証: `backend/src/lib/auth/logto.ts`
- FC 会員関連の保存先: `backend/src/api/subscription-record/*`
- notification preference 保存先: `backend/src/api/notification-preference/*`

---

## 2. Logto とアプリ側データ責務分離（今回の方針）

### Logto 側（identity / auth）
- `sub(logtoUserId)`, email/phone/username、認証プロバイダ、session、JWT scope/role
- Account Center で変更される認証系設定（password / MFA / sessions / linked accounts）

### mizzz app 側（業務 / UX）
- `app-user`（新設）を真実源に、membership / loyalty / notification / CRM / onboarding / support flags を保持
- `subscription-record` から会員状態を派生して `app-user` に反映
- `notification-preference` を `logtoUserId` キーで初期化/更新

> ポイント: 「認証可否」は Logto token + backend 検証、「業務状態」は app DB で管理。

---

## 3. user domain モデル整理（新設 `app-user`）

`backend/src/api/app-user/content-types/app-user/schema.json` を追加し、以下を保持:

- identity: `authIdentity`, `logtoUserId`, `appUserId`, `primaryEmail`, `primaryPhone`, `username`
- profile: `displayName`, `avatarUrl`, `locale`, `timezone`, `sourceSite`
- membership/access: `membershipStatus`, `membershipPlan`, `accessLevel`, `accountStatus`
- lifecycle: `profileCompletionState`, `onboardingState`, `firstLoginAt`, `lastLoginAt`
- business states: `loyaltyState`, `notificationPreference`, `crmPreference`
- ops/safety: `linkedProviders`, `mergeState`, `supportFlags`, `fieldSources`, `lastSyncedAt`, `syncVersion`

`fieldSources` により「Logto由来か app由来か」を明示化。

---

## 4. 初回プロビジョニング基盤追加

新規 API:

- `POST /api/user-sync/provision`
  - Bearer token を `verifyLogtoToken` で検証
  - `logtoUserId` で app-user を upsert
  - 初回時: seed データ作成（locale / notification / crm / onboarding など）
  - 再ログイン時: identity 系項目・membership派生値・lastLogin を更新
  - `notification-preference` を idempotent に作成/更新

- `GET /api/user-sync/me`
  - app-user + auth summary + membership summary + notification preference を返却

- `GET /api/user-sync/support/lookup`
  - `x-ops-token` + `email|logtoUserId|appUserId` で検索

### 冪等性
- 主キー: `logtoUserId`（unique）
- `findFirst` + `create/update` により再ログインで重複作成を防止
- notification preference も `userId=logtoUserId` で重複防止

---

## 5. profile / locale / preference 同期整理

- identity 系（email/phone/displayName/avatar/linkedProviders）は `provision` 時に Logto claims から反映。
- locale は request body（frontend locale）優先、なければ claims locale。
- notification preference / CRM preference は app 側で保持し、Logto へ業務設定を寄せない。
- frontend 側に `UserSyncBridge` を追加し、サインイン後に `provision` を自動呼び出し。
  - 同一 session 内は `sessionStorage` で重複呼び出しを回避。

---

## 6. membership / loyalty / CRM / notification 接続整理

- `subscription-record`（最新）から `membershipPlan`, `membershipStatus`, `accessLevel` を導出。
- `app-user` へ反映して mypage / support / analytics の共通参照点にする。
- `notification-preference` は初回作成と再同期で `lastSyncedAt` を更新。
- loyalty / CRM の詳細ロジックは次段で `app-user` の `loyaltyState` / `crmPreference` を起点に拡張できる形へ統一。

---

## 7. role / permission / accessLevel 同期整理

- backend 認可は引き続き token 検証（`verifyLogtoToken`）と scope 検証を優先。
- `accessLevel` は UX / business state 用の表現として `app-user` に保持。
- admin 権限は claims role が `admin` の場合のみ app 側へ `admin` として反映。
- 「会員状態（membership）」と「運用権限（role/scope）」を分離。

---

## 8. support / admin 導線整理

- `supportLookup` API で下記キー検索を標準化:
  - `email`
  - `logtoUserId`
  - `appUserId`
- `supportFlags`, `mergeState`, `lastLoginAt`, `linkedProviders` を app-user で確認可能。
- 内部 admin panel 未整備でも API + runbook で最低限の一次対応が可能。

---

## 9. duplicate account / account merge 方針

- 今回は危険な自動マージを導入せず、`mergeState` / `supportFlags.duplicateCandidate` で検知優先。
- social/email 重複疑いは support 介入を前提に runbook 化。
- 将来の account linking / reconciliation utility は次PRで追加可能（not_done）。

---

## 10. Management API / automation 整理

- Management API は引き続き **default tenant endpoint** を使用（Cloud の原則）。
- 今回の provisioning API は Management API 不要で動作。
- 今後の automation 候補:
  - role assign job
  - user repair utility
  - orphan record check
  - linked account audit helper

---

## 11. env / GitHub Secrets / runtime / docs 整理

### 追加 env
- backend: `LOGTO_USER_SYNC_OPS_TOKEN`（support lookup API 用）

### GitHub Secrets 追加推奨
- `LOGTO_USER_SYNC_OPS_TOKEN`

### runtime と CI の責務分離
- runtime: backend の `LOGTO_*`, `LOGTO_USER_SYNC_OPS_TOKEN`
- frontend CI: `VITE_LOGTO_*`（既存）

### staging / production 分離
- `LOGTO_USER_SYNC_OPS_TOKEN` は環境ごとに別値
- support lookup API へのアクセスログ監査を推奨

---

## 12. 実装順（実施）

1. 現状調査（auth / mypage / notification / docs / env）
2. user domain モデル追加（`app-user`）
3. 初回プロビジョニング API 追加
4. frontend サインイン後同期ブリッジ追加
5. env / docs 更新

---

## 13. 動作確認手順

1. Logto でログイン（main/store/fc いずれか）
2. `POST /api/user-sync/provision` が 200 で返ることを確認
3. `GET /api/user-sync/me` で `appUser` が取得できることを確認
4. 同一ユーザー再ログインで `provisioned=false` になり重複レコードが増えないことを確認
5. support token を付与して `GET /api/user-sync/support/lookup?email=...` が機能することを確認

---

## 14. 残課題（次PR候補）

- account merge 補助 UI
- account reconciliation バッチ
- loyalty / crm の自動セグメント更新 job
- user summary を mypage UI に可視化
- Management API を使った role sync 自動化

---

## 仮定

1. Logto の `identities` claim が利用可能で、linked provider 判定に使える前提。
2. `subscription-record` の最新レコードが membership 判定の一次情報として妥当である前提。
3. support lookup API は当面 `x-ops-token` 運用で許容し、将来は内部管理権限へ移行する前提。
