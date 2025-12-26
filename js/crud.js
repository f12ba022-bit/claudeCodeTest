// タスク管理アプリケーション - CRUD with localStorage

class TaskManager {
    constructor() {
        this.tasks = [];
        this.editingTaskId = null;
        this.currentFilter = 'all';
        this.init();
    }

    // 初期化
    init() {
        this.loadTasks();
        this.attachEventListeners();
        this.renderTasks();
        this.updateStats();
    }

    // LocalStorageからタスクを読み込み (READ)
    loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            try {
                this.tasks = JSON.parse(storedTasks);
            } catch (error) {
                console.error('タスクの読み込みに失敗しました:', error);
                this.tasks = [];
            }
        }
    }

    // LocalStorageにタスクを保存
    saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('タスクの保存に失敗しました:', error);
            alert('タスクの保存に失敗しました。ストレージの容量を確認してください。');
        }
    }

    // イベントリスナーを設定
    attachEventListeners() {
        // フォーム送信
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // キャンセルボタン
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelEdit();
        });

        // 全削除ボタン
        document.getElementById('clearAll').addEventListener('click', () => {
            this.clearAllTasks();
        });

        // フィルターボタン
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    // フォーム送信処理
    handleSubmit() {
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority').value;

        if (!title) {
            alert('タイトルを入力してください。');
            return;
        }

        if (this.editingTaskId !== null) {
            // 更新 (UPDATE)
            this.updateTask(this.editingTaskId, title, description, priority);
        } else {
            // 作成 (CREATE)
            this.createTask(title, description, priority);
        }

        this.resetForm();
    }

    // タスクを作成 (CREATE)
    createTask(title, description, priority) {
        const task = {
            id: Date.now(),
            title: title,
            description: description,
            priority: priority,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.tasks.unshift(task); // 配列の先頭に追加
        this.saveTasks();
        this.renderTasks();
        this.updateStats();

        this.showNotification('タスクを追加しました！', 'success');
    }

    // タスクを更新 (UPDATE)
    updateTask(taskId, title, description, priority) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);

        if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                title: title,
                description: description,
                priority: priority,
                updatedAt: new Date().toISOString()
            };

            this.saveTasks();
            this.renderTasks();
            this.updateStats();

            this.showNotification('タスクを更新しました！', 'success');
        }
    }

    // タスクを削除 (DELETE)
    deleteTask(taskId) {
        if (!confirm('このタスクを削除してもよろしいですか？')) {
            return;
        }

        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();

        this.showNotification('タスクを削除しました！', 'info');
    }

    // 全タスクを削除
    clearAllTasks() {
        if (this.tasks.length === 0) {
            alert('削除するタスクがありません。');
            return;
        }

        if (!confirm(`全ての タスク（${this.tasks.length}件）を削除してもよろしいですか？`)) {
            return;
        }

        this.tasks = [];
        this.saveTasks();
        this.renderTasks();
        this.updateStats();

        this.showNotification('全てのタスクを削除しました！', 'info');
    }

    // タスクを編集モードに設定
    editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);

        if (task) {
            this.editingTaskId = taskId;
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskPriority').value = task.priority;

            document.getElementById('btnText').textContent = '更新';
            document.getElementById('cancelBtn').style.display = 'inline-block';

            // フォームまでスクロール
            document.querySelector('.task-form-section').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // 編集をキャンセル
    cancelEdit() {
        this.editingTaskId = null;
        this.resetForm();
    }

    // フォームをリセット
    resetForm() {
        document.getElementById('taskForm').reset();
        document.getElementById('btnText').textContent = '追加';
        document.getElementById('cancelBtn').style.display = 'none';
        this.editingTaskId = null;
    }

    // フィルターを設定
    setFilter(filter) {
        this.currentFilter = filter;

        // フィルターボタンのアクティブ状態を更新
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.renderTasks();
    }

    // タスクをフィルタリング
    getFilteredTasks() {
        if (this.currentFilter === 'all') {
            return this.tasks;
        }
        return this.tasks.filter(task => task.priority === this.currentFilter);
    }

    // タスクを画面に表示 (READ)
    renderTasks() {
        const taskList = document.getElementById('taskList');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p class="empty-message">タスクがありません。上のフォームから追加してください。</p>';
            return;
        }

        taskList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');

        // 削除ボタンと編集ボタンにイベントリスナーを追加
        filteredTasks.forEach(task => {
            document.getElementById(`delete-${task.id}`).addEventListener('click', () => {
                this.deleteTask(task.id);
            });

            document.getElementById(`edit-${task.id}`).addEventListener('click', () => {
                this.editTask(task.id);
            });
        });
    }

    // タスクのHTML要素を生成
    createTaskHTML(task) {
        const createdDate = new Date(task.createdAt).toLocaleString('ja-JP');
        const priorityLabel = {
            high: '高',
            medium: '中',
            low: '低'
        };

        return `
            <div class="task-item priority-${task.priority}">
                <div class="task-header">
                    <div>
                        <div class="task-title">${this.escapeHTML(task.title)}</div>
                        <span class="task-priority priority-${task.priority}">
                            優先度: ${priorityLabel[task.priority]}
                        </span>
                    </div>
                </div>
                ${task.description ? `<div class="task-description">${this.escapeHTML(task.description)}</div>` : ''}
                <div class="task-meta">
                    <span class="task-date">作成日: ${createdDate}</span>
                    <div class="task-actions">
                        <button class="edit-btn" id="edit-${task.id}">編集</button>
                        <button class="delete-btn" id="delete-${task.id}">削除</button>
                    </div>
                </div>
            </div>
        `;
    }

    // 統計情報を更新
    updateStats() {
        const total = this.tasks.length;
        const high = this.tasks.filter(task => task.priority === 'high').length;
        const medium = this.tasks.filter(task => task.priority === 'medium').length;
        const low = this.tasks.filter(task => task.priority === 'low').length;

        document.getElementById('taskCount').textContent = `${total} 件のタスク`;
        document.getElementById('totalTasks').textContent = total;
        document.getElementById('highPriorityTasks').textContent = high;
        document.getElementById('mediumPriorityTasks').textContent = medium;
        document.getElementById('lowPriorityTasks').textContent = low;
    }

    // 通知を表示
    showNotification(message, type = 'success') {
        // 簡易的な通知（実際のプロジェクトではより洗練された実装を推奨）
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#28a745' : '#17a2b8'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // HTMLエスケープ（XSS対策）
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// アニメーション用CSS（動的に追加）
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
