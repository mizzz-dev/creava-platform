# Clerk から Logto（無料プラン）への移行整理

最終更新: 2026-04-15

## 1. 目的と前提

- 現在の認証基盤は Clerk に強く依存している。
- 目標は **Logto 無料プラン前提**で、既存の FC 制御・決済導線を壊さず段階移行すること。
- このドキュメントは、実装着手前の棚卸し（現状 / 影響 / 必要作業 / 判断材料）を目的とする。

## 2. 現状の Clerk 依存ポイント（リポジトリ実態）

### frontend

- `main.tsx` で `VITE_CLERK_PUBLISHABLE_KEY` がある場合のみ `ClerkProvider` を有効化。
- `useCurrentUser` は Clerk 有効時に `useUser()` から `AppUser` を生成し、未設定時は guest 固定。
- 認証UI（ログイン/ログアウト、SNS連携表示、FCログイン導線）は `@clerk/clerk-react` の `useClerk/useAuth/useUser` 前提。
- FC 決済・ポータル遷移は `getToken()` 由来の Bearer トークンを backend に送信。

### backend

- `verifyClerkToken()` が Bearer JWT をデコードし、`sub` を userId として利用（厳密署名検証なし）。
- payment controller は `requireAuthenticatedClerkUser()` を通して checkout/portal を認証保護。
- Webhook 由来の永続データは `clerkUserId` を主キー相当として記録。

### CMS / schema

- `payment-record` と `subscription-record` の両方で `clerkUserId` 属性が保存される。

### docs / env

- 環境変数・運用手順・デプロイドキュメント全体が `VITE_CLERK_PUBLISHABLE_KEY` 前提で記載。

## 3. Logto 無料プラン前提で最初に確認すべき制約

2026-04-15 時点で、公式 pricing では無料枠として以下が示されている（要再確認）。

- 月間アクティブユーザー: 最大 50,000
- トークン: 50K
- アプリ数: 3
- M2M app: 1
- RBAC / Organizations / MFA / Enterprise SSO は Pro 領域

参考:
- https://logto.io/ja/pricing
- https://docs.logto.io/logto-cloud/custom-domain

> 注意: 既存実装の「role/memberPlan/contractStatus」を IdP 側メタデータで管理したい場合、無料プランで必要十分かを先に検証する。

## 4. 移行に必要なこと（全体）

## 4.1 認証アーキテクチャ再定義（設計）

1. **IDトークン / アクセストークンの責務分離**
   - frontend→backend は何を bearer で送るか（aud/iss/sub）を明確化。
2. **会員状態の真実源（Source of Truth）整理**
   - 認証プロバイダ属性を信じるか、Strapi 側 DB を authoritative にするか決定。
3. **無料プラン制約に沿った機能境界設定**
   - 将来必要な RBAC/MFA をどう扱うか（アプリ側実装か、将来 Pro 移行か）を決める。

## 4.2 frontend 実装移行

1. 依存差し替え
   - `@clerk/clerk-react` 依存を除去。
   - Logto SDK（React）に置換。
2. Provider 差し替え
   - `main.tsx` の `ClerkProvider` 条件分岐を `LogtoProvider` ベースに再構成。
3. hooks 差し替え
   - `useCurrentUser` の入力を Logto claims へ変更。
   - `toAppUser` 相当の正規化関数を `lib/auth/logto.ts` として実装。
4. UI 差し替え
   - `openSignIn/openSignUp/signOut` 依存箇所を Logto の `signIn/signOut` フローに置換。
   - `SocialAuthProviderStatus` の Clerk 固有連携API（link/unlink）を機能要件に合わせ再設計。
5. 環境変数更新
   - `VITE_CLERK_*` を `VITE_LOGTO_*` に置換し、未設定時フォールバック（guest）を維持。

## 4.3 backend 実装移行

1. トークン検証基盤
   - `verifyClerkToken` を `verifyLogtoToken` に置換。
   - **JWKS を使った署名検証 / iss / aud / exp / nbf 検証**を必須化。
2. payment controller 修正
   - `AuthenticatedClerkUser` 型とエラーメッセージを汎用化（例: `AuthenticatedUser`）。
3. metadata / user ID 命名の中立化
   - `clerkUserId` を `authUserId`（または `identityUserId`）へ変更。
   - Stripe metadata の `userId` 付与規約を維持しつつ、生成元を Logto に変更。

## 4.4 Strapi schema / データ移行

1. schema 変更
   - `payment-record.clerkUserId` / `subscription-record.clerkUserId` を改名または互換追加。
2. 既存データ移行
   - バックフィル用スクリプトで `clerkUserId -> authUserId` をコピー。
3. 互換期間
   - 一定期間は両カラム参照で後方互換を維持し、リリース後に `clerkUserId` 廃止。

## 4.5 インフラ / 運用

1. Logto テナント作成・アプリ設定
   - callback URL / post logout redirect / CORS / custom domain を main/store/fc 各ドメインで整合。
2. Secret / env 差し替え
   - frontend と backend の環境変数を全環境（dev/stg/prod）で更新。
3. 監視と障害対応
   - ログイン失敗率、token 検証失敗率、FC 決済401率の監視追加。
4. ランブック更新
   - 既存 Clerk 記載 docs を Logto ベースに全面更新。

