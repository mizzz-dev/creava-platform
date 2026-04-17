# backend-strapi-structure

## 構成
- `backend/src/api/*`: content-types / routes / controllers / services
- `backend/config/*`: CORS, DB, middleware, plugin
- `backend/src/lib/auth/logto.ts`: Logto JWT検証
- `backend/src/lib/stripe/*`: Stripe client/webhook/idempotency

## 実装上の注意
- Strapi v5 では publish 状態に `status` が使われるため、業務的公開区分は `accessStatus` を利用
- frontend側 endpoint は `frontend/src/lib/api/endpoints.ts` と整合を取る
- CORS許可 origin は `backend/config/middlewares.ts` の配列 + `FRONTEND_URL`
- 公開 submit API は `inquiry-submissions/public`

## 決済・会員
- payment controller は Logto検証を前提
- 一部 `clerkUserId` 互換フィールドが残る（移行期）
- webhookイベントは重複記録防止ログあり
