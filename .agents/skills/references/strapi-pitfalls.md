# strapi-pitfalls

## よくある落とし穴
1. endpoint名不一致
- schemaの `pluralName` と frontend `API_ENDPOINTS` がズレる

2. populate不足
- 画像やrelationが null でUI崩れ

3. Draft/Publish誤認
- 管理画面上は存在するが API で返らない

4. `status` の意味衝突
- Strapiシステム `status`（draft/published）と業務公開 `accessStatus` を混同

5. CORS未許可
- site追加時に `FRONTEND_URL`/middleware origin更新漏れ

6. schema変更時の型未追従
- frontend types / mapping / UI が更新されず実行時不整合

## 変更前後の最低確認
- [ ] content-type schema diff
- [ ] route/controller/service 影響
- [ ] frontend endpoint/type/populate
- [ ] seedデータ/運用手順
