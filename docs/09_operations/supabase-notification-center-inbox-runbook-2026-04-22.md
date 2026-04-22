# Supabase Auth 前提 notification center / lifecycle messaging / cross-site inbox runbook（2026-04-22）

## 1. 現在の通知体験の課題
- 通知設定（preference）はあるが、**履歴・未読・既読・archive/dismiss** を横断管理する inbox 導線が弱い。
- `member-notification`（表示）と `delivery-log`（配信）の責務が分かれている一方、UI/運用で同時に追跡しづらい。
- support/internal から「なぜ見えているか/見えていないか」の説明用サマリが不足。
- main/store/fc で同じユーザーが同一 inbox を見る導線が不足し、見落としが発生しやすい。

## 2. 状態責務の分離方針
- `deliveryState`: pending/delivered/failed/skipped/suppressed（配信結果）。
- `messageVisibilityState`: hidden/visible/...（表示対象制御）。
- `readState`: unread/seen/read（閲覧状態）。
- `archiveState`: active/archived（一覧上の整理状態）。
- `dismissState`: active/dismissed（一時非表示状態）。
- `notificationPreferenceState`: in-app/email の受信設定。
- `consentState` / `crmConsentState`: 法務・同意責務（通知可視性と分離）。

## 3. cross-site inbox 実装
- API: `GET /api/user-sync/notifications/inbox`
  - app-user（business state） + member-notification（message summary） + delivery-log（delivery summary）を統合返却。
- UI: `/member/notifications`（main/store/fc 共通導線）
  - unread/important/action-required summary。
  - category filter。
  - read / archive / dismiss 操作。
- message には `sourceSite` を保持し、どのサイト起点かをユーザーに表示。

## 4. lifecycle / campaign / important notice 運用方針
- `important_notice` / `security_notice` を action-required 集計に含める。
- campaign は inbox に表示しても、important と同じ重みで扱わない。
- 初期運用は conservative（daily cap・dedupe window を env で制御）。

## 5. support / internal admin 観点
- user-facing inbox は `member-notification` ベース。
- raw delivery は `delivery-log` に保持し、ユーザーには生ログを直接表示しない。
- internal は既存 user lookup で `authUserId/supabaseUserId/logtoUserId` 互換検索を維持。
- notification-sensitive 操作（reset など）は internal permission + audit log を維持。

## 6. RLS / access 方針（Supabase + app DB）
- Supabase Auth は認証のみ。通知状態の SoT は app 側（Strapi DB）。
- user self-service は `requireAuthUser` 前提で **本人 userId の message のみ更新**。
- backend endpoint で userId フィルタを必須化し、UI 側制御だけに依存しない。
- `SUPABASE_SERVICE_ROLE_KEY` は backend/trusted server 限定。

## 7. analytics イベント
- 追加対象:  
  `notification_center_view`, `inbox_summary_view`, `message_detail_view`, `message_mark_read`, `message_archive`, `message_dismiss`, `unread_badge_click`, `important_notice_view`, `important_notice_cta_click`, `lifecycle_message_view`, `lifecycle_message_cta_click`, `campaign_message_view`, `campaign_message_cta_click`, `notification_settings_view`, `notification_settings_save`, `support_from_notification_center`。
- 推奨属性: `sourceSite`, `locale`, `theme`, `membershipStatus`, `lifecycleStage`, `messageType`, `messageCategory`。

## 8. env / Secrets
- frontend: `VITE_NOTIFICATION_CENTER_ENABLED`, `VITE_NOTIFICATION_IMPORTANT_MAX`, `VITE_NOTIFICATION_INBOX_PAGE_SIZE`, `VITE_NOTIFICATION_DIGEST_DEFAULT`
- backend: `NOTIFICATION_CENTER_ENABLED`, `NOTIFICATION_INBOX_PAGE_SIZE`, `NOTIFICATION_IMPORTANT_NOTICE_DAILY_CAP`, `NOTIFICATION_CAMPAIGN_DAILY_CAP`, `NOTIFICATION_DEDUPE_WINDOW_HOURS`, `NOTIFICATION_DIGEST_HOUR_UTC`, `NOTIFICATION_DELIVERY_BATCH_SIZE`
- GitHub Secrets は backend runtime 側を優先し、frontend には anon/public 情報のみ設定。

## 9. 確認手順
1. main/store/fc で `/member/notifications` に到達できること。
2. 同一ユーザーで同じ inbox summary が見えること。
3. read/archive/dismiss が本人データだけ更新されること。
4. unauthorized/anon で notification API にアクセス不可であること。
5. analytics event が許可リストに含まれ、保存できること。

## 10. よくあるトラブル
- inbox が空: `member-notification` に userId 一致レコードが無い。
- delivery summary が 0: `delivery-log` テンプレートキー/サイトキーの不一致。
- read 更新失敗: `messageId` が他人の message または存在しない。
- settings は変更されたが表示が変わらない: preference と consent の責務差を確認。

## 11. 仮定
1. notification 基盤の正式な queue/orchestrator は次PRで拡張する。
2. `member-notification` を user-facing summary ストアとして継続利用する。
3. archived/dismissed は同テーブル拡張で段階対応し、専用 table 分割は次段で検討する。
4. advanced digest/push/reminder automation は `not_done` として次PRに分離する。
