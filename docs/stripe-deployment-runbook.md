# Stripe 決済運用ランブック（staging / production 分離）

最終更新: 2026-04-09

## 0. 目的

- `store.mizzz.jp` の one-time payment（`mode=payment`）を安全運用する。
- `fc.mizzz.jp` の subscription（`mode=subscription`）と Customer Portal を安全運用する。
- GitHub Actions（ビルド時）とデプロイ先 runtime env（実行時）の責務を分離する。
- staging は Stripe **test mode**、production は Stripe **live mode** を強制する。

---

## 1. 現状確認チェック（実装前後で同じ項目を確認）

1. `backend/.env.example`
2. `frontend/.env.example`
3. 決済 API ルート: `backend/src/api/payment/routes/payment.ts`
4. Checkout Session 作成: `backend/src/api/payment/services/payment.ts`
5. Webhook endpoint: `backend/src/api/payment/controllers/payment.ts`
6. Portal Session 作成: `backend/src/api/payment/controllers/payment.ts`
7. 決済ルートの `auth: false` と実際の本人認証の実装差分
8. 会員状態同期（`subscription-record` / `payment-record`）
9. デプロイ方法（frontend / backend）
10. GitHub Actions workflow
11. デプロイ先の runtime env 管理（Strapi Cloud Variables 等）

---

## 2. 役割分離（重要）

### 2.1 GitHub Actions の役割

- frontend を環境別にビルドして配布する。
- 環境ごとの **publishable key（`VITE_STRIPE_PUBLISHABLE_KEY`）** を注入する。
- backend の runtime secret は持たない（`STRIPE_SECRET_KEY` は配布しない）。

### 2.2 runtime env（Strapi Cloud / VPS）の役割

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` 等の秘密情報を保持。
- Webhook 署名検証・Checkout/Portal 生成を実行。
- `STRIPE_EXPECTED_MODE` で test/live 取り違えを検知。

---

## 3. 必要な環境変数一覧

## 3.1 frontend（公開可 / VITE_* のみ）

| 変数名 | staging | production | 備考 |
|---|---|---|---|
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` | 公開可 |
| `VITE_STRAPI_API_URL` | stg API URL | prod API URL | 公開可 |
| `VITE_STRAPI_API_TOKEN` | read token | read token | 読み取り専用前提 |

> 禁止: `VITE_` で `sk_*` / `whsec_*` を渡すこと。

## 3.2 backend（非公開 / runtime のみ）

