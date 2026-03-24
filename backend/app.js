const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;
app.use(express.json());

const FRONTEND_ORIGIN = 'http://localhost:5173';

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// Initialize SQLite database and tasks table
const db = new sqlite3.Database('./tasks.db');

const ALLOWED_SIZES = new Set(['XS', 'S', 'M', 'L', 'XL']);
const sseClients = new Set();

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('To Do', 'In Progress', 'Done')),
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
      stmt.run('Set up project structure', 'To Do', 'M');
      stmt.run('Design task card layout', 'In Progress', 'S');
      stmt.run('Implement taskboard columns', 'In Progress', 'L');
      stmt.run('Review and refactor', 'Done', 'M');
      stmt.run('Write documentation', 'To Do', 'S');
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

function parseTaskIdParam(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

app.get('/tasks/:id', (req, res) => {
  const id = parseTaskIdParam(req);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  db.get(
    'SELECT id, title, status, size FROM tasks WHERE id = ?',
    [id],
    (err, row) => {
      if (err) {
        console.error('Error fetching task:', err);
        return res.status(500).json({ error: 'Failed to fetch task' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(row);
    }
  );
});

app.get('/events', (req, res) => {
  if (req.headers.accept !== undefined && !req.headers.accept.includes('text/event-stream')) {
    return res.status(406).json({ error: 'Client must accept text/event-stream' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write(': connected\n\n');

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

function broadcastTaskUpdated(taskId) {
  const payload = `event: task-updated\ndata: ${JSON.stringify({ taskId })}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

function updateTaskHandler(req, res) {
  const id = parseTaskIdParam(req);
  if (id === null) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  const { title, status, size } = req.body ?? {};
  const updates = [];
  const values = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'title must be a non-empty string' });
    }
    updates.push('title = ?');
    values.push(title.trim());
  }

  if (status !== undefined) {
    if (typeof status !== 'string' || status.trim().length === 0) {
      return res.status(400).json({ error: 'status must be a non-empty string' });
    }
    updates.push('status = ?');
    values.push(status.trim());
  }

  if (size !== undefined) {
    if (typeof size !== 'string') {
      return res.status(400).json({ error: 'size must be a string' });
    }
    const normalizedSize = size.trim().toUpperCase();
    if (!ALLOWED_SIZES.has(normalizedSize)) {
      return res.status(400).json({
        error: `size must be one of ${Array.from(ALLOWED_SIZES).join(', ')}`
      });
    }
    updates.push('size = ?');
    values.push(normalizedSize);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'Provide title, status, or size to update' });
  }

  const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
  values.push(id);

  db.run(sql, values, function runCallback(err) {
    if (err) {
      console.error('Error updating task:', err);
      return res.status(500).json({ error: 'Failed to update task' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.get(
      'SELECT id, title, status, size FROM tasks WHERE id = ?',
      [id],
      (selectErr, row) => {
        if (selectErr) {
          console.error('Error selecting updated task:', selectErr);
          return res.status(500).json({ error: 'Failed to fetch updated task' });
        }
        broadcastTaskUpdated(id);
        res.json(row);
      }
    );
  });
}

app.patch('/tasks/:id', updateTaskHandler);
app.put('/tasks/:id', updateTaskHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
