# 🏍️ MoldovaMotoWithBE – Full-Stack Motorcycle Tour Website

A premium, production-grade React web application for a Moldovan motorcycle tour company.
Includes a public-facing booking website and a full admin dashboard with auth and CRUD.

---

## Routes

| Path     | Description                              |
|----------|------------------------------------------|
| `/`      | Public tour website with booking flow    |
| `/admin` | Admin portal (login: `admin / moldova2024`) |

---

## Quick Start — Docker (Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Compose)

### Development mode — hot reload on port 3000

```bash
# Clone / unzip the project
cd moldovamotoWithBE

# Build image and start dev server
docker compose up --build

# Open in browser
open http://localhost:3000        # public site
open http://localhost:3000/admin  # admin panel
```

> Source files are bind-mounted, so any edit to `src/` reloads instantly via Vite HMR.

### Production mode — optimised build served by Nginx on port 80

```bash
docker compose --profile prod up --build

open http://localhost        # public site
open http://localhost/admin  # admin panel
```

### Rebuild after adding packages

```bash
docker compose up --build
```

---

## Quick Start — Local Node (no Docker)

```bash
cd moldovamotoWithBE
npm install
npm run dev
# → http://localhost:3000
```

Build for production:

```bash
npm run build
npm run preview   # serves dist/ on :4173
```

---

## Project Structure

```
moldovamoto/
├── Dockerfile              # Multi-stage: dev → builder → prod (nginx)
├── docker-compose.yml      # Dev (default) + prod profiles
├── nginx.conf              # SPA routing + gzip + security headers
├── index.html              # Vite HTML entry with SEO meta tags
├── vite.config.js          # Vite config: host 0.0.0.0, port 3000
├── package.json
└── src/
    ├── main.jsx            # React root + BrowserRouter + routes
    └── pages/
        ├── Home.jsx        # Public website (hero, tours, map, booking modal)
        └── Admin.jsx       # Admin panel (auth, dashboard, CRUD)
```

---

## Admin Panel

Login with: **admin / moldova2024**

| Section   | Features                                                              |
|-----------|-----------------------------------------------------------------------|
| Dashboard | Live stats, revenue bar chart, fleet status, recent bookings table    |
| Routes    | Create / edit / delete tours, filter by status, difficulty colour coding |
| Bookings  | Search, filter, inline confirm/cancel, full edit modal, revenue sub-stats |
| Fleet     | Table + card grid views, status badges, odometer, last service date   |

Admin data persists in **localStorage** between browser sessions.

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| UI       | React 18, inline styles             |
| Routing  | React Router v6                     |
| Build    | Vite 5                              |
| Images   | Unsplash CDN (swap for real photos) |
| Fonts    | Google Fonts – Archivo + Lora       |
| Serve    | Nginx 1.27 (production)             |
| Container| Docker + Docker Compose             |

---

## Customisation

### Replace placeholder images
Swap the Unsplash URLs in `src/pages/Home.jsx`:
```js
img: "https://images.unsplash.com/photo-xxxxx?w=600&q=80"
```

### Change admin credentials
Edit in `src/pages/Admin.jsx`:
```js
if (user === "admin" && pass === "moldova2024") {
```

### Add real backend
Replace the `localStorage` calls in Admin.jsx's `useEffect` / `persist` with
`fetch()` calls to your API (Express, Supabase, PocketBase, etc.).

---

## License
MIT — free to use and modify for commercial projects.
