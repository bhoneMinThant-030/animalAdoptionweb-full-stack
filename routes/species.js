var express = require("express");
var db = require("../db");
var router = express.Router();

// GET /api/species
router.get("/", function (req, res) {
  var sql = "SELECT species_id, species_name FROM species ORDER BY species_name";

  db.query(sql, function (error, result) {
    if (error) throw error;
    res.json(result);
  });
});

// GET /api/species/:id/breeds
router.get("/:id", function (req, res) {
  var sql = `
    SELECT breed_id, breed_name
    FROM breed
    WHERE species_id = ?
  `;

  db.query(sql, [req.params.id], function (error, result) {
    if (error) throw error;
    res.json(result);
  });
});

module.exports = router;
