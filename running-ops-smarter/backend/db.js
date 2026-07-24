const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

function readDB() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function getAll(collection) {
  const db = readDB();
  return db[collection] || [];
}

function getById(collection, id) {
  const db = readDB();
  return (db[collection] || []).find((item) => item.id === Number(id));
}

function create(collection, payload) {
  const db = readDB();
  const nextId = db.nextIds[collection];
  const item = { id: nextId, ...payload };
  db[collection].push(item);
  db.nextIds[collection] = nextId + 1;
  writeDB(db);
  return item;
}

function update(collection, id, payload) {
  const db = readDB();
  const idx = db[collection].findIndex((item) => item.id === Number(id));
  if (idx === -1) return null;
  db[collection][idx] = { ...db[collection][idx], ...payload, id: Number(id) };
  writeDB(db);
  return db[collection][idx];
}

function remove(collection, id) {
  const db = readDB();
  const idx = db[collection].findIndex((item) => item.id === Number(id));
  if (idx === -1) return false;
  db[collection].splice(idx, 1);
  writeDB(db);
  return true;
}

module.exports = { getAll, getById, create, update, remove };
