import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("surplus.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    price REAL,
    category TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
  );

  CREATE TABLE IF NOT EXISTS team (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    bio TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER
  );
`);

// Seed default settings if empty
const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
if (settingsCount.count === 0) {
  const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
  insertSetting.run("site_name", "Surplus Consultancy");
  insertSetting.run("contact_email", "info@surplus.com");
  insertSetting.run("contact_phone", "+1 234 567 890");
  insertSetting.run("address", "123 Business Ave, Suite 100");
  insertSetting.run("hero_title", "Empowering Your Future with Surplus");
  insertSetting.run("hero_subtitle", "Expert consultancy services for students and professionals.");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  
  // Settings
  app.get("/api/settings", (req, res) => {
    const rows = db.prepare("SELECT * FROM settings").all();
    const settings = rows.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    res.json(settings);
  });

  app.post("/api/settings", (req, res) => {
    const updates = req.body;
    const upsert = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    const transaction = db.transaction((data) => {
      for (const [key, value] of Object.entries(data)) {
        upsert.run(key, String(value));
      }
    });
    transaction(updates);
    res.json({ success: true });
  });

  // Categories
  app.get("/api/categories", (req, res) => {
    res.json(db.prepare("SELECT * FROM categories").all());
  });

  app.post("/api/categories", (req, res) => {
    const { name, description } = req.body;
    try {
      const info = db.prepare("INSERT INTO categories (name, description) VALUES (?, ?)")
        .run(name, description);
      res.json({ id: info.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/categories/:id", (req, res) => {
    const { name, description } = req.body;
    db.prepare("UPDATE categories SET name = ?, description = ? WHERE id = ?")
      .run(name, description, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/categories/:id", (req, res) => {
    db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Courses
  app.get("/api/courses", (req, res) => {
    const rows = db.prepare("SELECT * FROM courses").all();
    res.json(rows);
  });

  app.post("/api/courses", (req, res) => {
    const { title, description, duration, price, category, image_url } = req.body;
    const info = db.prepare("INSERT INTO courses (title, description, duration, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)")
      .run(title, description, duration, price, category, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/courses/:id", (req, res) => {
    const { title, description, duration, price, category, image_url } = req.body;
    db.prepare("UPDATE courses SET title = ?, description = ?, duration = ?, price = ?, category = ?, image_url = ? WHERE id = ?")
      .run(title, description, duration, price, category, image_url, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/courses/:id", (req, res) => {
    db.prepare("DELETE FROM courses WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Registrations
  app.get("/api/registrations", (req, res) => {
    const rows = db.prepare(`
      SELECT r.*, c.title as course_title 
      FROM registrations r 
      LEFT JOIN courses c ON r.course_id = c.id
      ORDER BY r.created_at DESC
    `).all();
    res.json(rows);
  });

  app.patch("/api/registrations/:id", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE registrations SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  // Team
  app.get("/api/team", (req, res) => {
    res.json(db.prepare("SELECT * FROM team").all());
  });

  app.post("/api/team", (req, res) => {
    const { name, role, bio, image_url } = req.body;
    const info = db.prepare("INSERT INTO team (name, role, bio, image_url) VALUES (?, ?, ?, ?)")
      .run(name, role, bio, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  // Services
  app.get("/api/services", (req, res) => {
    res.json(db.prepare("SELECT * FROM services").all());
  });

  app.post("/api/services", (req, res) => {
    const { title, description, icon } = req.body;
    const info = db.prepare("INSERT INTO services (title, description, icon) VALUES (?, ?, ?)")
      .run(title, description, icon);
    res.json({ id: info.lastInsertRowid });
  });

  // Testimonials
  app.get("/api/testimonials", (req, res) => {
    res.json(db.prepare("SELECT * FROM testimonials").all());
  });

  app.post("/api/testimonials", (req, res) => {
    const { client_name, content, rating } = req.body;
    const info = db.prepare("INSERT INTO testimonials (client_name, content, rating) VALUES (?, ?, ?)")
      .run(client_name, content, rating);
    res.json({ id: info.lastInsertRowid });
  });

  // Stats for Dashboard
  app.get("/api/stats", (req, res) => {
    const courseCount = db.prepare("SELECT COUNT(*) as count FROM courses").get() as any;
    const regCount = db.prepare("SELECT COUNT(*) as count FROM registrations").get() as any;
    const pendingRegCount = db.prepare("SELECT COUNT(*) as count FROM registrations WHERE status = 'pending'").get() as any;
    const teamCount = db.prepare("SELECT COUNT(*) as count FROM team").get() as any;

    res.json({
      totalCourses: courseCount.count,
      totalRegistrations: regCount.count,
      pendingRegistrations: pendingRegCount.count,
      teamMembers: teamCount.count
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
