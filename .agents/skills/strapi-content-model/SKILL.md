---
name: strapi-content-model
description: Strapi v5 の content-type / relation / populate / 公開状態を安全に変更する skill。schema変更やAPI拡張時に使う。frontend表示調整のみなら使わない。
---

# strapi-content-model

## いつ使うか
- content-type 追加/変更
- relation・populate・公開状態の調整
- controller/service のAPI仕様変更

## いつ使わないか
- frontend見た目のみの変更

## 入力として読むもの
- `../references/backend-strapi-structure.md`
- `../references/strapi-pitfalls.md`
- `backend/src/api/*/content-types/*/schema.json`
- `frontend/src/lib/api/endpoints.ts` と対象 module API

## 実行手順
1. schema diff を最小化
2. endpoint 名（pluralName）整合を確認
3. populate 追加漏れをチェック
4. frontend 型・マッピング・UI影響を同時更新
5. seed/運用手順への影響を明記

## 出力の期待形式
- schema変更点
- frontend影響点
- 移行要否（必要なら手順）

## repo固有の注意点
- `status` は Strapiの publish 用。業務公開は `accessStatus`
- CORSと公開ルートの扱いに注意

## どこに効くか
- backend中心 + frontend連動

## 破壊的変更回避チェック
- 既存 endpoint/slug を維持
- Draft/Publish の期待挙動維持
- 管理画面運用の入力負荷を増やし過ぎない

## 確認コマンド
- `npm run build:backend`
- `npm run seed:backend`
- `npm run build:frontend`

## PR / commit / branch ルール
- 日本語コミット・日本語PR
- branch 名に `codex` / `Claude` を含めない
