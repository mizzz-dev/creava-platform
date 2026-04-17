---
name: fanclub-experience
description: fanclub 体験（fc_only、限定公開、会員導線、マイページ、加入導線）を安全に改善する skill。アクセス制御を伴うFC改修時に使う。単なる見た目調整だけなら使わない。
---

# fanclub-experience

## いつ使うか
- FC会員向け導線改善
- `fc_only`/`limited` 表示ロジック確認
- join/login/mypage フロー改善

## いつ使わないか
- Strapi schema 主体変更
- Store主目的の改善

## 入力として読むもの
- `frontend/src/modules/fanclub/*`
- `frontend/src/hooks/useContentAccess.ts`, `frontend/src/utils/index.ts`
- `frontend/src/components/guards/FanclubAuthGuard.tsx`
- `backend/src/api/fanclub-content/*`, `backend/src/lib/auth/logto.ts`

## 実行手順
1. ゲスト/会員/管理者の表示差を整理
2. 認証あり/なし両方の安全側挙動を確認
3. 期限公開・archiveVisibleForFC の条件を検証
4. FC導線と main 導線の連携を確認

## 出力の期待形式
- ロール別挙動表
- 変更点と回帰リスク

## repo固有の注意点
- 認証は Logto 実装前提
- `clerkUserId` は互換残存のため削除前提で扱わない

## どこに効くか
- fanclub frontend + auth/payment backend

## 破壊的変更回避チェック
- FC制御ロジックの条件式互換
- 非ログイン時の落ち方（クラッシュ防止）
- checkout/callback ルート維持

## 確認コマンド
- `npm run test:frontend`
- `npm run build:frontend`

## PR / commit / branch ルール
- 日本語コミット・日本語PR
- branch 名に `codex` / `Claude` を含めない
