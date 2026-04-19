# 外部連携基盤 / Webhook Hub / Sync 運用基盤（2026-04-19）

## 0. 目的
- `mizzz.jp` / `store.mizzz.jp` / `fc.mizzz.jp` を横断し、inbound webhook / outbound delivery / scheduled sync / replay / reconciliation を統一運用する。
- 課金・注文・CRM・通知・分析・認証連携の失敗を **再送可能・照合可能・監査可能** にする。
- **DNS変更不要**（既存 backend API ドメインをそのまま利用）。

## 1. 現在の外部連携基盤課題（調査結果）
1. inbound webhook は Stripe に偏っており、provider差分を吸収する共通ハブがない。
2. outbound は `delivery-log` で結果は残るが connector 単位の健康状態や再送導線が弱い。
3. scheduled sync は運用概念が分散し、run 単位の履歴モデルが不足。
4. dead-letter / replay / reconciliation が domain として独立しておらず、失敗時の復旧が属人化しやすい。
5. internal admin は user/order/revenue/BI 中心で、連携運用専用コンソールが不足。
6. source of truth は billing/revenue/order で記述が分散し、運用者が一箇所で参照しづらい。

## 2. 責務分離（integration / connector / sync）

### 2-1. 新しい運用モデル
- `integration`: ドメイン横断の連携単位（例: billing, order, crm, auth）。
- `connectorType`: provider差分の吸収単位（stripe, notification-email, logto-m2m など）。
- `syncRun`: scheduled/manual/reconciliation の実行履歴。
- `deadLetterItem`: 失敗隔離キュー。
- `replayRequest`: 安全再実行の受付・監査。

### 2-2. inbound/outbound/scheduled の整理
- inbound: 受信（verify/ingest）
- outbound: 送信（delivery/attempt）
- scheduled: pull/push/reconciliation
- replay は本体処理ではなく「再実行要求」を記録する責務

## 3. 追加API（internal admin 向け）
- `GET /api/internal/integrations/overview`
- `GET /api/internal/integrations/inbound-events`
- `GET /api/internal/integrations/outbound-deliveries`
- `GET /api/internal/integrations/dead-letters`
- `GET /api/internal/integrations/replay-requests`
- `POST /api/internal/integrations/replay`
- `POST /api/internal/integrations/reconciliation/run`

> すべて internal permission 必須（Bearer token）。

## 4. データモデル追加
- `dead-letter-item`
  - failureReason / severity / replayable / dangerous / retryCount / idempotencyKey など。
- `replay-request`
  - runMode(safe/dangerous), status(requested/running/succeeded/failed/rejected), auditLogRef。
- `sync-run`
  - syncDirection(inbound/outbound/scheduled/reconciliation), healthState, retryPolicy, stats。

## 5. internal admin integration console
- Internal Admin Page に integration セクションを追加。
- できること:
  - connector health 一覧
  - failed inbound / failed outbound / dead-letter 一覧
  - safe replay 要求
  - reconciliation 実行
- 目的:
  - support / finance / ops が「どこで失敗しているか」を即確認する。

## 6. billing / order / CRM / analytics / auth との接続
- billing/order: 既存 Stripe webhook + order/revenue データから reconciliation 差分を計算。
- CRM/notification: `delivery-log` を outbound delivery として統合表示。
- analytics/BI: 既存 BI 指標に加えて integration 健康状態を internal admin で運用。
- auth(Logto): internal permission と audit log により replay/reconciliation の操作履歴を追跡。

## 7. source of truth（本PR時点）
- billing/subscription: Stripe webhook
- order state: `order` content-type
- revenue/reporting: `revenue-record`
- entitlement: `entitlement-record`
- outbound notification: `delivery-log`
- external failure quarantine: `dead-letter-item`

## 8. 運用手順（最小）
1. integration overview で failed / dead-letter を確認。
2. dead-letter から safe replay を登録。
3. `replay-request` を監査ログで追跡。
4. `reconciliation/run` で差分検出（missing revenue / orphan revenue / missing entitlement）。
5. high severity は manual approval フローを別PRで追加予定。

## 9. 既知の残課題
- connector別の署名検証テンプレート（Stripe以外）の拡張。
- outbound API の deliveryAttempt テーブル分離。
- dangerous replay の承認ワークフロー（2人承認）。
- queue 実行基盤（BullMQ 等）との本格統合。

## 10. 失敗ケースへの対応
- webhook は届くが反映されない: inbound events + dead-letter を確認。
- outbound 送信失敗: outbound-deliveries + replay-request を確認。
- duplicate event: idempotency key/eventId の重複検知でno-op。
- out-of-order event: reconciliation run で差分を検知し manual repair。

## 11. CI / Secrets / Env
- runtime env に integration 関連の timeout/retry/reconciliation 上限を追加。
- GitHub Secrets は既存の backend runtime secret に追加して管理。
- staging / production で値を分離する。

## 12. 仮定
- 既存 Stripe webhook は継続利用する。
- `delivery-log` は notification 系 outbound の一次記録として扱う。
- Strapi content-type の追加は既存 migration 方針に従って環境適用する。
