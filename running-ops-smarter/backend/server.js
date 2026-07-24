const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve the frontend as static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ---------- Helpers ----------
function makeCrudRoutes(collectionName, routePath) {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json(db.getAll(collectionName));
  });

  router.get('/:id', (req, res) => {
    const item = db.getById(collectionName, req.params.id);
    if (!item) return res.status(404).json({ error: `${collectionName} not found` });
    res.json(item);
  });

  router.post('/', (req, res) => {
    const created = db.create(collectionName, req.body);
    res.status(201).json(created);
  });

  router.put('/:id', (req, res) => {
    const updated = db.update(collectionName, req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: `${collectionName} not found` });
    res.json(updated);
  });

  router.delete('/:id', (req, res) => {
    const ok = db.remove(collectionName, req.params.id);
    if (!ok) return res.status(404).json({ error: `${collectionName} not found` });
    res.status(204).end();
  });

  app.use(routePath, router);
}

// ---------- Routes ----------
makeCrudRoutes('staff', '/api/staff');
makeCrudRoutes('tasks', '/api/tasks');
makeCrudRoutes('schedules', '/api/schedules');

// Extra: quick task status update (PATCH)
app.patch('/api/tasks/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['pending', 'in-progress', 'done'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }
  const updated = db.update('tasks', req.params.id, { status });
  if (!updated) return res.status(404).json({ error: 'Task not found' });
  res.json(updated);
});

// Dashboard summary: quick ops overview
app.get('/api/summary', (req, res) => {
  const staff = db.getAll('staff');
  const tasks = db.getAll('tasks');
  const schedules = db.getAll('schedules');

  const tasksByStatus = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalStaff: staff.length,
    totalTasks: tasks.length,
    totalSchedules: schedules.length,
    tasksByStatus,
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Running Operations Smarter API' });
});

app.listen(PORT, () => {
  console.log(`Running Operations Smarter API listening on http://localhost:${PORT}`);
});
