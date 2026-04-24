<h1 align="center">Navimint</h1>

<p align="center">
  <strong>ソースコードリポジトリから画面一覧と画面遷移を可視化するデスクトップアプリ</strong>
</p>

<p align="center">
  <a href="./README.md"><img src="https://img.shields.io/badge/README-English-orange" alt="English README" /></a>
</p>

---

## 概要

Navimintは、CursorのTypeScript SDKを活用してソースコードリポジトリを解析し、画面一覧と画面遷移を可視化するデスクトップアプリです。

ユーザーが指定したディレクトリ内のソースコードをCursorのTypeScript SDKで解析し、`screens.json` を生成します。Navimintは、この `screens.json` をもとに画面同士の関係や遷移を視覚的に表示します。

アプリが現在利用している `screens.json` の仕様は [`docs/screens-json.ja.md`](./docs/screens-json.ja.md) を参照してください。
