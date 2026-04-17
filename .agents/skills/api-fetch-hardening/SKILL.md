---
name: api-fetch-hardening
description: Strapi API クライアントの堅牢化（content-type 検証、HTML応答混入検知、retry、timeout、エラーUX）専用 skill。初回読み込み不安定やAPI失敗時UX改善で使う。
---

# api-fetch-hardening

## いつ使うか
- APIが時々失敗する / 初回表示が不安定
- HTMLエラーページ混入でJSON parse失敗
- retry/timeout/重複リクエスト制御を改善したい

## いつ使わないか
- 純粋なUIデザイン調整
- schema変更主体

## 入力として読むもの
- `frontend/src/lib/api/client.ts`
- `frontend/src/lib/api/strapi.ts`
- 影響ページの module API + 画面
- `../references/fetch-hardening-checklist.md`

## 実行手順
1. 失敗パターンを分類（network/http/content-type/parse）
2. retry対象・非対象を明示
3. timeout + abort を導入
4. HTML混入/非JSONレスポンス検知
5. ユーザー向けエラー導線を整備
6. ログ・再試行・フォールバックの順で改善

## 出力の期待形式
- hardening差分一覧
- 想定障害ケースと挙動表
- UIエラー表示仕様

## repo固有の注意点
- 既存の cache / SWR風再検証を壊さない
- Authorization 付与条件（publicは不要）を維持

## どこに効くか
- frontend API層 + 一覧/詳細ページ

## 破壊的変更回避チェック
- 既存呼び出しシグネチャ互換
- エラー型の互換（`StrapiApiError`）
- preview/auth 取得フロー維持

## 確認コマンド
- `npm run test:frontend`
- `npm run lint --prefix frontend`
- `npm run build:frontend`

## PR / commit / branch ルール
- 日本語コミット・日本語PR
- branch 名に `codex` / `Claude` を含めない
