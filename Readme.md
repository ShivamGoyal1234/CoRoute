# coRoute

**Collaborative trip planning platform** — create trips, manage itineraries, budgets, and checklists, and discuss activities with other travelers in real time.

---

## Features

- **Authentication** — Email/password signup and login; OTP for verification and password reset; JWT-based sessions
- **Trips** — Create, edit, and delete trips with dates, destination, map location, currency, and budget
- **Itinerary** — Days and activities (title, time, cost, status, images); drag-and-drop ordering; activity detail modal
- **Budget** — Total budget and categories; budgeting section and summary
- **Organization** — Invite members (owner/editor/viewer); collaboration feed; trip messages
- **Travel files** — Trip-level uploads and per-activity attachments
- **Checklists** — Packing, booking, documentation; assign tasks; mark complete
- **Activity discussion** — Comments per activity with **real-time updates** (Socket.IO)
- **Theme** — Light / dark / system with persistence
- **Maps** — Google Maps for trip location, trip cards, and landing hero

---

## Tech Stack

| Layer     | Technologies |
| --------- | ------------- |
| **Frontend** | React 19, TypeScript, Vite 7, React Router 7, Tailwind CSS 4, Framer Motion, Axios, Socket.IO client, React Google Maps API, Heroicons |
| **Backend**  | Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, bcrypt, Socket.IO, Multer, ImageKit, Resend/Nodemailer, Helmet, express-validator, rate limiting |
| **Deploy**   | Netlify (frontend), separate backend host |

---

## Project Structure

```
coRoute/
├── frontend/                 # React SPA
│   ├── public/
│   ├── src/
│   │   ├── components/      # Layout, modals, cards, maps, etc.
│   │   ├── contexts/        # Auth, Theme, Socket, SkipAnimation
│   │   ├── lib/             # api.ts, axios.ts
│   │   ├── pages/           # Landing, Dashboard, TripDetail, Auth, Settings, etc.
│   │   ├── types/           # Shared TypeScript types
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Express API
│   ├── src/
│   │   ├── config/          # App config, database
│   │   ├── controllers/
│   │   ├── middleware/      # auth, permission, error
│   │   ├── models/          # User, Trip, Day, Activity, Comment, etc.
│   │   ├── routes/
│   │   ├── services/        # email, webhook
│   │   ├── socket/
│   │   ├── app.ts
│   │   └── types/
│   ├── package.json
│   └── tsconfig.json
├── netlify.toml              # Netlify build (frontend)
└── README.md                 # This file
```

---

## Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **npm** or yarn

---

## Installation

### 1. Clone and install dependencies

```bash
# From repo root
cd frontend && npm install && cd ..
cd backend  && npm install && cd ..
```

### 2. Environment variables

**Frontend** — create `frontend/.env`:

```env
# API base URL (no trailing slash). In dev, Vite proxies /api to this.
VITE_API_URL=http://localhost:5000

# Optional: Google Maps (for trip location, cards, hero map)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Backend** — create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/coroute

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# CORS (frontend origin)
CORS_ORIGIN=http://localhost:5173

# Optional: file upload (ImageKit)
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_FOLDER=

# Optional: email (Resend or SMTP)
RESEND_API_KEY=
RESEND_FROM=CoRoute <onboarding@resend.dev>

# Or SMTP
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=
# SMTP_PASS=
# SMTP_FROM=
```

### 3. Run the app

**Terminal 1 — backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 — frontend:**

```bash
cd frontend
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)  
- Backend API: [http://localhost:5000](http://localhost:5000)  

Ensure `frontend/.env` has `VITE_API_URL=http://localhost:5000` so the proxy and Socket.IO connect to the backend.

---

## Scripts

| Location   | Command        | Description                |
| ---------- | -------------- | -------------------------- |
| `frontend/` | `npm run dev`  | Start Vite dev server      |
| `frontend/` | `npm run build`| TypeScript + Vite build    |
| `frontend/` | `npm run preview` | Preview production build |
| `frontend/` | `npm run lint` | ESLint                     |
| `backend/`  | `npm run dev`  | Start with nodemon         |
| `backend/`  | `npm run build`| Compile TypeScript         |
| `backend/`  | `npm start`    | Run compiled `dist/app.js` |
| `backend/`  | `npm run lint` | ESLint                     |

---

## Deployment

### Frontend (Netlify)

- Build settings in **netlify.toml**: base `frontend`, command `npm run build`, publish `dist`.
- Set **Environment variable**: `VITE_API_URL` = your production API URL (e.g. `https://api.yourdomain.com`).
- Optional: `VITE_GOOGLE_MAPS_API_KEY` for maps in production.

### Backend

- Deploy to your preferred Node host (Railway, Render, Fly.io, etc.).
- Set all `backend/.env` variables in the host’s environment.
- Point frontend `VITE_API_URL` to this API URL.

---

## Learning & documentation

- **Project learning** — Auth, REST API, real-time (Socket.IO), state (contexts), theming, maps, and deployment.
- **Tech stack** — See [Tech Stack](#tech-stack) and `frontend/package.json` / `backend/package.json`.
- **Frontend details** — Color palette, component overview, and Vite proxy: see [frontend/README.md](frontend/README.md).

---

## License

MIT
