# store.mizzz.jp / fc.mizzz.jp 本番公開整備レポート（2026-04-08）

## 1. 現状調査結果
- frontend は React + Vite の単一実装で、`VITE_SITE_TYPE=main|store|fanclub` でサブドメインごとにルート・導線を切り替える構成。
- backend は Strapi v5。`store-product` / `fanclub-content` / `news-item` / `blog-post` / `event` / `faq` など公開導線に必要な主要モデルは揃っている。
- API クライアント（`frontend/src/lib/api/client.ts`）で `response.ok` 判定、`content-type` 検証、HTML 応答混入検知、timeout/retry、AbortController に対応済み。
- `SubdomainHeader` / `SubdomainFooter` / `StoreLayout` / `FanclubLayout` があり、store/fc の共通導線を既に共通化できる構造になっている。
- i18n は `ja/en/ko` で運用、テーマは `light/dark/system` と localStorage 保持に対応済み。
- 認証は Clerk + `FanclubAuthGuard` を基盤に、会員ページの保護が可能。
- Strapi 側は `json-api-error` / `rate-limit` / `request-audit` ミドルウェアを実装済みで、公開運用向けの防御層がある。

## 2. 本番公開に向けた不足項目
- fc の一部セクション（movies/gallery/tickets）のデータ供給を最終的に mock 依存から CMS 実データ中心に統一する必要がある。
- 会員契約ステータス（free/paid/premium、更新/失効）の真実源 API は今後の追加が必要。
- 監視運用は現状 GA とログ中心のため、アラート閾値・障害一次対応フローの明文化をさらに強化する余地がある。
- 多言語 SEO（hreflang と sitemap 運用）の公開後継続メンテ手順を強化する余地がある。

## 3. そのまま使えるもの
- 防御的 API クライアント（timeout/retry/content-type 検証/HTML混入対策）。
- サブドメイン共通ヘッダー/フッター/共通レイアウト。
- Clerk 認証基盤と Guard。
- 共通エラー UI（ErrorState / EmptyState / Retry 導線）。
- Strapi 側の CORS・セキュリティ設定と API エラー正規化。

## 4. 先に直すべき不具合
- サブドメインの一部文言が固定文字列だったため、多言語切替とズレる箇所を優先修正。
- 問い合わせ導線文言を全サブドメインで統一し、メインサイト誘導を明示。
- API 失敗時の観測点を本番向けに増やし、障害把握をしやすくする。

## 5. 作業ブランチ名
- `release-store-fc-foundation`

## 6. 実装優先順位
1. 共通導線（header/footer/contact）
2. API 安定性（失敗時 UX と観測）
3. 認証/保護導線
4. 多言語・テーマ整合
5. store/fc 主要ページの安定運用
6. Strapi 管理画面運用ガード
7. SEO/法務/公開前チェック

## 7. 共通基盤で対応したこと
- `SubdomainHeader` のナビ文言・問い合わせ導線を i18n 化。
- `SubdomainFooter` の案内文・法務導線・言語表示を i18n 化。
- store/fc レイアウトのナビ/法務リンク定義を翻訳キーで統一。
- 「お問い合わせは mizzz.jp メインサイトで受け付ける」表現を共通化。

## 8. store で対応したこと
- store ナビ（商品一覧/デジタル/ガイド）を多言語キー運用に統一。
- 法務リンク（配送/返品/規約/プライバシー/特商法）を翻訳キー化。
- 問い合わせ導線を常に `mizzz.jp` 起点で表示。

## 9. fc で対応したこと
- fanclub ナビ（入会/動画/ギャラリー/マイページ）を多言語キー化。
- 法務リンク（規約/プライバシー/特商法/サブスクポリシー）を翻訳キー化。
- 共通フッターで main/store/fc 回遊導線を維持。

## 10. Strapi 管理画面で対応したこと
- 既存の quick actions（アイコン付き）構成を運用継続前提で再確認。
- `store-product` lifecycle による slug/価格/在庫/画像未設定警告の運用ガードが効くことを確認。
- API エラー正規化ミドルウェア（HTML混入時のJSON化）を公開前提で継続運用。

## 11. 追加 / 修正ファイル一覧
- `frontend/src/components/layout/StoreLayout.tsx`
- `frontend/src/components/layout/FanclubLayout.tsx`
- `frontend/src/components/layout/SubdomainHeader.tsx`
- `frontend/src/components/layout/SubdomainFooter.tsx`
- `frontend/src/hooks/useAsyncState.ts`
- `frontend/src/locales/ja/common.json`
- `frontend/src/locales/en/common.json`
- `frontend/src/locales/ko/common.json`
- `docs/store-fc-launch-execution-report-2026-04-08.md`

## 12. ルーティング一覧
- store: `/`, `/products`, `/products/:handle`, `/news`, `/news/:slug`, `/faq`, `/guide`, `/shipping-policy`, `/returns`, `/terms`, `/privacy`, `/legal`, `/contact`
- fc: `/`, `/about`, `/join`, `/login`, `/mypage`, `/news`, `/news/:slug`, `/blog`, `/blog/:slug`, `/movies`, `/movies/:slug`, `/gallery`, `/gallery/:slug`, `/events`, `/events/:slug`, `/faq`, `/terms`, `/privacy`, `/legal`, `/commerce-law`, `/subscription-policy`

## 13. CMS モデル一覧
- `store-product`
- `fanclub-content`
- `news-item`
- `blog-post`
- `event`
- `faq`
- `site-setting`
- `media-item`
- `work`
- `profile`
- `award`

