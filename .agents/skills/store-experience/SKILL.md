---
name: store-experience
description: store 体験（商品一覧/詳細/在庫状態/購入導線/再入荷通知）に限定して改善する skill。store改善時に使うが、サイト全体をEC主役に寄せる提案はしない。
---

# store-experience

## いつ使うか
- Store UI/UX 改善
- `available/soldout/coming_soon` 表示の整合修正
- カート/購入導線/再入荷通知改善

## いつ使わないか
- Home全体のブランド調整（`brand-design-polish`）
- FC会員制御中心の改修（`fanclub-experience`）

## 入力として読むもの
- `frontend/src/modules/store/*`
- `frontend/src/pages/Store*`
- `backend/src/api/store-product/*`
- `../references/project-context.md`, `../references/strapi-pitfalls.md`

## 実行手順
1. 商品状態管理の現行 enum/条件を確認
2. FC限定導線が壊れない設計を先に確認
3. main→store 導線の自然さを維持
4. 失敗時UX（在庫切れ・決済不可）を明確化

## 出力の期待形式
- UX課題と対応一覧
- 購買導線の変更点
- FC連携影響

## repo固有の注意点
- store は重要だが主役化しない
- checkout周辺は Stripe/Strapi 連携を前提
- 価格/通貨/在庫の表示整合を維持

## どこに効くか
- store frontend + 関連 backend

## 破壊的変更回避チェック
- 商品 slug/handle 互換
- 在庫ステータス判定の後方互換
- FC限定商品制御維持

## 確認コマンド
- `npm run test:frontend`
- `npm run lint --prefix frontend`
- `npm run build:frontend`

## PR / commit / branch ルール
- 日本語コミット・日本語PR
- branch 名に `codex` / `Claude` を含めない
