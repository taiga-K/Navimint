# Language Map — 言語別の検索パターン

言語非依存の 4 概念(画面 / イベント / SQL / UI 文字列)を、技術スタックごとの具体的なファイル・パターンに対応付ける表。
Phase 0 で判定した言語の節だけを読めばよい。

新しい言語・パターンを発見したら、この表に追記すること。

## 判定の手がかり(拡張子 → スタック)

| 拡張子 | スタック |
|---|---|
| `.vbp` `.frm` `.bas` `.cls` `.ctl` | VB6 |
| `.sln` `.vbproj` + `.Designer.vb` | VB.NET (WinForms) |
| `.sln` `.csproj` + `.Designer.cs` | C# (WinForms) |
| `.csproj` + `.xaml` | C# (WPF) |
| `.dpr` `.dproj` `.pas` `.dfm` | Delphi |
| `.vcxproj` `.dsp` `.rc` + `.cpp` | C++ (MFC / Win32) |
| `.mdb` `.accdb`(エクスポートされた `.bas` / `.frm` テキスト) | Access VBA |
| `.pbl` のエクスポート(`.srw` `.srd` `.sru`) | PowerBuilder |
| `.java` + javax.swing import | Java (Swing) |

---

## VB6

| 概念 | 在り処 / grep パターン |
|---|---|
| 起動点 | `.vbp` 内の `Startup=`(Sub Main または起動フォーム) |
| 画面 | `.frm` ファイル全列挙。`Begin VB.Form` |
| イベント | `Private Sub .*_Click` `_Load` `_Change` `_KeyPress` `_Timer` |
| UI 文字列 | `.frm` 内の `Caption\s*=` `Text\s*=`(機械生成部なので確実にパース可) |
| メッセージ | `MsgBox` |
| SQL | `"SELECT` `"INSERT` `"UPDATE` `"DELETE` `"EXEC`(文字列連結に注意)、ADO: `.Execute` `.Open` `CommandText` |
| 帳票 | `.rpt`(Crystal Reports)、`Printer.` 直接制御、`.dsr`(DataReport) |
| 依存 | `.vbp` の `Reference=` `Object=`(COM / OCX) |
| 注意 | `On Error Resume Next` による暗黙のエラー握りつぶし、暗黙の型変換 |

## VB.NET / C# (WinForms)

| 概念 | 在り処 / grep パターン |
|---|---|
| 起動点 | `Program.cs` の `Application.Run` / VB.NET の `My.Application`(ApplicationEvents) |
| 画面 | `: Form` / `Inherits .*Form` を継承するクラス全列挙。`.Designer.cs` / `.Designer.vb` |
| イベント | C#: `+= new EventHandler` `_Click(object sender`、VB: `Handles .*\.Click` |
| UI 文字列 | `.Designer.*` 内の `.Text =`、`.resx` の `<value>` |
| メッセージ | `MessageBox.Show` |
| SQL | `CommandText` `SqlCommand` `OleDbCommand` `"SELECT` `"EXEC`、ORM があれば属性/マッピングファイル |
| 自動処理 | `Timer` `BackgroundWorker` `FileSystemWatcher` |
| 帳票 | `.rpt` `.rdlc`(ReportViewer)、ActiveReports |
| 依存 | `.csproj` / `.vbproj` の `<Reference>` `<COMReference>` |

## C# (WPF)

| 概念 | 在り処 / grep パターン |
|---|---|
| 画面 | `.xaml`(Window / Page / UserControl)全列挙 |
| イベント | XAML の `Click=` `Command=`(Command の場合は ViewModel の `ICommand` 実装を辿る) |
| UI 文字列 | XAML の `Content=` `Header=` `Text=`、`.resx` |
| その他 | WinForms の節に準ずる |

## Delphi

| 概念 | 在り処 / grep パターン |
|---|---|
| 起動点 | `.dpr` の `Application.CreateForm`(自動生成フォームの一覧でもある) |
| 画面 | `.dfm` ファイル全列挙(`object Form1: TForm1`) |
| イベント | `.dfm` の `OnClick =` + 対応する `.pas` の `procedure TForm1.xxxClick` |
| UI 文字列 | `.dfm` の `Caption =` `Text =` |
| メッセージ | `ShowMessage` `MessageDlg` `Application.MessageBox` |
| SQL | `TQuery` `TADOQuery` の `SQL.Text` / `SQL.Add`、`.dfm` 内の `SQL.Strings` |
| 帳票 | QuickReport(`TQuickRep`)、ReportBuilder、FastReport(`.fr3`) |
| 依存 | `uses` 句、BDE / ADO コンポーネント |

## C++ (MFC / Win32)

| 概念 | 在り処 / grep パターン |
|---|---|
| 起動点 | `WinMain` / `CWinApp::InitInstance` |
| 画面 | `.rc` の `DIALOG` / `DIALOGEX` リソース全列挙、`CDialog` / `CFormView` 派生クラス |
| イベント | メッセージマップ: `BEGIN_MESSAGE_MAP` 〜 `END_MESSAGE_MAP` の `ON_COMMAND` `ON_BN_CLICKED` |
| UI 文字列 | `.rc` の `STRINGTABLE` とダイアログ定義内のリテラル、`resource.h` の ID 対応 |
| メッセージ | `MessageBox` `AfxMessageBox` |
| SQL | ODBC: `SQLExecDirect` `CRecordset`、文字列リテラルの SQL |
| メニュー | `.rc` の `MENU` リソース(機能一覧の優良ソース) |

## Access VBA

| 概念 | 在り処 / grep パターン |
|---|---|
| 画面 | フォームオブジェクト一覧(エクスポートして調査する) |
| イベント | `Private Sub .*_Click` 等(VB6 とほぼ同じ) |
| ロジック | **クエリオブジェクト(保存されたクエリ)とマクロが機能の本体であることが多い** |
| 帳票 | レポートオブジェクト一覧 |
| 注意 | テーブル/クエリ/フォーム/レポート/マクロの一覧自体が機能一覧に近い。可能なら全オブジェクトのテキストエクスポートを依頼する |

## 共通(言語非依存)

| 対象 | パターン |
|---|---|
| DB 起点の逆引き | テーブル名・ストアド名で全ソースを grep(SQL 文字列は言語が違ってもほぼ同形)。言語混在時の相互検証の軸になる |
| 設定駆動の分岐 | `GetPrivateProfileString`(INI)、`Registry` / `RegOpenKey`、`ConfigurationManager` / `AppSettings`、設定値を読むテーブルへの SELECT |
| 外部連携 | `Shell` / `Process.Start` / `CreateProcess`、FTP / HTTP クライアント、固定パスへのファイル出力、`SmtpClient` / MAPI |
| 帳票・印刷 | `.rpt` `.rdlc` `.fr3` ファイル、`Printer` / `PrintDocument` / `StartDoc` |
