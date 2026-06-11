---
name: legacy-data-flow
description: Reverse-engineer a data flow diagram (データフロー図/DFD) and external interface inventory (外部連携一覧) from legacy source code. Enumerates file I/O, network calls, mail, external process launches, and shared DB access; recovers file layouts and renders mermaid DFDs. Use when the user asks for データフロー図, 外部連携一覧, external interfaces, file layouts, インタフェース一覧, or integration analysis of a legacy codebase for rebuild requirements (リバースエンジニアリング, 新規作り直し). Companion to legacy-feature-inventory.
---

# Legacy Data Flow

レガシーシステムの外部連携一覧とデータフロー図(DFD)を復元するスキル。新システムの外部インタフェース要件と移行時の連携切替計画のインプットを作ることが目的。

## 前提条件

- 入手できる情報は**ソースコードのみ**(ドキュメントなし、コメントなし、git 履歴なし)
- 連携相手システムの情報・運用手順は入手できない(相手の実態は常に推測になる)
- 機能一覧(`legacy-feature-inventory`)の CRUD マトリクスがあれば再利用する

## 基本原則

1. 連携 ID は `IF-001` 形式で採番し、契機となる機能 ID(F-XXX)と紐付ける
2. **方向(IN / OUT)・契機・フォーマット・接続先**を連携ごとに必ず揃える。1 つでも欠けたら欠けた属性を `不明` と明記する
3. 接続先(相手システム)はパス名・サーバー名・ファイル名からの**推測**にしかならない。推測根拠を必ず書く
4. 確信度 3 値は他スキルと共通: `確定` / `推測` / `不明`

## ワークフロー

```
- [ ] Phase 0: 入力確認
- [ ] Phase 1: 連携口の列挙
- [ ] Phase 2: 連携属性の特定
- [ ] Phase 3: ファイルレイアウトの復元
- [ ] Phase 4: 相手システムの推定
- [ ] Phase 5: 相互検証
- [ ] Phase 6: 成果物の出力
```

### Phase 0: 入力確認

機能一覧と CRUD マトリクスを読み込む。なければ最低限、バッチ・連携系のエントリポイント列挙だけ先に行う(`legacy-feature-inventory` Phase 2 相当)。

### Phase 1: 連携口の列挙

「システムの境界を越えるデータの出入口」を全 grep する。種類別パターン:

| 種類 | 検出パターン(言語横断) |
|---|---|
| ファイル入出力 | `Open ... For Input/Output`(VB6)、`StreamReader/Writer` `File.` (.NET)、`AssignFile`(Delphi)、`fopen`(C)。**固定パス・UNC パス(`\\server\...`)・ドライブレター直書き**を最優先で拾う |
| ネットワーク | FTP / HTTP クライアント、`Winsock`、`WebClient` / `HttpWebRequest`、ソケット |
| メール | `SmtpClient`、MAPI、`CDO.Message`、Outlook オートメーション |
| 外部プロセス | `Shell` / `Process.Start` / `ShellExecute` / `CreateProcess`(別 EXE・バッチファイルの起動) |
| 別 DB / リンク | 接続文字列が複数種類ないか(メイン DB 以外への接続)、Access リンクテーブル、DB リンク |
| 帳票・印刷 | 出力先がファイル(PDF/CSV 保存)の帳票は連携の可能性あり |
| クリップボード / OLE | Excel オートメーション(`CreateObject("Excel.Application")`)による出力 |

接続先・パスが**設定ファイル / レジストリ / 設定テーブル**から読まれている場合は、その設定キー名も記録する(実環境での値が要調査になる)。

### Phase 2: 連携属性の特定

連携ごとに記録する属性:

- **方向**: IN(取り込み) / OUT(出力) / 双方向
- **契機**: どの機能(F-XXX)・どのバッチから実行されるか。手動ボタンか自動(Timer)か
- **頻度の手がかり**: Timer 間隔、ファイル名の日付パターン(`YYYYMMDD` → 日次と推測)
- **エラー時挙動**: 連携失敗時にどうなるか(リトライ / 無視 / 業務停止)。`On Error Resume Next` 配下なら「失敗を検知しない」と記録する

### Phase 3: ファイルレイアウトの復元

ファイル連携はレイアウトが事実上のインタフェース仕様。読み書きコードから復元する:

- CSV: Split / 結合のカラム順、区切り文字、ヘッダ行の有無、引用符処理
- 固定長: Mid / Substring のオフセットと長さ(バイト単位か文字単位かを明記。全角混在時に重要)
- 文字コード: 明示指定があれば確定、なければ言語デフォルト(VB6 は Shift_JIS 等)を `推測` で記録
- 各項目は DB カラムとの対応(どのテーブルのどのカラムを出力しているか)まで書く

### Phase 4: 相手システムの推定

パス名(`\\KEIRI-SV\import\`)、ファイル名(`juchu_to_kaikei.csv`)、URL、メール宛先から相手を推測する。**推測である旨と根拠を必ず明記**し、相手の実在確認を要調査リストへ送る(10 年の間に相手システムが廃止され、誰も読まないファイルを出力し続けているケースは珍しくない)。

### Phase 5: 相互検証

- CRUD マトリクスで「**どの機能からも書かれないのに読まれているテーブル**」→ 外部システムが直接書き込んでいる疑い。共有 DB 連携として IF 一覧に追加する(確信度: 推測)
- IN 連携の取り込みファイルについて「誰が置くのか」がコードから不明なもの → 手作業運用または他システムの出力。要調査リストへ
- OUT 連携の出力先を読むコードがこのコードベースにない → 相手は外部。IF 一覧に残す

### Phase 6: 成果物の出力

[output-template.md](output-template.md) のフォーマットで出力する。構成:

1. 調査サマリ
2. 外部連携一覧
3. ファイルレイアウト定義
4. データフロー図(mermaid)
5. 要調査リスト

## 静的解析の死角チェックリスト

- [ ] 共有 DB を直接読み書きする他システム(このコードベースには一切現れない)
- [ ] タスクスケジューラ等で起動される別 EXE / バッチファイル(ソース未入手の可能性)
- [ ] 手作業運用(人がファイルをコピーする・Excel に貼る等。コードに写らない)
- [ ] 設定値で無効化されている連携(コード上は存在するが実環境では動いていない)
- [ ] 相手システムの廃止(出力先が既に誰にも読まれていない)

## 参照ファイル

- 成果物のフォーマット: [output-template.md](output-template.md)
- 外部連携の言語別パターン: `../legacy-feature-inventory/language-map.md`(共通セクション)。ファイルが見つからない場合は `legacy-feature-inventory` スキルの language-map.md を探す。それもなければ本 SKILL.md の Phase 1 のパターン表で代替する
