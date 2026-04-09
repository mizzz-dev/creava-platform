# store.mizzz.jp / fc.mizzz.jp デザインシステム整備ログ（2026-04-09）

## 1. 現状確認結果（最初に実施）

### 1-1. 現在のUI品質課題
- レイアウト幅は `max-w-6xl px-4` の直書きが多く、セクション間の余白規則が画面ごとにブレやすい。
- CTA ボタンがページ/コンポーネントごとに個別 Tailwind 記述となっており、優先度（primary/secondary/accent）の再現性が低い。
- バッジは `Badge.tsx` とページ内インライン実装が混在し、意味（new/limited/members/featured）と見た目の対応が揺れやすい。
- テーマ切替・言語切替は動作済みだが、focus 可視性を統一できる余地がある。

### 1-2. コンポーネント重複箇所
- ボタン: `VisualHeroSection`, `FanclubSitePages`, 各ページリンクで再実装。
- ラベル: `Badge.tsx` + 各ページで丸バッジを個別記述。
- コンテナ: `mx-auto max-w-6xl px-4` が store/fc ページに反復。

### 1-3. store / fc で不統一な箇所
- hero CTA のスタイル規則（色・border・hover）がファイルごとに差分。
- 会員ラベル（members only）とロック状態ラベルの視覚ルールが統一されていない。
- analytics の命名は `cta_click` 中心で、テーマ切替/言語切替/商品カードのイベント可視化がしにくい。

### 1-4. デザインルールが不足している箇所
- semantic token（意味ベース色）
- section/container spacing ルール
- badge semantic tone ルール
- CTA variant ルール
- motion 運用（既存 `motionPresets` を使う前提の明文化）

### 1-5. 今回整理すべき共通基盤
1. Token（色/余白/半径/影/モーション）
2. 共通 Button / Badge（semantic）
3. container / section ユーティリティ
4. 計測イベント（テーマ・言語・商品カード）
5. 実装ガイド（運用ルール + NG例）

### 1-6. 作業ブランチ名
- `ui-foundation-store-fc`

### 1-7. 実装順
1. 現状確認
2. デザイントークン整理
3. 共通コンポーネント整理
4. layout/spacing 規則整理
5. badge/cta/タイポ規則整理
6. motion ルール記載
7. store 適用
8. fc 適用
9. a11y/perf 改善
10. ドキュメント整備

---

## 2. 今回の実装差分

### 2-1. デザイントークン
- `frontend/src/index.css` に `:root` / `.dark` ベースで token 変数を追加。
  - color token / semantic accent
  - spacing scale
  - radius scale
  - shadow token
  - motion duration/easing
- `ds-container`, `ds-section` ユーティリティを追加。

### 2-2. 共通コンポーネント基盤
- `Button` を新規追加（`primary / secondary / ghost / accent`、`sm/md/lg`、`to/href/button` 対応）。
- `SemanticBadge` を新規追加（`new/limited/members/featured/trending/early_access/neutral`）。
- `cn` ヘルパーを追加。

### 2-3. store 適用
- `VisualHeroSection` の CTA を `Button` に統一。
- Hero badge を `SemanticBadge` に統一。
- Store home のルートコンテナを `ds-container` へ変更。

### 2-4. fc 適用
- FC セクションカードの権限バッジを `SemanticBadge` に統一。
- ロック状態/閲覧可能状態の CTA を `Button` に統一。
- FC home / section template のコンテナを `ds-container` に統一。

### 2-5. a11y / 計測 / パフォーマンス
- ThemeToggle / LangSwitcher に `focus-ring` を適用。
- analytics に以下の専用イベントヘルパーを追加。
  - `trackThemeToggle`
  - `trackLanguageSwitch`
  - `trackProductCardClick`
- ProductCard クリックで `cta_click` + `product_card_click` の二段計測を行い、UI刷新前後比較しやすい構造に。

---

## 3. デザイン運用ルール（今後）

### 3-1. タイポ
- display: hero 見出し（`text-3xl sm:text-5xl`）
- heading: section 見出し（`text-2xl` 前後）
- body: `text-sm leading-relaxed`
- caption/meta: `font-mono text-[10px-12px]`

### 3-2. 余白 / グリッド
- ページの第一コンテナは `ds-container` を使用。
- section の縦間隔は `ds-section` または `mt-10/mt-12` に統一し、`mt-*` の過剰バラつきを避ける。

### 3-3. カラー / ダークモード
- 意味ベース色を優先（members, limited, featured など）。
- ダークモードでは token を通した配色変更を優先し、個別 hardcode を増やさない。

### 3-4. バッジ / CTA
- バッジは意味（tone）を props で渡す。
- CTA は `Button` variant で強弱を表現。
  - primary: 最重要
  - accent: 会員導線や限定導線
  - secondary/ghost: 補助導線

### 3-5. モーション / イラスト
- モーションは `motionPresets` 再利用を基本とする。
- reduced motion を尊重（`useReducedMotion` 前提）。
- イラストは Hero 主導線の補助として使用し、本文可読性を優先。

### 3-6. CMS耐性
- Hero の title/subtitle/description は長文前提で改行/折返し耐性を持たせる。
- バッジやCTAの文言長は日本語・英語・韓国語で崩れにくいサイズ帯を維持。

---

## 4. NG例
- ページごとに CTA クラスを再定義する。
- `members only` を画面ごとに別色で実装する。
- ダークモード用色をトークン経由せずインラインで追加し続ける。
- Hero に過剰な常時ループアニメーションを追加する。

## 5. 追加実装チェックリスト
- [ ] `Button` / `SemanticBadge` 再利用で実装している
- [ ] `ds-container` を利用している
- [ ] ライト/ダークでコントラスト確認済み
- [ ] ja/en/ko で長文崩れ確認済み
- [ ] クリック導線の analytics が命名規則に沿っている
- [ ] ErrorState / EmptyState の表示を壊していない

## 6. 仮定
- store/fc の主導線は「ブランド訴求 + 会員導線 + 安心導線」を優先し、EC特化UIには寄せない。
- analytics は既存 `trackEvent` 基盤（GA等）に接続済みである前提。
- 今回は Stripe 本格導入を対象外とし、UI品質と運用ルール整備を優先する。
