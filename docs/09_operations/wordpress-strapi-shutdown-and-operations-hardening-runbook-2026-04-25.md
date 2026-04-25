# WordPress 単独運用移行 / Strapi shutdown execution / decommission runbook（2026-04-25）

- 対象: `mizzz.jp` / `store.mizzz.jp` / `fc.mizzz.jp`
- 目的: **「WordPress で配信できる」状態から「Strapi を停止しても日常運用できる」状態へ移行**する。
- 前提: staged cutover と migration parity の最小基盤は完了済み。

## 0. この runbook で分離して扱う責務
1. shutdown execution
2. residual dependency cleanup
3. editor workflow parity
4. media governance
5. preview / publish / revalidation / cache invalidation
6. monitoring / audit / rollback boundary

> 重要: 「配信成立」と「停止後の運用成立」を同義で扱わない。

---

## 1. 現在 still Strapi-dependent な運用・route・job（2026-04-25時点）

### 1-1. frontend / provider
- `frontend/src/lib/cms/rollout.ts` は `VITE_CMS_PROVIDER !== wordpress` または rollout flag 未有効時に `strapi` fallback を継続する。
- `frontend/src/lib/cms/index.ts` は endpoint ごとに `strapiProvider` / `wordpressProvider` を分岐し、Strapi path がコード上に残る。

### 1-2. CI/CD / workflow / infra
- `.github/workflows/deploy-backend.yml` は `strapi_cloud` deploy target と `pm2 reload strapi` パスを維持。
- `.github/workflows/deploy.yml` / `ci.yml` / `release-safety.yml` に `VITE_STRAPI_API_URL` / `VITE_STRAPI_API_TOKEN` / `STRAPI_DEPLOY_TOKEN` 依存が残る。

### 1-3. docs / runbook
- `docs/09_operations/cms-manual.md` など Strapi 管理画面前提の運用記述が残る。
- publish/preview/revalidation runbook は Strapi webhook 主語で書かれた章が存在する。

---

## 2. 現在 WordPress 単独で成立している部分
- content fetch（blog/news/events/works/store/fanclub/settings）は provider contract 上で WordPress 対応済み。
- WordPress plugin 側に migration route / preview verify / discovery search / stripe webhook route が存在。
- `scripts/migrate-strapi-to-wordpress.ts` で dry-run / verify-only / actual-run / resume-failed-only と diff 監査が可能。

---

## 3. shutdown execution readiness 不足
- residual dependency の棚卸しを継続的に出力する自動監査が不足。
- shutdown 前後の fallback boundary / rollback boundary / observation window が docs 断片化。
- secrets cleanup（Strapi token 無効化、workflow secrets 廃止）と infra cleanup（Strapi deploy path 退役）の実行順序が未統合。

---

## 4. 今回追加した整備

### 4-1. residual dependency 監査スクリプト追加
- `scripts/migration/strapi-decommission-audit.mjs` を追加し、以下 state を JSON report に出力。
  - `strapiShutdownState`
  - `decommissionExecutionState`
  - `residualDependencyState`
  - `cleanupState`
  - `secretCleanupState`
  - `infraCleanupState`
  - `fallbackBoundaryState`
  - `rollbackBoundaryState`
  - `postCutoverState`
  - `decommissionTraceId`
  - `decommissionStartedAt / decommissionCompletedAt / decommissionVerifiedAt`
- report には `requiredPathCheck` と `residualDependencies`（severity/category付き）を含める。

### 4-2. decommission 実行時の必須境界を明文化
- shutdown 実行前に critical/high 残依存ゼロを確認。
- rollback を「Strapi 再起動」ではなく「運用境界の切戻し」単位で定義。
- observation window 中の監視対象（content/search/preview/publish/stripe）を固定。

---

## 5. WordPress editor workflow parity

### 5-1. ロール分離
- editor: draft 作成 + locale 入力 + media 初期設定。
- reviewer: preview parity と publish readiness を検証。
- publisher: publish 実行 + revalidation 結果確認。
- admin: 失敗時の manual recovery / rollback 判断。

