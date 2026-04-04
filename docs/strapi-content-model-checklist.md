# Strapi 表示成立チェックリスト（ホームページ運用）

Home / Store / Latest を実データで崩さず運用するための最低限チェック。

## エンドポイント対応

- Settings: `/api/site-setting`
- Works: `/api/works`
- News: `/api/news-items`
- Blog: `/api/blog-posts`
- Events: `/api/events`
- Store: `/api/store-products`
- Fanclub: `/api/fanclub-contents`

## フロントで期待している主フィールド

### Settings (single)
- `siteName`
- `description`
- `ogImage` (media)

### Works
- `title`, `slug`, `publishAt`, `accessStatus`
- `thumbnail` (media)
- `isFeatured`
- case study 用（任意）: `caseStudyBackground`, `caseStudyGoal`, `caseStudyApproach`, `caseStudyImplementation`, `caseStudyResult`

### News / Blog / Fanclub
- `title`, `slug`, `publishAt`, `accessStatus`
- `thumbnail` (media, 任意)

### Events
- `title`, `slug`, `startAt`, `venue`, `accessStatus`

### Store
- `title`, `slug`, `price`, `currency`
- `previewImage` (media, 任意)
- `purchaseStatus` (`available` / `soldout` / `coming_soon`)
- `stripeLink`（Stripe主軸）
- `baseLink`（補助導線）
- `accessStatus`

## populate 指針

- Works: `thumbnail`
- News/Blog/Fanclub: `thumbnail`
- Store: `previewImage`
- Settings: `ogImage`

## 表示成立の運用ポイント

1. Home の Featured Works は 3〜4件を維持
2. Latest (News/Blog/Events) は最低1件ずつある状態を保つ
3. Store は `coming_soon` のみでも表示は成立
4. `fc_only` / `limited` を混ぜてアクセス制御の確認を行う
5. 画像あり / 画像なし両パターンを残す

## Seed / fixture 運用（repo 内で完結）

`backend/scripts/seed` を使うと、Home / Store / Fanclub の表示確認に必要なサンプルデータを一括投入できます。

### 件数目安（現行 fixture）

- Works: 14件（featured / case study / public / fc_only / limited を含む）
- News: 14件
- Blog: 14件
- Events: 8件
- Store: 12件（available / soldout / coming_soon を含む）
- Fanclub: 12件
- Site Settings: 1件

### 実行手順

```bash
npm run develop --prefix backend
# 初回確認後に停止
npm run seed:backend
```

### 画像運用メモ

- media フィールド（`thumbnail`, `previewImage`, `ogImage`）は未設定でも表示が崩れないよう実装済み
- OGP だけは `site-setting.ogImage` または `frontend/public/og-default.png` のどちらかを必ず用意する
- UI 確認時は「画像あり / 画像なし」を混在させる（空状態の崩れ検知に有効）
