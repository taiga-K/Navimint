# Workspace Page Override

このファイルは、Navimint のメイン画面である「画面一覧 + グラフ + 詳細/プレビュー」ワークスペース専用の上書きルールを定義する。

対象イメージは、添付プロトタイプの 3 ペイン構成を前提とする。

## 1. Page Goal

- 左で対象 screen を探す
- 中央で screen 間の関係を把握する
- 右で screen の詳細と preview を確認する

この画面では、派手なブランディングよりも「探索速度」と「状態把握のしやすさ」を優先する。

## 2. Layout Override

### Exact Structure

| Region | Spec |
|---|---|
| Left Sidebar | `256px - 280px` 固定 |
| Center Graph Canvas | `minmax(0, 1fr)` |
| Right Inspector | `352px - 384px` 固定 |
| Bottom Status | `24px` |

### Pane Behavior

- Left Sidebar と Right Inspector は独立スクロール
- 中央 Graph は余白を多く取り、ノードが窮屈に見えないようにする
- 右ペイン下部の Preview は縦可変だが、**最低 240px** を確保する

## 3. Sidebar Rules

### Search

- プレースホルダは `Search by name, route, or description`
- 検索欄は panel 内で最も目立つ input だが、主役にはしない
- 虫眼鏡アイコンは `--text-muted`

### Screen List Item

- 高さは `36px - 44px`
- 左に小さな color chip、中央に name、右に route の断片または件数
- 選択状態:
  - 背景 `--bg-selected`
  - 左 border `2px solid var(--accent-primary)`
  - 文字は `--text-primary`
- 非選択状態:
  - 名前は `--text-secondary`
  - route は `--text-muted`

## 4. Graph Canvas Rules

### Canvas Surface

- 背景は `--bg-app` をベースに、必要なら 1 段だけ暗いドットグリッドを使う
- グリッドは見せすぎない。表示する場合でも 3% - 5% 程度のコントラストに抑える
- パン・ズーム UI は右上か左下に寄せ、ノードの近くに浮かせない

### Node Design

- ノード幅は `120px - 168px`
- 角丸は `10px - 12px`
- 基本状態は `--bg-panel` 背景 + `--border-strong`
- hover は背景を `--bg-elevated` に変更
- selected は border を `--accent-primary` にし、外周に soft glow を付与

### Edge Design

- 通常エッジは `rgba(148, 163, 184, 0.35)`
- hover/selected に連動するエッジのみ `--accent-primary` を使う
- 矢印やトリガー情報は常時全部表示しない。選択時または近接時のみ見せる

## 5. Inspector Rules

### Information Hierarchy

右ペインは次の順に固定する。

1. Screen title
2. 基本情報 (`name`, `route`, `description`)
3. Inbound transitions
4. Outbound transitions
5. Metadata (`preview`, `baseURL`, `resolved URL`)
6. Preview frame

### Section Styling

- セクション間は `1px` border で区切る
- section title は `12px` uppercase か、`13px` semibold のどちらかに統一する
- 値がコード的な文字列なら mono を使う

## 6. Preview Rules

- 外枠は `--bg-panel` 上に `--border-strong`
- 内側の Web preview が白背景でも見切れないよう、`12px - 16px` の frame padding を入れる
- ロード中は真っ白の空領域にせず、URL と loading state を表示する

## 7. Interaction Rules

- 主要操作は click / keyboard で完結させる
- hover は補助であり、意味の確定は selected 状態で行う
- ノード選択とサイドバー選択は常に同期させる
- 検索結果ハイライトと選択ハイライトは同じ見た目にしない

## 8. Microcopy Tone

- 短く、技術的で、断定的にする
- 例:
  - `Inbound transitions`
  - `Resolved URL`
  - `Preview unavailable`
  - `No transitions`

曖昧で感情的な文言は避ける。

## 9. Acceptance Checklist

- [ ] 3 ペインの役割がひと目でわかる
- [ ] 選択中 screen が左・中央・右で一貫している
- [ ] Preview が暗色 UI の中で孤立せず自然に見える
- [ ] グラフキャンバスが装飾過多になっていない
- [ ] hover だけに依存する重要情報がない
