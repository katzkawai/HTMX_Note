# メモ帳アプリ（HTMX vs Vanilla JavaScript 比較版）

同じ機能を**HTMX**と**Vanilla JavaScript**の2つの異なる手法で実装したメモ帳アプリです。両方の実装を比較して、それぞれのアプローチの違いを学習できます。

## 2つの実装アプローチ

このプロジェクトでは、全く同じ機能を持つメモ帳アプリを2つの異なる技術で実装しています：

- **HTMX版**: `http://localhost:3000/` - HTMLの属性だけで動的操作を実現
- **Vanilla JavaScript版**: `http://localhost:3000/vanilla` - 従来のJavaScriptでDOM操作とAPI通信を実装

### アクセス方法
- サーバー起動後、各ページの上部にあるナビゲーションボタンで簡単に切り替え可能
- 同じデータを共有するため、一方で作成したメモはもう一方でも表示される

## 実装方式の比較

### HTMX版の特徴

**アプローチ**: 宣言的プログラミング
- HTMLの属性（`hx-*`）だけで動的操作を定義
- JavaScriptコードを一切書かない
- サーバーからHTMLフラグメントを受け取って画面を更新

**使用している主な属性**:
- `hx-post`: POSTリクエストを送信（メモの追加）
- `hx-get`: GETリクエストを送信（メモの取得・編集フォーム表示）
- `hx-put`: PUTリクエストを送信（メモの更新）
- `hx-delete`: DELETEリクエストを送信（メモの削除）
- `hx-target`: レスポンスを挿入する対象要素を指定
- `hx-swap`: レスポンスの挿入方法を指定
- `hx-confirm`: 削除前の確認ダイアログを表示

**サーバーサイド**:
```javascript
// HTMLフラグメントを返す
app.post('/notes', (req, res) => {
    // ... メモ作成処理
    res.send(noteHtml); // HTMLを直接返す
});
```

### Vanilla JavaScript版の特徴

**アプローチ**: 命令的プログラミング
- JavaScriptでDOM操作とイベント処理を明示的に実装
- fetch APIを使用してAjax通信を実装
- サーバーからJSONデータを受け取ってクライアントで画面を構築

**主な実装要素**:
- ES6クラスベースの設計（`NotesApp`クラス）
- 非同期処理（`async/await`）
- イベントリスナーによるユーザーインタラクション制御
- クライアントサイドでのHTML生成とDOM操作

**サーバーサイド**:
```javascript
// JSONデータを返す
app.post('/api/notes', (req, res) => {
    // ... メモ作成処理
    res.json(newNote); // JSONオブジェクトを返す
});
```

### 技術的な違いの比較表

| 項目 | HTMX版 | Vanilla JavaScript版 |
|------|--------|---------------------|
| **クライアントコード量** | 0行（HTMLのみ） | 約200行のJavaScript |
| **学習コスト** | 低（HTML属性のみ） | 中（JavaScript知識必要） |
| **サーバーレスポンス** | HTMLフラグメント | JSONデータ |
| **DOM操作** | HTMX自動処理 | 手動実装 |
| **エラーハンドリング** | 限定的 | 柔軟な制御可能 |
| **カスタマイズ性** | 中程度 | 高い |
| **デバッグ** | シンプル | JavaScriptデバッガー使用 |
| **バンドルサイズ** | HTMX（~14KB） | 0KB（ブラウザ標準API） |

## 機能詳細

### 1. メモの追加
- タイトルと内容を入力してフォームを送信
- ページリロードなしで新しいメモが一覧の先頭に追加される
- フォームは自動的にクリアされる

### 2. メモの編集
- 各メモの「編集」ボタンをクリック
- インライン編集フォームが表示される
- 変更を保存またはキャンセルが可能

### 3. メモの削除
- 各メモの「削除」ボタンをクリック
- 確認ダイアログが表示される
- 確認後、メモが一覧から削除される

### 4. リアルタイム更新
- 全ての操作でページリロードが不要
- サーバーからHTMLフラグメントを受信して画面を更新
- スムーズなユーザー体験を提供

## 技術スタック

