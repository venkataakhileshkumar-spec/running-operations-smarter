const API_BASE = '/api';

const state = {
  staff: [],
  tasks: [],
  schedules: [],
};

// ---------- Utility ----------
async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  return res.json();
}
async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}
async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}
async function apiPatch(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}
async function apiDelete(path) {
  await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
}

function staffNameById(id) {
  const s = state.staff.find((x) => x.id === Number(id));
  return s ? s.name : 'Unassigned';
}

// ---------- Tabs ----------
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

// ---------- Summary ----------
async function refreshSummary() {
  const summary = await apiGet('/summary');
  const todayShifts = state.schedules.length;
  document.getElementById('sum-staff').textContent = summary.totalStaff;
  document.getElementById('sum-schedules').textContent = todayShifts;
  document.getElementById('sum-pending').textContent = summary.tasksByStatus.pending || 0;
  document.getElementById('sum-done').textContent = summary.tasksByStatus.done || 0;
}

// ---------- Render: Staff ----------
function renderStaff() {
  const tbody = document.getElementById('staff-table-body');
  tbody.innerHTML = state.staff.map((s) => `
    <tr>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.role)}</td>
      <td>${escapeHtml(s.email || '')}</td>
      <td>${escapeHtml(s.phone || '')}</td>
      <td>
        <button class="btn-icon" onclick="editStaff(${s.id})">Edit</button>
        <button class="btn-icon danger" onclick="deleteStaff(${s.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

// ---------- Render: Schedules ----------
function renderSchedules() {
  const tbody = document.getElementById('schedules-table-body');
  tbody.innerHTML = state.schedules.map((sc) => `
    <tr>
      <td>${escapeHtml(staffNameById(sc.staffId))}</td>
      <td>${escapeHtml(sc.date)}</td>
      <td>${escapeHtml(sc.shiftStart)}</td>
      <td>${escapeHtml(sc.shiftEnd)}</td>
      <td>${escapeHtml(sc.notes || '')}</td>
      <td>
        <button class="btn-icon" onclick="editSchedule(${sc.id})">Edit</button>
        <button class="btn-icon danger" onclick="deleteSchedule(${sc.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

// ---------- Render: Tasks ----------
function renderTasks() {
  const tbody = document.getElementById('tasks-table-body');
  tbody.innerHTML = state.tasks.map((t) => `
    <tr>
      <td>${escapeHtml(t.title)}</td>
      <td>${escapeHtml(staffNameById(t.assignedTo))}</td>
      <td class="priority-${t.priority}">${escapeHtml(t.priority)}</td>
      <td>${escapeHtml(t.dueDate || '')}</td>
      <td>
        <select onchange="changeTaskStatus(${t.id}, this.value)" class="status-select">
          <option value="pending" ${t.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="in-progress" ${t.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
          <option value="done" ${t.status === 'done' ? 'selected' : ''}>Done</option>
        </select>
      </td>
      <td>
        <button class="btn-icon" onclick="editTask(${t.id})">Edit</button>
        <button class="btn-icon danger" onclick="deleteTask(${t.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------- Load all data ----------
async function loadAll() {
  const [staff, tasks, schedules] = await Promise.all([
    apiGet('/staff'),
    apiGet('/tasks'),
    apiGet('/schedules'),
  ]);
  state.staff = staff;
  state.tasks = tasks;
  state.schedules = schedules;
  renderStaff();
  renderSchedules();
  renderTasks();
  refreshSummary();
}

// ---------- Task status quick change ----------
async function changeTaskStatus(id, status) {
  await apiPatch(`/tasks/${id}/status`, { status });
  await loadAll();
}

// ---------- Delete handlers ----------
async function deleteStaff(id) {
  if (!confirm('Remove this staff member?')) return;
  await apiDelete(`/staff/${id}`);
  await loadAll();
}
async function deleteSchedule(id) {
  if (!confirm('Remove this shift?')) return;
  await apiDelete(`/schedules/${id}`);
  await loadAll();
}
async function deleteTask(id) {
  if (!confirm('Remove this task?')) return;
  await apiDelete(`/tasks/${id}`);
  await loadAll();
}

// ---------- Modal form handling ----------
const overlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalForm = document.getElementById('modal-form');

function openModal(title, fieldsHtml, onSubmit) {
  modalTitle.textContent = title;
  modalForm.innerHTML = `${fieldsHtml}
    <div class="modal-actions">
      <button type="button" class="btn-secondary" id="modal-cancel">Cancel</button>
      <button type="submit" class="btn-primary">Save</button>
    </div>`;
  overlay.classList.remove('hidden');
  document.getElementById('modal-cancel').onclick = closeModal;
  modalForm.onsubmit = async (e) => {
    e.preventDefault();
    await onSubmit(new FormData(modalForm));
    closeModal();
    await loadAll();
  };
}
function closeModal() {
  overlay.classList.add('hidden');
  modalForm.innerHTML = '';
}
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

function staffOptions(selectedId) {
  return state.staff.map((s) => `<option value="${s.id}" ${Number(selectedId) === s.id ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('');
}

// ---------- Add / Edit: Staff ----------
document.getElementById('add-staff-btn').addEventListener('click', () => {
  openModal('Add Staff', `
    <label>Name</label><input name="name" required />
    <label>Role</label><input name="role" required />
    <label>Email</label><input name="email" type="email" />
    <label>Phone</label><input name="phone" />
  `, async (fd) => {
    await apiPost('/staff', Object.fromEntries(fd));
  });
});
function editStaff(id) {
  const s = state.staff.find((x) => x.id === id);
  openModal('Edit Staff', `
    <label>Name</label><input name="name" value="${escapeHtml(s.name)}" required />
    <label>Role</label><input name="role" value="${escapeHtml(s.role)}" required />
    <label>Email</label><input name="email" type="email" value="${escapeHtml(s.email)}" />
    <label>Phone</label><input name="phone" value="${escapeHtml(s.phone)}" />
  `, async (fd) => {
    await apiPut(`/staff/${id}`, Object.fromEntries(fd));
  });
}

// ---------- Add / Edit: Schedule ----------
document.getElementById('add-schedule-btn').addEventListener('click', () => {
  openModal('Add Shift', `
    <label>Staff</label><select name="staffId">${staffOptions()}</select>
    <label>Date</label><input name="date" type="date" required />
    <label>Shift Start</label><input name="shiftStart" type="time" required />
    <label>Shift End</label><input name="shiftEnd" type="time" required />
    <label>Notes</label><textarea name="notes" rows="2"></textarea>
  `, async (fd) => {
    const data = Object.fromEntries(fd);
    data.staffId = Number(data.staffId);
    await apiPost('/schedules', data);
  });
});
function editSchedule(id) {
  const sc = state.schedules.find((x) => x.id === id);
  openModal('Edit Shift', `
    <label>Staff</label><select name="staffId">${staffOptions(sc.staffId)}</select>
    <label>Date</label><input name="date" type="date" value="${sc.date}" required />
    <label>Shift Start</label><input name="shiftStart" type="time" value="${sc.shiftStart}" required />
    <label>Shift End</label><input name="shiftEnd" type="time" value="${sc.shiftEnd}" required />
    <label>Notes</label><textarea name="notes" rows="2">${escapeHtml(sc.notes)}</textarea>
  `, async (fd) => {
    const data = Object.fromEntries(fd);
    data.staffId = Number(data.staffId);
    await apiPut(`/schedules/${id}`, data);
  });
}

// ---------- Add / Edit: Task ----------
document.getElementById('add-task-btn').addEventListener('click', () => {
  openModal('Add Task', `
    <label>Title</label><input name="title" required />
    <label>Description</label><textarea name="description" rows="2"></textarea>
    <label>Assigned To</label><select name="assignedTo">${staffOptions()}</select>
    <label>Priority</label>
    <select name="priority">
      <option value="low">Low</option>
      <option value="medium" selected>Medium</option>
      <option value="high">High</option>
    </select>
    <label>Due Date</label><input name="dueDate" type="date" />
  `, async (fd) => {
    const data = Object.fromEntries(fd);
    data.assignedTo = Number(data.assignedTo);
    data.status = 'pending';
    await apiPost('/tasks', data);
  });
});
function editTask(id) {
  const t = state.tasks.find((x) => x.id === id);
  openModal('Edit Task', `
    <label>Title</label><input name="title" value="${escapeHtml(t.title)}" required />
    <label>Description</label><textarea name="description" rows="2">${escapeHtml(t.description)}</textarea>
    <label>Assigned To</label><select name="assignedTo">${staffOptions(t.assignedTo)}</select>
    <label>Priority</label>
    <select name="priority">
      <option value="low" ${t.priority === 'low' ? 'selected' : ''}>Low</option>
      <option value="medium" ${t.priority === 'medium' ? 'selected' : ''}>Medium</option>
      <option value="high" ${t.priority === 'high' ? 'selected' : ''}>High</option>
    </select>
    <label>Due Date</label><input name="dueDate" type="date" value="${t.dueDate || ''}" />
  `, async (fd) => {
    const data = Object.fromEntries(fd);
    data.assignedTo = Number(data.assignedTo);
    await apiPut(`/tasks/${id}`, data);
  });
}

// ---------- Init ----------
loadAll();
