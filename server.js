const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('.'));

let notes = [
    { id: 1, title: 'サンプルメモ', content: 'これはサンプルのメモです。', createdAt: new Date() }
];
let nextId = 2;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/notes', (req, res) => {
    const notesHtml = notes.map(note => `
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
    `).join('');
    
    res.send(notesHtml);
});

app.post('/notes', (req, res) => {
    const { title, content } = req.body;
    const newNote = {
        id: nextId++,
        title,
        content,
        createdAt: new Date()
    };
    notes.unshift(newNote);
    
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
    
    req.app.locals.lastForm = req.body;
    res.send(noteHtml);
});

app.get('/notes/:id/edit', (req, res) => {
    const noteId = parseInt(req.params.id);
    const note = notes.find(n => n.id === noteId);
    
    if (!note) {
        return res.status(404).send('<div class="error">メモが見つかりません</div>');
    }
    
    const editFormHtml = `
        <div class="note-item edit-form" id="note-${note.id}">
            <form hx-put="/notes/${note.id}" hx-target="#note-${note.id}" hx-swap="outerHTML">
                <div class="form-group">
                    <input type="text" name="title" value="${note.title}" required>
                </div>
                <div class="form-group">
                    <textarea name="content" rows="4" required>${note.content}</textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="save-btn">保存</button>
                    <button type="button" class="cancel-btn" hx-get="/notes/${note.id}" hx-target="#note-${note.id}" hx-swap="outerHTML">キャンセル</button>
                </div>
            </form>
        </div>
    `;
    
    res.send(editFormHtml);
});

app.get('/notes/:id', (req, res) => {
    const noteId = parseInt(req.params.id);
    const note = notes.find(n => n.id === noteId);
    
    if (!note) {
        return res.status(404).send('<div class="error">メモが見つかりません</div>');
    }
    
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
    
    res.send(noteHtml);
});

app.put('/notes/:id', (req, res) => {
    const noteId = parseInt(req.params.id);
    const { title, content } = req.body;
    const noteIndex = notes.findIndex(n => n.id === noteId);
    
    if (noteIndex === -1) {
        return res.status(404).send('<div class="error">メモが見つかりません</div>');
    }
    
    notes[noteIndex] = { ...notes[noteIndex], title, content };
    const updatedNote = notes[noteIndex];
    
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
    
    res.send(noteHtml);
});

app.delete('/notes/:id', (req, res) => {
    const noteId = parseInt(req.params.id);
    notes = notes.filter(n => n.id !== noteId);
    res.send('');
});

app.listen(PORT, () => {
    console.log(`サーバーがポート${PORT}で起動しました`);
    console.log(`http://localhost:${PORT} でアクセスできます`);
});