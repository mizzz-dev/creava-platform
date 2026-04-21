# 会員ランク / 継続バッジ / ミッション / 実績 / 特典段階化 基盤整備（2026-04-20）

## 1. 現在の会員継続価値体験の課題
- `membershipStatus` / `entitlementState` / `subscriptionState` / `billingState` は存在するが、継続・参加・再訪を積み上げる表示層（rank/mission/achievement/perk）が薄い。
- main / store / fc で「会員である価値」の提示はある一方、`次に何をすると価値が増えるか` が共通モデルで表示されていない。
- mypage は account/billing 中心で progress hub 的な自己把握が弱く、notification / CRM / support / internal admin からも追跡しづらい。

## 2. rank / badge / mission / achievement の責務整理
- `membershipStatus`: 会員区分そのもの（会員かどうか）。
- `entitlementState`: いま使える権利。
- `memberRankState` / `rankTier`: 継続・参加の段階。
- `streakState`: 継続の安定性。
- `missionState` / `missionProgress`: 次に取る自然な行動導線。
- `achievementState`: 達成履歴のハイライト。
- `perkState` / `perkUnlockState` / `perkEligibility`: 実利特典の段階。
- `benefitVisibilityState`: いま表示すべき粒度（teaser / visible / emphasized）。

## 3. 会員ランク / 継続バッジ基盤整理内容
- frontend に `resolveMemberProgression` を追加し、`memberRankState / rankTier / streakState / continuityBadge / nextUnlockHint` を導出。
- backend `app-user` に rank/progression 系属性を追加し、`/api/user-sync/me` と internal summary で同一状態を参照可能化。
- grace/expired の時は rank と perk を分離して扱い、`会員状態` と `継続価値状態` を混同しないルールに統一。

## 4. ミッション / 実績 / 参加価値導線整理内容
- `missionState / missionProgress / achievementState` を導入し、FC更新確認・store回遊・通知設定の3ミッションを最小セットで定義。
- progress hub で「今の状態」「次解放」「進捗%」を表示。
- event 計測を `mission_list_view`, `member_rank_progress_view`, `next_unlock_hint_view` で追加。

## 5. main / store / fc の段階的会員価値体験強化内容
- Home / Store Home / Fanclub Home に progress hub を追加。
- 既存の lifecycle banner と member value panel の下層に配置し、認証共通基盤を維持したまま段階体験を上乗せ。
- 非会員は teaser、中間状態（grace）は recovery、会員は unlock 中心の表示に揃えた。

## 6. mypage / member progress / perk hub 整理内容
- mypage に progress hub を追加し、member summary から rank/mission/perk を同一画面で確認可能化。
- technical state 名の露出を減らし、`nextUnlockHint` を中心に次行動を案内。

## 7. notification / CRM / support / internal admin 接続整理内容
- support page に progress hub を表示し、問い合わせ前の自己解決導線を強化。
- internal lookup / me summary に `memberRankState / missionState / perkState / achievementState` を返却。
- CRM/notification のセグメント追加余地として `progressionSummary` を API 返却に追加。

## 8. loyalty / campaign / content value 接続整理内容
- `loyaltyState` と `memberRankState` を同居させ、campaign/seasonal perk へ繋げる下地を追加。
- `nextUnlockHint` で seasonal perk / personalized offer への拡張余地を明示。

## 9. 計測追加内容
- `progress_hub_view`
- `member_rank_view`
- `member_rank_progress_view`
- `mission_list_view`
- `next_unlock_hint_view`
- イベントには `sourceSite / lifecycleStage / membershipStatus / entitlementState / memberRankState / missionState / perkState` を付与。

## 10. env / GitHub Secrets / runtime / docs 整理内容
- `frontend/.env.example` に rank/mission/progress/perk 系フラグを追加。
- `backend/.env.example` に rank model / mission sync / perk message 制御を追加。
- `docs/10_appendix/environment-variables.md` に Variables/Secrets の追加行を反映。

## 11. 動作確認結果
- 型・lint・build の通過を確認（詳細は PR の Testing セクション）。

## 12. 追加 / 修正ファイル一覧
- `frontend/src/lib/auth/memberProgression.ts`
- `frontend/src/components/common/MemberProgressHub.tsx`
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/pages/storefront/StorefrontHomePage.tsx`
- `frontend/src/pages/FanclubPage.tsx`
- `frontend/src/pages/MemberPage.tsx`
- `frontend/src/pages/support/SupportCenterPage.tsx`
- `backend/src/api/app-user/content-types/app-user/schema.json`
- `backend/src/api/app-user/controllers/app-user.ts`
- `frontend/.env.example`
- `backend/.env.example`
- `docs/10_appendix/environment-variables.md`

## 13. 残課題
- mission progress の実データ連携（favorites/history/event閲覧）
- achievement 履歴の永続化モデル（history テーブル）
- personalized perk の重複配信抑止ロジック（notification / CRM）
- seasonal campaign 別の rank 条件テンプレート化

## 14. 仮定一覧
1. Logto は単一認証基盤として運用済みで、member state は app 側 business state として扱える。
2. 今回は rule-based rank/mission で開始し、厳密な行動ログ集計は次PRで強化する。
3. 金銭的ポイント制や法的に複雑な特典付与は本フェーズ対象外。
