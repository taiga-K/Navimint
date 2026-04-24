# Workspace Contract

## 概要

この文書は、Navimint のメイン画面であるワークスペース UI の契約を定義する。

ワークスペース UI は、次の 3 カラムで構成する。

- 左カラム: `Sidebar`
- 中央カラム: `FlowGraph`
- 右カラム: `DetailPanel`

本契約の目的は、`screens.json` を 3 カラムで一貫して扱うための責務分担、共有状態、
導出データ、選択モデル、同期ルールを先に固定することにある。

## 参照文書

- `docs/screens-json.md`
- `docs/screens-json.ja.md`
- `ARCHITECTURE.md`
- `design-system/navimint/MASTER.md`
- `design-system/navimint/pages/workspace.md`

## 前提

- 解析結果は、開いたプロジェクトのルート直下の `screens.json` に保存される
- `screens.json` は `Sidebar`、`FlowGraph`、`DetailPanel` の共通入力である
- 実装は `Electron + TypeScript + React` を前提とする
- ファイル I/O と保存は `main` 側で扱い、`renderer` は `preload` 経由の API のみを利用する

## 3 カラムの責務

### 左カラム

左カラムは、screen の発見と主選択を担当する。

- screen 一覧の表示
- search query による一覧絞り込み
- connected screen と orphan screen のグルーピング
- `selectedScreenId` の更新

左カラムは、遷移関係の詳細解釈や preview 表示の責務を持たない。

### 中央カラム

中央カラムは、screen 間の関係可視化を担当する。

- 全 screen のグラフ描画
- screen node の選択
- selected screen の関係強調

中央カラムは、一覧検索の責務を持たない。

### 右カラム

右カラムは、selected screen の inspector を担当する。

- `Details`
- `Transitions`
- `Preview`

右カラムは、主選択の起点ではなく、選択結果の表示と preview 関連操作を担当する。

## 共有状態

ワークスペース全体で共有する状態は次のとおりとする。

```ts
type WorkspaceState = {
  document: ScreensDocument | null;
  loadState: "idle" | "loading" | "ready" | "error";
  selectedScreenId: string | null;
  searchQuery: string;
  previewBaseUrl: string | null;
};
```

### 各状態の意味

- `document`: 現在読み込まれている `screens.json`
- `loadState`: 読み込み状態
- `selectedScreenId`: 3 カラム共通の主選択
- `searchQuery`: 左カラムの一覧絞り込み条件
- `previewBaseUrl`: preview 生成に使う現在の base URL

`selectedScreenId` が主選択の唯一の正本である。

## 導出データ

`document` から次の導出データを生成してよい。

```ts
type WorkspaceDerived = {
  screenById: Record<string, ScreenDefinition>;
  inboundByScreenId: Record<string, ScreenTransition[]>;
  outboundByScreenId: Record<string, ScreenTransition[]>;
  connectedScreenIds: string[];
  orphanScreenIds: string[];
  filteredConnectedScreenIds: string[];
  filteredOrphanScreenIds: string[];
  resolvedPreviewUrlByScreenId: Record<string, string | null>;
};
```

### 導出ルール

- `screenById` は `screens[].id` をキーにする
- `inboundByScreenId` は `transitions[].to` で集約する
- `outboundByScreenId` は `transitions[].from` で集約する
- 不正な `id` を参照する transition は描画対象から除外する
- `resolvedPreviewUrlByScreenId` は `previewBaseUrl + screen.route` で生成する

## screen の分類

### connected screen

少なくとも 1 件以上の inbound transition または outbound transition を持つ screen。

### orphan screen

inbound transition も outbound transition も 0 件の screen。

```ts
const isOrphanScreen =
  inboundByScreenId[screen.id].length === 0 &&
  outboundByScreenId[screen.id].length === 0;
```

## 左カラムの表示契約

左カラムは、screen を次の 2 セクションに分けて表示する。

- `Routes`
- `Orphan`

### 表示ルール

