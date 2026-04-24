# Strapi content model / relation / media / locale 再整理 runbook（2026-04-24）

- 作成日: 2026-04-24
- 対象: `mizzz.jp` / `store.mizzz.jp` / `fc.mizzz.jp` が参照する Strapi v5
- 目的: 「速く、壊れにくく、編集しやすく、再利用しやすい」CMS 情報設計へ段階移行する
- スコープ: 現行実装の棚卸し・責務整理・互換戦略・移行手順・運用手順

---

## 0. 先に結論（ベスト案）

優先すべき施策は **content model / component / relation / media / locale schema の責務再整理**。  
publish / preview / revalidation が既に整っていても、情報設計が複雑なままでは性能・運用・保守が再び悪化するため。

---

## 1. 現状調査結果（必須調査項目）

### 1-1. Strapi version
- `@strapi/strapi: 5.41.1`

### 1-2. collection type / single type 一覧
- content-type 総数: **43**
- collection type: **41**
- single type: **2**
- draftAndPublish 有効: **20**

### 1-3. components / dynamic zones
- `backend/src/components` が存在せず、**component / dynamic zone は実質未使用**。
- 再利用・責務分離の多くが `json` field で代替されている。

### 1-4. relation / media / locale / slug / SEO 構造
- relation fields: **28**
- media fields: **35**
- json fields: **98**
- localized fields (`pluginOptions.i18n.localized`): **2**
- uid fields: **16**
- SEO は `seoTitle`, `seoDescription`, `ogImage` などが各 model へ分散。

### 1-5. main / store / fc の依存
- frontend は API endpoint ごとに `populate` を個別指定しており、モデルの密結合がある。
- `store` と `campaign` で重複 field が多く、同義概念が複数箇所に分散。

### 1-6. preview / publish / revalidation 依存
- `backend/src/api/cms-sync/controllers/cms-sync.ts` が webhook / preview verify / manual revalidate を担当。
- schema 変更時は `model -> revalidate tag/path` 対応表の影響確認が必須。

---

## 2. 問題点（最初にまとめる 1〜10）

### 2-1. 現在の Strapi content model の問題点
1. `site-setting`, `store-product`, `campaign` が「永続 entity + 表示設定 +運用状態」を混在保持。
2. 1 model あたり field 数が過多（例: `site-setting` 102 attributes）。
3. `json` field が多く、入力バリデーションと型保証が弱い。

### 2-2. component 設計の問題点
1. shared component / page-specific component の分離がなく、再利用単位が曖昧。
2. display section と永続データの分離が弱く、model が肥大化。

### 2-3. relation 設計の問題点
1. `campaign`, `faq`, `guide`, `store-product` に relation が集中。
2. 関連候補の多対多が多く、運用者の選択負荷・populate コストが増えやすい。

### 2-4. media 設計の問題点
1. 同義の hero / image 系 field が散在。
2. locale別メディアの責務が field 名だけでは明確でない。

### 2-5. locale / SEO / slug 設計の問題点
1. localized field が 2件のみで、実運用は独自 `locale` 文字列依存が中心。
2. SEO field が各 type で揺れており、共通 QA しづらい。

### 2-6. frontend 依存上の問題点
1. `populate` 仕様が endpoint 単位で増殖し、schema 変更が直接影響。
2. list と detail の境界が薄く、不要データ取得リスクがある。

### 2-7. editor 運用上の問題点
1. field が多く入力ルールが暗黙。
2. `json` field は自由度が高い反面、誤入力検知が難しい。

### 2-8. すぐやるべき整理
1. 現行 schema 監査を自動化し、問題濃度が高い model を可視化。
2. `json` フィールドの責務分類（表示断片 / 配列設定 / locale差分 / workflow メタ）を先に実施。
3. list/detail 用の API response 境界を先に定義。