| 変数名 | staging | production | 備考 |
|---|---|---|---|
| `STRIPE_EXPECTED_MODE` | `test` | `live` | モード不一致のガード |
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` | backend専用 |
| `STRIPE_WEBHOOK_SECRET` | test endpoint の `whsec_...` | live endpoint の `whsec_...` | backend専用 |
| `STRIPE_CHECKOUT_SUCCESS_URL` | stg URL | prod URL | 共通fallback |
| `STRIPE_CHECKOUT_CANCEL_URL` | stg URL | prod URL | 共通fallback |
| `STRIPE_STORE_CHECKOUT_SUCCESS_URL` | store-stg success | store prod success | 任意 |
| `STRIPE_STORE_CHECKOUT_CANCEL_URL` | store-stg cancel | store prod cancel | 任意 |
| `STRIPE_FC_CHECKOUT_SUCCESS_URL` | fc-stg success | fc prod success | 任意 |
| `STRIPE_FC_CHECKOUT_CANCEL_URL` | fc-stg cancel | fc prod cancel | 任意 |
| `STRIPE_PORTAL_RETURN_URL` | fc-stg mypage | fc prod mypage | 必須 |

---

## 4. ローカル設定手順

1. `cp backend/.env.example backend/.env`
2. `cp frontend/.env.example frontend/.env.local`
3. backend は Stripe test key を設定（`STRIPE_EXPECTED_MODE=test`）。
4. frontend は `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...` を設定。
5. fanclub checkout / portal は Clerk トークン付きで呼び出されることを確認。

---

## 5. staging 設定手順（test mode）

1. GitHub Environments に `staging` を作成。
2. `staging` Environment Secrets に frontend 用の `VITE_*` を登録。
3. Strapi Cloud の staging runtime Variables に backend 用 `STRIPE_*` を登録。
4. `STRIPE_EXPECTED_MODE=test` を設定。
5. Stripe Dashboard（test mode）で Product / Price / Webhook endpoint / Portal configuration を用意。

---

## 6. production 設定手順（live mode）

1. GitHub Environments に `production` を作成。
2. `production` Environment Secrets に `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...` を登録。
3. runtime（Strapi Cloud / VPS）で `STRIPE_SECRET_KEY=sk_live_...` を登録。
4. `STRIPE_EXPECTED_MODE=live` を設定。
5. Stripe Dashboard を live mode に切り替え、live Product/Price/Webhook/Portal を別途構築。

---

## 7. GitHub Actions 設定手順

対象 workflow:
- `.github/workflows/deploy.yml`
- `.github/workflows/deploy-backend.yml`

手順:
1. Environments（`staging`, `production`）を作成。
2. 各 Environment に secrets/vars を分離登録。
3. `deploy.yml` は branch / manual input から環境を判定して同一workflowで配布。
4. `deploy-backend.yml` は `workflow_dispatch` で `target_env` を明示。

---

## 8. デプロイ先 runtime env 設定手順

### Strapi Cloud

- `Settings > Variables` で環境ごとに backend の `STRIPE_*` を設定。
- frontend 側（static hosting）は `VITE_*` のみ利用。
- backend の Stripe secret は GitHub Actions の build env に注入しない。

### VPS（必要な場合）

- `/etc/...` など runtime の secret store に `STRIPE_*` を設定。
- PM2 再起動時に environment が反映されることを確認。

---

## 9. Stripe Dashboard 側の設定手順

1. mode を test/live で切り替えて、同名 Product/Price を別作成。
2. Webhook endpoint を mode ごとに分離。
   - staging backend URL（test endpoint）
   - production backend URL（live endpoint）
3. endpoint secret（`whsec_*`）を runtime env に反映。
4. Customer Portal Configuration を mode ごとに作成。
5. fanclub `membership-plan.stripePriceId` に **同モード** の Price ID を設定。

---

## 10. Webhook 署名検証確認手順

1. Stripe CLI / Dashboard から `checkout.session.completed` を送信。
2. `Stripe-Signature` なしのリクエストが 400 になることを確認。
3. 署名付きリクエストが `webhook-event-log` に保存されることを確認。
4. 同一 event の再送で `duplicated: true` が返ることを確認。

---

## 11. Checkout / Subscription / Portal の確認手順

### store checkout

1. `store.mizzz.jp`（staging）で購入ボタンを押下。
2. Checkout URL へ遷移すること。
3. 完了後 `payment-record` に `paymentStatus=succeeded` が記録されること。

### fanclub subscription

1. ログイン状態で fanclub join から checkout を開始。
2. backend が Authorization Bearer トークン必須であること。
3. Webhook 後 `subscription-record.clerkUserId` / `customerId` が記録されること。

### customer portal

1. ログイン状態で mypage から Portal 起動。
2. `subscription-record` の `clerkUserId` と一致する `customerId` が使われること。
3. `customerId` を frontend から直接指定できないこと。

---

## 12. test/live 取り違え防止チェックリスト

- [ ] frontend の `VITE_STRIPE_PUBLISHABLE_KEY` が環境と一致
- [ ] backend の `STRIPE_SECRET_KEY` が環境と一致
- [ ] backend の `STRIPE_EXPECTED_MODE` が環境と一致
- [ ] `membership-plan.stripePriceId` が環境と一致
- [ ] `STRIPE_WEBHOOK_SECRET` が endpoint と一致
- [ ] Stripe Dashboard の mode が作業対象と一致

---

## 13. 既知リスク

1. Clerk JWT の署名厳密検証（JWKS）が未実装で、現状はトークン payload 解析ベース。
2. store checkout はゲスト購入を許容しており、本人紐付けは必須化していない。
3. `payment-record` / `subscription-record` は作成型で、状態更新型（upsert）への移行余地あり。
4. Stripe API/運用設定変更時、runbook と dashboard 設定が乖離するリスク。

---

## 14. PR本文案（日本語）

```md
## タイトル
Stripe本番運用に向けた env / workflow / webhook / fanclub認証導線の整理

## 概要
- Stripe test/live 分離を前提に、frontend build env と backend runtime env の責務を分離
- fanclub checkout / portal を Authorization Bearer トークン前提へ変更
- Webhook / 会員状態同期と運用手順（staging→production）を runbook 化

## 変更内容
- backend/.env.example を新規追加し Stripe/Clerk/payment の必要 env を定義
- deploy workflow を GitHub Environments（staging/production）前提へ整理
- fanclub checkout / customer portal API を本人認証連動に変更
- docs/stripe-deployment-runbook.md を追加

## 確認手順
- npm run lint --prefix frontend
- npm run build:frontend
- npm run build:backend
- Webhook 疎通（署名あり/なし、重複送信）
- fanclub checkout / portal のログイン連動確認

## 影響範囲
- frontend / backend / docs / GitHub Actions 運用

## 破壊的変更
- customer portal API は `customerId` 直指定を廃止（Bearer トークン前提）
```

---

## 15. 残課題

1. Clerk JWT の JWKS 署名厳密検証実装。
2. subscription state の upsert 設計（同一 subscriptionId の履歴運用方針確定）。
3. staging ドメイン（`*.stg.mizzz.jp`）の DNS / SSL 実体整備。
4. 運用監視（Webhook 失敗通知、Portal 起動失敗率、決済失敗率）の導入。