- connected screen は `Routes` セクションに表示する
- orphan screen は `Orphan` セクションに表示する
- 両セクションとも、`screens.json` の出現順を保持する
- search は左カラムの一覧表示にのみ作用する
- search 対象は `name`、`route`、`description`
- orphan screen は表示対象から除外しない

### 非目標

初期契約では、orphan screen を非表示にする toggle は扱わない。

## 中央カラムの描画契約

- 中央グラフは初期状態で全 screen を描画する
- orphan screen も中央グラフに描画する
- search query は中央グラフの描画対象に影響しない
- selected screen が存在する場合のみ selected node を強調する

## 右カラムの表示契約

右カラムは次の順序で情報を表示する。

1. `Details`
2. `Transitions`
3. `Preview`

### Details

- `name`
- `route`
- `description`

### Transitions

- inbound transitions
- outbound transitions

orphan screen の場合、`Transitions` は 0 件表示になる。

### Preview

- preview URL は `previewBaseUrl + route` で生成する
- 動的 route もそのまま URL に連結する
- `previewBaseUrl` は UI から更新できる
- 更新された `previewBaseUrl` は保存対象である

## 初期状態

ワークスペース初期状態は次のとおりとする。

- `document = null`
- `loadState = "idle"`
- `selectedScreenId = null`
- `searchQuery = ""`
- `previewBaseUrl = null`

`document` 読み込み後も、初期選択は行わない。

## イベントと同期ルール

### `DocumentLoaded(document)`

- `document` を共有状態に格納する
- `loadState = "ready"` にする
- `previewBaseUrl = document.project.baseURL` にする
- `selectedScreenId` は `null` のまま維持する

### `ScreenSelected(screenId)`

発火元:

- 左カラムの list item click
- 中央グラフの node click

更新:

- `selectedScreenId = screenId`

結果:

- 左カラムの該当 item を selected 表示にする
- 中央グラフの該当 node を selected 表示にする
- 右カラムの `Details`、`Transitions`、`Preview` を更新する

### `SearchQueryChanged(query)`

更新:

- `searchQuery = query`

結果:

- 左カラムの一覧だけを再絞り込みする
- 中央グラフの描画対象は変えない
- `selectedScreenId` は変更しない

### `PreviewBaseUrlUpdated(baseURL)`

更新:

- `previewBaseUrl = baseURL`
- `document.project.baseURL = baseURL`

結果:

- 右カラムの preview URL を再生成する
- 保存対象の `screens.json` に反映される

### `DocumentReloaded(nextDocument)`

更新:

- `document = nextDocument`
- `previewBaseUrl = nextDocument.project.baseURL`

結果:

- 既存の `selectedScreenId` が `nextDocument.screens` に存在すれば維持する
- 存在しなければ `selectedScreenId = null` にする
- `searchQuery` は維持する

## 空状態とエラー状態

### `screens.json` が存在しない場合

- `loadState = "error"`
- 左カラム、中央カラム、右カラムは empty / error state を表示する

### `screens` が空の場合

- 左カラムは空一覧を表示する
- 中央グラフは空状態を表示する
- 右カラムは no selection 状態を表示する

### `selectedScreenId = null` の場合

- 左カラムは selected item を持たない
- 中央グラフは selected node を持たない
- 右カラムは no selection 状態を表示する

## 保存ルール

- `screens.json` の保存先は `<rootDir>/screens.json` に固定する
- 保存処理は `main` 側で行う
- `renderer` は保存 API を `preload` 経由で呼び出す
- UI から更新した `previewBaseUrl` は `project.baseURL` に反映して保存する

## 実装境界

### `main`

- `screens.json` の読み込み
- 検証
- 保存
- 再読込

### `preload`

- `renderer` に公開する読み書き API の定義

### `renderer`

- 3 カラム UI の描画
- 共有状態の保持
- 導出データの生成
- ユーザー操作による state 更新

### `shared`

- `ScreensDocument` などの共有型
- IPC の request / response 型

## 今後の拡張対象

次は本契約の対象外とする。

- transition 単位の選択状態
- graph viewport の永続化
- orphan screen の非表示 toggle
- route pattern に対する preview パラメータ補完
- preview 失敗時の詳細な診断 UI
