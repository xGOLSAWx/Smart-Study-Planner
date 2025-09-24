/* app.js
   Smart Study Planner (SSP) - Simplified
   - Only Add Task, Mark Done/Undo, Delete
   - LocalStorage key: "ssp_tasks"
*/

(() => {
  const STORAGE_KEY = 'ssp_tasks';
  let tasks = []; // { id, name, subject, date, time, done }

  // --- DOM ---
  const form = document.getElementById('task-form');
  const inputName = document.getElementById('task-name');
  const inputSubject = document.getElementById('task-subject');
  const inputDate = document.getElementById('task-date');
  const inputTime = document.getElementById('task-time');
  const submitBtn = document.getElementById('task-submit');
  const tasksList = document.getElementById('tasks-list');

  // --- Storage helpers ---
  const saveToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  };
  const loadFromStorage = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  };

  // --- Utils ---
  const uid = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const escapeHtml = (str) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  // --- Render ---
  const renderTask = (task) => {
    const li = document.createElement('li');
    li.className = 'task-card';
    li.dataset.id = task.id;
    if (task.done) li.classList.add('done');

    li.innerHTML = `
      <div class="task-info">
        <h3 class="task-title">${escapeHtml(task.name)}</h3>
        <p class="task-subject">Subj – <span>${escapeHtml(task.subject)}</span></p>
        <p class="task-datetime">${escapeHtml(task.date || '')} ${escapeHtml(task.time || '')}</p>
      </div>
      <div class="task-actions">
        <button class="done-btn" data-action="toggle-done">
          ${task.done ? 'Undo' : 'Done'}
        </button>
        <button class="remove-btn" data-action="delete">Delete</button>
      </div>
    `;
    return li;
  };

  const renderList = () => {
    tasksList.innerHTML = '';
    if (tasks.length === 0) {
      tasksList.innerHTML = `<div class="empty-box">No tasks yet. Add your first study task!</div>`;
      return;
    }

    const sorted = tasks.slice().sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return (a.date + a.time).localeCompare(b.date + b.time);
    });

    const ul = document.createElement('ul');
    ul.className = 'tasks-ul';
    for (const t of sorted) {
      ul.appendChild(renderTask(t));
    }
    tasksList.appendChild(ul);
  };

  // --- Actions ---
  const addTask = (data) => {
    const newTask = { id: uid(), ...data, done: false };
    tasks.push(newTask);
    saveToStorage();
    renderList();
  };

  const deleteTask = (id) => {
    tasks = tasks.filter((t) => t.id !== id);
    saveToStorage();
    renderList();
  };

  const toggleDone = (id) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    t.done = !t.done;
    saveToStorage();
    renderList();
  };

  // --- Events ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = inputName.value.trim();
    const subject = inputSubject.value.trim();
    const date = inputDate.value || '';
    const time = inputTime.value || '';

    if (!name || !subject) {
      alert('Please enter task name and subject.');
      return;
    }

    addTask({ name, subject, date, time });
    form.reset();
  });

  tasksList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const li = e.target.closest('li.task-card');
    const id = li.dataset.id;

    if (btn.dataset.action === 'delete') {
      if (confirm('Delete this task?')) deleteTask(id);
    } else if (btn.dataset.action === 'toggle-done') {
      toggleDone(id);
    }
  });

  // --- Init ---
  const init = () => {
    loadFromStorage();
    renderList();
  };

  document.addEventListener('DOMContentLoaded', init);
})();
