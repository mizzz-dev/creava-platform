# main / store / fc 横断 engagement saved-state runbook（2026-04-24）

## 概要
- 目的: `favorites / recently viewed / continue journey / activity center / share` を main・store・fc・support でユーザーが実際に使える形で提供する。
- 非目的: analytics event と UI state を同一責務で管理すること。
- 本PRでは `favoriteState / recentViewState / continueJourneyState / activityCenterState / shareState / guestPersistenceState / syncState` を分離した。

## 役割分担
- favoriteState: 保存/解除と同期状態を管理。
- recentViewState: 閲覧履歴（見た事実）のみを管理。
- continueJourneyState: 再開導線（resumable/in_progress など）を管理。
- activityCenterState: 未読・既読・アーカイブを管理。
- shareState: copied/shared/blocked/failed を管理。
- guestPersistenceState: local only / pending merge / merged を管理。
- syncState: authenticated 時の同期試行状態を管理。

## guest persistence / auth sync / merge 方針
- 未ログイン: localStorage に保存（PIIは保存しない）。
- ログイン後: 即時 merge ではなく `pending_merge` として扱い、重複排除戦略を通して同期する。
- merge 成功後は `merged`、失敗時は `sync_failed` を可視化。

## main / store / fc / support 差分
- main: 保存・最近見た・続きから見るの横断ハブ表示。
- store: 商品中心の再訪導線と share を表示。
- fc: 会員導線と限定コンテンツ再訪を表示。
- support: article・FAQ の再訪導線を activity center から辿れるように表示。

## analytics / personalization / recommendation hook
- track: `content_favorite_add`, `history_viewed`, `favorite_based_revisit`, share CTA。
- recommendation hook: favoriteKinds/recentKinds/supportAffinityState を抽出して suggestion レイヤーに渡す。
- 注意: impression/click/downstream success の分離は次PRで dashboard 連携を強化。

## privacy / consent / SEO / accessibility
- saved metadata に自由入力本文や個人識別情報を含めない。
- member-only/private content は share を `blocked` にする。
- canonical を崩さないため share URL は canonical/path のみ使用。
- アクセシビリティ: ボタンに `aria-pressed`・セクションに `aria-label` を付与。

## env / runtime / secrets
### Frontend runtime env
- `VITE_ENGAGEMENT_CENTER_ENABLED`
- `VITE_ENGAGEMENT_MAX_ACTIVITY_ITEMS`
- `VITE_ENGAGEMENT_MAX_CONTINUE_ITEMS`
- `VITE_ENGAGEMENT_ALLOW_NATIVE_SHARE`
- `VITE_ENGAGEMENT_ALLOW_GUEST_PERSISTENCE`
- `VITE_ENGAGEMENT_SYNC_ENDPOINT`
- `VITE_ENGAGEMENT_SYNC_TIMEOUT_MS`
- `VITE_ENGAGEMENT_SYNC_RETRY`

### GitHub Secrets / Variables（推奨）
- Secrets: `ENGAGEMENT_SYNC_SHARED_SECRET`, `ENGAGEMENT_SYNC_ENDPOINT_TOKEN`
- Variables: `ENGAGEMENT_SYNC_ENDPOINT`, `ENGAGEMENT_ROLLOUT_PERCENT`, `ENGAGEMENT_ENABLE_ACTIVITY_CENTER`

## rollout / rollback
1. `VITE_ENGAGEMENT_CENTER_ENABLED=false` で全無効化可能。
2. サイト別段階導入: main → store → fc の順。
3. rollback 時は localStorage を削除せず UI だけ非表示にして再有効化可能にする。

## 確認手順
1. 未ログインで news/product/fanclub/support guide を閲覧。
2. activity center に recent が蓄積されることを確認。
3. favorite を追加/解除し activity が増えることを確認。
4. continue journey から再開できることを確認。
5. public と member-only で share 結果（shared/blocked）が分かれることを確認。
6. ログイン後、guestPersistenceState が pending_merge になることを確認。

## よくあるトラブル
- 症状: 共有が失敗する。
  - 原因: `navigator.share` 非対応 + clipboard 権限なし。
  - 対応: HTTPS 環境で再確認。fallback を `copy` 優先で運用。
- 症状: continue journey が表示されない。
  - 原因: 閲覧トラッキング未実行。
  - 対応: detail page で `trackViewItem` 呼び出しを確認。

## 仮定
- Supabase Auth の user id を `useCurrentUser().user?.id` で取得できる。
- share 可能対象は public content の canonical path に限定する。
- sync endpoint は次PRで backend 実装し、今回は hook/状態のみ提供する。
