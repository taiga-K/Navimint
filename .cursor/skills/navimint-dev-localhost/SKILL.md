---
name: navimint-dev-localhost
description: Starts Navimint local development (Vite on port 5173 and Electron with HMR). Use when the user asks to run localhost, start the dev server, open the app in development, npm run dev, or when debugging "port already in use" or Electron failing to start next to Vite.
---

# Navimint: localhost 開発起動

## 前提

- リポジトリルートで実行する（依存は `npm install` 済み想定）。
- 初回または `dev:main` の成果物が無い場合でも、`dev` スクリプトが先に `build:main` を走らせる。

## 起動コマンド

```bash
cd /path/to/Navimint
npm run dev
```

## 何が起動するか

1. **`build:main`**: `tsc -p tsconfig.main.json` で `dist/main/` を一度ビルドする。
2. **`concurrently`** で次を同時起動する:
   - **main**: `tsc -w -p tsconfig.main.json`（ウォッチ）
   - **renderer**: `vite`（既定で **http://127.0.0.1:5173/**）
   - **electron**: `wait-on tcp:5173 dist/main/index.js` のあと、`VITE_DEV_SERVER_URL=http://127.0.0.1:5173 electron .`

ブラウザだけ確認する場合は **http://127.0.0.1:5173/** を開く。Electron ウィンドウは同じ Vite URL を読み込む。

## トラブルシュート

### Port 5173 is already in use

別プロセスが 5173 を掴んでいる。既存の `npm run dev` / Vite を止めるか、占有 PID を終了する。

```bash
lsof -i :5173
# 必要なら kill <PID>
```

### Electron が即クラッシュし `exports is not defined in ES module scope` など

`package.json` に **`"type": "module"`** があり、`dist/main/index.js` が **CommonJS（tsc）** のとき、Node が main を ESM として解釈して壊れる。**`type: module` を付けない**（このリポジトリの想定）か、ビルド出力と `type` を揃える必要がある。

## 本番に近い起動（参考）

一回ビルドしてから Electron のみ:

```bash
npm run start
```

`dev` とは別フロー（HMR なし）。
