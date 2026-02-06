const express = require("express");
const db = require("../db");
const path = require("path");
const multer = require("multer");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

/* =========================
   Helpers
========================= */
function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function parsePositiveInt(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function cleanText(v) {
  return typeof v === "string" ? v.trim() : "";
}

function validateEnum(value, allowed) {
  return allowed.includes(value);
}

/* =========================
   Multer (1–3 images)
========================= */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "public", "images"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    if (file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

/* =========================
   GET /api/animals
========================= */
router.get("/", (req, res, next) => {
  const sql = `
    SELECT
      animal_id, name, species, breed,
      gender, age_months, temperament, status,
      image_url, created_at, updated_at
    FROM animals
    ORDER BY animal_id ASC
  `;
  db.query(sql, (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});

/* =========================
   GET /api/animals/:id  (JOIN)
   Returns [row] for your existing frontend
========================= */
router.get("/:id", (req, res, next) => {
  const id = parsePositiveInt(req.params.id);
  if (!id) return next(httpError(400, "Invalid animal id"));

  const sql = `
    SELECT
      a.animal_id, a.name, a.species, a.breed,
      a.gender, a.age_months, a.temperament, a.status,
      a.image_url, a.created_at, a.updated_at,
      GROUP_CONCAT(ai.image_url ORDER BY ai.sort_order ASC SEPARATOR '||') AS images_concat
    FROM animals a
    LEFT JOIN animal_images ai
      ON ai.animal_id = a.animal_id
    WHERE a.animal_id = ?
    GROUP BY a.animal_id
    LIMIT 1
  `;

  db.query(sql, [id], (err, rows) => {
    if (err) return next(err);
    if (!rows || rows.length === 0) return next(httpError(404, "Animal not found"));

    const row = rows[0];
    const images = row.images_concat ? String(row.images_concat).split("||").filter(Boolean) : [];
    delete row.images_concat;

    // Ensure cover appears in images
    if (row.image_url && !images.includes(row.image_url)) images.unshift(row.image_url);
    row.images = images;

    res.json([row]);
  });
});

/* =========================
   POST /api/animals  (admin)
   No transaction version
========================= */
router.post("/", requireAdmin, upload.array("image", 3), (req, res, next) => {
  const name = cleanText(req.body.name);
  const species = cleanText(req.body.species);
  const breed = cleanText(req.body.breed);
  const temperament = cleanText(req.body.temperament);

  const gender = req.body.gender;
  const status = req.body.status;
  const age_months = Number(req.body.age_months);

  if (!name) return next(httpError(400, "Name is required"));
  if (!species) return next(httpError(400, "Species is required"));
  if (!breed) return next(httpError(400, "Breed is required"));
  if (!temperament) return next(httpError(400, "Temperament is required"));

  if (!Number.isInteger(age_months) || age_months < 0) {
    return next(httpError(400, "age_months must be an integer >= 0"));
  }

  if (!validateEnum(gender, ["Male", "Female", "Unknown"])) return next(httpError(400, "Invalid gender"));
  if (!validateEnum(status, ["Available", "Reserved", "Adopted"])) return next(httpError(400, "Invalid status"));

  const files = req.files || [];
  if (!files.length) return next(httpError(400, "At least 1 image is required"));
  if (files.length > 3) return next(httpError(400, "You can upload up to 3 images"));

  const imageUrls = files.map((f) => "/images/" + f.filename);
  const coverUrl = imageUrls[0];

  const insertAnimalSql = `
    INSERT INTO animals
      (name, species, breed, gender, age_months, temperament, status, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const animalParams = [name, species, breed, gender, age_months, temperament, status, coverUrl];

  db.query(insertAnimalSql, animalParams, (err1, result1) => {
    if (err1) return next(err1);

    const animalId = result1.insertId;
    const rows = imageUrls.map((url, idx) => [animalId, url, idx]);

    db.query(
      "INSERT INTO animal_images (animal_id, image_url, sort_order) VALUES ?",
      [rows],
      (err2) => {
        if (err2) return next(err2);
        res.json({ animal_id: animalId });
      }
    );
  });
});

/* =========================
   PUT /api/animals/:id (admin)
   If new images uploaded -> replace images
   No transaction version
========================= */
router.put("/:id", requireAdmin, upload.array("image", 3), (req, res, next) => {
  const id = parsePositiveInt(req.params.id);
  if (!id) return next(httpError(400, "Invalid animal id"));

  const name = cleanText(req.body.name);
  const species = cleanText(req.body.species);
  const breed = cleanText(req.body.breed);
  const temperament = cleanText(req.body.temperament);

  const gender = req.body.gender;
  const status = req.body.status;
  const age_months = Number(req.body.age_months);

  if (!name) return next(httpError(400, "Name is required"));
  if (!species) return next(httpError(400, "Species is required"));
  if (!breed) return next(httpError(400, "Breed is required"));
  if (!temperament) return next(httpError(400, "Temperament is required"));

  if (!Number.isInteger(age_months) || age_months < 0) {
    return next(httpError(400, "age_months must be an integer >= 0"));
  }

  if (!validateEnum(gender, ["Male", "Female", "Unknown"])) return next(httpError(400, "Invalid gender"));
  if (!validateEnum(status, ["Available", "Reserved", "Adopted"])) return next(httpError(400, "Invalid status"));

  const files = req.files || [];
  if (files.length > 3) return next(httpError(400, "You can upload up to 3 images"));

  const imageUrls = files.map((f) => "/images/" + f.filename);
  const newCoverUrl = imageUrls.length ? imageUrls[0] : null;

  const updateSql = `
    UPDATE animals
    SET
      name = ?,
      species = ?,
      breed = ?,
      gender = ?,
      age_months = ?,
      temperament = ?,
      status = ?,
      image_url = COALESCE(?, image_url)
    WHERE animal_id = ?
  `;

  const params = [name, species, breed, gender, age_months, temperament, status, newCoverUrl, id];

  db.query(updateSql, params, (err1, result1) => {
    if (err1) return next(err1);
    if (!result1 || result1.affectedRows === 0) return next(httpError(404, "Animal not found"));

    // No new images => done
    if (!imageUrls.length) return res.json({ success: true });

    // Replace images (delete then insert)
    db.query("DELETE FROM animal_images WHERE animal_id = ?", [id], (err2) => {
      if (err2) return next(err2);

      const rows = imageUrls.map((url, idx) => [id, url, idx]);
      db.query(
        "INSERT INTO animal_images (animal_id, image_url, sort_order) VALUES ?",
        [rows],
        (err3) => {
          if (err3) return next(err3);
          res.json({ success: true });
        }
      );
    });
  });
});

/* =========================
   DELETE /api/animals/:id (admin)
   ✅ short because ON DELETE CASCADE handles animal_images
========================= */
router.delete("/:id", requireAdmin, (req, res, next) => {
  const id = parsePositiveInt(req.params.id);
  if (!id) return next(httpError(400, "Invalid animal id"));

  db.query("DELETE FROM animals WHERE animal_id = ?", [id], (err, result) => {
    if (err) return next(err);
    if (!result || result.affectedRows === 0) return next(httpError(404, "Animal not found"));
    res.json({ success: true });
  });
});

module.exports = router;
