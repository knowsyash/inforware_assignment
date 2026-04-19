const Database = require('better-sqlite3');
const path = require('path');

// Initialize the database file
const dbPath = path.join(__dirname, 'inventory.db');
const db = new Database(dbPath);

// Create the items table if it doesn't exist
const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      is_synced BOOLEAN DEFAULT 0
    )
  `);
};

initDb();

// Function to add a new item
const addItem = (name, quantity) => {
  const stmt = db.prepare('INSERT INTO items (name, quantity) VALUES (?, ?)');
  return stmt.run(name, quantity);
};

// Function to get all items that haven't been synced yet
const getUnsyncedItems = () => {
  const stmt = db.prepare('SELECT * FROM items WHERE is_synced = 0');
  return stmt.all();
};

// Function to get all items including synced ones
const getAllItems = () => {
  const stmt = db.prepare('SELECT * FROM items ORDER BY id DESC');
  return stmt.all();
};

// Function to mark an item as synced
const markItemAsSynced = (id) => {
  const stmt = db.prepare('UPDATE items SET is_synced = 1 WHERE id = ?');
  return stmt.run(id);
};

module.exports = {
  addItem,
  getUnsyncedItems,
  getAllItems,
  markItemAsSynced
};
