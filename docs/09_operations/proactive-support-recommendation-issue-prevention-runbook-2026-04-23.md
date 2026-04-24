# proactive support / recommendation scoring / issue prevention runbook (2026-04-23)

## 0. 目的
- 対象: `mizzz.jp` main / `store.mizzz.jp` / `fc.mizzz.jp`
- 目的: 問い合わせ前の self-service を「検索して探す」中心から「文脈に応じた先回り案内」へ拡張する。
- 本改修は **suggestion と human handoff を分離** し、強制クローズや自動解決は行わない。

## 1. 現状確認（改修前の弱点）
1. proactive recommendation の状態管理がなく、表示・クリック・解決・handoff の区別が曖昧。
2. issue signal を support 文脈として集約する型がなく、known issue match と no-result を同じ扱いにしやすい。
3. conversational help と proactive intervention が分離されておらず、運用観点で最適化しづらい。
4. 問い合わせフォームへ渡す prefill に proactive state が含まれず、support thread 側で先回り案内の効果を追跡しにくい。

## 2. 状態責務（混同禁止）
- `recommendationState`: 候補評価/提示/クリック/抑制。
- `issueSignalState`: 既知障害一致、検索失敗傾向、エスカレーション兆候。
- `interventionState`: トリガー後の表示〜完了/handed off。
- `preventionOutcomeState`: 自己解決できたか、部分解決か、問い合わせ移行か。
- `assistantSessionState` / `troubleshootingState` / `handoffState`: 既存 conversational help 側。

> 重要: recommendation 表示 = 解決成功ではない。

## 3. 実装概要
### frontend
- `frontend/src/modules/support/proactiveSupport.ts`
  - proactive support の型定義。
  - recommendation scoring（rule-based）と issue signal 判定。
  - recommendation 生成（article/known issue/assistant/handoff）。
- `frontend/src/modules/support/components/ProactiveSupportPanel.tsx`
  - context-aware proactive recommendation UI。
  - `proactive_intervention_click` 計測。
- `frontend/src/pages/support/SupportCenterPage.tsx`
  - 検索文脈 + sourceSite + lifecycle を入力に評価。
  - `proactive_intervention_evaluated` 計測。
  - Contact handoff URL に proactive state を prefill 連携。
- `frontend/src/pages/ContactPage.tsx`
  - handoff prefill で proactive state を受け取り。
- `frontend/src/modules/contact/components/SupportAssistPanel.tsx`
  - 問い合わせ前パネルに proactive state を表示（サポート側文脈引き継ぎ補助）。

### backend
- `backend/src/api/analytics-event/controllers/analytics-event.ts`
  - `proactive_intervention_evaluated` / `proactive_intervention_click` / `proactive_intervention_feedback` を許可イベントへ追加。

## 4. recommendationState / issueSignalState / interventionState 定義
- `recommendationState`
  - `not_evaluated | eligible | shown | clicked | dismissed | suppressed`
- `issueSignalState`
  - `none | weak_signal | likely_issue | repeated_issue | known_issue_match | escalation_risk`
- `interventionState`
  - `not_triggered | triggered | viewed | engaged | completed | handed_off`
- `preventionOutcomeState`
  - `unknown | self_resolved | partially_resolved | still_need_support | handed_off_to_human`

## 5. publish / review / disable
- publish 対象: public 記事/known issue のみ。
- support-only / internal-only の suggestion は user-facing に出さない。
- recommendation disable は event tracking で `recommendationState=suppressed` を確認して段階導入する。

## 6. no-result / low-confidence / repeated-handoff の確認
1. Support Center で該当キーワードを入力。
2. `proactive_intervention_evaluated` の `issueSignalState` と `recommendationScoreState` を確認。
3. 問い合わせ導線へ進み、Contact prefill の proactive state が保持されることを確認。
4. support case 側で prefill message と state を見て重複説明が減るか確認。

## 7. effectiveness / analytics
- 主要イベント
  - `proactive_intervention_evaluated`
  - `proactive_intervention_click`
  - `assistant_session_start`（既存）
  - `self_service_deflection`（既存）
- 初期KPI
  - intervention click-through（表示→クリック）
  - intervention→handoff 率
  - category/sourceSite/lifecycle 別の still_need_support 率

## 8. 環境変数 / Secrets
### frontend
- `VITE_PROACTIVE_SUPPORT_ENABLED`
- `VITE_PROACTIVE_SUPPORT_MIN_SCORE`
- `VITE_PROACTIVE_INTERVENTION_COOLDOWN_MINUTES`

### backend
- `SUPPORT_PROACTIVE_SCORING_VERSION`
- `SUPPORT_PROACTIVE_KNOWN_ISSUE_WEIGHT`
- `SUPPORT_PROACTIVE_LOW_RESULT_WEIGHT`

### GitHub Secrets / Variables（推奨）
- `ANALYTICS_OPS_TOKEN`
- `ANALYTICS_IP_HASH_SALT`
- `VITE_ANALYTICS_OPS_ENDPOINT`
- `SUPPORT_PROACTIVE_SCORING_VERSION`

## 9. local / staging / production
- local: hardcoded rule-based scoring で E2E を確認。
- staging: known issue と category を増やして過剰表示を確認。
- production: score threshold を高めに設定し段階ロールアウト。

## 10. テスト手順
1. Support Center を開く。
2. 検索キーワード入力で proactive panel が表示される。
3. article / known issue / assistant / handoff の CTA 動作を確認。
4. Contact に遷移し prefill の proactive state が見えることを確認。
5. analytics-events/public で対象イベントが拒否されないことを確認。

## 11. 失敗時の確認
- proactive panel が出ない
  - score threshold、検索文字数、候補件数を確認。
- クリックイベントが保存されない
  - frontend `VITE_ANALYTICS_OPS_ENDPOINT` と backend `ANALYTICS_OPS_TOKEN` を確認。
- 問い合わせ prefill が欠落
  - URL length と query encode 状態を確認。

## 12. よくあるトラブル
- known issue がないのに `known_issue_match` になる
  - candidate type 判定ロジックを確認。
- recommendation が過剰表示される
  - min score を引き上げる。
- handoff を押し付けに感じる
  - CTA の優先順位を assistant / troubleshooting 先行へ調整。

## 13. 仮定
- 既存の conversational help / support thread / case prefill 基盤は稼働中。
- known issue は status API で public summary を取得できる。
- 運用ダッシュボードは analytics event から集計可能。
