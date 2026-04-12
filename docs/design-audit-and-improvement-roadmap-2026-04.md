# デザイン現状調査レポート & 改善ロードマップ（2026-04）

> 対象: `mizzz.jp`（main）/ `store.mizzz.jp`（store）/ `fc.mizzz.jp`（fc）  
> 作成日: 2026-04-12  
> 調査ブランチ: `claude/survey-design-improvements-iceID`

---

## 1. エグゼクティブサマリー

> **調査確度について:** 本ドキュメントは主要ファイルの静的解析に基づく。以下のファイルは**今回未読**であり、該当箇所の評価は推定・仮定を含む。実装着手前に確認を要する。
> - `frontend/src/pages/HomePage.tsx`（ホームページ各セクション構成）
> - `frontend/src/modules/store/components/ProductCard.tsx`（商品カードのビジュアル実装）
> - `frontend/src/components/common/VisualHeroSection.tsx`（store/fc Hero の詳細）
>
> 仮定ベースの項目は「11. 仮定事項」にまとめてある。**実装優先度の判断前に、未読ファイルの確認を推奨する。**

コードベースの主要部分を精査した結果、**基盤（デザインシステム・アニメーション・ルーティング・CMS連携）は高品質に整備済み**であることが確認できた。一方で、以下の課題が浮き彫りになった（★は推定含む）。

| カテゴリ | 評価 | 主な課題 | 確度 |
|----------|------|----------|------|
| main Hero | △ | BrandVisualAccent が小さく、ブランドとしての視覚的インパクトが弱い | 確認済 |
| About Me | ✕ | プロフィール写真エリアがプレースホルダー SVG のまま（空欄同然） | 確認済 |
| store Hero | △ | VisualHeroSection の metrics 表示が不明（未読） | ★推定 |
| store 商品カード | △ | ProductCard の画像実装が未確認（ProductCard.tsx 未読） | ★推定 |
| store 全体 | △ | 商品画像の存在感が薄く、「売り場感」が不足 | ★推定含む |
| fc | △ | FcSectionTemplate が汎用カード羅列で、FC 特有の特別感が出ていない | 確認済 |
| エラーページ | ◯ | 構造は良いが、イラストが小さく（96×96px）インパクト不足 | 確認済 |
| アニメーション | ◯ | 定義は豊富だが、一部アニメーション（scanline, aurora_pulse, word_up）が十分活用されていない | 確認済 |
| ライト/ダーク | ◯ | 設計は良いが、一部コンポーネントでライトモードの完成度が低い | 確認済 |

---

## 2. コードベース概要（参照情報）

```
frontend/
├── src/
│   ├── pages/               # 38 ページコンポーネント
│   │   ├── AboutPage.tsx           ← 要改善（プロフィール欠落）
│   │   ├── NotFoundPage.tsx        ← 改善余地あり
│   │   ├── InternalErrorPage.tsx   ← 改善余地あり
│   │   ├── storefront/             ← store サブドメイン
│   │   └── fc/FanclubSitePages.tsx ← FC サブドメイン（要改善）
│   ├── modules/
│   │   └── home/components/HeroSection.tsx  ← 要強化
│   ├── components/common/
│   │   ├── BrandIllustration.tsx   ← 要刷新
│   │   ├── VisualHeroSection.tsx   ← store/fc で使用（確認要）
│   │   └── ...
│   ├── index.css                   ← デザイントークン・ユーティリティ完備
│   └── lib/theme.tsx               ← ライト/ダーク切替
└── tailwind.config.ts              ← アニメーション 25+ 種類定義済み
```

---

## 3. main (mizzz.jp) の現状と課題

### 3-1. Hero セクション（`HeroSection.tsx`）

**現状:**
- テキストスクランブル見出し、磁気ホバーCTA、カウンター統計、マーキーティッカー ✓
- 右側に `BrandVisualAccent`（w-220px の discipline サイクルカード）
- 背景: subtle グリッド + 2つの小さな radial-gradient

**課題:**
- `BrandVisualAccent` が小さなウィジェット（220px）で、デスクトップで右側に浮かぶ印象。ブランドとしての「顔」になるビジュアルではない
- モバイルでは右側ビジュアルが非表示（`hidden md:block`）→ スマホで Hero が寂しい
- 背景効果が控えめすぎる（opacity 5% 程度の radial-gradient 2つのみ）
- Stats（120 Works / 50 Clients / 8 Years）がハードコード
- Ticker items（film/photography/music/direction/design/motion/editorial）がハードコード

