# Supabase Auth 前提 セキュリティ設定ハブ / MFA / linked accounts / session / recovery runbook（2026-04-22）

## 1. 方針
- main / store / fc は **同一 Supabase Auth project** を共有する。
- `auth.users` は認証ID管理に限定し、app 側 `app-user.securitySummary` でセキュリティ状態の表示用サマリーを保持する。
- 会員状態（membership/entitlement/subscription/billing/lifecycle）と security state（mfa/session/recovery/sensitive action）を分離する。

## 2. 責務分離
- Supabase Auth: 本人認証、セッション発行、パスワード再設定、メール変更、MFA 実行。
- app user domain (`api::app-user`): 画面表示用の security summary、support/admin 追跡用の normalized state。
- backend (`/api/user-sync/security/sensitive-action`): security-sensitive 操作前の再認証 freshness 判定。

## 3. security state モデル
`/api/user-sync/me` は以下を返す。
- `securityHub`
- `securitySummary.securityLevelState`（basic/enhanced/strong/restricted）
- `securitySummary.mfaState`（disabled/available/enabled/required）
- `securitySummary.reauthRequiredState`（fresh/required/unknown）
- `securitySummary.linkedIdentityState`（none/single_provider/multi_provider/conflict_risk）
- `securitySummary.sessionState`（normal/review_recommended/revoke_recommended）
- `securitySummary.recoveryState`
- `securitySummary.sensitiveActionState`
- `securitySummary.passwordChangeCapability`
- `securitySummary.emailChangeCapability`
- `securitySummary.providerLinkCapability`
- `securitySummary.sessionRevokeCapability`
- `securitySummary.securityNoticeState`
- `securitySummary.securityUpdatedAt`
- `securitySummary.lastSensitiveActionAt`
- `securitySummary.lastPasswordResetAt`
- `securitySummary.lastEmailChangeAt`
- `securitySummary.lastMfaUpdateAt`

## 4. self-service 可能項目
- パスワード再設定メール送信（Supabase recover API）
- メール変更（再認証 freshness チェック後）
- セッション破棄（この端末以外 / 全端末）
- linked provider の確認（表示）

## 5. sensitive flow 方針
- 対象: `email_change`, `password_change`, `provider_link_change`, `session_revoke`, `account_recovery`。
- backend で `SENSITIVE_REAUTH_MAX_AGE_SEC` を超えたトークンを `412 Precondition Failed` で拒否する。
- frontend は `reauth_required` を受けたら再ログインを案内する。

## 6. RLS / access 方針
- frontend は anon key のみを利用し、service role key を渡さない。
- privileged 操作（internal/support）は `requireInternalPermission` を継続利用する。
- self-service 更新は backend API で検証し、UI 制御だけに依存しない。

## 7. support / internal admin での確認
- `GET /api/internal/users/:authUserId/summary` の `userSummary.security` で user-facing security summary を追跡する。
- support は `authUserId` / `supabaseUserId` / `logtoUserId` の互換検索で対象ユーザーを特定する。

## 8. 計測イベント
- `security_hub_view`
- `security_summary_view`
- `password_reset_start`
- `email_change_start`
- `session_revoke_complete`
- `sensitive_action_reauth_start`

イベントには `sourceSite`, `membershipStatus`, `lifecycleStage` を含める。

## 9. GitHub Secrets / runtime env
- frontend runtime:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_SUPABASE_PASSWORD_RESET_REDIRECT_URL`
  - `VITE_SUPABASE_EMAIL_CHANGE_REDIRECT_URL`
  - `VITE_SUPABASE_REAUTH_REDIRECT_URL`
- backend runtime/secret:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_JWT_ISSUER`
  - `SUPABASE_JWKS_URI`
  - `SUPABASE_JWT_AUDIENCE`
  - `SENSITIVE_REAUTH_MAX_AGE_SEC`

## 10. local / staging / production 確認手順
1. `/member` を開いて security summary が表示されること。
2. パスワード再設定送信でメール送信完了メッセージを確認。
3. メール変更申請で sensitive action check が呼ばれること。
4. セッション破棄（others/global）実行後に結果メッセージを確認。
5. internal summary で `userSummary.security` を確認。

## 11. よくあるトラブル
- `reauth_required`: 長時間ログイン状態。再ログインしてから再実行する。
- `content-type 不正`: Strapi reverse proxy で HTML 応答混入。API URL / CORS を確認。
- `logout scope` 失敗: Supabase 側 scope サポートと project 設定を確認。

## 12. 仮定
1. Supabase project で OAuth provider は既に有効化済み。
2. `auth_time` または `iat` claim を reauth freshness 判定に利用可能。
3. セッション破棄 API の `scope=others|global` が環境で利用可能。
4. advanced MFA/passkey/device trust は次PRで追加する。
