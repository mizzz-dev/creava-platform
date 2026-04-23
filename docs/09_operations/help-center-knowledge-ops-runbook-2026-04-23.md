# public help center / FAQ search / self-service deflection / knowledge operations runbook（2026-04-23）

## 1. 現状確認サマリ（課題）
1. FAQ/Guide は存在するが、検索結果状態（no-result / low-confidence）と問い合わせ流入の接続が弱い。
2. 記事表示・検索失敗・自己解決可否の状態が同一指標で整理されておらず、article effectiveness を判断しづらい。
3. support case 側の knowledgeGapState はあるが、public help center 側の検索/記事行動との接続が薄い。
4. known issue は status/incident 系に分散し、help center ハブから「自己解決」導線として追いにくい。

## 2. 状態責務（混同防止）
- `articleState`: `draft | review_pending | published | outdated | archived`
- `articleVisibilityState`: `public | members_only | support_only | internal_only`
- `searchResultState`: `results_found | low_confidence | no_results | ambiguous`
- `deflectionState`: `not_attempted | article_viewed | article_helpful | self_resolved | still_need_support`
- `knownIssueState`: `none | suspected | confirmed | published | resolved | archived`
- `knowledgeGapState`: `none | suspected | confirmed | article_needed | article_update_needed`

> `articleState` と `articleEffectivenessState` は別。公開中の記事でも effectiveness は低い可能性がある。

## 3. 実装方針（今回）
- help center の検索状態を `searchResultState` として明示。
- 検索イベントを `help_search_query` / `help_search_no_result` で記録。
- guide detail の表示/feedback を `help_article_view` / `help_article_feedback` で記録。
- 問い合わせ遷移時の deflection を `self_service_deflection` で記録。
- suggestion クリック時に article view + deflection の連続イベントを送信。

## 4. 計測イベント（public）
- `help_hub_view`: support center の閲覧。
- `help_search_query`: query 長・resultCount・category を保存。
- `help_search_no_result`: no-result を個別保存。
- `help_article_view`: FAQ/Guide/Known issue の閲覧。
- `help_article_feedback`: helpful/not_helpful。
- `self_service_deflection`: article_viewed / article_helpful / still_need_support。

## 5. support / internal admin / operations 連携
- support queue 側は `knowledgeGapState` を継続使用。
- help center 側イベントは analytics 基盤で集約し、次PRで dashboard の「search failure」「article effectiveness」「deflection」カードへ接続。
- known issue は status communication の `knowledgeSummary` を起点に運用し、記事化は review/publish フローで分離。

## 6. セキュリティ境界
- public は `faq.isPublic !== false` と公開Guideのみを表示。
- `internal note` / `support_only` / `internal_only` は user-facing UI に出さない。
- dangerous auto publish は行わず、suggestion は運用承認前提。

## 7. 確認手順
1. `/support` で検索語を2文字以上入力し、検索状態表示が更新されること。
2. 結果0件の語で `help_search_no_result` が送信されること。
3. `/support/guides/:slug` で閲覧時に `help_article_view` が送信されること。
4. Guide詳細の helpful/not_helpful 押下で `help_article_feedback` が送信されること。
5. 「解決しないので問い合わせる」で `self_service_deflection=still_need_support` が送信されること。

## 8. env / secrets
- frontend:
  - `VITE_HELP_SEARCH_MIN_QUERY_LENGTH`
  - `VITE_HELP_SEARCH_DEBOUNCE_MS`
- backend:
  - `INQUIRY_KNOWLEDGE_NO_RESULT_MIN_DAILY`
  - `INQUIRY_KNOWLEDGE_EFFECTIVENESS_LOOKBACK_DAYS`

## 9. 未対応（次PR候補）
- semantic search / ranking 改善。
- no-result query の管理画面 UI。
- article effectiveness summary の専用 API（category/sourceSite/userState 別）。
- known issue 専用 content-type と article linkage の強化。

## 10. 仮定
1. support forecasting/staffing 基盤は前PRで稼働済み。
2. operations dashboard は analytics-event 集約を取り込める。
3. guide/faq の publish 運用は Strapi editorial workflow を継続する。
