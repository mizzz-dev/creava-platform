# Strapi -> WordPress 全面移行計画（Phase 1 起点）

## A. 現在の Strapi 依存箇所一覧（要点）
- frontend API client: `frontend/src/lib/api/client.ts`, `frontend/src/lib/api/strapi.ts`
- endpoint constants: `frontend/src/lib/api/endpoints.ts`
- content modules: `frontend/src/modules/{blog,news,events,works,store,fanclub,settings}/api.ts`
- env: `VITE_STRAPI_API_URL`, `VITE_STRAPI_API_TOKEN`, `VITE_STRAPI_*`
- backend: `backend/src/api/*`, `backend/config/*`, `backend/package.json`

## B. WordPress content type 対応表
| Strapi | WordPress CPT |
|---|---|
| blog-posts | blog |
| news-items | news |
| events | event |
| works | work |
| store-products | store_product |
| fanclub-contents | fanclub_content |
| site-setting(single) | site_settings(option or singleton endpoint) |

## C. Stripe 決済設計
- Checkout: `POST /wp-json/creava/v1/checkout/session`
- Portal: `POST /wp-json/creava/v1/billing/portal`
- Webhook: `POST /wp-json/creava/v1/stripe/webhook`
- Webhook 署名検証: `Stripe\Webhook::constructEvent` を必須
- 保存先: `creava_order`, `creava_subscription`, `creava_entitlement`, `creava_customer`

## D. 変更対象ファイル
- frontend CMS provider: `frontend/src/lib/cms/*`
- frontend env type: `frontend/src/vite-env.d.ts`
- modules API 差し替え: `frontend/src/modules/*/api.ts`
- WordPress plugin scaffold: `wordpress/wp-content/plugins/creava-platform-core/*`
- migration scaffold: `scripts/migrate-strapi-to-wordpress.ts`, `scripts/migration/*`

## E. 実装ステップ
1. Phase 1: 依存洗い出し・移行設計（このドキュメント）
2. Phase 2: WP plugin 基盤（CPT/Taxonomy/Meta/REST namespace）
3. Phase 3: コンテンツ API 実装（一覧/詳細/slug）
4. Phase 4: frontend CMS provider 化（Strapi/WordPress 切替）
5. Phase 5: Stripe Checkout/Portal/Webhook と権限連携
6. Phase 6: データ移行スクリプトを実装・dry-run/本番実行
7. Phase 7: Strapi 段階撤去

## F. リスクと対策
- リスク: 既存 JSON 形式差分でフロント崩壊
  - 対策: WordPress 側で Strapi 互換形式（`data` + `meta.pagination`）を返す
- リスク: paid content がフロント判定依存になる
  - 対策: API 側で本文出し分け / entitlement サーバー判定
- リスク: Stripe webhook の不正呼び出し
  - 対策: 署名必須・イベント型 allowlist・idempotency 保存
- リスク: URL/slug 変更
  - 対策: slug 維持 + redirect map 運用

## G. Phase 1 以降の実装状況（このブランチ）
- CMS provider 層を追加し、`VITE_CMS_PROVIDER=wordpress` で WordPress API を利用可能にした。
- Blog / News / Events / Works / Store / Fanclub / SiteSettings の API 呼び出しを provider 経由へ切替した。
- WordPress plugin の最小スキャフォールド（CPT/Taxonomy/Meta/REST route）を作成した。
- Stripe endpoint は route と雛形実装まで追加し、署名検証本実装は TODO として残した。
