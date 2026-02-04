require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MySQLStoreFactory = require("express-mysql-session");

const animalsRouter = require("./routes/animals");
const authRouter = require("./routes/auth");

const app = express();

/** Create an error with HTTP status code */
function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

app.use(express.json());

// Warn early if secret missing (sessions may behave oddly)
if (!process.env.SESSION_SECRET) {
  console.warn("WARNING: SESSION_SECRET missing in .env. Add it to enable sessions.");
}

// ===== Sessions stored in MySQL =====
const MySQLStore = MySQLStoreFactory(session);

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.use(
  session({
    name: "adopthub.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// Static files
app.use(express.static("public"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/animals", animalsRouter);

// 404 -> forward to central error handler
app.use((req, res, next) => {
  next(httpError(404, `Route not found: ${req.method} ${req.originalUr}`));
});

// ===== CENTRAL ERROR HANDLER (must be last) =====
app.use((err, req, res, next) => {
  let status = Number(err.statusCode || err.status || 500);
  let message = err.message || "Internal server error";

  // Invalid JSON body error (express.json)
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    status = 400;
    message = "Invalid JSON in request body";
  }

  // Multer upload errors
  if (err && err.name === "MulterError") {
    status = 400;

    if (err.code === "LIMIT_FILE_SIZE") {
      status = 413;
      message = "Image must be 5MB or smaller";
    } else {
      message = "File upload error";
    }
  }

  // Custom fileFilter error
  if (message === "Only image files allowed") {
    status = 400;
  }

  // Hide internal details for 500+
  if (status >= 500) {
    console.error("SERVER ERROR:", err);
    message = "Internal server error";
  }

  res.status(status).json({ error: message });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
