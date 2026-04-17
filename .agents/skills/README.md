# creava-platform repo-local skills

このディレクトリは `creava-platform` 専用の Codex Skills セットです。

## Skill 一覧（1 skill = 1 job）
- `repo-context`: 事前調査と影響範囲固定
- `frontend-page-implementation`: frontend ページ実装
- `brand-design-polish`: ブランドUIの磨き込み
- `store-experience`: store体験改善
- `fanclub-experience`: FC体験改善
- `strapi-content-model`: Strapi content model変更
- `api-fetch-hardening`: fetch安定化・障害耐性
- `docs-and-runbook`: docs/runbook整備
- `issue-pr-writer-ja`: 日本語 issue/PR/commit 整備
- `design-critique`: 実装後のUI批評

## 明示呼び出し例
- 「この issue の前に `$repo-context` で調査して」
- 「store の UX を改善したいので `$store-experience`」
- 「HTML 応答混入の対策を `$api-fetch-hardening` で進めて」
- 「PR文面を repo ルール準拠で `$issue-pr-writer-ja`」

## 暗黙呼び出しされやすい task
- route追加/ページ実装 → `frontend-page-implementation`
- Strapi schema変更 → `strapi-content-model`
- API不安定調査 → `api-fetch-hardening`
- docs更新 → `docs-and-runbook`
- デザインレビュー → `design-critique`

## 推奨の使い分け
1. まず `repo-context` で現状確認
2. 実装系 skill を1つ選ぶ（混ぜすぎない）
3. 実装後に `design-critique` と `issue-pr-writer-ja`

## main / store / fc / backend / docs への対応
- main中心: `repo-context`, `frontend-page-implementation`, `brand-design-polish`, `design-critique`
- store: `store-experience`, `api-fetch-hardening`
- fc: `fanclub-experience`
- backend(Strapi): `strapi-content-model`
- docs/運用: `docs-and-runbook`, `issue-pr-writer-ja`

## スキルを増やしすぎない運用ルール
- 新規 skill は「既存 skill に収まらない反復業務」のみ追加
- まず references 更新で吸収できるか検討
- 1 skill が複数責務を持ち始めたら分割

## 設計理由
- AGENTS.md の「最小差分」「home主役」「日本語運用」を各 skill に埋め込んだ
- docs と実装のズレ（Clerk/Formspree→Logto/Strapi submit）を吸収するため `repo-context` を独立
- デザイン改善は実装と分離し、`brand-design-polish` と `design-critique` に分割
- fetch安定化を独立させ、HTML混入や retry/timeout を再利用可能にした

## タスク→skill マップ
- issue対応（調査含む）: `repo-context` + `issue-pr-writer-ja`
- 機能追加（frontend）: `repo-context` + `frontend-page-implementation`
- CMS対応: `repo-context` + `strapi-content-model`
- UI改善: `brand-design-polish` + `design-critique`
- fetch安定化: `api-fetch-hardening`
- ドキュメント整備: `docs-and-runbook`

## 将来の plugin 化方針
- 現時点は repo-local skills を優先（変更追従が速いため）
- チーム横断で再利用需要が増えた時点で plugin 化を検討
