---
name: design-critique
description: 実装後のUIを批評し、テンプレ感・導線バランス・可読性・a11y・dark対応を点検する skill。デザインレビュー最終工程で使う。新規機能実装そのものには使わない。
---

# design-critique

## いつ使うか
- UI変更後のレビュー
- PR前の最終ポリッシュ

## いつ使わないか
- APIやschema中心のバックエンド変更

## 入力として読むもの
- 変更対象の画面
- `../references/design-principles.md`
- 可能ならスクリーンショット

## 実行手順
1. テンプレUI感の有無を判定
2. main主役 / store・fc従属のバランス確認
3. 余白・タイポ・視線誘導・CTA密度を評価
4. light/dark 両方でコントラスト確認
5. a11y（focus、見出し、alt）を点検
6. 改善提案を「必須/推奨/任意」で分類

## 出力の期待形式
- スコアカード（情報設計 / 視認性 / 導線 / 一貫性）
- 問題点と改善提案（優先度付き）

## repo固有の注意点
- EC色が強すぎる提案を避ける
- モーション過多で可読性を落とさない

## どこに効くか
- frontend UI 全域

## 破壊的変更回避チェック
- レビューで route/API 変更提案を出す場合は互換策を併記

## 確認コマンド
- `npm run lint --prefix frontend`
- `npm run build:frontend`

## PR / commit / branch ルール
- 日本語コミット・日本語PR
- branch 名に `codex` / `Claude` を含めない
