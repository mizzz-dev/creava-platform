# store.mizzz.jp / fc.mizzz.jp 立ち上げ実行レポート（2026-04-08）

## 1. 現状調査結果
- frontend は `VITE_SITE_TYPE`（main / store / fanclub）で単一コードベースを切替する構成。
- backend は Strapi v5。`store-product` / `fanclub-content` / `news-item` / `blog-post` / `event` / `faq` / `site-setting` などが実装済み。
- API クライアントは `frontend/src/lib/api/client.ts` に集約され、`content-type` 検証・`response.ok` 判定・HTML混入検知・timeout/retry/AbortController を内包。
- i18n は `ja/en/ko` の3言語を `frontend/src/lib/i18n.ts` で初期化済み。
- テーマ切替は `frontend/src/lib/theme.tsx` で `light/dark/system` + localStorage 保存 + OS追従対応済み。
- サブドメイン共通UIは `SubdomainHeader` / `SubdomainFooter` / `StoreLayout` / `FanclubLayout` で整備済み。
- 認証は Clerk + `FanclubAuthGuard` で未ログイン・未認証・会員状態を判定。
- サブドメインURLは `siteLinks.ts`（`VITE_MAIN_SITE_URL` / `VITE_STORE_SITE_URL` / `VITE_FANCLUB_SITE_URL`）で管理。
- お問い合わせ導線は store/fc とも `mizzz.jp` への遷移導線を採用。
- デプロイは frontend（FTP運用）/ backend（Strapi Cloud）を前提。

## 2. そのまま使えるもの
- 共通ルーティング定数（`routeConstants.ts`）
- 共通SEO（`PageHead`, `StructuredData`）
- 共通Error UI（`ErrorState`, `NotFoundState`）
- 共通テーマ / i18n / 認証基盤
- Strapi API 防御クライアント

## 3. 新規実装が必要なもの
- fc movies/gallery/tickets の CMS 本接続（現状は一部ダミーデータ）
- 会員契約状態のサーバー真実源API（課金連携）
- hreflang / 言語別 sitemap の運用強化
- Strapi 管理画面の運用補助（公開予約、商品複製など）

## 4. 先に直すべき不具合
- 画面遷移時のAPIキャンセルを UI エラー扱いしないこと
- 一覧/詳細での中断時ノイズ抑制
- Strapi 商品登録時の入力バリデーション漏れ運用の継続監視

## 5. 作業ブランチ名案
- `subdomain-foundation-store-fc`

## 6. 実装優先順位
1. API 安定化（中断/再試行/安全なエラー表示）
2. 共通基盤（ヘッダー/フッター/法務/問い合わせ導線）
3. 多言語・テーマ切替の全体整合
4. store 主要導線（一覧/詳細/法務/FAQ）
5. fc 主要導線（認証/マイページ/限定表示）
6. Strapi 管理画面運用改善
7. SEO / 法務 / デプロイ最終確認

## 7. 共通基盤でやること
- Subdomain Header / Footer 維持
- 問い合わせ導線の `https://mizzz.jp` 統一
- 共通レイアウト + 共通エラー状態 + Retry
- 共通SEO土台・法務導線の維持

## 8. store でやること
- `/`, `/products`, `/products/:handle` を中心に導線維持
- 絞り込み・ソート・在庫表示・売切表示・関連商品
- News / FAQ / Guide / Shipping / Returns / Legal 導線

## 9. fc でやること
- `/`, `/about`, `/join`, `/login`, `/mypage` を主導線に維持
- 限定公開表示・会員状態に応じた導線分岐
- News / Blog / Movies / Gallery / Events の基本閲覧導線

## 10. 追加 / 修正ファイル一覧（今回）
- `frontend/src/hooks/useAsyncState.ts`
- `frontend/src/hooks/useStrapiCollection.ts`
- `docs/store-fc-launch-execution-report-2026-04-08.md`

## 11. ルーティング一覧
- store: `/`, `/products`, `/products/:handle`, `/news`, `/news/:slug`, `/faq`, `/guide`, `/shipping-policy`, `/returns`, `/terms`, `/privacy`, `/legal`, `/contact`
- fc: `/`, `/about`, `/join`, `/login`, `/mypage`, `/news`, `/news/:slug`, `/blog`, `/blog/:slug`, `/movies`, `/movies/:slug`, `/gallery`, `/gallery/:slug`, `/events`, `/events/:slug`, `/faq`, `/terms`, `/privacy`, `/legal`, `/commerce-law`, `/subscription-policy`

