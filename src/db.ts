import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(process.cwd(), 'guidance.db');
const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('student', 'counselor', 'admin')) NOT NULL,
    bio TEXT,
    specialization TEXT
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    counselor_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (counselor_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT CHECK(type IN ('article', 'video', 'link')) NOT NULL,
    author_id INTEGER,
    FOREIGN KEY (author_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
  );
`);

// Seed some initial data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (email, password, name, role, specialization) VALUES (?, ?, ?, ?, ?)');
  // Password is 'password123' hashed (simulated for now, will use bcrypt in routes)
  // For seeding, we'll just put a placeholder and update it if needed, or just use a simple hash
  insertUser.run('admin@guidance.com', '$2a$10$x.Y6X6X6X6X6X6X6X6X6X6', 'Admin User', 'admin', null);
  insertUser.run('counselor1@guidance.com', '$2a$10$x.Y6X6X6X6X6X6X6X6X6X6', 'Dr. Sarah Smith', 'counselor', 'Career Guidance');
  insertUser.run('student1@guidance.com', '$2a$10$x.Y6X6X6X6X6X6X6X6X6X6', 'John Doe', 'student', null);

  const insertResource = db.prepare('INSERT INTO resources (title, category, content, type) VALUES (?, ?, ?, ?)');
  insertResource.run('Choosing the Right Career Path', 'Career', 'Finding your passion is the first step...', 'article');
  insertResource.run('Managing Exam Stress', 'Mental Health', 'Stress is a natural response...', 'article');
}

export default db;
