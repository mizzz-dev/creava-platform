---
name: brand-design-polish
description: ブランドサイトとしての見た目品質（余白・タイポ・ヒーロー・導線・light/dark）を改善する skill。UI品質向上時に使う。機能仕様変更やCMSモデル変更が主目的なら使わない。
---

# brand-design-polish

## いつ使うか
- Home / main UI の品位向上
- テンプレ感を減らす微調整
- hero/CTA/情報階層の改善

## いつ使わないか
- API仕様変更
- 認証・決済ロジック変更

## 入力として読むもの
- `../references/design-principles.md`
- 対象ページ JSX
- 既存 Tailwind class / motion 設定

## 実行手順
1. design context / brand personality を先に言語化
2. reference と anti-reference を定義
3. 余白・タイポ・色・コントラストを順に整える
4. motion は意味がある箇所だけ最小追加
5. store/fc への導線は主役化しない形で配置

## 出力の期待形式
- Before/After の意図説明
- 調整ポイント（余白/タイポ/導線/モーション）
- 回帰チェック結果

## repo固有の注意点
- main 主役の情報設計を崩さない
- darkで可読性を必ず確認
- SEO構造要素（見出し階層等）を壊さない

## どこに効くか
- 主に main frontend、次点で store/fc UI

## 破壊的変更回避チェック
- CTA先URL・route変更なし
- i18nキー欠落なし
- a11y（focus/heading/alt）劣化なし

## 確認コマンド
- `npm run lint --prefix frontend`
- `npm run build:frontend`

## PR / commit / branch ルール
- 日本語コミット・日本語PR
- branch 名に `codex` / `Claude` を含めない
