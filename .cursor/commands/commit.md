# commit

過去のcommitとの差分を取得し、変更内容を把握した上で、論理的に変更最小単位でcommitを実行する。

## 手順

### 1. 変更差分を取得

```bash
git status --porcelain
```

- 未追跡ファイル（`??`）があれば `git add` でステージング
- `git diff --cached` でステージング済みの差分を取得
- 未ステージの変更は `git diff` で確認

### 2. 変更内容を把握

- 差分を分析し、変更の種類（追加・修正・削除）を確認
- 関連するファイル群を特定する

### 3. 論理的に変更最小単位でcommit

- 1つのcommitには1つの明確な目的
- 複数の変更は `git add` でステージングを分けて実行
- **未追跡ファイルを含む変更されたファイルはすべてcommitする**

## コミットメッセージの書き方

- コミットメッセージのルールは `CONTRIBUTING.md` の `## コミットメッセージ` に従う
- `.cursor/commands/commit.md` では書式を重複定義せず、実行手順のみを扱う
- メッセージを組み立てる前に、`CONTRIBUTING.md` を確認して現在のルールを参照する

## commit実行コマンド

**zsh の場合**（推奨、複数行 body を保持）:
```bash
git commit -F =(cat <<'MSG'
type: subject

本文1行目（100字以内で改行）
本文2行目
本文3行目

refs: #123
MSG
)
```

**bash の場合**（複数 `-m` で段落区切り）:
```bash
git commit -m "type: subject" -m "本文1行目" -m "本文2行目"
```

## 複数変更を分割してcommitする場合

```bash
git status --porcelain

# 1つ目
git add <ファイル1>
git commit -F =(cat <<'MSG'
type: subject1

body1-1行目（100字以内で改行）
body1-2行目
MSG
)

# 2つ目
git add <ファイル2>
git commit -F =(cat <<'MSG'
type: subject2

body2-1行目（100字以内で改行）
body2-2行目
MSG
)
```

## 補足

- ステージング済みの変更がない場合は commit を実行しない
- `--amend` の指示がある場合は従う