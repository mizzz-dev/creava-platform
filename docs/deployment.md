# WordPress 移行時のデプロイ手順（草案）

1. WordPress 本体をデプロイ
2. `creava-platform-core` プラグインを配置/有効化
3. 環境変数（Stripe/CORS）を設定
4. `VITE_CMS_PROVIDER=wordpress` を frontend に反映
5. dry-run migration を実行
6. 本番 migration を実行
7. フロント主要導線を確認後、Strapi を read-only 化