### 2-9. 恒久対応の実装順
1. phase 1: 命名・責務・互換方針のドキュメント化
2. phase 2: shared component 導入（非破壊、optional 追加）
3. phase 3: 高負荷 relation の縮約と mapper 導入
4. phase 4: locale / SEO / media の統一仕様へ移行

### 2-10. 作業ブランチ名案
- `refactor/strapi-content-model-and-relations`

---

## 3. 責務分離（entity / component / dynamic zone / relation / media / locale）

### 3-1. 必須で持つ state 概念（設計メモ）
- `strapiEntityState`
- `strapiComponentState`
- `strapiDynamicZoneState`
- `strapiRelationState`
- `strapiMediaState`
- `strapiLocaleState`
- `strapiSeoState`
- `strapiSlugState`
- `strapiPreviewState`
- `strapiPublishState`
- `strapiMigrationState`
- `strapiCompatibilityState`
- `strapiAuditState`
- `strapiSchemaChangedAt`

> これらは現時点では「実体 field を増やす」のではなく、設計レビューと運用監査で追跡する概念として定義する。

### 3-2. 統合/分割方針
- entity: 意味のある永続データ（product, campaign, guide, faq）。
- display component: hero/cta/badge/style など表示責務。
- shared component: seo/media/meta/localization payload。
- page-specific block: 本当に再利用しない section のみ。

---

## 4. relation / dynamic zone / media / locale 改善方針

1. relation は「編集しやすさ」と「query コスト」を同時最適化する。  
2. list API では relation を最小化し、detail API で必要分のみ展開。  
3. media は URL 置き場ではなく alt/caption/credit/focal point を標準化。  
4. locale は `locale` string + localized field の二重管理を段階的に整理。  
5. dynamic zone は便利さ優先で増やさず、運用コストを先に評価。

---

## 5. frontend 互換 / API shape / migration

### 5-1. 互換戦略
- 既存 endpoint / slug / uid は維持。
- 新 schema 追加時は optional field 追加を優先。
- 旧 field 廃止は `compat mapper` 導入後に段階削除。

### 5-2. old -> new 対応表（第一弾）
- `*_seoTitle, *_seoDescription, ogImage` → `seo` shared component（将来）
- `hero*`, `cta*`, `badgeStyle*`, `backgroundVariant` → `display.hero` / `display.cta`（将来）
- `targetSites`, `targetLocales`（json） → typed component（将来）

### 5-3. migration 方針
- まずは **schema 監査 + 手順整備を先行**。
- 実 migration は再実行可能な script を backend/scripts に追加。
- backfill は dry-run と batch size を持たせる。

### 5-4. rollback 方針
- 互換 mapper を維持したまま段階切替。
- destructive 変更は 1 PR 1 type 原則。
- publish webhook/revalidate はモデル単位で回帰確認。

---

## 6. editor UX / naming / validation

1. field 名は editor 用語に寄せる（技術略語を避ける）。
2. `json` field は「入力例・説明・必須キー」を description に明記。
3. slug / locale / seo は入力順を固定し、公開前チェック項目を共通化。
4. relation 選択候補を増やしすぎない（最大候補件数やタグ付け運用を導入）。

---

## 7. monitoring / audit / docs / runbook

### 7-1. 今回追加した監査基盤
- `backend/scripts/strapi-schema-audit.mjs`
  - content-type ごとの attribute / relation / media / json / localized を集計
  - high-risk signal を機械的に出力

### 7-2. 運用ルール
- schema 変更 PR で `node backend/scripts/strapi-schema-audit.mjs` を必須化。
- 監査出力を PR 本文に貼り、増減理由を説明。

---

## 8. Strapi admin / 公開運用への影響

- 今回は **非破壊（コード追加と docs 更新のみ）**。
- 既存 entry の破壊や API 互換変更はなし。
- 次フェーズで component 導入時に editor 導線の再確認が必要。

---

## 9. env / GitHub Secrets / runtime

