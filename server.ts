import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import db from './src/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  // Auth
  app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const stmt = db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)');
      const info = stmt.run(email, hashedPassword, name, role);
      res.status(201).json({ id: info.lastInsertRowid, email, name, role });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    res.json(req.user);
  });

  // Users
  app.get('/api/users/counselors', authenticateToken, (req, res) => {
    const counselors = db.prepare('SELECT id, name, email, specialization, bio FROM users WHERE role = "counselor"').all();
    res.json(counselors);
  });

  // Appointments
  app.get('/api/appointments', authenticateToken, (req: any, res) => {
    let stmt;
    if (req.user.role === 'student') {
      stmt = db.prepare(`
        SELECT a.*, u.name as counselor_name 
        FROM appointments a 
        JOIN users u ON a.counselor_id = u.id 
        WHERE a.student_id = ?
      `);
    } else if (req.user.role === 'counselor') {
      stmt = db.prepare(`
        SELECT a.*, u.name as student_name 
        FROM appointments a 
        JOIN users u ON a.student_id = u.id 
        WHERE a.counselor_id = ?
      `);
    } else {
      stmt = db.prepare('SELECT * FROM appointments');
    }
    const appointments = stmt.all(req.user.id);
    res.json(appointments);
  });

  app.post('/api/appointments', authenticateToken, (req: any, res) => {
    const { counselor_id, date, time, notes } = req.body;
    const stmt = db.prepare('INSERT INTO appointments (student_id, counselor_id, date, time, notes) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(req.user.id, counselor_id, date, time, notes);
    res.status(201).json({ id: info.lastInsertRowid });
  });

  app.patch('/api/appointments/:id', authenticateToken, (req: any, res) => {
    const { status } = req.body;
    const stmt = db.prepare('UPDATE appointments SET status = ? WHERE id = ?');
    stmt.run(status, req.params.id);
    res.json({ message: 'Updated' });
  });

  // Resources
  app.get('/api/resources', (req, res) => {
    const resources = db.prepare('SELECT * FROM resources').all();
    res.json(resources);
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