**改善方向:**
- `BrandVisualAccent` を廃止または大型化し、より印象的な Hero ビジュアルへ置換
- 背景に Mesh Gradient または Aurora 効果を追加（既定義: `aurora_pulse` を活用）
- モバイル専用のビジュアル要素を追加（現在デスクトップのみ）
- Stats を Strapi `profile` から動的に取得するか、CMS設定経由にする

### 3-2. About ページ（`AboutPage.tsx`）

**現状:**
- 構造は充実（Hero, BIO, Timeline, Values, Skills, Visual Quote, Services, Tools, Social Proof, Works, Blog, Pricing, CTA）
- タイムライン 5項目、Values 4項目、Skills 3カテゴリは適切

**課題:**
```tsx
// AboutPage.tsx:207-214 — プロフィール写真が空のプレースホルダー
<div className="illustration-spot aspect-square w-full max-w-[260px] flex items-center justify-center">
  <div className="flex h-full w-full items-center justify-center opacity-20">
    <svg width="64" height="64" ...>
      {/* 半透明シルエット SVG のみ */}
```
- プロフィール写真が **実質空欄**（半透明人物シルエットのみ）→ ファーストインプレッションに大きなマイナス
- GitHub Activity Card が同じカラムに来るが、プロフィールが空だと文脈が薄い
- Visual Quote が About ページ内に重複している（hero copy と approachText が同じテキストを参照）
- SOCIAL_PROOF・PRICING_HIGHLIGHTS はハードコード（Strapi API から取るべき）

**改善方向:**
- プロフィールエリアを抽象的ブランドイラストに差し替え（`BrandIllustration` 拡張 or 新規）
- または、高品質な抽象アート・モーショングラフィック的なビジュアルを組み込む
- Timeline に `draw_line` アニメーションを適用（既定義済み）
- Values カードのアイコンをより大きく（現状 `text-xl`）
- Quote セクションを独立した full-width ブロックに格上げ
- Social Proof を Strapi awards API から動的取得

### 3-3. ホームページ 各セクション（`HomePage.tsx`未読だが推定）

**推定課題:**
- `FeaturedWorksSection`, `StorePreviewSection`, `FanclubCTASection` 等は CMS データが少ない段階では空欄が多く見えがち
- セクション間の視覚的落差（gray/white のフラットなレイアウト）

---

## 4. store (store.mizzz.jp) の現状と課題

### 4-1. StorefrontHomePage（`StorefrontHomePage.tsx`）

**現状:**
- 多数のセクション: VisualHeroSection, CampaignHero, PickUp, BentoSection, Spotlight, New Arrivals, Collections, Digest, Playful blocks, Member Pickup, Featured, Digital, News/Support ✓
- Playful blocks（DailyMessageCard, WeeklyPickupCard, SurpriseCard）はユニーク ✓
- 会員向けコンテンツの導線（Member Pickup, FC Join CTA）は充実 ✓

**課題:**
- `VisualHeroSection` の `metrics` props が箇条書きテキストの羅列（"新着ドロップと限定販売の更新を毎週整理して掲載。"）→ KPI パネルとして視覚化されていない可能性
- Editor's Pick のカードが商品画像なし（テキストのみ）→ 視覚的インパクト 0
- Collections セクション（`DEFAULT_COLLECTIONS` から）がテキストカードのみ → 画像なし
- News/FAQ セクションが下部に押し込まれた2カラムテキストリスト
- セクション数が多すぎてスクロールが重い（13+ セクション）
- `SkeletonProductCard` はあるが商品ゼロ時の empty-state が "公開中の商品はまだありません" テキストのみ

**改善方向:**
- Editor's Pick カードに商品サムネイルを前面に出す（高さ拡大 + 画像フォーカス）
- Collections に Visual Category Cards を導入（色 + アイコン + グラデーション）
- セクション優先度を整理し、`sectionResolver` でデフォルトオフのセクションを増やす
- Empty state をイラスト付きに（`BrandIllustration variant="store"` 活用）
- VisualHeroSection の metrics をアイコン付き stat カードに変更

