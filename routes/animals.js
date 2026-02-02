var express = require("express");
var db = require("../db");
var router = express.Router();
var path = require("path");
var multer = require("multer");

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


/**
 * NEW animals schema fields:
 * animal_id, name, species, breed, gender, age_months, temperament, status, image_url, created_at, updated_at
 */

// GET /api/animals  (list all animals)
router.get("/", function (req, res) {
  var sql = `
    SELECT
      animal_id, name,
      species, breed,
      gender, age_months, temperament, status,
      image_url, created_at, updated_at
    FROM animals
    ORDER BY animal_id ASC
  `;

  db.query(sql, function (error, result) {
    if (error) {
      console.log("DB ERROR (GET /api/animals):", error);
      return res.status(500).json({ error: error.message });
    }
    res.json(result);
  });
});

// GET /api/animals/:id (details)
router.get("/:id", function (req, res) {
  var sql = `
    SELECT
      animal_id, name,
      species, breed,
      gender, age_months, temperament, status,
      image_url, created_at, updated_at
    FROM animals
    WHERE animal_id = ?
  `;

  db.query(sql, [req.params.id], function (error, result) {
    if (error) {
      console.log("DB ERROR (GET /api/animals/:id):", error);
      return res.status(500).json({ error: error.message });
    }

    // Keep same response shape as before (your old code returns an array)
    res.json(result);
  });
});

// POST /api/animals (create)
router.post("/", upload.single("image"), function (req, res) {
  // Build image_url from uploaded file
  var image_url = req.file ? "/images/" + req.file.filename : null;

  var sql = `
    INSERT INTO animals
      (name,species,breed, gender, age_months, temperament, status, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  var parameter = [
    req.body.name,
    req.body.species,
    req.body.breed,
    req.body.gender,
    req.body.age_months,
    req.body.temperament,
    req.body.status,
    image_url,
  ];

  db.query(sql, parameter, function (error, result) {
    if (error) {
      console.log("DB ERROR (POST /api/animals):", error);
      return res.status(500).json({ error: error.message });
    }
    res.json(result);
  });
});


// PUT /api/animals/:id (update)
router.put("/:id", upload.single("image"), function (req, res) {
  const animalId = req.params.id;

  // if multer received a file, build the public path
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
    req.body.name,
    req.body.species,
    req.body.breed,
    req.body.gender,
    req.body.age_months,
    req.body.temperament,
    req.body.status,
    newImageUrl,   // null => keep old
    animalId,
  ];

  db.query(sql, parameter, function (error, result) {
    if (error) {
      console.log("DB ERROR (PUT /api/animals/:id):", error);
      return res.status(500).json({ error: error.message });
    }
    res.json(result);
  });
});

// DELETE /api/animals/:id
router.delete("/:id", function (req, res) {
  var sql = "DELETE FROM animals WHERE animal_id = ?";

  db.query(sql, [req.params.id], function (error, result) {
    if (error) {
      console.log("DB ERROR (DELETE /api/animals/:id):", error);
      return res.status(500).json({ error: error.message });
    }
    res.json(result);
  });
});

module.exports = router;
