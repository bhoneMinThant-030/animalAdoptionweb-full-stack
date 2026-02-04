const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();

// GET /api/auth/me
router.get("/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { name, email, password, role } = req.body || {};

  if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });
  if (String(password).length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

  // role comes from your HTML form (for demo)
  // Only allow "admin" or "user"
  const safeRole = role === "admin" ? "admin" : "user";

  db.query("SELECT id FROM users WHERE email = ?", [email], async (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (rows.length) return res.status(409).json({ error: "Email already in use" });

    try {
      const password_hash = await bcrypt.hash(password, 12);

      db.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        [name, email, password_hash, safeRole],
        (err2, result) => {
          if (err2) return res.status(500).json({ error: "DB error" });

          // auto-login after register
          req.session.user = { id: result.insertId, name, email, role: safeRole };
          res.json({ user: req.session.user });
        }
      );
    } catch {
      res.status(500).json({ error: "Server error" });
    }
  });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  db.query(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
    [email],
    async (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (!rows.length) return res.status(401).json({ error: "Invalid email/password" });

      const u = rows[0];
      const ok = await bcrypt.compare(password, u.password_hash);
      if (!ok) return res.status(401).json({ error: "Invalid email/password" });

      req.session.user = { id: u.id, name: u.name, email: u.email, role: u.role };
      res.json({ user: req.session.user });
    }
  );
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("adopthub.sid");
    res.json({ ok: true });
  });
});

module.exports = router;
