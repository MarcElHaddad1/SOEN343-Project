/**
 * tests/bookings.test.js
 * Integration tests for /api/bookings routes.
 * Stripe calls are mocked — no real payments are made.
 */

import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../src/app.js";
import { User } from "../src/models/User.js";
import { Vehicle } from "../src/models/Vehicle.js";
import { Booking } from "../src/models/Booking.js";
import { Payment } from "../src/models/Payment.js";

// Mock Stripe so no network calls are made during tests
jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          url: "https://checkout.stripe.com/test",
          id: "cs_test_session_001",
          payment_intent: "pi_test_001",
          payment_status: "paid",
          metadata: {
            userId: "WILL_BE_SET",
            vehicleId: "WILL_BE_SET",
            startDate: new Date(Date.now() + 86400000).toISOString(),
            endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
            totalAmount: "150"
          }
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: "cs_test_session_001",
          payment_intent: "pi_test_001",
          payment_status: "paid",
          metadata: {
            userId: "WILL_BE_SET",
            vehicleId: "WILL_BE_SET",
            startDate: new Date(Date.now() + 86400000).toISOString(),
            endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
            totalAmount: "150"
          }
        })
      }
    }
  }));
});

const app = createApp();

let customerToken;
let customerId;
let vehicleId;

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI || process.env.MONGODB_URI);

  // Provider
  await request(app).post("/api/auth/register").send({
    name: "Booking Provider",
    email: "bprovider@test.local",
    password: "password123",
    role: "provider"
  });
  await User.updateOne({ email: "bprovider@test.local" }, { approved: true });
  const provRes = await request(app).post("/api/auth/login").send({
    email: "bprovider@test.local",
    password: "password123"
  });

  // Vehicle
  const vRes = await request(app)
    .post("/api/vehicles")
    .set("Authorization", `Bearer ${provRes.body.token}`)
    .send({
      name: "Booking Car",
      type: "Car",
      pricePerDay: 50,
      city: "TestCity",
      addressFormatted: "1 Test Rd",
      lat: 45.5,
      lng: -73.5
    });
  vehicleId = vRes.body.vehicle._id;

  // Customer
  await request(app).post("/api/auth/register").send({
    name: "Booking Customer",
    email: "bcustomer@test.local",
    password: "password123",
    role: "customer"
  });
  const custRes = await request(app).post("/api/auth/login").send({
    email: "bcustomer@test.local",
    password: "password123"
  });
  customerToken = custRes.body.token;
  customerId = custRes.body.user.id;
});

afterAll(async () => {
  await Payment.deleteMany({});
  await Booking.deleteMany({});
  await Vehicle.deleteMany({ city: "TestCity" });
  await User.deleteMany({ email: /@test\.local$/ });
  await mongoose.disconnect();
});

// ---------------------------------------------------------------------------
// GET /api/bookings/my
// ---------------------------------------------------------------------------

describe("GET /api/bookings/my", () => {
  it("returns empty array when customer has no bookings", async () => {
    const res = await request(app)
      .get("/api/bookings/my")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/bookings/my");
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// POST /api/bookings/checkout/session
// ---------------------------------------------------------------------------

describe("POST /api/bookings/checkout/session", () => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const threeDays = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];

  it("returns a Stripe checkout URL for valid input", async () => {
    const res = await request(app)
      .post("/api/bookings/checkout/session")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ vehicleId, startDate: tomorrow, endDate: threeDays });

    expect(res.status).toBe(201);
    expect(res.body.url).toContain("stripe.com");
  });

  it("returns 400 when dates are missing", async () => {
    const res = await request(app)
      .post("/api/bookings/checkout/session")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ vehicleId });
    expect(res.status).toBe(400);
  });

  it("returns 400 when end date is before start date", async () => {
    const res = await request(app)
      .post("/api/bookings/checkout/session")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ vehicleId, startDate: threeDays, endDate: tomorrow });
    expect(res.status).toBe(400);
  });

  it("returns 404 for a non-existent vehicle", async () => {
    const res = await request(app)
      .post("/api/bookings/checkout/session")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        vehicleId: new mongoose.Types.ObjectId(),
        startDate: tomorrow,
        endDate: threeDays
      });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// POST /api/bookings/:id/return
// ---------------------------------------------------------------------------

describe("POST /api/bookings/:id/return", () => {
  it("marks a booking as completed and frees the vehicle", async () => {
    // Directly create a booking for this test
    const booking = await Booking.create({
      userId: customerId,
      vehicleId,
      status: "confirmed",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      totalAmount: 50
    });

    const res = await request(app)
      .post(`/api/bookings/${booking._id}/return`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(200);

    const updated = await Booking.findById(booking._id);
    expect(updated.status).toBe("completed");

    const vehicle = await Vehicle.findById(vehicleId);
    expect(vehicle.available).toBe(true);
  });

  it("returns 409 when vehicle is already returned", async () => {
    const booking = await Booking.create({
      userId: customerId,
      vehicleId,
      status: "completed",
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      totalAmount: 50
    });

    const res = await request(app)
      .post(`/api/bookings/${booking._id}/return`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(409);
  });
});
