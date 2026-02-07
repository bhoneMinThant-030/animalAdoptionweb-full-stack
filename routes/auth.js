const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// GET /api/auth/me
router.get("/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

// Register /api/auth/register
// POST /api/auth/register  (allows role=user/admin)
router.post("/register", (req, res, next) => {
  const { name, email, password, role } = req.body || {};

  if (!name || !email || !password) return next(httpError(400, "Missing fields"));
  if (String(password).length < 8) return next(httpError(400, "Password must be at least 8 characters"));

  const safeRole = role === "admin" ? "admin" : "user";

  db.query("SELECT id FROM users WHERE email = ?", [email], async (err, rows) => {
    if (err) return next(err);
    if (rows.length) return next(httpError(409, "Email already in use"));

    try {
      const password_hash = await bcrypt.hash(password, 12);

      db.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
        [name, email, password_hash, safeRole],
        (err2, result) => {
          if (err2) return next(err2);

          req.session.user = {
            id: result.insertId,
            name,
            email,
            role: safeRole,
          };

          res.json({ user: req.session.user });
        }
      );
    } catch (e) {
      return next(httpError(500, "Server error"));
    }
  });
});


// POST /api/auth/login  (ADMIN ONLY)
router.post("/login", (req, res, next) => {
  const { email, password } = req.body || {};
  if (!email || !password) return next(httpError(400, "Missing fields"));

  db.query(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
    [email],
    async (err, rows) => {
      if (err) return next(err);
      if (!rows.length) return next(httpError(401, "Invalid email/password"));

      const u = rows[0];
      const ok = await bcrypt.compare(password, u.password_hash);
      if (!ok) return next(httpError(401, "Invalid email/password"));

      req.session.user = { id: u.id, name: u.name, email: u.email, role: u.role };
      res.json({ user: req.session.user });
    }
  );
});

// POST /api/auth/logout
router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("adopthub.sid");
    res.json({ ok: true });
  });
});

module.exports = router;
