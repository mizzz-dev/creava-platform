# Alert / Anomaly / Forecast / Report 運用基盤整備（2026-04-19）

## 0. スキル利用
- 使用 skill: `repo-context` → `docs-and-runbook` → `issue-pr-writer-ja`
- 理由: main/store/fc/backend/frontend/docs/env/CI を跨いだ現状調査、責務分離設計、運用文書更新、PRメタデータ整備が必要だったため。

## 1. 現在の予測 / 異常検知 / レポート運用課題
1. KPI overview/cohort は存在するが、**alertRule** / **anomalyEvent** / **forecastSeries** / **reportRun** が分離されていない。
2. 重要指標（売上急減、checkout完了率低下、refund率急増、support急増）に対する**運用可能な閾値定義**が不足。
3. 週次/月次レポートは数値確認できるが、audience別（経営/運営/support）要約が不足し手作業が発生。
4. raw event と説明文が同一責務で扱われやすく、判断根拠の追跡が難しい。
5. mute / acknowledge の概念がなく、ノイズ制御の設計が不足。

## 2. alert / anomaly / forecast ドメイン設計整理
今回の API/画面では次の概念を分離して返す:

- `metricDefinition`: 指標定義、ownerTeam、sourceOfTruth、unit
- `metricSeries`: 日次の時系列実績（raw集計値）
- `alertRules`: 閾値/比較窓/owner を持つルール定義
- `anomalyEvents`: 変化判定結果（severity, explanation, actionHint, acknowledge状態）
- `forecastSeries`: moving average ベースの短期予測
- `summaryInsights`: audience向けの要約文
- `reportTemplate` / `reportRun` / `reportSections`: レポートテンプレートと実行結果
- `refreshState` / `sourceOfTruth` / `confidenceState`: 根拠と信頼状態
- `muteState` / `acknowledgementState` / `notificationChannel`: 運用制御の足場

### 責務分離ポリシー
- KPI本体 (`metricSeries`) と通知ルール (`alertRules`) を分離。
- anomaly判定 (`anomalyEvents`) と forecast (`forecastSeries`) を分離。
- raw数値と説明文 (`summaryInsights` / `reportSections`) を分離。
- store/fc/main 横断で同一枠組みを持ちつつ、`sourceSite` 差分を保持。

## 3. 重要KPIアラート基盤追加内容
追加 endpoint:
- `GET /api/internal/bi/alerts`

監視対象（初期セット）:
- growth/product: sessions, main→store率, main→fc率, checkout開始率, 購入完了率, form完了率, notification click率
- finance: store net revenue, fc subscription revenue, refund率
- support/ops: support件数, webhook failure件数

運用機能:
- `comparisonWindow=last_7d_vs_prev_7d`
- `alertThreshold`（drop/spike）
- low volume 抑制（`BI_ALERT_MIN_VOLUME`）
- `ownerTeam` / `actionHint` / `acknowledgementState` / `muteState`

## 4. 異常検知ロジック追加内容
- 前週比（7日 vs 直前7日）を基本比較として実装。
- relative drop / relative spike で判定。
- `anomalySeverity`: low / medium / high（変化率で段階化）。
- low volume 指標は false positive 抑制のため非通知。
- drill-down しやすいように `actionHint` を metric別に付与。

## 5. 予測 / trend / forecast 土台追加内容
- 7日移動平均ベースの baseline を生成。
- `store_net_revenue` と `support_cases` の簡易 forecast を `BI_FORECAST_HORIZON_DAYS` 日で生成。
- forecast は確定値ではなく判断補助として `confidenceState=medium` を明示。
- forecast と actual 比較余地を `baselineSeries` / `forecastSeries` 構造で分離。

## 6. 経営レポート / 運営レポート自動化内容
追加 endpoint:
- `GET /api/internal/bi/report?audience=executive|operations|support|crm&period=weekly|monthly`

内容:
- `reportTemplate`: audience/period/section/sourceOfTruth を明示
- `reportRun`: 期間・KPI snapshot・section別説明文・actionHint を返却
- `summaryInsight`: 経営/運営向けの先頭要約
- export 導線 (`/api/internal/bi/export.csv`) と dashboard 導線 (`/internal/admin`) を同梱

## 7. internal admin / dashboard 表示整理内容
- Internal Admin に以下を追加:
  - Alert/Anomaly 更新ボタン
  - 経営レポート生成ボタン
  - Supportレポート生成ボタン
- anomaly件数、forecast件数、businessHealthSnapshot を表示。
- alertRules/anomaly/reportRun JSON を確認できる運用面を提供。

## 8. CRM / support / finance / content 運用接続整理内容
- CRM: notification click低下をレポート/alertで確認し、配信改善へ接続。
- Support: support急増 + カテゴリ変化を FAQ/Guide/Form 改善導線へ接続。
- Finance: net急減/refund率増加を checkout/order/refund 調査導線へ接続。
- Operations: webhook failure を障害一次切り分けに接続。

## 9. docs / env / GitHub Secrets / CI 整理内容
### `.env.example` 追加
- `BI_ALERT_MIN_VOLUME`
- `BI_ALERT_DROP_RATIO`
- `BI_ALERT_SPIKE_RATIO`
- `BI_FORECAST_HORIZON_DAYS`

### GitHub Secrets / Variables（追加推奨）
- runtime env と同名で backend 環境へ投入。
- staging / production は値を分離。

### CI
- 既存 workflow を変更せず、runtime env と docs を先行整備。

### DNS
- **DNS変更不要**（既存 domain / endpoint 内で完結）。

## 10. 確認手順（runbook抜粋）
1. internal admin で BI overview/cohort を更新。
2. Alert/Anomaly 更新で `anomalyEvents` を確認。
3. 経営レポート/Supportレポートを生成し `reportRun` を確認。
4. CSV export で整合確認。
5. 変化検知時に ownerTeam が actionHint に従って一次切り分け。

## 11. よくあるトラブルと対処
- alertが多すぎる: `BI_ALERT_MIN_VOLUME` を上げる、`DROP/SPIKE_RATIO` を見直す。
- alertが出ない: 対象期間内データ量と threshold 設定を確認。
- anomaly根拠が不明: `baselineSeries` と `metricSeries` の比較値を確認。
- forecast と actual が乖離: 季節性要因を考慮し horizon/window を再設定。
- report と dashboard がズレる: 対象期間(from/to)と sourceOfTruth の一致を確認。
- store/fc指標が混ざる: sourceSite/revenueType フィルタを確認。

## 12. 今後の拡張候補（not_done）
- advanced forecasting（季節性・休日補正）
- staffing forecast / inventory forecast
- executive automation（定期送信・承認フロー）
- alert acknowledgment 永続化（現状は設計・返却構造まで）

## 13. 仮定
- order / revenue / subscription / inquiry / delivery / webhook の記録が継続投入される前提。
- internal admin 利用者に内部権限（`internal.user.read`）が付与済み前提。
- 本PRでは追加SaaS導入なし、Strapi既存データとルールベース検知を優先する前提。
