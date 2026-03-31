# creava-platform

Strapi（Headless CMS）・Clerk認証・Shopify連携で構築するモダンなクリエイタープラットフォーム

## 技術スタック

| レイヤー | 技術 |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| CMS | Strapi Cloud v5 |
| Auth | Clerk |
| Store | Shopify Storefront API |
| i18n | i18next（ja/en） |
| Routing | React Router v6 |

## 開発環境のセットアップ

```bash
# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env.local
# .env.local を編集して各APIキーを設定

# 開発サーバー起動
npm run dev
```

## 本番ビルド

```bash
# 本番用環境変数の設定
cp .env.production.example .env.production
# .env.production を編集

# 本番ビルド
npm run build:prod
# dist/ に出力される
```

## デプロイ

- **お名前.comレンタルサーバー**: [docs/deploy-onamae.md](docs/deploy-onamae.md) を参照

## 主要ページ

| パス | ページ |
|---|---|
| `/` | ホーム |
| `/works` | 作品一覧 |
| `/works/:slug` | 作品詳細 |
| `/news` | ニュース一覧 |
| `/news/:slug` | ニュース詳細 |
| `/blog` | ブログ一覧 |
| `/blog/:slug` | ブログ詳細 |
| `/fanclub` | ファンクラブ（会員限定） |
| `/fanclub/:slug` | ファンクラブ詳細 |
| `/store` | ストア |
| `/store/:handle` | 商品詳細 |
| `/contact` | お問い合わせ / 仕事依頼 |

## 環境変数

| 変数名 | 説明 |
|---|---|
| `VITE_SITE_URL` | サイトのURL |
| `VITE_STRAPI_API_URL` | Strapi Cloud APIエンドポイント |
| `VITE_STRAPI_API_TOKEN` | Strapi API トークン |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key |
| `VITE_SHOPIFY_STORE_DOMAIN` | Shopify ストアドメイン |
| `VITE_SHOPIFY_STOREFRONT_TOKEN` | Shopify Storefront API トークン |

詳細は `.env.example`（開発用）および `.env.production.example`（本番用）を参照してください。
