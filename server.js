require("dotenv").config();
const express = require("express");
const cors = require("cors");

const session = require("express-session");
const MySQLStoreFactory = require("express-mysql-session");

const animalsRouter = require("./routes/animals");
const speciesRouter = require("./routes/species");
const authRouter = require("./routes/auth");

const app = express();

app.use(cors());         // OK if you open pages via http://localhost:8080
app.use(express.json());

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
      secure: false, // set true if HTTPS
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// Serve static files from /public
app.use(express.static("public"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/animals", animalsRouter);
app.use("/api/species", speciesRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
