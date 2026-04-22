# Supabase Auth 前提 analytics foundation / event taxonomy / attribution / experiment measurement / observability runbook

## 1. 背景と目的
- main / store / fc を横断して、同一 taxonomy で説明可能な計測基盤を維持する。
- `auth.users` は認証の source of truth、analytics の business state は app 側 summary を source of truth とする。
- raw event / derived metric / attribution result / funnel result / experiment measurement を分離する。

## 2. 現状課題（2026-04-22）
1. イベント命名がページ単位で分散し、同義イベントが別名化しやすい。
2. anonymous / authenticated / session / attribution の境界が payload 依存で曖昧。
3. 露出（exposure）と成果（outcome）の分離が弱く、実験説明可能性が低い。
4. duplicate / replay / delayed の品質状態を明示できず、ops 判断が属人的。
5. dashboard が KPI 中心で、taxonomy 逸脱や schema drift の検知導線が弱い。

## 3. taxonomy の責務分離
### eventType
- `page_view`
- `section_view`
- `cta_click`
- `conversion`
- `state_change`
- `delivery_event`
- `support_event`
- `experiment_event`
- `ops_event`
- `security_event`
- `privacy_event`

### eventCategory
- `navigation` / `commerce` / `membership` / `support` / `notifications` / `privacy` / `security` / `experimentation` / `operations`

### 代表 state
- attributionState: `unattributed` / `last_touch` / `server_confirmed`
- identityMergeState: `not_needed` / `linked` / `pending_review` / `conflict_risk` / `rejected`
- eventQualityState: `normal` / `duplicate_possible` / `delayed` / `incomplete` / `replayed` / `suppressed`

## 4. identity stitching 方針
- `sessionId` と `anonymousId` は frontend で安定生成し event に付与。
- authenticated 判定は Supabase/Auth トークン有無で判定し、app user status は別フィールドで扱う。
- merge は conservative に実施し、`identityMergeState=pending_review` を起点に review 可能にする。

## 5. attribution / funnel
- 初期モデルは explainable な `last_touch` を標準化。
- funnel は単一巨大 funnel に統合せず、join/purchase/support/notification を分離。
- conversion は click と分離し、`conversion_event_logged` を成果イベントとして扱う。

## 6. experiment measurement
- `exposure_event_logged`（露出）
- `experiment_outcome_logged`（成果）
- assignment/exposure/outcome を別イベントとして保存。
- flag ON 状態と実露出を分離し、support/internal で理由追跡可能にする。

## 7. consent-aware tracking
- 必須イベント（security/privacy/ops/delivery）は consent 非依存で収集。
- product/marketing 系は cookie consent を尊重し、`consentAwareTrackingState` を保存。
- privacy center の設定と analytics tracking の許可状態を混同しない。

## 8. access / RLS / permission
- raw event は analyst/operator/admin に限定公開。
- summary 系（analyticsSummary/funnelSummary/attributionSummary/experimentMeasurementSummary/observabilitySummary）は reviewer も閲覧可。
- taxonomy 編集・pipeline 実行・replay 操作は admin/super_admin の backend action に限定。

## 9. dashboard 運用
- summary-first / drilldown-second を原則化。
- 主要 KPI
  - acquisition: sessions/new users
  - conversion: join / checkout / form completion
  - retention: revisit / active membership
  - observability: duplicate/schema drift/api failure
- 監査導線
  - `event_validation_run`
  - `schema_drift_detected`
  - `duplicate_event_detected`

## 10. env / secrets
- frontend: `VITE_ANALYTICS_*` は client 設定のみ。service role は置かない。
- backend: `SUPABASE_SERVICE_ROLE_KEY` と `ANALYTICS_*` runtime env を分離。
- GitHub Secrets は staging/production で分離し、runtime env と CI secret を混同しない。

## 11. QA / validation
1. main/store/fc で `page_view` + `cta_click` が同じ taxonomy 属性で保存される。
2. duplicate event（同じ eventId 再送）が `deduped: true` で no-op になる。
3. BI overview が summary 群（analytics/attribution/funnel/experiment/observability）を返す。
4. consent denied 時に optional tracking が抑制され、必須イベントは継続する。

## 12. よくあるトラブル
- eventName rejected: allow-list 未登録。
- dedupe が効かない: eventId 未送信、または eventId 生成規則が不安定。
- attribution が `unattributed` 偏重: referrer/campaign/sourceSection が未付与。
- summary 欠損: raw event が eventType/eventCategory 未付与。

## 13. 仮定
- internal admin / user360 / flag dashboard / release dashboard は既存導入済み。
- Strapi analytics-event collection は既存 migration 手順で schema 反映される。
- BI 詳細分析（cohort/LTV）は次PRで拡張。
