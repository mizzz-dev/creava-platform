---
name: issue-pr-writer-ja
description: issue / PR / commit / branch の文面と命名を、このrepoルール（日本語運用・禁止語）に合わせる skill。実装後の提出物整備時に使う。コード設計そのものには使わない。
---

# issue-pr-writer-ja

## いつ使うか
- PR作成時
- issue起票文作成時
- コミット粒度整理時

## いつ使わないか
- 実装詳細の設計/改修そのもの

## 入力として読むもの
- `AGENTS.md`
- `../references/writing-rules-ja.md`
- 変更差分（git diff / test結果）

## 実行手順
1. 変更目的を1〜3行で要約
2. コミットを1目的単位で整理
3. PR本文をテンプレ（概要/変更/確認/影響/破壊的変更）で作成
4. 未実施テスト・リスク・仮定を明記

## 出力の期待形式
- branch名候補（禁止語なし）
- コミットメッセージ案（日本語）
- PRタイトル/本文（日本語）
- PRメタデータ（labels/review_points/risks/not_done）

## repo固有の注意点
- `codex` / `Claude` を branch・コミット・PRタイトルに含めない
- docs 変更時も日本語運用

## どこに効くか
- 全領域の提出物整備

## 破壊的変更回避チェック
- 破壊的変更の有無を必ず明示
- ある場合は移行手順を同時に提示

## 確認コマンド
- `git status --short`
- `git log --oneline -n 10`

## PR / commit / branch ルール
- 日本語コミット・日本語PR
- branch 名に `codex` / `Claude` を含めない
