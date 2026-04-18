# PWA / モバイル app-like 基盤整備（2026-04-18）

## 1. 現状調査サマリ
- 既存は `site.webmanifest` のみ存在し、Service Worker / install prompt / Web Push 購読導線は未実装。
- notification / favorites / history / loyalty / discovery / support は主に localStorage と Strapi API で基盤済み。
- main / store / fc は共通 analytics context を持つため、PWAイベント拡張余地がある。
- offline 時の専用フォールバック・poor network 通知は不足。

## 2. 今回の実装
### Frontend
- `sw.js` + `offline.html` を追加し、静的資産のキャッシュ、HTMLのネットワーク優先 + オフラインフォールバックを追加。
- `registerServiceWorker` をエントリポイントに追加。
- install prompt の表示頻度制御（dismiss 7日、再表示 2日）を追加。
- iOS/Android/Desktop の説明分岐付き install バナーを追加。
- モバイル下部クイックナビ（main/store/fc で導線最適化）を追加。
- オフライン時トーストを追加。
- Notification Preference Center に Web Push opt-in ボタンと対応可否表示を追加。
- PWA関連 analytics イベントを追加:
  - `pwa_install_prompt_impression`
  - `pwa_install_prompt_click`
  - `pwa_install_success`
  - `pwa_install_dismiss`
  - `offline_fallback_view`
  - `bottom_nav_click`
  - `push_opt_in_prompt_impression`
  - `push_opt_in_success`
  - `push_opt_in_decline`

### Backend / Strapi
- `web-push-subscription` content-type を追加。
  - endpoint / keys / sourceSite / membershipStatus / permissionState などを保持。
  - 将来の CRM 連携・重複配信抑制・クリック計測に備えた属性を定義。

## 3. 運用ルール
- DNS追加: **不要**（既存 main/store/fc ドメイン配下で完結）。
- `VITE_ENABLE_PWA=false` で Service Worker 登録を停止可能。
- `VITE_WEB_PUSH_VAPID_PUBLIC_KEY` 未設定時は push購読APIを呼ばず、in-app/emailにフォールバック。
- SW更新時は `CACHE_VERSION` を更新し、古いキャッシュを無効化する。

## 4. Browser差分
- Android Chrome: install prompt + web push 対応。
- iOS Safari: install prompt イベントは非対応のため手動案内を表示。
- Desktop Chromium: install prompt 対応。
- 未対応ブラウザ: in-app通知 / メール通知 / Notification Center を案内。

## 5. 確認手順
1. `npm run build:frontend`。
2. httpsで起動し DevTools > Application で Service Worker と Manifest を確認。
3. offline切替で `offline.html` 表示を確認。
4. mobile viewport で下部ナビ表示と導線遷移を確認。
5. Notification Preference Center で push許可の導線と permission state 表示を確認。

## 6. 今後の拡張（次PR）
- Push payload テンプレートを Strapi `lifecycle-template` と接続。
- `web-push-subscription` の公開API（購読登録/解除）実装。
- 既読/クリック連携を analytics-event / crm セグメント更新へ統合。
- iOS向け web push（ホーム画面追加済み条件）文脈に合わせた最適化。
