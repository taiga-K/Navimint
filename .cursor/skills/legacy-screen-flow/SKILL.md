---
name: legacy-screen-flow
description: Reverse-engineer a screen inventory (画面一覧) and screen transition diagram (画面遷移図) from legacy desktop application source code with no documentation. Enumerates forms/dialogs, extracts navigation paths from form-open calls, and renders mermaid transition diagrams. Use when the user asks for 画面一覧, 画面遷移図, screen flow, screen list, or UI navigation analysis of a legacy codebase for rebuild requirements (リバースエンジニアリング, 新規作り直し). Companion to legacy-feature-inventory.
---

# Legacy Screen Flow

レガシーデスクトップアプリのソースコードから画面一覧と画面遷移図を復元するスキル。新規作り直しの要件定義のインプットを作ることが目的。`legacy-feature-inventory` と対で使う。

## 前提条件

- 入手できる情報は**ソースコードのみ**(ドキュメントなし、コメントなし、git 履歴なし)
- 実機での画面キャプチャ・操作確認はできない
- 機能一覧(`legacy-feature-inventory` の成果物)があれば Phase 2(画面列挙)の結果を再利用する。なければ本スキル内で列挙から行う

## 基本原則

1. 画面 ID は `S-001` 形式で採番し、機能一覧の機能 ID(F-XXX)と相互参照する
2. **モーダル(ShowDialog / ShowModal / DoModal)とモードレス(Show)を必ず区別する**。業務フローの直列/並行の違いとして要件に効く
3. 遷移には**契機**(どのメニュー・ボタン・条件か)を必ず付記する
4. すべての記述に確信度を付ける: `確定` / `推測` / `不明`(他スキルと共通)

## ワークフロー

```
- [ ] Phase 0: 入力確認
- [ ] Phase 1: 画面一覧の作成
- [ ] Phase 2: 遷移の抽出
- [ ] Phase 3: 遷移の契機・条件の特定
- [ ] Phase 4: 到達性の検証
- [ ] Phase 5: 成果物の出力
```

### Phase 0: 入力確認

機能一覧があれば画面の列挙結果と業務用語集を読み込む。なければ `legacy-feature-inventory` の language-map.md のパターンで画面定義ファイルを全列挙するところから始める。

### Phase 1: 画面一覧の作成

画面ごとに以下を記録する:

- 画面名: フォームタイトル(Caption / Text)を正とし、なければクラス名から推測
- 種別: `メニュー` / `入力` / `照会・検索` / `ダイアログ(確認・選択)` / `帳票プレビュー`
- 定義ファイル、対応する機能 ID
- MDI 親フォームは種別をコントロール構成の実態(多くは `メニュー`)で記録し、MDI 親である旨を備考に書く

種別はコントロール構成から推定する(グリッド中心 → 照会、テキストボックス+保存ボタン → 入力、ボタンのみ → メニュー)。

### Phase 2: 遷移の抽出

「画面を開くコード」を全 grep する。言語別パターン:

| スタック | 画面オープンのパターン |
|---|---|
| VB6 | `<フォーム名>.Show`(`vbModal` 引数でモーダル)、`Load <フォーム名>` |
| WinForms (C#/VB.NET) | `new <Form>()` + `.Show()` / `.ShowDialog()`、MDI: `MdiParent =` |
| WPF | `new <Window>()` + `.Show()` / `.ShowDialog()`、`NavigationService` / `Frame.Navigate` |
| Delphi | `T<Form>.Create` + `Show` / `ShowModal`、自動生成フォームは `.dpr` の `CreateForm` |
| MFC | `dlg.DoModal()`、`Create` + `ShowWindow`、`CView` の切り替え |

遷移として記録する属性: 遷移元 → 遷移先、モーダル/モードレス、戻り値の利用有無(ダイアログの結果で後続が分岐するか)。

### Phase 3: 遷移の契機・条件の特定

各遷移コードを含む関数を遡り、契機を特定する:

- メニュー項目 / ボタン / ダブルクリック / ファンクションキー
- 無条件か、条件付きか(権限・状態・設定による分岐があれば条件を記録)
- 起動時遷移(ログイン → メインメニュー等)は契機を `起動` とする

### Phase 4: 到達性の検証(相互検証)

起動画面から遷移を辿り、全画面への到達性を確認する。

- **どこからも遷移されない画面** = 孤立画面。次のいずれかなので必ず区別して記録する:
  1. 動的呼び出し(文字列からのフォーム生成・リフレクション)の死角 → 該当パターンを追加調査
  2. デッドスクリーン候補(作り直しスコープから外す候補) → 要調査リストへ
- 機能一覧の画面数と一致するかを突合し、差分があれば双方を修正する

### Phase 5: 成果物の出力

[output-template.md](output-template.md) のフォーマットで出力する。構成:

1. 調査サマリ
2. 画面一覧
3. 画面遷移図(mermaid)
4. 孤立画面リスト
5. 要調査リスト

## 静的解析の死角チェックリスト

- [ ] 文字列からのフォーム生成(`CreateObject` / `Activator.CreateInstance` / `Application.FindComponent`)
- [ ] タイマー・イベント起点で自動的に開くダイアログ(ユーザー操作以外の契機)
- [ ] MDI 子フォームの動的生成(同一フォームの複数インスタンス)
- [ ] 設定・権限テーブルによるメニュー項目の表示制御(コード上は遷移があるが特定ユーザーには見えない)
- [ ] `Shell` / `Process.Start` による別 EXE の画面起動(アプリ内遷移に見えない画面連携)

## 参照ファイル

- 成果物のフォーマット: [output-template.md](output-template.md)
- 画面定義ファイルの言語別パターン: `../legacy-feature-inventory/language-map.md`。ファイルが見つからない場合は `legacy-feature-inventory` スキルの language-map.md を探す。それもなければ本 SKILL.md の Phase 2 のパターン表で代替する