### 4-2. ProductCard（`modules/store/components/ProductCard.tsx` 未読）

**推定課題:**
- 商品サムネイルが空の場合の fallback 表現が弱い
- 2カラムグリッドでのカード内情報密度の調整

---

## 5. fc (fc.mizzz.jp) の現状と課題

### 5-1. FcSectionTemplate（`FanclubSitePages.tsx`）

**現状:**
```tsx
// FanclubSitePages.tsx:100 — 汎用カードの羅列
<article className="group rounded-2xl border border-gray-200/90 bg-white p-5 ...">
  <p className="font-mono text-xs text-gray-400">{item.publishAt}</p>
  <SemanticBadge ...>{isLocked ? `🔒 ${accessLabel}` : accessLabel}</SemanticBadge>
  <h2 ...>{item.title}</h2>
  <p ...>{item.description}</p>
  <Button ...>{isLocked ? '入会して見る' : '詳細を見る'}</Button>
</article>
```

**課題:**
- FC コンテンツが store の商品カードと同じ見た目 → 特別感ゼロ
- ロック表現が「🔒 会員限定」テキストのみ → プレミアム感の演出が弱い
- コンテンツ（MOVIES, GALLERIES, TICKETS）がハードコード（12本のサンプルデータ）→ Strapi からの動的取得未実装
- FcSectionTemplate が movie/gallery/ticket 全て同じ見た目 → カテゴリ差がない
- 入会促進の視覚的・感情的フックが弱い

**改善方向:**
- FC コンテンツカードを「FC 専用デザイン」に刷新（fuchsia/violet グラデーション、グラスモーフィズム）
- ロック状態に視覚的ドラマ（ぼかし + 光エフェクト + 解錠アニメーション）
- Movies/Gallery/Tickets でカードのビジュアル表現を差別化
- Strapi `fanclub-content` API への接続（既存 `getFanclubList` 活用）
- 入会 CTA ブロックをより感情的なコピーとビジュアルで強化

### 5-2. FanclubHomeHubPage（`FanclubSitePages.tsx` 後半部）

**現状:**  
VisualHeroSection, BrandIllustration, CuratedBentoSection, EditorialSpotlightSection, MemberPlayfulBlock, UpdateDigestSection を活用 → 構造は比較的良好

**課題:**
- BrandIllustration（variant="fanclub"）の現状が「抽象的な曲線 + 円」で弱い
- VisualHeroSection の fanclub 向けコンテンツが store と類似している可能性

---

## 6. 共通デザイン課題

### 6-1. BrandIllustration コンポーネント

**現状（`BrandIllustration.tsx`）:**
```tsx
<svg viewBox="0 0 300 220">
  <path d="M30 148c24-43 66-73 118-81..." />  {/* 単純な曲線 */}
  <circle cx="96" cy="78" r="8" />
  <circle cx="214" cy="74" r="11" />
  <circle cx="167" cy="122" r="5" />
</svg>
```
3本の曲線と3つの円のみ → ブランドとして「何を表しているか」が伝わらない

**改善方向:**
- variant ごとに異なる具体的なモーチーフを持つイラストへ刷新
- `store`: 商品・ショッピングバッグ・スター
- `fanclub`: FC バッジ・音符・フィルムコマ
- `limited`: リボン・クラウン
- アニメーション（`draw_line` `orbit_slow`）を積極活用

### 6-2. エラーページ

**現状:**
- 404: コンパス（96×96px）、GlitchCode、3つのナビカード、CTAボタン → 比較的良好
- 500: WiFi broken（96×96px）、大きな "500" テキスト、CTAボタン
- 503: 時計+レンチ（96×96px）、大きな "503" テキスト、maintenance バッジ、CTAボタン

**課題:**
- イラストが96×96px と小さい（`h-24 w-24`）→ ページ上で存在感が薄い
- 500 に NavCards がない（404 にはあるが 500/503 にはない）
- エラーページのメッセージが標準的で、mizzz らしい個性が薄い
- site type（main/store/fc）による色変化がない

**改善方向:**
- イラストを `h-48 w-48` に拡大、アニメーション詳細化
- 500/503 にも NavCards を追加（404 と同様）
- mizzz らしいエラーメッセージコピーに変更
- store 環境では商品関連メッセージ、fc 環境では FC らしいメッセージ

