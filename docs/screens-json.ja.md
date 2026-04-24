# `screens.json` 仕様書

## 概要

`screens.json` は、Navimint が解析結果を画面一覧と遷移図として扱うための中間ドキュメントです。

このファイルは、AI 解析の出力保存先であると同時に、フロントエンドが `Sidebar`、`FlowGraph`、`DetailPanel` を描画するための入力でもあります。

## ルート構造

`screens.json` のルートオブジェクトは、次の 4 要素で構成されます。

- `version`
- `project`
- `screens`
- `transitions`

```json
{
  "version": "1.0",
  "project": {
    "name": "my-project",
    "baseURL": "http://localhost:5173"
  },
  "screens": [
    {
      "id": "welcome",
      "name": "WelcomePage",
      "route": "/",
      "description": "プロジェクト未選択時の入口",
      "color": "#59C2D8"
    }
  ],
  "transitions": []
}
```

## ルートオブジェクト

| フィールド名 | 型 | 必須 | 説明 |
|---|---|---|---|
| `version` | `string` | 必須 | フォーマットバージョン。現行値は `"1.0"` |
| `project` | `object` | 必須 | プロジェクト情報 |
| `screens` | `array` | 必須 | 画面一覧 |
| `transitions` | `array` | 必須 | 画面間遷移の一覧 |

## `version`

- 型: `string`
- 必須
- 現在の想定値: `"1.0"`

現行実装では `"1.0"` を前提に扱います。

## `project`

`project` は、解析対象プロジェクトの基本情報です。

| フィールド名 | 型 | 必須 | 説明 |
|---|---|---|---|
| `name` | `string` | 必須 | プロジェクト名 |
| `baseURL` | `string` | 必須 | 画面プレビュー生成の基底 URL |

### 各項目の扱い

- `project.name` はプロジェクト名として表示されます
- `project.baseURL` は `screens[].route` と組み合わせて画面プレビュー URL の生成に使います
- `project.baseURL` には、`http://localhost:5173` のようなベース URL を設定します

## `screens`

`screens` は画面一覧です。各要素は 1 つの画面を表します。

| フィールド名 | 型 | 必須 | 説明 |
|---|---|---|---|
| `id` | `string` | 必須 | 画面の一意 ID |
| `name` | `string` | 必須 | 画面名 |
| `route` | `string` | 必須 | URL パターン |
| `description` | `string` | 任意 | 画面説明 |
| `color` | `string` | 任意 | 画面アクセント色 |

### 各項目の扱い

- `id` は `transitions[].from` と `transitions[].to` から参照されます
- `name` は一覧表示やグラフノードのラベルに使われます
- `route` は画面情報表示や、`project.baseURL` と組み合わせたプレビュー URL 生成の元になります
- `description` は詳細表示や検索対象に使われます
- `color` は画面ノードや一覧のアクセント色として使われます

### `color` の扱い

- `color` は任意です
- 指定する場合は 16 進カラーコードを推奨します
- 不正な値が入っていてもアプリは壊れず、フォールバック色に置き換えられます

## `transitions`

`transitions` は画面間遷移のフラット配列です。

| フィールド名 | 型 | 必須 | 説明 |
|---|---|---|---|
| `from` | `string` | 必須 | 遷移元画面の `id` |
| `to` | `string` | 必須 | 遷移先画面の `id` |
| `trigger` | `string` | 任意 | 遷移を引き起こす操作 |
| `condition` | `string` | 任意 | 遷移条件 |

### 運用上の注意

- `from` と `to` は、必ず `screens[].id` に存在する値を参照する必要があります
- 存在しない `id` を参照する遷移は、フロントエンドの描画対象から除外されます
- `trigger` と `condition` は詳細表示やエッジ情報に使われます

## 保存場所

`screens.json` は、開いたプロジェクトのルート直下に配置します。

アプリは任意パスの JSON を読むのではなく、`<rootDir>/screens.json` を固定で探します。保存時も同じ場所に書き込みます。

## 最小有効スキーマ

現行 Navimint を壊さずに動かす最小形は次の通りです。

```json
{
  "version": "1.0",
  "project": {
    "name": "my-project",
    "baseURL": "http://localhost:5173"
  },
  "screens": [
    {
      "id": "welcome",
      "name": "WelcomePage",
      "route": "/",
      "description": "Entry screen",
      "color": "#59C2D8"
    }
  ],
  "transitions": []
}
```

## 運用ルール

- `screens[].id` は一意にする
- `transitions[].from` と `transitions[].to` は既存の `screens[].id` を参照する
- `route` は URL パターンとして意味が通る値にする
- `/users/:id` のような動的セグメントを含んでもよい
- `color` を指定する場合は 16 進カラーコードを使う

## まとめ

現行実装で `screens.json` に実際に効いているのは、`version`、`project.name`、`project.baseURL`、`screens` の基本情報、`transitions` の参照情報です。

この仕様書に沿って JSON を生成すれば、現在の Navimint の画面一覧表示、遷移図表示、詳細表示にそのまま利用できます。
