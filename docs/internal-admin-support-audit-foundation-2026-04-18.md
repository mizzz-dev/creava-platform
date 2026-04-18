# internal admin / support / 権限管理 / 監査ログ 基盤整備（2026-04-18）

## DNS変更
- **DNS変更不要**（既存 main/store/fc + Strapi API 配下の追加エンドポイントのみ）。

## 1. 現在の内部運用課題
1. support lookup は `x-ops-token` ベースで、内部担当ロール粒度が薄く最小権限が曖昧。
2. user 状態確認が `app-user` / `notification-preference` / `inquiry-submission` / `moderation` に分散。
3. 危険操作（accountStatus変更・通知設定代行変更）の監査モデルが未整備。
4. 「誰が何をなぜ変更したか」を一元追跡しづらい。

## 2. support / CRM / moderation / loyalty で見づらい箇所
- support: inquiry 参照と app-user 情報が別導線。
- CRM/notification: 通知設定の現況確認と変更導線が離れている。
- moderation/community: 通報履歴・mod action が user 文脈で見えにくい。
- loyalty: app-user 上の `loyaltyState` と他活動ログが並べて見えない。

## 3. 権限管理で危険な箇所
- 単一トークン依存の lookup。
- 危険操作の事前理由入力・権限チェックが未統一。
- 監査ログの標準化不足（actor/target/action/result/reason）。

## 4. internal admin 最低限機能（今回）
- internal role / permission を app 側で定義（`super_admin`, `internal_admin`, `support`, `crm`, `moderation`, `campaign`, `read_only`）。
- `GET /api/internal/users/lookup`
- `GET /api/internal/users/:logtoUserId/summary`
- `POST /api/internal/users/:logtoUserId/account-status`（danger）
- `POST /api/internal/users/:logtoUserId/notification-reset`（danger）
- `/internal/admin` UI（管理者向け最小コンソール）

## 5. 監査ログで追うべき操作（今回優先）
- account status 更新
- notification preference 代行リセット

監査項目:
- actorLogtoUserId
- actorInternalRoles
- targetType / targetId
- action
- status(success/denied/failed)
- reason
- beforeState / afterState（必要最小限）
- sourceSite
- requestId
- metadata

## 6. env / docs / runbook 不足の補完
- backend `.env.example` は既存 Logto/M2M を維持。
- internal role 運用は Logto claims の `roles` を前提に app 側 permission へ変換。
- support runbook には「danger 操作は理由必須 + audit 参照」を追記対象。

## 7. 作業ブランチ名
- `internal-admin-ops-audit-foundation`

## 8. 実装順
1. internal role/permission ヘルパー追加
2. internal audit log content-type 追加
3. app-user internal lookup/summary 追加
4. danger 操作 + audit 記録追加
5. internal admin 最小 UI 追加
6. docs 更新

## 9. CI/Secrets 運用メモ
- frontend は `VITE_LOGTO_*` + `VITE_STRAPI_API_URL` を継続。
- backend は `LOGTO_*` と `LOGTO_USER_SYNC_OPS_TOKEN` を継続。
- internal API は Bearer token 必須（frontend へ management secret を露出しない）。

## 10. 今後の拡張余地
- session revoke（Logto Management API）
- campaign override / moderation override の実操作 API
- internal dashboard / SLA / support automation
- audit log の検索UI・CSV export