### 6-3. アニメーション活用率

| アニメーション | 定義 | 活用状況 |
|---------------|------|----------|
| `aurora_pulse` | ✓ | ほぼ未使用 |
| `scanline` | ✓ | ほぼ未使用 |
| `word_up` | ✓ | ほぼ未使用（HeroSection の ticker のみ？）|
| `draw_line` | ✓ | 未使用（About Timeline に使えるはず）|
| `ripple_out` | ✓ | 限定的 |
| `bg_pan` | ✓ | 限定的 |
| `orbit_slow` | ✓ | 404 ページのみ |
| `breathe` | ✓ | 限定的 |
| `float_diagonal` | ✓ | ほぼ未使用 |

### 6-4. ライト/ダーク品質差

- **ダーク**: `cyber-950`（#06060f）ベースで完成度高い。glow エフェクトが映える
- **ライト**: `#f8f9fb` ベースで清潔感はあるが、一部コンポーネントで「白すぎてのっぺりする」課題
- **主な差異箇所**:
  - HeroSection: ライトモードでは背景グリッドが薄く（opacity 2.5%）、グリッドがほぼ見えない
  - BrandVisualAccent カード: ライトで `shadow-[0_2px_20px_rgba(0,0,0,0.06)]` → ダーク `shadow-[0_4px_32px_rgba(0,0,0,0.6)]` と差が大きい
  - Error pages: ライトでのコーナーブラケット（`border-gray-200/60`）は非常に薄く視認性が低い

### 6-5. モバイル表示

- HeroSection: デスクトップ右側の BrandVisualAccent が `hidden md:block` → モバイルでビジュアル要素なし
- AboutPage: Stats 4カラム（`grid-cols-4`）がモバイルで折り返す設計
- StorefrontHomePage: Product グリッド（`grid-cols-2 md:grid-cols-4`）は適切

---

## 7. 優先度付き改善ロードマップ

### P1 — 最高優先度（ブランド体験に直接影響）

| # | 対象 | 改善内容 | 難易度 |
|---|------|----------|--------|
| 1 | `AboutPage.tsx` | プロフィール写真エリアをブランドイラストに置換 | 中 |
| 2 | `HeroSection.tsx` | BrandVisualAccent を大型ビジュアルに刷新、背景 Aurora 強化 | 中 |
| 3 | `FanclubSitePages.tsx` (FcSectionTemplate) | FC カードを専用デザインに刷新（プレミアム感） | 中 |
| 4 | `BrandIllustration.tsx` | variant 別具体的イラストへ刷新 | 中〜高 |

### P2 — 高優先度（完成度・没入感に影響）

| # | 対象 | 改善内容 | 難易度 |
|---|------|----------|--------|
| 5 | `StorefrontHomePage.tsx` | Editor's Pick & Collections にビジュアル追加 | 中 |
| 6 | `NotFoundPage.tsx` | イラスト拡大（h-48）、メッセージ個性化 | 低 |
| 7 | `InternalErrorPage.tsx` | イラスト拡大（h-48）、Nav Cards 追加、メッセージ個性化 | 低 |
| 8 | `AboutPage.tsx` | Timeline に draw_line アニメーション適用 | 低 |
| 9 | `HeroSection.tsx` | モバイル向けビジュアル要素追加 | 中 |

### P3 — 中優先度（品質向上・磨き上げ）

| # | 対象 | 改善内容 | 難易度 |
|---|------|----------|--------|
| 10 | `tailwind.config.ts` / `index.css` | 未活用アニメーション（aurora_pulse, word_up）のユーティリティクラス追加 | 低 |
| 11 | `FanclubSitePages.tsx` | Strapi `fanclub-content` API 接続（ハードコード除去） | 中 |
| 12 | ライトモード全般 | ライトモードでの Background / Shadow 品質向上 | 中 |
| 13 | `VisualHeroSection.tsx` | metrics プロップを stat カード表示に変更 | 低〜中 |
| 14 | 共通 | モバイルでの Hero ビジュアル改善 | 中 |

---

## 8. 実装ブランチ名案

各 PR は独立した機能を持ち、小さく・レビューしやすい単位とする。

