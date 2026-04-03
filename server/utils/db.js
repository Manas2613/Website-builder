const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function readDb() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return { users: [] };
  }
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function getUsers() {
  const db = readDb();
  return db.users || [];
}

function saveUsers(users) {
  const db = readDb();
  db.users = users;
  writeDb(db);
}

module.exports = {
  getUsers,
  saveUsers,
};
