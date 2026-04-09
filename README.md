# Mobility Rental Full-Stack App

This project is now split into:

- `frontend` (React + Vite)
- `backend` (Node + Express + MongoDB + Stripe test payments)

## Quick Start

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
   - `npm run install:all`
3. Seed demo data (50 vehicles):
   - `npm run seed`
4. Run both services:
   - `npm run dev`

Frontend runs on `http://localhost:5173`.
Backend runs on `http://localhost:5000`.

## Main Features

- MongoDB-backed users/providers/vehicles/bookings/payments/notifications
- Provider approval workflow
- Vehicle search with filters/sort/pagination
- Vehicle detail view with map
- Checkout flow with Stripe test-mode payment intent
- Profile settings with address autocomplete (Google Places via backend)
- Twilio + email notifications for key lifecycle events
- OpenAI image generation on vehicle create (with fallback images)