```
# P1 グループ（最高優先）
design/hero-visual-overhaul           # HeroSection 刷新 + Aurora 背景強化
design/about-page-profile-visual       # About プロフィールビジュアル + Timeline アニメ
design/fc-premium-card-redesign        # FC コンテンツカード専用デザイン刷新
design/brand-illustration-overhaul    # BrandIllustration variant 別刷新

# P2 グループ（高優先）
design/store-visual-enhancement        # Store Editor's Pick + Collections ビジュアル
design/error-pages-enhancement         # 404/500/503 イラスト拡大 + 個性化
design/animation-polish                # 未活用アニメーション活用 + 一貫性強化

# P3 グループ（中優先）
feature/fc-strapi-content-integration  # FC Strapi API 接続（ハードコード除去）
design/light-mode-polish               # ライトモード完成度向上
```

---

## 9. 実装順（推奨フロー）

```
Week 1
├── design/about-page-profile-visual      # 最もインパクトが大きく、範囲が限定的
├── design/error-pages-enhancement        # 小さく・すぐ効果が出る

Week 2
├── design/hero-visual-overhaul           # main の顔となる部分
├── design/brand-illustration-overhaul    # store/fc の共通ビジュアル基盤

Week 3
├── design/fc-premium-card-redesign       # FC 特別感向上
├── design/store-visual-enhancement       # Store 売り場感向上

Week 4
├── design/animation-polish               # 全体の磨き上げ
├── feature/fc-strapi-content-integration # ハードコード除去
├── design/light-mode-polish              # 最終仕上げ
```

---

## 10. 追加・修正予定ファイル（見込み）

### 新規作成（予定）
```
frontend/src/components/common/illustrations/
├── ProfileIllustration.tsx        # About プロフィールエリア用
├── StoreHeroIllustration.tsx      # Store Hero 用
├── FcContentIllustration.tsx      # FC コンテンツカード用
└── ErrorIllustration.tsx          # エラーページ共通（サイズ変数付き）
```

### 主な修正対象
```
frontend/src/
├── pages/
│   ├── AboutPage.tsx                 # P1: プロフィール + Timeline アニメ
│   ├── NotFoundPage.tsx              # P2: イラスト拡大 + 個性化
│   ├── InternalErrorPage.tsx         # P2: イラスト拡大 + NavCards + 個性化
│   └── fc/FanclubSitePages.tsx       # P1: FC カードデザイン刷新 + API 接続
├── modules/home/components/
│   └── HeroSection.tsx               # P1: Aurora 背景 + 大型ビジュアル
├── pages/storefront/
│   └── StorefrontHomePage.tsx        # P2: Editor's Pick + Collections ビジュアル
├── components/common/
│   ├── BrandIllustration.tsx         # P1: variant 別刷新
│   ├── VisualHeroSection.tsx         # P3: metrics → stat カード
│   └── motionPresets.ts              # P3: 新プリセット追加
├── index.css                         # P3: aurora クラス追加
└── tailwind.config.ts                # P3: word_up アニメーション活用クラス
```

---

## 11. 仮定事項

以下は既存コードと一般的なブランドサイトのベストプラクティスを基に推測した点を明記する。

1. **プロフィール写真**: 実際の写真素材の準備状況が不明なため、「ブランドイラスト」で代替する方針を提案。実写素材がある場合は `<img>` で差し替え可能な構造にする。

2. **FC コンテンツの Strapi 接続**: `getFanclubList()` API が既存 (`frontend/src/modules/fanclub/api`) に存在すると仮定。実際の接続可否は API 確認が必要。

3. **VisualHeroSection の metrics**: 現状 props として `metrics: { label, value }[]` を受け取り、どのようにレンダリングされているか未確認。改善方針は read 後に確定する。

4. **ProductCard の image 表示**: `modules/store/components/ProductCard.tsx` を未読のため、サムネイル表示の有無は推定。実装前に確認要。

5. **store サブドメインのカラーテーマ**: FanclubGuard の `fanclub` 判定ロジックと同様に、`VITE_SITE_TYPE` で `store`/`fanclub` を判定してエラーページの配色を変える方針を提案。

6. **SEO/法務導線の維持**: 全改善はデザイン変更のみとし、ルーティング・認証・権限制御・多言語・SEO コンポーネントは一切変更しない。

---

*このドキュメントは次 PR での実装の基準ドキュメントとして使用する。各 PR は独立ブランチで開発し、本 doc の優先度に従って順次マージする。*
