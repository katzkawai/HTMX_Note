// 必要なライブラリを読み込む
const express = require('express'); // Webサーバーを作るためのフレームワーク
const path = require('path');       // ファイルパスを扱うためのライブラリ
const app = express();              // Expressアプリケーションを作成
const PORT = 3000;                  // サーバーが使用するポート番号

// ミドルウェアの設定（リクエストの前処理を行う機能）
app.use(express.urlencoded({ extended: true })); // フォームデータを解析できるようにする
app.use(express.json());                         // JSON形式のデータを解析できるようにする
app.use(express.static('.'));                    // 静的ファイル（HTML、CSS等）を配信する設定

// メモのデータを保存する配列（本来はデータベースを使用）
let notes = [
    { id: 1, title: 'サンプルメモ', content: 'これはサンプルのメモです。', createdAt: new Date() }
];
let nextId = 2; // 新しいメモに割り当てるIDの番号

// ルートパス（'/'）にアクセスされた時の処理
app.get('/', (req, res) => {
    // index.htmlファイルを送信する
    res.sendFile(path.join(__dirname, 'index.html'));
});

// メモ一覧を取得するAPI（GETリクエスト）
app.get('/notes', (req, res) => {
    // メモの配列をHTMLに変換する
    const notesHtml = notes.map(note => `
        <div class="note-item" id="note-${note.id}">
            <div class="note-header">
                <h3>${note.title}</h3>
                <div class="note-actions">
                    <!-- 編集ボタン：クリックすると編集フォームを表示 -->
                    <button class="edit-btn" hx-get="/notes/${note.id}/edit" hx-target="#note-${note.id}" hx-swap="outerHTML">編集</button>
                    <!-- 削除ボタン：クリックすると確認後にメモを削除 -->
                    <button class="delete-btn" hx-delete="/notes/${note.id}" hx-target="#note-${note.id}" hx-swap="outerHTML" hx-confirm="このメモを削除しますか？">削除</button>
                </div>
            </div>
            <div class="note-content">
                <p>${note.content}</p>
            </div>
            <div class="note-date">
                ${note.createdAt.toLocaleString('ja-JP')}
            </div>
        </div>
    `).join(''); // 配列の要素を結合して一つの文字列にする
    
    // 生成したHTMLをクライアントに送信
    res.send(notesHtml);
});

// 新しいメモを追加するAPI（POSTリクエスト）
app.post('/notes', (req, res) => {
    // リクエストボディからタイトルと内容を取得
    const { title, content } = req.body;
    
    // 新しいメモオブジェクトを作成
    const newNote = {
        id: nextId++,           // IDを自動採番
        title,                  // フォームから送信されたタイトル
        content,                // フォームから送信された内容
        createdAt: new Date()   // 現在の日時を作成日時に設定
    };
    
    // 新しいメモを配列の先頭に追加（最新のメモが上に表示される）
    notes.unshift(newNote);
    
    // 新しく作成されたメモのHTMLを生成
    const noteHtml = `
        <div class="note-item" id="note-${newNote.id}">
            <div class="note-header">
                <h3>${newNote.title}</h3>
                <div class="note-actions">
                    <button class="edit-btn" hx-get="/notes/${newNote.id}/edit" hx-target="#note-${newNote.id}" hx-swap="outerHTML">編集</button>
                    <button class="delete-btn" hx-delete="/notes/${newNote.id}" hx-target="#note-${newNote.id}" hx-swap="outerHTML" hx-confirm="このメモを削除しますか？">削除</button>
                </div>
            </div>
            <div class="note-content">
                <p>${newNote.content}</p>
            </div>
            <div class="note-date">
                ${newNote.createdAt.toLocaleString('ja-JP')}
            </div>
        </div>
    `;
    
    // 最後に送信されたフォームデータを保存（デバッグ用）
    req.app.locals.lastForm = req.body;
    
    // 新しいメモのHTMLをクライアントに送信
    res.send(noteHtml);
});

