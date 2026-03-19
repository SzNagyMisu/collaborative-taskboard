const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Initialize SQLite database and tasks table
const db = new sqlite3.Database('./tasks.db');

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      size TEXT NOT NULL CHECK (size IN ('XS', 'S', 'M', 'L', 'XL'))
    )`
  );

  db.get('SELECT COUNT(*) AS count FROM tasks', (err, row) => {
    if (err) {
      console.error('Error checking tasks count:', err);
      return;
    }

    if (row.count === 0) {
      const stmt = db.prepare(
        'INSERT INTO tasks (title, status, size) VALUES (?, ?, ?)'
      );
      stmt.run('Initial task', 'todo', 'XS');
      stmt.run('Second task', 'in-progress', 'XL');
      stmt.finalize();
    }
  });
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Endpoint to return all tasks as JSON
app.get('/tasks', (req, res) => {
  db.all('SELECT id, title, status, size FROM tasks', (err, rows) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
