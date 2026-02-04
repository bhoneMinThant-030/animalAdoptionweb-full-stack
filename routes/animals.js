var express = require("express");
var db = require("../db");
var router = express.Router();
var path = require("path");
var multer = require("multer");
var { requireAdmin } = require("../middleware/auth");

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

// Multer storage
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "public", "images"));
  },
  filename: function (req, file, cb) {
    var ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});

var upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    if (file.mimetype && file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

// GET /api/animals
router.get("/", function (req, res, next) {
  var sql = `
    SELECT
      animal_id, name, species, breed,
      gender, age_months, temperament, status,
      image_url, created_at, updated_at
    FROM animals
    ORDER BY animal_id ASC
  `;

  db.query(sql, function (error, result) {
    if (error) return next(error);
    res.json(result);
  });
});

// GET /api/animals/:id
router.get("/:id", function (req, res, next) {
  const id = parsePositiveInt(req.params.id);
  if (!id) return next(httpError(400, "Invalid animal id"));

  var sql = `
    SELECT
      animal_id, name, species, breed,
      gender, age_months, temperament, status,
      image_url, created_at, updated_at
    FROM animals
    WHERE animal_id = ?
  `;

  db.query(sql, [id], function (error, result) {
    if (error) return next(error);

    if (!result || result.length === 0) {
      return next(httpError(404, "Animal not found"));
    }

    // Keep your existing frontend compatibility (array)
    res.json(result);
  });
});

// POST /api/animals (admin only)
router.post("/", requireAdmin, upload.single("image"), function (req, res, next) {
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

  if (!validateEnum(gender, ["Male", "Female", "Unknown"])) {
    return next(httpError(400, "Invalid gender"));
  }

  if (!validateEnum(status, ["Available", "Reserved", "Adopted"])) {
    return next(httpError(400, "Invalid status"));
  }

  if (!req.file) return next(httpError(400, "Image is required"));

  var image_url = "/images/" + req.file.filename;

  var sql = `
    INSERT INTO animals
      (name, species, breed, gender, age_months, temperament, status, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  var parameter = [
    name,
    species,
    breed,
    gender,
    age_months,
    temperament,
    status,
    image_url,
  ];

  db.query(sql, parameter, function (error, result) {
    if (error) return next(error);
    res.json(result);
  });
});

// PUT /api/animals/:id (admin only)
router.put("/:id", requireAdmin, upload.single("image"), function (req, res, next) {
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

  if (!validateEnum(gender, ["Male", "Female", "Unknown"])) {
    return next(httpError(400, "Invalid gender"));
  }

  if (!validateEnum(status, ["Available", "Reserved", "Adopted"])) {
    return next(httpError(400, "Invalid status"));
  }

  const newImageUrl = req.file ? `/images/${req.file.filename}` : null;

  const sql = `
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

  const parameter = [
    name,
    species,
    breed,
    gender,
    age_months,
    temperament,
    status,
    newImageUrl,
    id,
  ];

  db.query(sql, parameter, function (error, result) {
    if (error) return next(error);

    if (!result || result.affectedRows === 0) {
      return next(httpError(404, "Animal not found"));
    }

    res.json(result);
  });
});

// DELETE /api/animals/:id (admin only)
router.delete("/:id", requireAdmin, function (req, res, next) {
  const id = parsePositiveInt(req.params.id);
  if (!id) return next(httpError(400, "Invalid animal id"));

  var sql = "DELETE FROM animals WHERE animal_id = ?";

  db.query(sql, [id], function (error, result) {
    if (error) return next(error);

    if (!result || result.affectedRows === 0) {
      return next(httpError(404, "Animal not found"));
    }

    res.json(result);
  });
});

module.exports = router;