// 特定のメモの編集フォームを表示するAPI
app.get('/notes/:id/edit', (req, res) => {
    // URLパラメータからメモのIDを取得し、数値に変換
    const noteId = parseInt(req.params.id);
    // 指定されたIDのメモを検索
    const note = notes.find(n => n.id === noteId);
    
    // メモが見つからない場合はエラーを返す
    if (!note) {
        return res.status(404).send('<div class="error">メモが見つかりません</div>');
    }
    
    // 編集フォームのHTMLを生成
    const editFormHtml = `
        <div class="note-item edit-form" id="note-${note.id}">
            <!-- hx-put: PUTリクエストを送信してメモを更新 -->
            <form hx-put="/notes/${note.id}" hx-target="#note-${note.id}" hx-swap="outerHTML">
                <div class="form-group">
                    <!-- 現在のタイトルを初期値として設定 -->
                    <input type="text" name="title" value="${note.title}" required>
                </div>
                <div class="form-group">
                    <!-- 現在の内容を初期値として設定 -->
                    <textarea name="content" rows="4" required>${note.content}</textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="save-btn">保存</button>
                    <!-- キャンセルボタン：編集を取り消して元の表示に戻る -->
                    <button type="button" class="cancel-btn" hx-get="/notes/${note.id}" hx-target="#note-${note.id}" hx-swap="outerHTML">キャンセル</button>
                </div>
            </form>
        </div>
    `;
    
    // 編集フォームのHTMLをクライアントに送信
    res.send(editFormHtml);
});

// 特定のメモの詳細を取得するAPI（編集キャンセル時に使用）
app.get('/notes/:id', (req, res) => {
    // URLパラメータからメモのIDを取得し、数値に変換
    const noteId = parseInt(req.params.id);
    // 指定されたIDのメモを検索
    const note = notes.find(n => n.id === noteId);
    
    // メモが見つからない場合はエラーを返す
    if (!note) {
        return res.status(404).send('<div class="error">メモが見つかりません</div>');
    }
    
    // メモの表示用HTMLを生成
    const noteHtml = `
        <div class="note-item" id="note-${note.id}">
            <div class="note-header">
                <h3>${note.title}</h3>
                <div class="note-actions">
                    <button class="edit-btn" hx-get="/notes/${note.id}/edit" hx-target="#note-${note.id}" hx-swap="outerHTML">編集</button>
                    <button class="delete-btn" hx-delete="/notes/${note.id}" hx-target="#note-${note.id}" hx-swap="outerHTML" hx-confirm="このメモを削除しますか？">削除</button>
                </div>
            </div>
            <div class="note-content">
                <p>${note.content}</p>
            </div>
            <div class="note-date">
                ${note.createdAt.toLocaleString('ja-JP')}
            </div>
        </div>
    `;
    
    // メモのHTMLをクライアントに送信
    res.send(noteHtml);
});

// 既存のメモを更新するAPI（PUTリクエスト）
app.put('/notes/:id', (req, res) => {
    // URLパラメータからメモのIDを取得し、数値に変換
    const noteId = parseInt(req.params.id);
    // リクエストボディから更新されたタイトルと内容を取得
    const { title, content } = req.body;
    // 指定されたIDのメモのインデックスを検索
    const noteIndex = notes.findIndex(n => n.id === noteId);
    
    // メモが見つからない場合はエラーを返す
    if (noteIndex === -1) {
        return res.status(404).send('<div class="error">メモが見つかりません</div>');
    }
    
    // 既存のメモを更新（作成日時は保持）
    notes[noteIndex] = { ...notes[noteIndex], title, content };
    const updatedNote = notes[noteIndex];
    
    // 更新されたメモの表示用HTMLを生成
    const noteHtml = `
        <div class="note-item" id="note-${updatedNote.id}">
            <div class="note-header">
                <h3>${updatedNote.title}</h3>
                <div class="note-actions">
                    <button class="edit-btn" hx-get="/notes/${updatedNote.id}/edit" hx-target="#note-${updatedNote.id}" hx-swap="outerHTML">編集</button>
                    <button class="delete-btn" hx-delete="/notes/${updatedNote.id}" hx-target="#note-${updatedNote.id}" hx-swap="outerHTML" hx-confirm="このメモを削除しますか？">削除</button>
                </div>
            </div>
            <div class="note-content">
                <p>${updatedNote.content}</p>
            </div>
            <div class="note-date">
                ${updatedNote.createdAt.toLocaleString('ja-JP')}
            </div>
        </div>
    `;
    
    // 更新されたメモのHTMLをクライアントに送信
    res.send(noteHtml);
});

// メモを削除するAPI（DELETEリクエスト）
app.delete('/notes/:id', (req, res) => {
    // URLパラメータからメモのIDを取得し、数値に変換
    const noteId = parseInt(req.params.id);
    // 指定されたID以外のメモだけを残してフィルタリング
    notes = notes.filter(n => n.id !== noteId);
    // 空のレスポンスを送信（要素がDOMから削除される）
    res.send('');
});

// サーバーを起動する
app.listen(PORT, () => {
    console.log(`サーバーがポート${PORT}で起動しました`);
    console.log(`http://localhost:${PORT} でアクセスできます`);
});