## 12. CMS モデル一覧
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

## 13. API 一覧
- `GET /api/store-products`
- `GET /api/fanclub-contents`
- `GET /api/news-items`
- `GET /api/blog-posts`
- `GET /api/events`
- `GET /api/faqs`
- `GET /api/site-setting`

## 14. 認証 / 権限制御方針
- Clerk でユーザー認証。
- `FanclubAuthGuard` で未ログイン/未認証/会員状態を段階制御。
- `fc_only` / `limited` は frontend 側表示制御 + backend 公開設定で二重管理。

## 15. エラー処理方針
- API 層で `response.ok` / `content-type` 検証。
- HTML 応答混入を専用エラー化し `Unexpected token <` を露出しない。
- timeout / retry / AbortController を標準利用。
- 画面離脱による中断（status 499）はユーザーエラーとして表示しない。

## 16. 多言語対応方針
- `ja/en/ko` を同時運用。
- ヘッダー/フッターから常時切替。
- 未翻訳時は ja フォールバック。

## 17. テーマ切替方針
- `light/dark/system` を維持。
- localStorage を優先し、未設定時に system 追従。

## 18. ヘッダー / フッター設計方針
- main/store/fc の相互回遊を優先。
- 問い合わせは main サイトに集約。
- モバイルはドロワー優先で主要導線を浅く維持。

## 19. SEO / 法務対応一覧
- ページ単位 title/description/OG/canonical は `PageHead` で制御。
- 商品詳細で `Product` / `BreadcrumbList` 構造化データ。
- 法務ページ: terms/privacy/trade(commerce-law)/subscription-policy を維持。

## 20. 環境変数一覧
- frontend: `VITE_SITE_TYPE`, `VITE_MAIN_SITE_URL`, `VITE_STORE_SITE_URL`, `VITE_FANCLUB_SITE_URL`, `VITE_SITE_URL`, `VITE_STRAPI_API_URL`, `VITE_STRAPI_API_TOKEN`, `VITE_CLERK_PUBLISHABLE_KEY`
- backend: `FRONTEND_URL`, `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `DATABASE_URL`

## 21. デプロイ確認項目
- `store` / `fanclub` の build 成功
- main への問い合わせ遷移確認
- i18n / テーマ切替確認
- 保護ページの未ログイン制御確認
- API 障害時の Retry / 安全エラーメッセージ確認

## 22. 残課題
- fc の実データ化（movies/gallery/tickets）
- 課金連携による会員状態のサーバー同期
- hreflang / 言語別 sitemap の厳密運用

## 23. 作成したブランチ名
- `subdomain-foundation-store-fc`

## 24. コミット一覧
- API 中断時のエラー表示抑制とAbortSignal対応を追加
- store/fc 立ち上げ実行レポートを追加

## 25. PR本文案
### 概要
store.mizzz.jp / fc.mizzz.jp の立ち上げに向け、既存コードベースを前提に API 安定化と実行レポート整備を実施しました。

### 対応内容
- `useAsyncState` で中断（499）をユーザーエラーとして扱わない改善
- `useStrapiCollection` / `useStrapiSingle` で AbortSignal 伝搬と unmount 時中断を追加
- 調査結果・優先順位・方針・残課題を一体化した運用レポートを追加

### 変更ファイル
- frontend/src/hooks/useAsyncState.ts
- frontend/src/hooks/useStrapiCollection.ts
- docs/store-fc-launch-execution-report-2026-04-08.md

### 確認手順
- `npm run lint --prefix frontend`
- `npm run build:frontend`
- `npm run build:backend`

### 未対応事項
- fc の課金同期API
- Strapi 管理画面の公開予約 / 複製機能
- 多言語SEO（hreflang / sitemap分割）

### リスク
- 呼び出し側の一部 fetcher で signal 未使用の場合、完全な中断効果が出ない可能性がある

## 仮定
- 問い合わせは今後も `https://mizzz.jp` へ一本化する運用を継続する。
- 課金ステータスの真実源は将来 backend API へ集約し、現段階は Clerk metadata 併用とする。
