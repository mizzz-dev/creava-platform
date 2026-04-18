# 横断検索 / discovery / recommendation 基盤（2026-04-18）

## 概要
- main / store / fc をまたぐ discovery 体験として `/discover` を追加。
- Strapi custom API `GET /api/discovery/search` を追加し、Product / News / Event / FC / FAQ / Guide / Blog / static page を横断検索。
- favorites / history / notifications（localStorage）を検索結果の再ランキングと補助導線に利用。
- analytics イベントに discovery 系イベントを追加。

## 検索対象ルール
- 公開・非公開は `accessStatus` + `memberState` で分離。
- `memberState=guest` では `fc_only` や `isPublic=false` FAQ を除外。
- locale は `ja/en/ko` を想定し、guide/faq の `locale` と突合。
- sourceSite / contentType / category / sort で絞り込み。

## 関連導線ルール
- 検索結果カードに `related` CTA を表示（例: Product→Guide/Support, FAQ→Support）。
- 0件時は `support` / `products` / `join` を代替導線として提示。
- 下部に以下の再発見導線を固定表示:
  - 最近見たコンテンツ
  - お気に入りベース
  - 通知ベース

## CMS運用ルール
- 優先順は既存 `displayPriority` を再利用。
- FAQ / Guide の `tags` / `keywords` / `category` を定期メンテして検索ノイズを抑制。
- FC向け導線を出す場合は `accessStatus` と `archiveVisibleForFC` の整合を必ず確認。

## env / Secrets / Variables
- **新規 env 追加なし**。
- **新規 GitHub Secrets / Variables 追加なし**。
- `ANALYTICS_OPS_TOKEN` 等の既存 analytics 設定を継続利用。

## local / staging / production 差分
- local: `/discover` で API疎通確認（guest/memberState 切替）。
- staging/prod: FC限定が guest で漏れないことを確認。

## DNS
- `/discover` は既存ドメイン配下のパス運用のため、**DNS変更は不要**。

## 確認手順
1. main/store/fc それぞれで `/discover` を開く。
2. `sourceSite` を切り替えて結果が意図どおり変わることを確認。
3. `memberState=guest` で FC限定が出ないことを確認。
4. フィルタ・ソート変更時に analytics (`filter_apply`,`sort_apply`) が送信されることを確認。

## よくあるミス
- `sourceSite=all` のまま運用し、サイト文脈が崩れる。
- FAQ/Guide の category 更新漏れで意図しない検索ヒットが発生する。
- `memberState=member` だけで権限が担保されたと誤解する（実運用では認証状態との整合が必要）。
