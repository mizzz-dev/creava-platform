---
name: repo-context
description: creava-platform の全体文脈（main/store/fc/Strapi/docs差分）を先に固定するための skill。新規タスク開始時・影響範囲確認時に使う。単一バグ修正で文脈確認不要なときは使わない。
---

# repo-context

## いつ使うか
- 新規 issue 着手時
- 大きめ変更の設計前
- docs と実装のズレ確認が必要なとき

## いつ使わないか
- 1ファイル限定の typo 修正
- 既に同一タスク内で文脈確認済みの後続微修正

## 入力として読むもの
1. `README.md`, `AGENTS.md`
2. `docs/` の該当章
3. `frontend/src/lib/routes.tsx`, `routeConstants.ts`, `siteLinks.ts`
4. `frontend/src/lib/auth/*`, `frontend/src/modules/contact/lib/submit.ts`
5. `backend/src/api/*`, `backend/config/*`, `.github/workflows/*`
6. `../references/project-context.md`

## 実行手順
1. docs主張とコード実装を比較し、差分を列挙
2. main/store/fc/backend/docs への影響範囲を先に宣言
3. 破壊的変更の可能性（route/slug/endpoint/schema）をチェック
4. 実装方針を「最小差分 + 共通層寄せ」に落とす

## 出力の期待形式
- 「現状理解」「差分（docs vs code）」「実装方針」「未確認事項」を箇条書き

## repo固有の注意点
- 認証は Logto が実装実態
- 問い合わせは Strapi submit API 実装が実態
- main 主役、store/fc は導線

## どこに効くか
- main/store/fc/backend/docs 全域

## 破壊的変更回避チェック
- 既存 URL/slug/endpoint 維持
- FC制御（fc_only/limited/archiveVisibleForFC）維持
- SEO/i18n/theme を壊さない

## 確認コマンド
- `rg --files docs frontend backend .github/workflows`
- `npm run test:frontend`
- `npm run lint --prefix frontend`

## PR / commit / branch ルール
- 日本語コミット・日本語PR
- branch 名は英小文字ハイフン、`codex` / `Claude` 禁止