### 共通
- **バックエンド**: Node.js, Express.js
- **データストレージ**: メモリ内配列（開発用）
- **スタイル**: CSS3（レスポンシブデザイン対応）

### HTMX版
- **フロントエンド**: HTMX, HTML5
- **通信**: HTMLフラグメント

### Vanilla JavaScript版
- **フロントエンド**: HTML5, Vanilla JavaScript（ES6+）
- **通信**: JSON API（fetch API使用）

## 起動方法

### 必要な環境
- **Node.js** (v14以上推奨)
- **npm** (Node.jsに同梱)

### ステップバイステップの起動手順

#### 1. プロジェクトのクローン
```bash
git clone https://github.com/katzkawai/HTMX_Note.git
cd HTMX_Note
```

#### 2. 依存関係のインストール
```bash
npm install
```
このコマンドで以下のパッケージがインストールされます：
- `express`: Webサーバーフレームワーク
- `nodemon`: 開発用の自動再起動ツール

#### 3. サーバーの起動
**本番モード（推奨）:**
```bash
npm start
```

**開発モード（ファイル変更時の自動再起動）:**
```bash
npm run dev
```

#### 4. アプリケーションへのアクセス
ブラウザで以下のURLにアクセスしてください：
```
HTMX版: http://localhost:3000
Vanilla JavaScript版: http://localhost:3000/vanilla
```

### 起動確認

サーバーが正常に起動すると、ターミナルに以下のメッセージが表示されます：
```
サーバーがポート3000で起動しました
http://localhost:3000 でアクセスできます
HTMX版: http://localhost:3000
Vanilla JS版: http://localhost:3000/vanilla
```

### トラブルシューティング

#### ポート3000が使用中の場合
```bash
# 使用中のプロセスを確認
lsof -i :3000

# または別のポートで起動
PORT=3001 npm start
```

#### Node.jsのバージョン確認
```bash
node --version
npm --version
```

## プロジェクト構成

```
HTMX_Note/
├── index.html          # HTMX版のHTMLファイル
├── vanilla.html        # Vanilla JavaScript版のHTMLファイル
├── server.js           # Express サーバー（両バージョン対応）
├── style.css           # HTMX版のスタイルシート
├── vanilla-style.css   # Vanilla JavaScript版のスタイルシート
├── vanilla-script.js   # Vanilla JavaScript版のクライアントロジック
├── CLAUDE.md          # 開発者向けプロジェクト情報
├── package.json       # プロジェクト設定
├── package-lock.json  # 依存関係の詳細
├── README.md          # このファイル
└── node_modules/      # インストールされた依存関係
```

## 学習のポイント

このプロジェクトを通して以下の技術を学ぶことができます：

### HTMX関連
1. **HTMX の基本的な使い方**
   - 宣言的なAJAX操作
   - DOM操作の簡略化
   - サーバーサイドレンダリングとの組み合わせ

2. **HTMLフラグメント設計**
   - 部分的なHTML更新
   - サーバーサイドテンプレート生成

### Vanilla JavaScript関連
3. **モダンJavaScript**
   - ES6+の非同期処理（async/await）
   - クラスベース設計
   - fetch APIの使用

4. **DOM操作とイベント処理**
   - 動的コンテンツ生成
   - イベント委譲パターン
   - XSSセキュリティ対策

### 共通技術
5. **Express.js の基礎**
   - RESTful API の実装
   - HTMLとJSONの両レスポンス対応
   - ミドルウェアの使用

6. **レスポンシブデザイン**
   - モバイル対応のCSS設計
   - 一貫したUI/UX

7. **Git/GitHub の使用**
   - バージョン管理の実践

### アーキテクチャ比較
8. **設計パターンの理解**
   - 宣言的 vs 命令的プログラミング
   - サーバーサイドレンダリング vs クライアントサイドレンダリング
   - それぞれのメリット・デメリット

## 更新履歴

### 2025-06-16
- **HTMX v2へのアップグレード**
  - HTMXのバージョンを1.9.12から2.0.3に更新
  - CDNのURLを最新版に変更
  - 既存の機能は全て互換性があるため、動作に変更なし
  - より安定したパフォーマンスと最新の機能に対応