## 4.6 テスト観点

- ログイン/ログアウト、セッション復元
- FC 限定コンテンツのアクセス制御（guest/member/premium）
- fanclub checkout / customer portal の bearer 認証
- 多言語 UI 文言（ja/en/ko）
- Clerk 未設定フォールバック相当の「認証無効時の安全側挙動」

## 5. メリット / デメリット

## 5.1 メリット

- 無料枠が比較的大きく、初期コスト抑制しやすい。
- OIDC/OAuth 標準で backend 検証実装を中立化しやすい。
- 現状 backend が「JWTデコード中心」であるため、JWKS 検証を入れる移行はセキュリティ改善にもなる。
- Clerk 固有 API 依存（link/unlink など）を整理することで、将来の IdP 再移行コストを下げられる。

## 5.2 デメリット / リスク

- 既存コード・ドキュメント全域で Clerk 依存が広く、置換コストが大きい。
- `clerkUserId` がデータモデルに浸透しており、DB 移行を誤ると決済/会員導線に影響。
- 無料プランでは RBAC/MFA/Organizations に制限があり、将来要件次第で再設計または有料化が必要。
- ソーシャル連携 UI/UX は Clerk と完全互換にならない可能性がある。

## 6. 推奨移行戦略（段階）

### Phase 0: 調査・設計（先行）

- Logto 無料プラン制約と必要機能の適合確認。
- claim 設計（`sub`, email, custom claims）と AppUser マッピング定義。

### Phase 1: backend 互換レイヤー

- `verifyLogtoToken` 実装。
- `authUserId` 追加 + 並行書き込み（旧 `clerkUserId` 維持）。

### Phase 2: frontend 切替

- Provider/hooks/UI を Logto 化。
- feature flag で clerk/logto 切替可能にして段階リリース。

### Phase 3: 本番切替

- Logto 本番設定 + env 切替。
- 監視しながら段階的トラフィック移行。

### Phase 4: 後片付け

- Clerk 依存コード・env・docs 削除。
- `clerkUserId` 完全廃止。

## 7. Claude Code に渡す実行プロンプト（そのまま利用可）

以下を Claude Code に渡してください。

```text
あなたは /workspace/creava-platform の実装担当です。
目的は、認証基盤を Clerk から Logto（無料プラン前提）へ段階移行するための「実装可能な差分」を作ることです。

# 必須要件
- 既存導線（Home / Contact / Store / Fanclub）を壊さない。
- 最小差分で進め、互換期間を設ける。
- FC制御と決済導線（fanclub checkout / customer portal）を維持する。
- i18n は ja/en/ko の欠落を出さない。
- 変更理由と影響範囲を docs に明記する。

# 今回の作業スコープ
1) 現状調査
- Clerk 依存箇所を frontend/backend/docs で列挙。
- `clerkUserId` を参照/保存している箇所を列挙。

2) backend 実装
- backend/src/lib/auth/clerk.ts を置換または並存で logto 用検証モジュールを追加。
- JWKS による署名検証を実装（iss/aud/exp/nbf の検証を含む）。
- payment controller の `AuthenticatedClerkUser` 依存を中立型へ変更。
- `clerkUserId` を `authUserId` へ段階移行できるよう、互換読み書きを実装。

3) schema と移行
- payment-record / subscription-record に `authUserId` を追加。
- 既存 `clerkUserId` からのバックフィル手順（スクリプト or 手順書）を追加。

4) frontend 実装
- main.tsx の Provider を Logto 対応へ変更（未設定時 guest フォールバック維持）。
- useCurrentUser と user正規化関数を Logto claim ベースへ変更。
- AuthButton / FanclubGuard / ContentAccessGuard / FanclubSitePages / SocialAuthProviderStatus の認証呼び出しを Logto API に置換。
- `VITE_CLERK_*` を `VITE_LOGTO_*` へ移行し、.env.example と型定義を更新。

5) docs
- 開発手順・デプロイ手順・運用手順の Clerk 記述を Logto ベースへ更新。
- 無料プラン制約（50K MAU / トークン / アプリ数制限）を明記し、将来の有料化トリガーを記載。

6) テスト
- 少なくとも以下を実施:
  - npm run lint --prefix frontend
  - npm run test:frontend
  - npm run build:frontend
  - npm run build:backend
- 失敗時は原因・影響・回避策を整理。

# 出力形式
- まず「変更計画」を箇条書きで提示。
- 次に実装差分を適用。
- 最後に以下を必ず提示:
  - 変更ファイル一覧
  - 互換性への影響
  - 未対応事項
  - 実行コマンドと結果

# 注意
- 破壊的変更を避けるため、旧 `clerkUserId` を即時削除しないこと。
- 命名に `codex` を含めないこと。
```

## 8. 補足: Clerk 継続との比較観点（意思決定用）

- 「無料枠」だけでなく、現在使っている具体機能（SNS連携数、将来のMFA/RBAC、マルチドメイン運用）で比較する。
- すでに Clerk 実装が広い場合、短期は維持して backend 検証強化のみ先行する選択肢も現実的。
- 先に「データモデル中立化（authUserId化）」を完了しておくと、どの IdP でも運用しやすくなる。
