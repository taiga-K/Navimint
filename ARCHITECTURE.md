# Architecture

この文書は、このリポジトリの変わりにくい構造を説明する。
目的は、実装の量に関わらず「どこに何を置くか」「どの境界を崩さないか」を
判断できる状態を保つことにある。

ここでは個別画面の詳細や一時的な実装都合は扱わない。
代わりに、責務分担、依存方向、文書の位置づけ、不変条件を記述する。

## 採用構成

このプロジェクトは `Electron + TypeScript + React` を前提とする。
デスクトップアプリとしての責務を明確にするため、実装は `main`、`preload`、
`renderer`、`shared` の 4 領域に分割する。

## ディレクトリ構成

```text
src/
  main/
    index.ts
    window.ts
    ipc/
    utils/

  preload/
    index.ts
    types.d.ts

  renderer/
    index.html
    main.tsx
    App.tsx
    components/
    pages/
    features/
    hooks/
    lib/
    styles/

  shared/
    types/
    constants/
```

## 責務分担

### `src/main`

Electron のメインプロセスを置く。アプリ起動、`BrowserWindow` の生成、アプリ
メニュー、OS 連携、ファイルシステムやネイティブ API へのアクセス、`ipcMain`
による受け口はここに集約する。

### `src/preload`

`main` と `renderer` の橋渡しを担当する。`contextBridge` を通して UI 側に公開
する API を定義し、`renderer` から Node.js や Electron API を直接触らせない。

### `src/renderer`

React による UI 実装を置く。画面、共通コンポーネント、機能単位の UI ロジック、
フロントエンド向けの状態管理はここに集約する。OS 依存の処理は直接持たず、
必要な機能は `preload` 経由で呼び出す。

### `src/shared`

プロセス間で共有する型や定数を置く。特に IPC の request / response 型はここで
定義し、`main` と `renderer` の型のずれを防ぐ。

## 依存方向の原則

- `renderer` は `preload` が公開した API のみを利用する。
- `preload` は `renderer` の UI 実装に依存しない。
- `main` は `renderer` の詳細実装に依存しない。
- 共有可能な型と定数のみを `shared` に置き、実行時責務は混在させない。

## 不変条件

- Node.js / Electron の生 API を `renderer` に直接公開しない。
- IPC は ad-hoc に増やさず、責務ごとに整理した境界を保つ。
- UI 都合で `main` の責務を侵食しない。
- OS 連携や永続化は `main` 側で完結させる。