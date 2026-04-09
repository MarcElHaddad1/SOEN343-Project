# Testing — Kabany

This branch contains all test suites for the Mobility Rental platform.

## Test Structure

```
backend/tests/
├── auth.test.js       Auth routes: register, login, /me, password change
├── vehicles.test.js   Vehicle CRUD, filters, role enforcement
└── bookings.test.js   Booking flow, date validation, return logic

frontend/tests/
└── components.test.jsx  ProtectedRoute, ToastViewport unit tests
```

## Backend Tests

**Stack:** Jest + Supertest

```bash
cd backend
npm install
# Add TEST_MONGODB_URI to backend/.env (use a separate test database!)
npm test
```

All tests clean up after themselves using `afterEach`/`afterAll` hooks. Use a dedicated test database — never run against production.

### Coverage

| File | What's tested |
|------|--------------|
| `auth.test.js` | Registration (customer/provider), duplicate email, login success/fail, JWT validation, password change |
| `vehicles.test.js` | Public search, providerId filter, pagination cap, create (provider/customer/unauth), PATCH own vehicle, DELETE own vehicle |
| `bookings.test.js` | My bookings list, Stripe session creation, date validation, vehicle-not-found, return booking, double-return 409 |

## Frontend Tests

**Stack:** Vitest + @testing-library/react

```bash
cd frontend
npm install
npm test
```

### Coverage

| File | What's tested |
|------|--------------|
| `components.test.jsx` | ProtectedRoute: loading state, unauthenticated redirect, authenticated render, role mismatch redirect, role match render; ToastViewport: no render when empty |

## Writing New Tests

**Backend:**
- Place files in `backend/tests/` named `*.test.js`
- Use `supertest` to call the Express app directly — no running server needed
- Mock third-party services (Stripe, Twilio, OpenAI) with `jest.mock()`
- Always clean up created records in `afterAll`

**Frontend:**
- Place files in `frontend/tests/` named `*.test.jsx`
- Use `@testing-library/react` — test behaviour, not implementation
- Mock `useAuth` with `vi.mock()` to control auth state per test

## Environment

Add a `TEST_MONGODB_URI` to `backend/.env` pointing to a dedicated test database:

```
TEST_MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mobility_rental_test
```
