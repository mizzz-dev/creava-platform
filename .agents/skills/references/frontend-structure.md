# frontend-structure

## 主要ディレクトリ
- `frontend/src/pages`: ルートページ
- `frontend/src/modules`: 機能単位（home/store/fanclub/contact など）
- `frontend/src/components`: 共通UI
- `frontend/src/hooks`: 横断フック
- `frontend/src/lib`: ルーティング/API/SEO/i18n/auth/theme
- `frontend/src/locales/{ja,en,ko}`: 翻訳

## ルーティングの要点
- ルート定数は `src/lib/routeConstants.ts`
- 実ルーティングは `src/lib/routes.tsx`（site typeで分岐）
- main では `/store` `/fanclub` をサブドメインへ誘導する構成あり

## 守るべき実装パターン
- データ取得は module API + `lib/api/*` を利用
- access制御は `useContentAccess` / `canViewContent` を利用
- 認証依存UIは `lib/auth/*` + `useCurrentUser` で吸収
- SEOは `components/seo/PageHead` + `StructuredData` を併用

## デザインシステム的ルール
- Tailwind utility中心
- ダークテーマは `ThemeProvider` + `dark` クラスで制御
- Framer Motion演出は過剰化せず、可読性/導線優先
