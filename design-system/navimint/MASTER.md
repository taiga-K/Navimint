# Navimint Design System

> **運用ルール:** 具体的な画面を設計するときは、まず `design-system/navimint/pages/[page-name].md` を確認する。  
> そのファイルが存在する場合は、ページ固有ルールをこの Master より優先する。  
> 存在しない場合は、この Master を単一の設計基準として使う。

---

**Project:** Navimint  
**Category:** Developer Tool / Desktop Workspace  
**Base Inspirations:** VSCode / Cursor / Notion  
**Primary Mode:** Dark by default, light mode optional

## 1. Design Intent

Navimint は、ソースコード解析の結果を「一覧」「関係図」「詳細」の 3 つの視点で行き来するデスクトップアプリである。  
UI は派手さよりも、情報の可読性、選択状態の明快さ、長時間利用でも疲れにくい密度を優先する。

### Product Personality

- **Calm:** 常時視界に入っても疲れにくい静かな配色
- **Precise:** 選択・ホバー・フォーカスの差分が明確
- **Structured:** 情報階層が常に読み取れる
- **Technical:** 開発者ツールらしい信頼感と検査性
- **Assistive:** AI 解析結果を補助する、邪魔しない UI

### Core Principles

1. **Low Noise, High Signal**  
   背景や装飾は抑え、選択中の要素だけを強く見せる。
2. **Progressive Disclosure**  
   一覧で概要、グラフで関係、右ペインで詳細を出す。
3. **Desktop Density First**  
   タッチ前提ではなく、キーボードとポインタの精密操作を前提にする。
4. **Stable Layout**  
   読み込みや選択でレイアウトが跳ねない。
5. **Inspectability**  
   Route、ID、URL、色、トリガーなど、技術情報はすぐ拾える形にする。

## 2. Visual Direction

### Overall Style

- ベースは **Cursor / VSCode 系のダークワークスペース**
- 情報パネルの静けさは **Notion 的な余白と整列感** を取り入れる
- グラフキャンバスは装飾的にしすぎず、ノードとエッジの視認性を最優先にする
- ホバーは「浮かせる」より **背景差・境界線差・文字色差** で表現する

### What To Avoid

- ランディングページ風の大きすぎる余白
- ネオン過多のサイバー表現
- 強いグラデーションやガラスモーフィズム
- 重要操作を hover のみで見せる設計
- レイアウトシフトを起こす hover scale

## 3. Color System

ワークスペースの配色は **ニュートラルなグレースケール** を基軸とする。  
`main` `base` `assets` の 3 軸を起点に、UI の階層（背景 → 境界 → メタテキスト）を表現する。

### Palette Anchors

| Anchor | Hex | 役割 |
|---|---|---|
| `main` | `#121212` | アプリ全体の主背景 |
| `base` | `#515151` | パネル間の主境界線 |
| `assets` | `#919191` | ラベル / メタ / アイコンのトーン |

### Core Tokens

| Token | Hex | Usage |
|---|---|---|
| `--color-app` | `#121212` | アプリ全体の背景（main） |
| `--color-panel` | `#1A1A1A` | サイドバー、詳細ペイン |
| `--color-panel-muted` | `#0A0A0A` | ステータスバー、補助領域 |
| `--color-elevated` | `#262626` | ホバー、入力欄、選択候補 |
| `--color-selected` | `#2F2F2F` | 選択状態の面 |
| `--color-border-subtle` | `#2E2E2E` | 通常境界 |
| `--color-border-strong` | `#515151` | パネル区切り、カード境界（base） |
| `--color-text-primary` | `#F5F5F5` | 主テキスト |
| `--color-text-secondary` | `#C8C8C8` | 補足説明 |
| `--color-text-muted` | `#919191` | ラベル、メタ情報（assets） |
| `--color-accent-primary` | `#60A5FA` | フォーカス、選択、リンク |
| `--color-accent-success` | `#22C55E` | Preview 成功、実行状態 |
| `--color-accent-warning` | `#F59E0B` | 注意 |
| `--color-accent-danger` | `#F87171` | エラー、削除 |
| `--color-accent-node` | `#A78BFA` | グラフ補助アクセント |

### Semantic Usage

