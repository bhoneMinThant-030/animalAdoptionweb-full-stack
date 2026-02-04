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

// POST /api/auth/register  (DISABLED)
router.post("/register", (req, res, next) => {
  return next(httpError(404, "Registration is disabled"));
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

      // ✅ admin-only login
      if (u.role !== "admin") return next(httpError(403, "Admin login only"));

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
