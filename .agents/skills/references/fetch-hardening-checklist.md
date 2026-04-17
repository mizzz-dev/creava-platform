# fetch-hardening-checklist

## GETクライアント（frontend/src/lib/api/client.ts）チェック
- [ ] `response.ok` 非成功時の詳細エラー化
- [ ] `content-type` が `application/json` か検証
- [ ] HTML混入（`<!doctype html>` / `<html`）を検知
- [ ] timeout + AbortController
- [ ] retry対象ステータス（408/425/429/5xx）
- [ ] exponential backoff
- [ ] in-flight重複排除
- [ ] stale-while-revalidate キャッシュ

## UI層チェック
- [ ] ローディング/空状態/失敗状態を分離
- [ ] 失敗時に再試行導線がある
- [ ] API障害文言がユーザー向けに理解可能
- [ ] 画面クラッシュを避ける安全側フォールバック

## backend側チェック
- [ ] JSON APIエラー整形 middleware との整合
- [ ] CORS / 認証エラー時にHTMLレスポンスになっていないか
