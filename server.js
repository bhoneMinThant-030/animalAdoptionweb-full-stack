require("dotenv").config();
const express = require("express");
const cors = require("cors");

const animalsRouter = require("./routes/animals");
const speciesRouter = require("./routes/species");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from /public
app.use(express.static("public"));

// Routes
app.use("/api/animals", animalsRouter);
app.use("/api/species", speciesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central error handler
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;

  // Keep errors clean (don’t leak internal details)
  const message =
    status === 500 ? "Internal server error" : (err.message || "Error");

  res.status(status).json({ error: message });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
 