- **無彩色を基調にする:** 背景・境界・テキストは achromatic（グレースケール）に揃える
- **常用アクセントは 1 色に絞る:** 基本は `--color-accent-primary`
- **成功 / 警告 / エラーは accent 系を使い続ける:** これらの意味色はグレースケール化しない
- **画面固有 color は補助扱い:** `screens.json` の `color` はノード識別にのみ使い、UI 全体のテーマ色にはしない
- **境界線で構造を作る:** 背景差だけで区切らず、1px border を積極的に使う

### Light Mode Guidance

Light mode を用意する場合も、ニュートラルな achromatic 軸を維持する。  
`base` と `assets` はダーク / ライト共通で同じ値を使い、配色のアイデンティティを保つ。

| Token | Hex |
|---|---|
| `--color-app` | `#FAFAFA` |
| `--color-panel` | `#FFFFFF` |
| `--color-elevated` | `#F0F0F0` |
| `--color-border-subtle` | `#E0E0E0` |
| `--color-border-strong` | `#515151` |
| `--color-text-primary` | `#121212` |
| `--color-text-secondary` | `#515151` |
| `--color-text-muted` | `#919191` |
| `--color-accent-primary` | `#2563EB` |

## 4. Typography

### Font Stack

- **UI Sans:** `Inter`, `Noto Sans JP`, `system-ui`, `sans-serif`
- **Code / Route / ID:** `JetBrains Mono`, `SFMono-Regular`, `Menlo`, `monospace`

### Typography Rules

- 見出しは派手にせず、**14 / 16 / 20 / 24** を主軸にする
- 長文説明は少なめにし、ラベルと値の対で読ませる
- `route`、`id`、`baseURL`、JSON キーは monospace を使う
- 日本語 UI でも本文は Sans、技術情報だけ Mono に切り替える

### Recommended Scale

| Token | Size | Weight | Usage |
|---|---|---|---|
| `--text-xs` | `12px` | `500` | メタ情報、補足ラベル |
| `--text-sm` | `13px` | `500` | 一覧項目、入力欄 |
| `--text-md` | `14px` | `500` | 標準本文 |
| `--text-lg` | `16px` | `600` | セクション見出し |
| `--text-xl` | `20px` | `600` | パネルタイトル |
| `--text-mono-sm` | `12px` | `500` | route / URL / code |

## 5. Spacing, Radius, Shadow

### Spacing Tokens

| Token | Value | Usage |
|---|---|---|
| `--space-1` | `4px` | 極小ギャップ |
| `--space-2` | `8px` | アイコンとラベル |
| `--space-3` | `12px` | コンパクト padding |
| `--space-4` | `16px` | 基本 padding |
| `--space-5` | `20px` | パネル内余白 |
| `--space-6` | `24px` | セクション間 |
| `--space-8` | `32px` | 大きめの余白 |

### Radius Tokens

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `6px` | input, badge |
| `--radius-md` | `8px` | list item, button |
| `--radius-lg` | `12px` | card, panel block |
| `--radius-xl` | `16px` | modal, preview container |

### Shadow Tokens

影は「浮遊感」ではなく、レイヤー差の補助として最小限に使う。

| Token | Value |
|---|---|
| `--shadow-soft` | `0 1px 2px rgba(15, 23, 42, 0.28)` |
| `--shadow-panel` | `0 8px 24px rgba(2, 6, 23, 0.28)` |
| `--shadow-focus` | `0 0 0 3px rgba(96, 165, 250, 0.22)` |

## 6. Layout System

### Canonical Workspace Layout

- **Left Rail:** プロジェクト名、検索、画面一覧
- **Center Canvas:** グラフ、ズーム、パン、状態表示
- **Right Inspector:** 詳細情報、遷移、プレビュー

### Default Desktop Sizing

| Area | Width |
|---|---|
| Left Rail | `272px` |
| Right Inspector | `360px` |
| Top Toolbar | `48px` |
| Bottom Status Bar | `24px` |

### Layout Rules

- 3 ペインは常時表示を基本にし、情報の居場所を固定する
- 中央キャンバスだけが流動幅を取る
- サイドペイン内は `sticky` より **内部スクロール** を優先する
- パネル区切りは 1px border で統一する
- 非同期読み込み時は skeleton で面積を確保し、レイアウトジャンプを防ぐ

## 7. Component Rules

### Navigation List

- 各項目は **1 行目に画面名、2 行目に route**
- 選択状態は `--color-selected` と `--color-accent-primary` の左ボーダーで明示
- hover は背景を `--color-elevated` に上げる
- クリック可能な行には必ず `cursor: pointer`

