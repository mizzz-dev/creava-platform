# store.mizzz.jp 立ち上げ・安定化: 現状調査と次アクション

## 1. 現状調査結果

### frontend / backend 構成
- frontend: React + Vite + TypeScript。`VITE_SITE_TYPE=store` でストア向けルートに切替。
- backend: Strapi v5。`store-product` / `news-item` / `faq` / `site-setting` は既存定義あり。

### 既存 API クライアント
- `frontend/src/lib/api/client.ts` に timeout / retry / AbortController / HTML 応答判定 / `response.ok` 判定が既に実装済み。
- 開発時詳細ログは `useAsyncState` で出力する設計。

### 商品 / News / FAQ
- 商品 / News は API モジュール経由で取得済み。
- FAQ はこれまで静的配列表示だったため、今回 CMS 取得導線を追加。

### デザインシステム / 共通 UI
- 共通 `ErrorState` / Skeleton 系コンポーネントあり。
- Store 用 `StoreLayout`、カード UI、法務ページ UI が既存。

### サブドメイン受け先
- `store.mizzz.jp` は frontend 同一コードベースを store ターゲットでデプロイする設計。
- ルーティングは `isStoreSite` 判定で store 専用構成へ切替。

### 環境変数 / API URL / CORS
- frontend は `VITE_STRAPI_API_URL` / `VITE_STRAPI_API_TOKEN` 前提。
- backend CORS は `https://store.mizzz.jp` を既定許可済み。`FRONTEND_URL` で追加許可可能。

### デプロイ
- ロリポップ（frontend）+ Strapi Cloud（backend）運用が docs に明記済み。

## 2. 実装優先順位
1. API 安定化（FAQ を含めた取得統一、エラー表現の本番安全化）
2. ストア導線と法務導線（`/legal` / `/terms` / `/privacy`）
3. CMS モデル拡張（Product の運用項目増強）
4. 商品一覧/詳細の絞り込み・在庫・関連商品の改善
5. SEO / 構造化データ / sitemap の最終調整

## 3. 追加 / 修正ファイル一覧
- 追加: `frontend/src/modules/faq/api.ts`
- 追加: `frontend/src/pages/storefront/StorefrontLegalPage.tsx`
- 追加: `docs/store-mizzz-next-actions.md`
- 修正: `frontend/src/pages/FAQPage.tsx`
- 修正: `frontend/src/hooks/useAsyncState.ts`
- 修正: `frontend/src/types/content.ts`
- 修正: `frontend/src/lib/routeConstants.ts`
- 修正: `frontend/src/lib/routes.tsx`

## 4. ルーティング一覧（store）
- `/`
- `/products`
- `/products/:handle`
- `/collections/:slug`
- `/news`
- `/news/:slug`
- `/faq`
- `/guide`
- `/shipping-policy`
- `/returns`
- `/contact`
- `/legal`
- `/terms`
- `/privacy`
- `/legal/terms`
- `/legal/privacy-policy`
- `/legal/tokushoho`

## 5. CMS モデル一覧（現状 + 必要拡張）
- 現状: `store-product`, `news-item`, `faq`, `site-setting`
- 追加推奨: `category`（Collection Type）、`product-tag`（Collection Type）
- `store-product` 追加推奨属性:
  - `sku`, `stock`, `images(multiple)`, `descriptionShort`, `descriptionLong`
  - `featured`, `isNewArrival`, `sortOrder`
  - `seoTitle`, `seoDescription`, `ogImage`
  - `cautionNotes`, `shippingNotes`, `digitalDeliveryNotes`

## 6. API 一覧
- 商品一覧: `GET /api/store-products`
- 商品詳細(slug): `GET /api/store-products?filters[slug][$eq]=...`
- News 一覧: `GET /api/news-items`
- FAQ 一覧: `GET /api/faqs`
- Site Settings: `GET /api/site-setting`

## 7. 環境変数一覧（store 最低限）
### frontend
- `VITE_SITE_TYPE=store`
- `VITE_SITE_URL=https://store.mizzz.jp`
- `VITE_STRAPI_API_URL`
- `VITE_STRAPI_API_TOKEN`
- `VITE_FORMSPREE_CONTACT_ID`
- `VITE_FORMSPREE_REQUEST_ID`

### backend (Strapi Cloud)
- `FRONTEND_URL=https://mizzz.jp,https://store.mizzz.jp,https://fc.mizzz.jp`
- `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`
- `DATABASE_*`（本番 PostgreSQL）

## 8. エラー処理方針
- API クライアント層で `content-type`, `response.ok`, timeout, retry を強制。
- HTML 応答・JSON パース失敗を `StrapiApiError` に正規化。
- UI では `ErrorState` と `EmptyState` を分離。
- 開発は詳細ログ出力、本番は安全メッセージを表示（今回反映）。

## 9. SEO / 法務対応一覧
- 実装済み:
  - `PageHead` ベースの title/description/OG
  - 商品詳細の Product/Breadcrumb 構造化データ
  - `robots.txt` / `sitemap.xml`
- 今回追加:
  - `/legal` ハブページ
  - `/terms`, `/privacy` の store 導線

## 10. デプロイ確認項目
- `VITE_SITE_TYPE=store` で build し、`store.mizzz.jp` 配下に配置。
- Strapi Public 権限で `store-products/news-items/faqs/site-setting` の `find/findOne` を許可。
- CORS に `https://store.mizzz.jp` が入っていること。
- 公開後、商品一覧 / 商品詳細 / FAQ / News が取得できること。

## 11. 残課題
- Strapi 管理画面での商品運用バリデーション強化（slug/price/image/stock）。
- Product モデル拡張（SKU・在庫・SEO・注意事項）と frontend 型追従。
- 商品一覧のタグ絞り込みとソート強化。
- カート〜決済導線（Stripe / BASE）の確定実装。
- モバイル QA（実機）と E2E 導入。

## 仮定
- 既存の `store-product` は当面 current schema を維持し、破壊的変更を避ける。
- FAQ は Strapi データ未投入時に既存静的 FAQ をフォールバックとして利用する。
- `/terms` `/privacy` は store で短縮導線として追加し、既存 `/legal/*` も互換維持する。
