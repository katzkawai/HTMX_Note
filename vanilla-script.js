class NotesApp {
    constructor() {
        this.notes = [];
        this.editingId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadNotes();
    }

    bindEvents() {
        const form = document.getElementById('note-form');
        form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    async loadNotes() {
        try {
            const response = await fetch('/api/notes');
            if (!response.ok) {
                throw new Error('Failed to load notes');
            }
            this.notes = await response.json();
            this.renderNotes();
        } catch (error) {
            console.error('Error loading notes:', error);
            this.showError('メモの読み込みに失敗しました');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const titleInput = document.getElementById('title');
        const contentInput = document.getElementById('content');
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        
        if (!title || !content) {
            return;
        }

        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            });

            if (!response.ok) {
                throw new Error('Failed to create note');
            }

            const newNote = await response.json();
            this.notes.unshift(newNote);
            this.renderNotes();
            
            titleInput.value = '';
            contentInput.value = '';
        } catch (error) {
            console.error('Error creating note:', error);
            this.showError('メモの作成に失敗しました');
        }
    }

    async deleteNote(id) {
        if (!confirm('このメモを削除しますか？')) {
            return;
        }

        try {
            const response = await fetch(`/api/notes/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete note');
            }

            this.notes = this.notes.filter(note => note.id !== id);
            this.renderNotes();
        } catch (error) {
            console.error('Error deleting note:', error);
            this.showError('メモの削除に失敗しました');
        }
    }

    editNote(id) {
        this.editingId = id;
        this.renderNotes();
    }

    cancelEdit() {
        this.editingId = null;
        this.renderNotes();
    }

    async saveEdit(id) {
        const titleInput = document.querySelector(`#edit-title-${id}`);
        const contentInput = document.querySelector(`#edit-content-${id}`);
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        
        if (!title || !content) {
            return;
        }

        try {
            const response = await fetch(`/api/notes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            });

            if (!response.ok) {
                throw new Error('Failed to update note');
            }

            const updatedNote = await response.json();
            const index = this.notes.findIndex(note => note.id === id);
            if (index !== -1) {
                this.notes[index] = updatedNote;
            }
            
            this.editingId = null;
            this.renderNotes();
        } catch (error) {
            console.error('Error updating note:', error);
            this.showError('メモの更新に失敗しました');
        }
    }

    renderNotes() {
        const notesList = document.getElementById('notes-list');
        
        if (this.notes.length === 0) {
            notesList.innerHTML = '<div class="loading">メモがありません</div>';
            return;
        }

        notesList.innerHTML = this.notes.map(note => {
            if (this.editingId === note.id) {
                return this.renderEditForm(note);
            } else {
                return this.renderNote(note);
            }
        }).join('');

        this.bindNoteEvents();
    }

    renderNote(note) {
        const date = new Date(note.createdAt).toLocaleString('ja-JP');
        return `
            <div class="note-item" id="note-${note.id}">
                <div class="note-header">
                    <h3>${this.escapeHtml(note.title)}</h3>
                    <div class="note-actions">
                        <button class="edit-btn" data-action="edit" data-id="${note.id}">編集</button>
                        <button class="delete-btn" data-action="delete" data-id="${note.id}">削除</button>
                    </div>
                </div>
                <div class="note-content">
                    <p>${this.escapeHtml(note.content)}</p>
                </div>
                <div class="note-date">
                    ${date}
                </div>
            </div>
        `;
    }

    renderEditForm(note) {
        return `
            <div class="note-item edit-form" id="note-${note.id}">
                <div class="form-group">
                    <input type="text" id="edit-title-${note.id}" value="${this.escapeHtml(note.title)}" required>
                </div>
                <div class="form-group">
                    <textarea id="edit-content-${note.id}" rows="4" required>${this.escapeHtml(note.content)}</textarea>
                </div>
                <div class="form-actions">
                    <button class="save-btn" data-action="save" data-id="${note.id}">保存</button>
                    <button class="cancel-btn" data-action="cancel" data-id="${note.id}">キャンセル</button>
                </div>
            </div>
        `;
    }

    bindNoteEvents() {
        const notesList = document.getElementById('notes-list');
        
        notesList.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const id = parseInt(e.target.dataset.id);
            
            switch (action) {
                case 'edit':
                    this.editNote(id);
                    break;
                case 'delete':
                    this.deleteNote(id);
                    break;
                case 'save':
                    this.saveEdit(id);
                    break;
                case 'cancel':
                    this.cancelEdit();
                    break;
            }
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = `<div class="error">${message}</div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NotesApp();
});