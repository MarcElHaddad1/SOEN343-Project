# Frontend — Mena

This branch contains all frontend source code for the Mobility Rental platform.

## Ownership

| Area | Files |
|------|-------|
| Build config | `frontend/vite.config.js`, `frontend/index.html`, `frontend/package.json` |
| API client | `frontend/src/api/client.js` |
| Auth & Toast contexts | `frontend/src/context/` |
| Shared components | `frontend/src/components/` |
| All pages | `frontend/src/pages/` |
| Global styles | `frontend/src/index.css` |
| Public assets | `frontend/public/` |

## Setup

```bash
cd frontend
npm install
cp ../.env.example .env   # fill in VITE_API_URL and VITE_GOOGLE_MAPS_API_KEY
npm run dev               # http://localhost:5173
```

## Key Pages

| Route | Page | Role |
|-------|------|------|
| `/` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/search` | SearchPage | All authenticated |
| `/vehicles/:id` | VehicleDetailsPage | All authenticated |
| `/checkout/:id` | CheckoutPage | Customer |
| `/checkout/success` | CheckoutSuccessPage | Customer |
| `/bookings` | BookingsPage | Customer |
| `/payments` | PaymentsPage | Customer |
| `/notifications` | NotificationsPage | Customer |
| `/settings` | SettingsPage | All authenticated |
| `/provider` | ProviderPage | Provider |
| `/admin` | AdminPage | Admin |
| `/admin/stats` | AdminStatsPage | Admin |

## Fixes Applied

- `/checkout/success` route declared before `/checkout/:id` to prevent React Router capturing "success" as `:id`
- `AuthContext` functions wrapped in `useCallback` — fixes stale closure bug
- `CheckoutPage` date inputs have `min` attribute to block past dates
- `AdminPage` uses `/pending-providers` endpoint for the approval queue
- `ProviderPage` uses `?providerId=` server-side filter instead of client-side 200-record fetch

## Branch Conventions

- Branch off `mena` for any frontend feature work
- Keep components in `src/components/`, page-level logic in `src/pages/`
- Use `useAuth()` and `useToast()` hooks — do not access localStorage directly
