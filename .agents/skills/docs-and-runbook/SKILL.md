---
name: docs-and-runbook
description: docs/runbook を実装実態に合わせて更新する skill。セットアップ手順・運用手順・トラブルシュート更新で使う。コード変更なしの要約だけなら使わない。
---

# docs-and-runbook

## いつ使うか
- 実装変更に伴う docs 更新
- 古い運用手順の修正
- 新規 runbook / checklist 追加

## いつ使わないか
- コード修正のみで docs 影響がない小変更

## 入力として読むもの
- `README.md`, `AGENTS.md`
- 対象コード（frontend/backend/workflows）
- 既存 docs
- `../references/writing-rules-ja.md`

## 実行手順
1. docs主張とコード実態を diff 化
2. 実態優先で本文更新
3. 旧情報は削除せず「旧運用」明示で残すか判断
4. 確認コマンド/検証手順を再現可能に記載

## 出力の期待形式
- 更新理由
- 変更差分
- 未検証事項

## repo固有の注意点
- 認証/フォームは時期で変遷があるため、現行実装を必ず確認
- 日本語ドキュメントを基本とする

## どこに効くか
- docs 全域 + README

## 破壊的変更回避チェック
- 既存手順の削除時は代替手順を明示
- CI/deploy フローに反する記述をしない

## 確認コマンド
- `npm run test:frontend`
- `npm run build:frontend`
- `npm run build:backend`

## PR / commit / branch ルール
- 日本語コミット・日本語PR
- branch 名に `codex` / `Claude` を含めない
