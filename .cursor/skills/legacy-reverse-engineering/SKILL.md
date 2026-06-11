---
name: legacy-reverse-engineering
description: Orchestrate the full legacy reverse-engineering pipeline by running 5 companion skills (legacy-feature-inventory, then legacy-business-rules / legacy-screen-flow / legacy-data-dictionary / legacy-data-flow in parallel subagents) and integrating their deliverables into a requirements-definition document set. Use when the user asks to reverse-engineer an entire legacy codebase, 現行システムの調査一式, レガシーコードのリバースエンジニアリング, 新規作り直しのための現状把握, or wants all deliverables (機能一覧・ビジネスルール・画面遷移図・ER図・データフロー図) at once.
---

# Legacy Reverse Engineering (Orchestrator)

レガシーコードベースに対して 5 つの調査スキルを正しい順序・並列度で実行し、成果物一式を統合するオーケストレーター。個別の成果物だけが必要な場合は本スキルを使わず、該当する個別スキルを直接使うこと。

## パイプラインと依存関係

```
Phase 1(直列・必須先行)
  legacy-feature-inventory ── 機能一覧 + CRUDマトリクス + 業務用語集

Phase 2(4 つを並列サブエージェントで実行)
  ├─ legacy-business-rules    … 機能ID・用語集に依存
  ├─ legacy-screen-flow       … 画面列挙・機能IDに依存
  ├─ legacy-data-dictionary   … CRUDマトリクス・用語集に依存
  └─ legacy-data-flow         … CRUDマトリクス・機能IDに依存

Phase 3(直列)
  統合・相互検証 ── INDEX + 統合要調査リスト
```

機能一覧は全下流スキルの入力(ID 体系・用語集・CRUD マトリクス)を生むため必ず先行させる。下流 4 スキルは互いの成果物を必須としないため並列実行できる(data-dictionary の BR-ID 紐付けは Phase 3 で後付けする)。

## ワークフロー

```
- [ ] Phase 0: 対象と出力先の確認
- [ ] Phase 1: 機能一覧の作成(直列)
- [ ] Phase 2: 下流 4 スキルの並列実行
- [ ] Phase 3: 統合・相互検証
```

### Phase 0: 対象と出力先の確認

1. 対象コードベースの絶対パスを確認する(ワークスペース外なら ユーザーに確認)
2. 成果物の出力ディレクトリを決める(既定: 対象コードベース直下ではなく、調査用の `reverse-engineering/` ディレクトリ。ユーザー指定があればそれに従う)
3. 5 つのスキルディレクトリ(`legacy-feature-inventory` 等)の絶対パスを解決しておく(Phase 2 のサブエージェントに渡すため)

### Phase 1: 機能一覧の作成(直列)

`legacy-feature-inventory` の SKILL.md を読み、その手順に従って実行する。出力: `<出力先>/feature-inventory.md`

完了条件: 機能一覧・CRUD マトリクス・業務用語集・要調査リストが揃っていること。ここが不完全だと下流 4 スキルすべての品質が落ちるため、先に完了させてから Phase 2 に進む。

### Phase 2: 下流 4 スキルの並列実行

4 つのサブエージェントを**同時に起動**する(1 メッセージで 4 つの Task 呼び出し)。

| サブエージェント | 実行スキル | 出力ファイル |
|---|---|---|
| ビジネスルール抽出 | legacy-business-rules | `business-rules.md` |
| 画面遷移調査 | legacy-screen-flow | `screen-flow.md` |
| データ辞書作成 | legacy-data-dictionary | `data-dictionary.md` |
| データフロー調査 | legacy-data-flow | `data-flow.md` |

**サブエージェントへのプロンプトに必ず含めること**(サブエージェントは会話の文脈を持たないため):

1. 実行するスキルの SKILL.md の絶対パスと「最初にこれを読み、手順に従え」という指示
2. 対象コードベースの絶対パス
3. Phase 1 の成果物 `feature-inventory.md` の絶対パス(入力として読ませる)
4. 出力ファイルの絶対パス
5. 前提条件の要約: ソースコードのみ・コメントなし・git 履歴なし・ヒアリング不可、確信度 3 値(確定/推測/不明)を使うこと
6. 完了時に「成果物パス・件数サマリ・要調査リストの件数」を報告させること

### Phase 3: 統合・相互検証

4 つの成果物が揃ったら統合作業を行う:

1. **相互検証**(不整合は修正せず INDEX に記録し、要調査として扱う):
   - 機能一覧の画面数 ↔ screen-flow の画面数
   - 機能一覧の CRUD マトリクス ↔ data-dictionary のテーブル一覧(片方にしかないテーブルは要確認)
   - data-flow の共有 DB 疑い ↔ CRUD マトリクスの「誰も書かないテーブル」
2. **BR-ID の後付け紐付け**: data-dictionary の「暗黙の整合性ルール」と business-rules のルールを突合し、対応する BR-ID を data-dictionary 側に追記する
3. **統合要調査リスト**: 5 成果物の要調査リストを 1 つに統合し、重複を除去して調査方法別(実データ調査 / 利用部門ヒアリング / 環境・運用調査 / 未入手資産の入手)に分類する
4. **INDEX の作成**: `<出力先>/INDEX.md` を以下の構成で作る:

```markdown
# 現行調査成果物 — [システム名]

## 成果物一覧
| 成果物 | ファイル | 規模サマリ |
|---|---|---|
| 機能一覧 | feature-inventory.md | XX機能(確定XX/推測XX/不明XX) |
| ビジネスルール仕様書 | business-rules.md | XXルール、矛盾XX件 |
| 画面一覧・遷移図 | screen-flow.md | XX画面、孤立XX |
| ER図・データディクショナリ | data-dictionary.md | XXテーブル、廃止候補XX |
| データフロー図・外部連携一覧 | data-flow.md | XX連携 |

## 相互検証の結果
[件数の突合結果と不整合の一覧]

## 統合要調査リスト
[調査方法別に分類した一覧。後工程のヒアリング・実データ調査の ToDo になる]

## 調査の限界
静的解析のみ(動的解析・git 履歴・ヒアリングなし)で作成。Why(仕様の意図)は原則として復元していない。
```

## 失敗時の扱い

- Phase 2 のサブエージェントが 1 つ失敗しても他の成果物の統合は続行し、欠けた成果物を INDEX に明記して再実行を提案する
- 対象コードベースが巨大で 1 回で完了しない場合は、機能一覧を業務領域で分割し、下流スキルを領域単位で繰り返す(ID 体系は全体で一意に保つ)

## 参照(実行対象スキル)

- `../legacy-feature-inventory/SKILL.md`
- `../legacy-business-rules/SKILL.md`
- `../legacy-screen-flow/SKILL.md`
- `../legacy-data-dictionary/SKILL.md`
- `../legacy-data-flow/SKILL.md`
