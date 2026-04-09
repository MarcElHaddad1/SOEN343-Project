/**
 * tests/vehicles.test.js
 * Integration tests for /api/vehicles routes.
 */

import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../src/app.js";
import { User } from "../src/models/User.js";
import { Vehicle } from "../src/models/Vehicle.js";

const app = createApp();

let providerToken;
let customerToken;
let providerId;

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI || process.env.MONGODB_URI);

  // Register + approve a provider
  await request(app).post("/api/auth/register").send({
    name: "Vehicle Provider",
    email: "vprovider@test.local",
    password: "password123",
    role: "provider"
  });
  await User.updateOne({ email: "vprovider@test.local" }, { approved: true });
  const provRes = await request(app).post("/api/auth/login").send({
    email: "vprovider@test.local",
    password: "password123"
  });
  providerToken = provRes.body.token;
  providerId = provRes.body.user.id;

  // Register a customer
  await request(app).post("/api/auth/register").send({
    name: "Vehicle Customer",
    email: "vcustomer@test.local",
    password: "password123",
    role: "customer"
  });
  const custRes = await request(app).post("/api/auth/login").send({
    email: "vcustomer@test.local",
    password: "password123"
  });
  customerToken = custRes.body.token;
});

afterAll(async () => {
  await Vehicle.deleteMany({ city: "TestCity" });
  await User.deleteMany({ email: /@test\.local$/ });
  await mongoose.disconnect();
});

// ---------------------------------------------------------------------------
// GET /api/vehicles
// ---------------------------------------------------------------------------

describe("GET /api/vehicles", () => {
  it("returns paginated results for unauthenticated users", async () => {
    const res = await request(app).get("/api/vehicles");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.page).toBe(1);
  });

  it("filters by city", async () => {
    const res = await request(app).get("/api/vehicles?city=Montreal");
    expect(res.status).toBe(200);
    res.body.items.forEach((v) => expect(v.city).toBe("Montreal"));
  });

  it("filters by providerId", async () => {
    const res = await request(app).get(`/api/vehicles?providerId=${providerId}`);
    expect(res.status).toBe(200);
    res.body.items.forEach((v) => {
      expect(v.providerId._id ?? v.providerId).toBe(providerId);
    });
  });

  it("respects the limit parameter (max 48)", async () => {
    const res = await request(app).get("/api/vehicles?limit=999");
    expect(res.status).toBe(200);
    expect(res.body.meta.limit).toBeLessThanOrEqual(48);
  });
});

// ---------------------------------------------------------------------------
// POST /api/vehicles
// ---------------------------------------------------------------------------

describe("POST /api/vehicles", () => {
  const validPayload = {
    name: "Test Corolla",
    type: "Car",
    pricePerDay: 55,
    city: "TestCity",
    addressFormatted: "123 Test St, TestCity",
    lat: 45.5,
    lng: -73.5,
    available: true
  };

  it("creates a vehicle for an approved provider", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${providerToken}`)
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.vehicle.name).toBe("Test Corolla");
    expect(res.body.vehicle.providerId).toBeDefined();
  });

  it("returns 403 for a customer", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${customerToken}`)
      .send(validPayload);
    expect(res.status).toBe(403);
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).post("/api/vehicles").send(validPayload);
    expect(res.status).toBe(401);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${providerToken}`)
      .send({ name: "Incomplete" });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/vehicles/:id  &  DELETE /api/vehicles/:id
// ---------------------------------------------------------------------------

describe("PATCH & DELETE /api/vehicles/:id", () => {
  let vehicleId;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${providerToken}`)
      .send({
        name: "Edit Me",
        type: "Bike",
        pricePerDay: 20,
        city: "TestCity",
        addressFormatted: "456 Edit Ave, TestCity",
        lat: 45.5,
        lng: -73.5
      });
    vehicleId = res.body.vehicle._id;
  });

  it("updates own vehicle", async () => {
    const res = await request(app)
      .patch(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${providerToken}`)
      .send({ pricePerDay: 25 });

    expect(res.status).toBe(200);
    expect(res.body.vehicle.pricePerDay).toBe(25);
  });

  it("returns 403 when customer tries to update a vehicle", async () => {
    const res = await request(app)
      .patch(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ pricePerDay: 10 });
    expect(res.status).toBe(403);
  });

  it("deletes own vehicle", async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${providerToken}`);
    expect(res.status).toBe(200);

    const check = await request(app).get(`/api/vehicles/${vehicleId}`);
    expect(check.status).toBe(404);
  });
});