### 9-1. 追加した env（backend）
- `STRAPI_SCHEMA_VERSION`
- `STRAPI_SCHEMA_COMPAT_MODE`
- `STRAPI_SCHEMA_MIGRATION_DRY_RUN`
- `STRAPI_SCHEMA_MIGRATION_BATCH_SIZE`
- `STRAPI_RELATION_POPULATE_DEPTH_MAX`

### 9-2. GitHub Secrets/Variables の責務
- secrets: webhook secret / preview secret / ops token 等の機密。
- variables: schema version など非機密フラグ。

---

## 10. 動作確認結果

- `node backend/scripts/strapi-schema-audit.mjs` で JSON 出力を確認。
- 監査結果から高優先モデル（site-setting/store-product/campaign/guide/faq）を抽出。

---

## 11. 改善前後の主要指標（今回計測）

- content-type: 43
- relation fields: 28
- media fields: 35
- json fields: 98
- localized fields: 2

> 本PRは「可視化と設計基準の固定」が目的。実数値の改善は次フェーズで実施。

---

## 12. 追加 / 修正ファイル一覧

- `backend/scripts/strapi-schema-audit.mjs`（追加）
- `backend/package.json`（script 追加）
- `backend/.env.example`（schema migration 系 env 追加）
- `docs/10_appendix/environment-variables.md`（新規 env 追記）
- `docs/README.md`（本 runbook のリンク追加）
- `docs/09_operations/strapi-content-model-restructure-runbook-2026-04-24.md`（追加）

---

## 13. 残課題

1. component/dynamic zone の実体導入は未着手（次PR）。
2. frontend mapper の段階導入と詳細互換テストが必要。
3. locale strategy（i18n plugin 活用範囲）の再定義が必要。

---

## 14. PR 本文案（日本語）

```yaml
type: refactor
priority: high
areas:
  - strapi
  - cms
  - content-model
  - localization
  - performance
  - frontend
  - backend
  - runtime
  - docs
labels:
  - refactor
  - strapi
  - cms
  - content-model
  - localization
  - performance
  - frontend
  - backend
  - runtime
  - docs
review_points:
  - Strapi の content model 問題が特定されているか
  - entity / component / relation / media / locale の責務が分離されているか
  - frontend 互換 / migration / preview / publish への影響が整理されているか
  - editor が編集しやすい命名と validation になっているか
  - locale / SEO / media / slug の整合が取れているか
  - env / runtime / docs が整理されているか
risks:
  - schema 変更による API breaking change
  - relation 移行時のデータ不整合
  - locale / slug / preview の副作用
  - migration 手順の不足
not_done:
  - 必要なら次PRで Strapi editor dashboard / publish audit UI / scheduling workflow / media library governance / schema visualizer を追加
```

### 概要
Strapi content model の現状を監査し、entity/component/relation/media/locale の責務再整理を進めるための runbook と監査スクリプトを追加。

### 対応内容
- schema 監査スクリプト追加
- schema migration/compat 用 env の明文化
- docs/runbook へ問題点・実装順・互換方針・移行方針を追加

### 確認手順
1. `node backend/scripts/strapi-schema-audit.mjs`
2. 出力 JSON の `summary/details` を確認
3. 高リスク model の改善優先度を PR で合意

### 未対応事項
- component 実装と data migration 実行
- frontend mapper 本実装

### リスク
- 次フェーズで schema を実際に切る際の breaking change

---

## 15. PRメタデータ一覧 / 設定ラベル
- type: `refactor`
- priority: `high`
- areas: `strapi,cms,content-model,localization,performance,frontend,backend,runtime,docs`
- labels: `refactor,strapi,cms,content-model,localization,performance,frontend,backend,runtime,docs`

---

## 16. 仮定一覧

1. Strapi は引き続き単一 backend（main/store/fc 共有）で運用する。  
2. 既存 frontend は REST + populate 方式を継続する。  
3. 直近PRでは non-breaking を優先し、schema 物理変更は段階実施する。  
4. editor dashboard/workflow UI 強化は次フェーズで実施する。