### 5-2. daily operation checklist
1. locale（ja/en/ko）ごとに slug / SEO / accessStatus を確認。
2. preview は locale 指定で確認し、publish と混同しない。
3. publish 後は revalidation 監査ログまたは復旧導線まで確認。
4. store/fc の member-only 判定（`fc_only` / `limited` / `archiveVisibleForFC`）を最終確認。

---

## 6. media governance（運用ルール）

### 6-1. 命名規則（推奨）
- `site-contentType-slug-locale-yyyyMMdd-vN`
- 例: `main-news-summer-fes-ja-20260425-v1`

### 6-2. 必須メタ
- alt（locale別）
- caption（必要時）
- credit（外部素材時）
- reuse可否（shared / locale-specific）

### 6-3. ルール
- featured/OG/gallery は同一アセット使い回し可否を明記。
- 同一素材の重複アップロードは避け、既存 asset reuse を優先。
- orphaned asset は月次棚卸しで cleanup backlog 化。

---

## 7. preview / publish / revalidation hardening

### 7-1. preview
- backend verify endpoint を主系とし、frontend secret fallback は段階的に廃止。
- locale mismatch を検知したら publish を止める（preview parity NG）。

### 7-2. publish
- draft/published の責務分離を維持。
- relation 更新時は親/子/一覧導線を再確認対象に含める。

### 7-3. revalidation / cache invalidation
- 失敗時は manual revalidate 導線を利用し、監査ログに trace を残す。
- stale cache / draft leakage / locale 混線の3点を一次切り分けテンプレに含める。

---

## 8. shutdown execution / cleanup 実行手順

### 8-1. 事前監査
```bash
node scripts/migration/strapi-decommission-audit.mjs
```

### 8-2. 移行整合確認
```bash
node --loader ts-node/esm scripts/migrate-strapi-to-wordpress.ts --verify-only
```

### 8-3. 実行
1. WordPress 側 publish/preview/revalidate の直近24h成功率を確認。
2. Strapi 向け webhook / cron / deploy workflow を停止。
3. Strapi runtime secret を revoke（GitHub Secrets + runtime 環境）。
4. decommission report を保存し traceId を運用チャンネルへ共有。

### 8-4. 実行後観測（observation window）
- 最低 72h は monitoring 強化。
- content/search/preview/publish/stripe の各 error rate と trace を毎日レビュー。

---

## 9. rollback boundary

### 9-1. trigger
- content欠落/誤公開/preview failure/revalidation failure/stripe failure が SLA を超過。

### 9-2. boundary
- L1: manual revalidate / cache recovery
- L2: route-level feature flag rollback
- L3: site-level feature flag rollback
- L4: full rollback（緊急時のみ。復旧計画と承認必須）

### 9-3. 原則
- rollback は「何を戻すか」を明示し、Strapi 復活を前提化しない。

---

## 10. monitoring / ownership / escalation
- Owner: CMS運用責任者（main/store/fc 横断）
- Escalation: on-call backend → frontend lead → ops lead
- 日次確認:
  - publish fail count
  - preview verify fail count
  - revalidation fail count
  - discovery/search no-result ratio
  - stripe webhook fail count

---

## 11. secrets / env cleanup ポリシー
- frontend から Strapi URL/token を段階的に除去し、WordPress API URL を主系化。
- CI secrets は `STRAPI_*` を decommission 完了後に revoke。
- backend runtime で不要な Strapi secret は除去し、履歴は runbook に記録。

---

## 12. 残課題（次PR候補）
- editor dashboard parity（WordPress管理画面の可視化）
- search relevance tuning
- media dedup 自動化
- publish audit UI
- full infrastructure cleanup（workflow/hosting 設計の最終整理）

---

## 13. 仮定
1. WordPress preview/search/content API は production traffic で既に安定運用できる。
2. frontend は route-level rollback flag を即時反映できる。
3. Strapi 停止後も audit log / monitoring は別系統で継続取得できる。