## 14. API 一覧（主要読み取り）
- `GET /api/store-products`
- `GET /api/fanclub-contents`
- `GET /api/news-items`
- `GET /api/blog-posts`
- `GET /api/events`
- `GET /api/faqs`
- `GET /api/site-setting`

## 15. 認証 / 権限制御方針
- 認証: Clerk を使用。
- 画面保護: `FanclubAuthGuard` で未ログイン時に安全に誘導。
- 公開制御: `accessStatus`（`public` / `fc_only` / `limited`）を frontend/backend 双方で尊重。
- 将来拡張: free/paid/premium の段階制御を追加可能な構造を維持。

## 16. エラー処理方針
- API クライアント層で防御（`response.ok` / JSON 判定 / timeout / retry / abort）。
- HTML 応答混入時は専用エラーへ変換し、`Unexpected token <` をユーザー露出しない。
- 本番では安全な汎用メッセージ、開発時のみ詳細診断ログを表示。
- 本対応で `api_error` イベントを送信し、障害観測を補強。

## 17. 多言語対応方針
- `ja/en/ko` 3言語を同時維持。
- サブドメインヘッダー/フッターの固定文言を翻訳キーへ統一。
- キー欠落時は既存 i18next フォールバックを使用。

## 18. テーマ切替方針
- `light/dark/system` の既存基盤を継続。
- localStorage 優先 + system フォールバック。
- サブドメインの共通 UI は dark/light 双方でコントラスト確保。

## 19. ヘッダー / フッター設計方針
- main/store/fc の相互回遊を最優先。
- 問い合わせは `mizzz.jp` に集約し、サブドメイン側は遷移導線のみ提供。
- モバイル時はドロワー経由で主要導線を浅い階層で提供。

## 20. SEO / 法務 / セキュリティ対応一覧
- SEO: `PageHead` による title/description/canonical/OG の管理。
- 法務: terms/privacy/trade/subscription-policy 等への導線をサブドメイン共通 UI から常設。
- セキュリティ: Strapi で CSP/Frameguard/Referrer-Policy/CORS/RateLimit を適用。
- robots/sitemap は public 配下の分割 sitemap を継続利用。

## 21. 環境変数一覧
- frontend: `VITE_SITE_TYPE`, `VITE_MAIN_SITE_URL`, `VITE_STORE_SITE_URL`, `VITE_FANCLUB_SITE_URL`, `VITE_SITE_URL`, `VITE_STRAPI_API_URL`, `VITE_STRAPI_API_TOKEN`, `VITE_STRAPI_TIMEOUT_MS`, `VITE_STRAPI_RETRY_COUNT`, `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_GA_MEASUREMENT_ID`
- backend: `FRONTEND_URL`, `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `DATABASE_URL`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`

## 22. 本番公開前チェック項目
- build / lint / 型チェック成功
- store/fc の主要導線（商品一覧・詳細、会員ページ、法務、FAQ、News）
- 未ログイン/ログイン状態のアクセス制御
- 問い合わせ導線が `https://mizzz.jp/contact` に統一されていること
- 多言語切替（ja/en/ko）とテーマ切替（light/dark/system）
- API 失敗時の ErrorState / Retry 動作
- robots / sitemap / canonical / OGP の整合

## 23. デプロイ確認項目
- frontend: ターゲット別 build（main/store/fc）成功
- backend: Strapi Cloud の環境変数・CORS 設定確認
- 各サブドメインで404/500相当時の表示確認
- noindex/index の意図確認（会員限定ページ含む）

## 24. 残課題
- fc 会員契約状態 API（課金基盤連動）の本実装
- movies/gallery/tickets の完全 CMS 駆動化
- 運用監視の通知連携（Slack/Pager 等）追加

## 25. コミット一覧
- 共通ヘッダー/フッターの多言語導線を強化
- API エラー観測イベントを追加
- 本番公開整備レポートを更新

## 26. PR本文案
### 概要
store.mizzz.jp / fc.mizzz.jp の本番公開準備として、見た目追加より先に、共通導線・多言語運用・API障害観測を中心に基盤整備を実施しました。

### 対応内容
- subdomain 共通ヘッダー/フッターを翻訳キー運用へ統一
- 問い合わせ導線を `mizzz.jp` 集約として文言・導線を統一
- `useAsyncState` で API エラー発生時の観測イベント送信を追加
- 公開準備観点（ルート/CMS/API/環境変数/チェック項目）を運用レポートへ反映

### 変更ファイル
- frontend/src/components/layout/StoreLayout.tsx
- frontend/src/components/layout/FanclubLayout.tsx
- frontend/src/components/layout/SubdomainHeader.tsx
- frontend/src/components/layout/SubdomainFooter.tsx
- frontend/src/hooks/useAsyncState.ts
- frontend/src/locales/ja/common.json
- frontend/src/locales/en/common.json
- frontend/src/locales/ko/common.json
- docs/store-fc-launch-execution-report-2026-04-08.md

### 確認手順
- `npm run lint --prefix frontend`
- `npm run build:frontend`
- `npm run build:backend`

### 未対応事項
- 課金連動の会員ステータス API
- fc 一部セクションの完全 CMS 駆動化
- 監視通知の外部連携

### リスク
- 翻訳キー追加に伴い、今後キー名変更時は3言語同時更新が必要

## 仮定
- お問い合わせ導線は当面 `https://mizzz.jp/contact` へ一本化する。
- GA4 計測（`VITE_GA_MEASUREMENT_ID`）が本番で有効化される前提で `api_error` イベントを観測に利用する。
