# fc.mizzz.jp 実装メモ（Phase 1）

## 1. 実装方針の要約
- `VITE_SITE_TYPE=fanclub` 時に専用ルーティング・専用レイアウトを使用。
- 既存の `News / Blog / Events / FAQ / 法務ページ / Contact / Member` を再利用し、最小変更で立ち上げ。
- ファンクラブ専用ページ（`/join`, `/login`, `/movies`, `/gallery`, `/tickets`, `/member-store`, `/guide`, `/subscription-policy` など）を新設。
- 限定公開の見せ分けは `guest/member/admin` の既存ロールを活用し、将来 `premium` を拡張可能な構造で実装。
- 既存 API の防御的クライアント（timeout/retry/content-type検証）を継続利用。

## 2. ページ一覧
- `/` トップ
- `/about` ファンクラブ紹介
- `/join` プラン/入会
- `/login` ログイン導線
- `/mypage` マイページ導線
- `/member` 既存会員ダッシュボード
- `/news`, `/news/:slug`
- `/blog`, `/blog/:slug`
- `/movies`, `/movies/:slug`
- `/gallery`, `/gallery/:slug`
- `/schedule`
- `/events`, `/events/:slug`
- `/tickets`, `/tickets/:slug`
- `/member-store`
- `/faq`
- `/guide`
- `/contact`
- `/legal`
- `/terms`
- `/privacy`
- `/commerce-law`
- `/subscription-policy`

## 3. 会員導線フロー
1. 非会員が `/` で価値と特典を理解
2. `/join` でプランと規約同意を確認
3. `/login` から認証
4. `/mypage` / `/member` で契約状態・通知を確認
5. `/movies`, `/gallery`, `/tickets` で限定コンテンツへ到達
6. `/member-store` から将来の `store.mizzz.jp` 連携へ遷移

## 4. コンポーネント一覧
- `FanclubLayout`（専用ヘッダー/フッター）
- `FanclubHomeHubPage`
- `FanclubAboutSitePage`
- `FanclubJoinPage`
- `FanclubLoginPage`
- `FanclubMyPageSite`
- `FanclubMoviesPage` / `FanclubMoviesDetailPage`
- `FanclubGalleryPage` / `FanclubGalleryDetailPage`
- `FanclubTicketsPage` / `FanclubTicketsDetailPage`
- `FanclubSchedulePage`
- `FanclubMemberStorePage`
- `FanclubGuidePage`
- `FanclubLegalIndexPage`
- `FanclubSubscriptionPolicyPage`

## 5. CMS モデル一覧
運用モデル（既存 + 追加候補）:
- Member Plan
- News
- Blog Post
- Movie
- Gallery
- Event
- Ticket Info
- FAQ
- Site Settings

## 6. API 一覧
- 既存利用:
  - `GET /api/news-items`
  - `GET /api/blog-posts`
  - `GET /api/events`
  - `GET /api/faqs`
  - `GET /api/site-setting`
- 追加候補:
  - `GET /api/movies`
  - `GET /api/galleries`
  - `GET /api/ticket-infos`
  - `GET /api/member-plans`

## 7. 認証・権限制御方針
- 認証: Clerk（未設定環境ではゲストフォールバック）
- ロール: `guest / member / admin`
- 表示制御: `public / member / premium`（premium は将来拡張）
- 保護ページは未ログイン時に入会/ログイン導線へ誘導

## 8. エラー処理方針
- `strapiGet` で content-type 検証、`response.ok` 判定、HTML混入検知、JSONパース失敗専用エラー化。
- timeout + retry + AbortController に対応。
- UI では Error/Empty を分離し、再試行導線を維持。

## 9. SEO 方針
- index 対象: `/`, `/about`, `/join`, 公開ニュース/イベント、FAQ一部、法務ページ
- noindex 対象: `/mypage`, `/member`, 会員限定詳細、`/subscription-policy`（必要に応じて公開切替）

## 10. 計測方針
- `fc_lp_view`
- `fc_join_click`
- `fc_signup_start`
- `fc_signup_complete`
- `fc_login_success`
- `fc_member_content_view`
- `fc_movie_play`
- `fc_event_detail_view`
- `fc_ticket_click`
- `fc_member_store_click`
- `fc_cancel_flow_view`
- `fc_faq_view`

## 11. 環境変数一覧
- `VITE_SITE_TYPE=fanclub`
- `VITE_MAIN_SITE_URL`
- `VITE_STORE_SITE_URL`
- `VITE_FANCLUB_SITE_URL`
- `VITE_STRAPI_API_URL`
- `VITE_STRAPI_API_TOKEN`（必要時）
- `VITE_STRAPI_TIMEOUT_MS`
- `VITE_STRAPI_RETRY_COUNT`
- `VITE_CLERK_PUBLISHABLE_KEY`

## 12. デプロイ手順
1. `VITE_SITE_TYPE=fanclub` を設定
2. `fc.mizzz.jp` をフロント配信先へ向ける
3. Strapi CORS に `https://fc.mizzz.jp` を追加
4. 必要APIトークンを設定
5. build/deploy 後に認証導線と限定公開を確認

## 13. 確認手順
- ルート遷移確認（トップ〜法務）
- 非会員で限定詳細にアクセスし、ロック表示されること
- 会員で限定詳細が閲覧可能であること
- モバイル幅でヘッダー/カード崩れがないこと
- API障害時にエラーUIへフォールバックすること

## 14. 残課題一覧
- premium ロールの実データ運用（Clerk metadata + backend連携）
- Movie/Gallery/Ticket の Strapi 本実装
- 決済状態と契約状態のサーバー同期
- 会員限定ストア連携（SSO or token bridge）
- チケット応募外部連携と監査ログ整備
- 退会・解約の完全な自動化フロー

## 仮定
- 現時点の会員ロールは `member/admin` が中心で、`premium` は将来追加前提。
- Phase 1 は既存コンテンツモデルを活かし、Movie/Gallery/Ticket は最小 UI/導線先行。