### Search Input

- 高さは `36px` 前後
- アイコンは左固定、placeholder は `--color-text-muted`
- focus 時は `--color-accent-primary` の ring を表示

### Graph Node

- ノード本体は `--color-panel` または `--color-elevated`
- 境界線は `--color-border-strong`
- 選択中ノードは 1px 強調 border + soft glow
- ラベルは 1 行優先、補助情報は小さく 2 行目に置く
- ノード色は screen color を小さなチップで見せる

### Inspector Panel

- セクションを細かく分け、各セクションに `12px - 16px` の padding
- `Name / Route / Description` は縦並びの key-value ではなく、読みやすさを優先して block 単位で表示
- 遷移一覧は timeline ではなく、簡潔な list 表示を基本にする

### Preview Pane

- 白背景プレビューをそのまま見せる場合、外側に濃い panel frame を付けてコントラストを保つ
- Preview unavailable 時は空白ではなく、接続状態と原因を表示する

### Buttons

- Primary button は `--color-accent-primary` だけに寄せず、文脈で使い分ける  
  - 主操作: `--color-accent-primary`
  - 成功系操作: `--color-accent-success`
- hover では scale しない。色差と border 差だけ使う

## 8. Motion & Interaction

### Motion Tokens

| Token | Value | Usage |
|---|---|---|
| `--motion-fast` | `120ms` | hover |
| `--motion-base` | `160ms` | focus, selection |
| `--motion-slow` | `220ms` | panel expand, modal |

### Motion Rules

- hover は `background-color`, `border-color`, `color` のみを基本にする
- パネル開閉は短く、オーバーシュートしない
- `prefers-reduced-motion` では transform と長いアニメーションを無効化する
- ズーム操作の補助 UI は滑らかでもよいが、ノード自体のふるまいは静的に保つ

## 9. Accessibility

- テキストコントラストは 4.5:1 以上
- フォーカスリングは常に可視
- hover のみで重要情報を開示しない
- heading 階層を崩さない
- キーボードのみで一覧選択と詳細確認ができるようにする
- reduced motion を尊重する

## 10. Implementation Notes

### Recommended CSS Variable Set

実装の一次ソースは `src/renderer/styles/global.css` の `@theme` ブロック（Tailwind v4 のテーマ変数として `--color-*` を定義）。概念整理用のダーク例:

```css
@theme {
  --color-app: #121212;
  --color-panel: #1a1a1a;
  --color-panel-muted: #0a0a0a;
  --color-elevated: #262626;
  --color-selected: #2f2f2f;
  --color-border-subtle: #2e2e2e;
  --color-border-strong: #515151;
  --color-text-primary: #f5f5f5;
  --color-text-secondary: #c8c8c8;
  --color-text-muted: #919191;
  --color-accent-primary: #60a5fa;
  --color-accent-success: #22c55e;
  --color-accent-warning: #f59e0b;
  --color-accent-danger: #f87171;
  --color-accent-node: #a78bfa;
}
```

コンポーネントでは Tailwind の `bg-app` / `text-text-primary` などがこれらの `--color-*` にマップされる。

### React Guidance

Navimint の標準方針として、次を推奨する。

- 壊れても全体を巻き込まないように、主要ペイン単位で **Error Boundary** を検討する
- テーマや表示設定のような低頻度更新だけを **Context** に乗せる
- 頻繁に変わるホバー座標やドラッグ状態は Context に載せすぎない

## 11. Anti-Patterns

- 絵作り優先の大きすぎる見出し
- 装飾のためだけの glow / gradient / blur
- 情報の種類ごとに色を増やしすぎること
- 選択状態と hover 状態が似すぎて判別しづらいこと
- 右ペインに長文を詰め込み、一覧性を壊すこと
- 重要アクションをアイコンだけで表すこと

## 12. Review Checklist

- [ ] VSCode / Cursor 的な静かなダークワークスペースになっている
- [ ] Notion 的な整列感と読みやすさがある
- [ ] 左一覧、中央グラフ、右詳細の責務が混ざっていない
- [ ] hover と selected が明確に区別できる
- [ ] `route` や URL は mono で読み分けられる
- [ ] 白背景プレビューが暗色フレームの中で見切れず表示される
- [ ] `cursor-pointer`、focus ring、reduced motion を満たしている
