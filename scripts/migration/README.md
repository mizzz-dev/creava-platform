# Strapi -> WordPress migration

## 実行方法

```bash
node --loader ts-node/esm scripts/migrate-strapi-to-wordpress.ts --dry-run
node --loader ts-node/esm scripts/migrate-strapi-to-wordpress.ts
```

## 方針
- slug を維持して WordPress 側へ移行
- idempotent（再実行しても壊れにくい）
- `mapping.json` に Strapi ID と WordPress ID の対応を保存
- 画像は URL ベースで WordPress Media Library へ投入
