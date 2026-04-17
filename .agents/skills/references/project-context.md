# project-context

## 目的と優先順位（repo実態 + AGENTS.md）
1. ブランド訴求が主役（homeがハブ）
2. Contact / Request で依頼獲得
3. News / Blog / Events の継続発信
4. Store / Fanclub は強いが従属導線

## 実装の現在地（コード優先）
- frontend: React 18 + TypeScript + Vite + Tailwind + Framer Motion
- backend: Strapi v5（開発 SQLite / 本番 PostgreSQL）
- マルチサイト: `VITE_SITE_TYPE` で `main | store | fanclub` を切替
- i18n: `ja/en/ko`（READMEの `ja/en` 記述は古い）
- 認証: Logto（Clerk記述の docs は多くが旧情報）
- フォーム: Formspree ではなく Strapi API (`/api/inquiry-submissions/public`) 送信が実装済み

## 重要導線
- Home: 各機能へのハブ
- Contact/Request: 重要CV導線
- Store / FC: mainの世界観を崩さない範囲で強化

## 変更時の基本
- route/slug/endpoint/schema を不用意に変えない
- module/hook/lib に寄せる（ページ直書き回避）
- SEO・構造化データ・light/dark・i18nの欠落を起こさない
