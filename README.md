# AdoptHub (Project 2)

Small Node.js + Express + MySQL app for browsing animals and (admin-only) managing animals with image uploads.

## Tech stack

- Node.js (Express)
- MySQL (`mysql2`)
- Sessions: `express-session` + `express-mysql-session`
- Password hashing: `bcrypt`
- File uploads: `multer`
- Frontend: static HTML/CSS/JS in `public/`

## Project structure

- `server.js` - Express app entrypoint, session + routes
- `db.js` - MySQL connection pool
- `routes/auth.js` - login/register/logout API
- `routes/animals.js` - animals CRUD API (+ image upload)
- `middleware/auth.js` - `requireAdmin` middleware
- `public/` - frontend pages and assets

## Requirements

- Node.js + npm
- MySQL server

## Setup

1) Install dependencies:

```bash
npm install
```

2) Create an environment file:

- Copy `.env.example` to `.env`
- Fill in your MySQL credentials and a strong `SESSION_SECRET`

3) Create the MySQL database + tables (recommended: import the provided SQL dump).

This repo includes `db.sql` (MySQL dump) which:

- Creates the `animal_data` database
- Drops + recreates tables: `animals`, `animal_images`, `users`, `sessions`
- Inserts sample data (animals, users, and session rows)

Import options:

- MySQL CLI:

```bash
mysql -u <user> -p < db.sql
```

- MySQL Workbench: use "Data Import/Restore" and select `db.sql`

Important:
- The script **drops tables**, so run it on a fresh database or one you're okay overwriting.
- For GitHub/public sharing, review `db.sql` first (it contains sample `users` and `sessions` rows).

4) Start the server:

```bash
npm start
```

Server default: `http://localhost:8080` (or `PORT` from `.env`).

## Using the app

- List page: `http://localhost:8080/animals.html`
- Detail page: click "View" in the list, or open `http://localhost:8080/animal_detail.html?id=<animal_id>`

## API endpoints

Base URL: `http://localhost:<PORT>`

### Auth (`/api/auth`)

- `GET /api/auth/me` -> `{ user: { id, name, email, role } | null }`
- `POST /api/auth/register` -> registers and logs in (expects JSON: `name`, `email`, `password`, optional `role`)
- `POST /api/auth/login` -> logs in (expects JSON: `email`, `password`)
- `POST /api/auth/logout` -> logs out

### Animals (`/api/animals`)

- `GET /api/animals` -> list all animals
- `GET /api/animals/:id` -> one animal + `images` array (joins `animal_images`)

Admin-only (requires a logged-in session with `role === "admin"`):

- `POST /api/animals` -> create animal (multipart form-data)
  - Fields: `name`, `species`, `breed`, `gender`, `age_months`, `temperament`, `status`
  - Files: `image` (upload **exactly 3** images)
- `PUT /api/animals/:id` -> update animal (multipart form-data)
  - Same fields as create
  - Files: `image` (optional; if provided, must upload **exactly 3** images to replace)
- `DELETE /api/animals/:id` -> delete animal

## GitHub notes

- Do not commit `.env` (it contains secrets). Commit `.env.example` instead.
- Do not commit `node_modules/`. If it was committed previously, remove it from Git history before publishing.
- `db.sql` includes sample data (including user emails, password hashes, and session data). If you're making the repo public, remove/sanitize those rows or exclude the file.
- Image filenames in the dump may differ by letter-case from files in `public/images/`; this can break on case-sensitive systems (e.g., Linux).

## Known issues / limitations (current code)

- Anyone can register as `"admin"` via `POST /api/auth/register` if they send `role: "admin"`. Do not use this as-is for a real deployment.
- `public/animal_detail.html` uses file input name `images`, but the backend expects `image` (so uploading from the detail page edit form may fail).
- UI rendering uses `innerHTML` with DB data, which can be an XSS risk if untrusted content is stored.
