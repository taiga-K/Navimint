# branch

GitFlow に従い、適切な親ブランチから適切な命名で作業ブランチを作成する。

## ブランチ作成ルールの参照先

- ブランチ運用の基本ルールは `CONTRIBUTING.md` の `## ブランチ運用` に従う
- `.cursor/commands/branch.md` では、GitFlow に基づくブランチ種別の判断と `git checkout -b` を使った作成手順のみを扱う
- ブランチ名や運用方針に迷った場合は、先に `CONTRIBUTING.md` を確認して現在のルールを参照する

## いつ使うか

- 新機能開発を始めるとき
- リリース準備用のブランチを切るとき
- 本番の緊急修正を始めるとき

## 事前確認

### 1. 作業ツリーがクリーンか確認

```bash
git status --porcelain
```

- 出力が空ならそのまま進めてよい
- 未コミット変更がある場合は、ブランチ作成前にそのまま進めてよいかユーザーへ確認する

### 2. ブランチ種別を判断

| 種類 | 用途 | 親ブランチ | 命名形式 |
|------|------|------------|----------|
| `feature` | 新機能開発 | `develop` | `feature/<名前>` |
| `release` | リリース準備 | `develop` | `release/<バージョン>` |
| `hotfix` | 本番の緊急修正 | `main` | `hotfix/<名前>` |

ユーザーの意図から、どの種別に当たるかを決める。

## 命名の考え方

- ブランチ名の基本ルールは `CONTRIBUTING.md` の `## ブランチ運用` に従う
- 小文字とハイフンを使い、簡潔で内容が分かる名前にする
- `feature` と `hotfix` は変更内容が分かる短い名前を付ける
- `release` はバージョンをそのまま使う

例:

| 種類 | 例 |
|------|----|
| `feature` | `feature/add-user-auth`, `feature/issue-123-login` |
| `release` | `release/1.2.0`, `release/v2.0.0` |
| `hotfix` | `hotfix/fix-payment-crash`, `hotfix/issue-456-null-check` |

## 基本フロー

### feature ブランチ

```bash
git fetch origin develop
git checkout develop
git pull origin develop
git checkout -b feature/<ブランチ名>
```

### release ブランチ

```bash
git fetch origin develop
git checkout develop
git pull origin develop
git checkout -b release/<バージョン>
```

### hotfix ブランチ

```bash
git fetch origin main
git checkout main
git pull origin main
git checkout -b hotfix/<ブランチ名>
```

## 親ブランチの扱い

- `main` が存在しない場合は `master` を使用する
- リモートに `origin/develop` がない場合は、ローカルの `develop` から作成してもよい
- ユーザーが明示的に別の親ブランチを指定した場合は、その指定に従う

## 出力例

**入力**: ログイン機能を開発する

```bash
git fetch origin develop
git checkout develop
git pull origin develop
git checkout -b feature/add-login
```

**入力**: バージョン 1.2.0 のリリース準備

```bash
git fetch origin develop
git checkout develop
git pull origin develop
git checkout -b release/1.2.0
```

**入力**: 本番の決済エラーを緊急修正

```bash
git fetch origin main
git checkout main
git pull origin main
git checkout -b hotfix/fix-payment-error
```

## 補足

- リモートへの push は、ユーザーから明示的に依頼された場合のみ行う
- ブランチ作成後に共有が必要なら `.cursor/commands/push.md` の手順に従う
