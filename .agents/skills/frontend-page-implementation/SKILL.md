---
name: frontend-page-implementation
description: frontend の pages/modules/components/hooks/lib の責務に沿ってページ実装する skill。ルーティング追加・ページ改修・導線調整時に使う。スタイルだけの最終調整は brand-design-polish を優先。
---

# frontend-page-implementation

## いつ使うか
- 新規ページ追加
- 既存ページの導線・データ取得・表示改修
- main/store/fc の route 分岐を伴う変更

## いつ使わないか
- Strapi schema 主体の変更（`strapi-content-model`）
- fetch 安定化主体の変更（`api-fetch-hardening`）

## 入力として読むもの
- `../references/frontend-structure.md`
- `frontend/src/lib/routes.tsx`, `routeConstants.ts`
- 対象機能の `modules/*`, `hooks/*`, `lib/*`
- `components/seo/PageHead.tsx`, `components/seo/StructuredData.tsx`

## 実行手順
1. 画面責務を pages/modules に分解
2. route 定数起点で path を定義
3. データ取得は module API / lib API 経由に統一
4. i18n key を `ja/en/ko` 同時更新
5. light/dark と keyboard 操作を確認
6. SEO と JSON-LD を維持・更新

## 出力の期待形式
- 変更ファイル一覧
- 画面責務（page / module / hook / lib）の対応表
- 回帰確認項目

## repo固有の注意点
- Home のハブ性を壊さない
- main から store/fc への導線バランス維持
- page 直書きロジック増殖を避ける

## どこに効くか
- main/store/fc frontend

## 破壊的変更回避チェック
- `routeConstants.ts` と実ルーティング整合
- legacy redirect 挙動維持
- 既存 slug param 名を変更しない

## 確認コマンド
- `npm run lint --prefix frontend`
- `npm run test:frontend`
- `npm run build:frontend`

## PR / commit / branch ルール
- 日本語コミット・日本語PR
- branch 名に `codex` / `Claude` を含めない
