# Mobility Rental

A full-stack vehicle rental platform with customer, provider, and admin roles.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, React Router v7 |
| Backend | Node.js, Express 5, MongoDB (Mongoose) |
| Payments | Stripe Checkout |
| Notifications | Nodemailer (email) + Twilio (SMS) |
| Images | OpenAI DALL·E 3 |
| Maps | Google Maps / Places API |

## Project Structure

```
mobility-rental/
├── backend/          # Express API
│   ├── src/
│   │   ├── config/   # Environment config
│   │   ├── lib/      # DB connection
│   │   ├── middleware/  # JWT auth
│   │   ├── models/   # Mongoose schemas
│   │   ├── routes/   # API route handlers
│   │   ├── services/ # Notifications, image gen
│   │   └── utils/    # Bootstrap, sanitize helpers
│   └── scripts/      # One-off seed / maintenance scripts
└── frontend/         # React SPA
    └── src/
        ├── api/      # Fetch client
        ├── components/
        ├── context/  # Auth + Toast contexts
        └── pages/
```

## Quick Start

### 1. Clone & install

```bash
git clone <repo-url>
cd mobility-rental

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure environment

```bash
# Backend
cp .env.example backend/.env
# Edit backend/.env with your real values

# Frontend
cp .env.example frontend/.env
# Edit frontend/.env with your real values
```

### 3. Run development servers

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend && npm run dev
```

### 4. Seed the database (optional)

```bash
cd backend && npm run seed
```

## User Roles

| Role | Access |
|------|--------|
| **customer** | Search vehicles, book, view bookings/payments/notifications |
| **provider** | List and manage vehicles (requires admin approval) |
| **admin** | Approve/reject providers, view platform stats |

## Environment Variables

See `.env.example` in the project root for all required variables.

Key services you need to configure:
- **MongoDB Atlas** — database connection string
- **Stripe** — payment processing (test keys are fine for dev)
- **OpenAI** — DALL·E image generation (optional; falls back to placeholder images)
- **Google Maps** — address autocomplete + map embeds
- **Twilio + Gmail** — SMS and email notifications (optional)

## API Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register customer or provider |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| PATCH | `/api/auth/me` | JWT | Update profile |
| PATCH | `/api/auth/me/password` | JWT | Change password |
| GET | `/api/vehicles` | Public | Search/filter vehicles |
| GET | `/api/vehicles/:id` | Public | Get single vehicle |
| POST | `/api/vehicles` | Provider | Create vehicle listing |
| PATCH | `/api/vehicles/:id` | Provider | Update listing |
| DELETE | `/api/vehicles/:id` | Provider | Delete listing |
| GET | `/api/bookings/my` | Customer | My bookings |
| POST | `/api/bookings/checkout/session` | Customer | Create Stripe session |
| POST | `/api/bookings/checkout/confirm` | Customer | Confirm after payment |
| POST | `/api/bookings/:id/return` | Customer | Return vehicle |
| GET | `/api/bookings/payments/my` | Customer | Payment history |
| GET | `/api/notifications/my` | JWT | Notification log |
| GET | `/api/maps/autocomplete` | Public | Address suggestions |
| GET | `/api/maps/place/:placeId` | Public | Resolve place to coords |
| GET | `/api/admin/stats` | Admin | Platform metrics |
| GET | `/api/admin/providers` | Admin | All providers |
| GET | `/api/admin/users` | Admin | All customers |
| POST | `/api/admin/providers/:id/approve` | Admin | Approve provider |
| POST | `/api/admin/providers/:id/reject` | Admin | Reject provider |
