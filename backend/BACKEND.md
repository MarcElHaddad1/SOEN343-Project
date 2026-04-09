# Backend — Ahmad

This branch contains all backend source code for the Mobility Rental platform.

## Ownership

| Area | Files |
|------|-------|
| Entry point | `backend/src/index.js`, `backend/src/app.js` |
| Config | `backend/src/config/env.js` |
| Database | `backend/src/lib/db.js` |
| Auth middleware | `backend/src/middleware/auth.js` |
| Models | `backend/src/models/` |
| Routes | `backend/src/routes/` |
| Services | `backend/src/services/` |
| Utilities | `backend/src/utils/` |
| Scripts | `backend/scripts/` |

## Setup

```bash
cd backend
npm install
cp ../.env.example .env   # fill in MONGODB_URI, JWT_SECRET, STRIPE_SECRET_KEY, etc.
npm run dev               # http://localhost:5000
```

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Register customer or provider |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| PATCH | `/api/auth/me` | JWT | Update profile |
| PATCH | `/api/auth/me/password` | JWT | Change password |
| GET | `/api/vehicles` | Public | Search/filter vehicles (`?providerId=` supported) |
| GET | `/api/vehicles/:id` | Public | Single vehicle |
| POST | `/api/vehicles` | Provider | Create listing |
| PATCH | `/api/vehicles/:id` | Provider | Update listing |
| DELETE | `/api/vehicles/:id` | Provider | Delete listing |
| GET | `/api/bookings/my` | Customer | My bookings |
| POST | `/api/bookings/checkout/session` | Customer | Create Stripe session |
| POST | `/api/bookings/checkout/confirm` | Customer | Confirm after Stripe redirect |
| POST | `/api/bookings/:id/return` | Customer | Return vehicle |
| GET | `/api/bookings/payments/my` | Customer | Payment history |
| GET | `/api/notifications/my` | JWT | Notification log |
| GET | `/api/maps/autocomplete` | Public | Google Places suggestions |
| GET | `/api/maps/place/:placeId` | Public | Resolve place to coordinates |
| GET | `/api/admin/stats` | Admin | Platform metrics |
| GET | `/api/admin/providers` | Admin | All providers |
| GET | `/api/admin/pending-providers` | Admin | Unapproved providers |
| GET | `/api/admin/users` | Admin | All customers |
| POST | `/api/admin/providers/:id/approve` | Admin | Approve provider |
| POST | `/api/admin/providers/:id/reject` | Admin | Reject provider |

## Auth Middleware

Three helpers in `src/middleware/auth.js`:

- `authRequired` — blocks unauthenticated requests (401)
- `authOptional` — reads token if present, never blocks (useful for public routes)
- `requireRole(...roles)` — must follow `authRequired`; returns 403 on mismatch

## Fixes Applied

- `adminRoutes` applies `authRequired + requireRole('admin')` once at the top via `router.use()` — individual handlers can't accidentally be left unguarded
- `bookingRoutes` confirm endpoint uses `session.id` as idempotency key fallback when `payment_intent` is null
- `vehicleRoutes` accepts `?providerId=` filter server-side
- Replaced hardcoded developer scripts with generic `assignProviderToVehicles.js` and `checkProviderAssignment.js`

## Seeding

```bash
npm run seed              # creates 5 providers + 50 vehicles (default)
SEED_COUNT=100 npm run seed  # custom vehicle count
```
