# WordPress + Stripe 設定メモ

## 環境変数（WordPress）
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_DEFAULT_CURRENCY` (default: jpy)
- `CREAVA_FRONTEND_URL`
- `CREAVA_ALLOWED_ORIGINS`

## フロント環境変数
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_WORDPRESS_API_URL`
- `VITE_CMS_PROVIDER=wordpress`

## セキュリティ要件
- secret key をフロントへ露出しない
- webhook 署名検証を必須化
- checkout/session と billing/portal は CSRF/CORS を絞る
