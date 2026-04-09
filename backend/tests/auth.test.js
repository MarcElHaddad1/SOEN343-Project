/**
 * tests/auth.test.js
 * Unit + integration tests for /api/auth routes.
 *
 * Run: cd backend && npm test
 * Requires: NODE_ENV=test and a TEST_MONGODB_URI in .env
 */

import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../src/app.js";
import { User } from "../src/models/User.js";

const app = createApp();

beforeAll(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI || process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
  await User.deleteMany({ email: /@test\.local$/ });
});

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------

describe("POST /api/auth/register", () => {
  it("registers a new customer and returns 201", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "customer@test.local",
      password: "password123",
      phone: "+15140000001",
      role: "customer"
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe("customer@test.local");
    expect(res.body.user.role).toBe("customer");
    // passwordHash must never be exposed
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("registers a provider with approved=false", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test Provider",
      email: "provider@test.local",
      password: "password123",
      phone: "+15140000002",
      role: "provider"
    });

    expect(res.status).toBe(201);
    expect(res.body.user.approved).toBe(false);
  });

  it("returns 409 on duplicate email", async () => {
    const payload = {
      name: "Dup User",
      email: "dup@test.local",
      password: "password123",
      role: "customer"
    };
    await request(app).post("/api/auth/register").send(payload);
    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "noname@test.local"
    });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Login Tester",
      email: "login@test.local",
      password: "correct_password",
      role: "customer"
    });
  });

  it("returns a JWT token on valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@test.local",
      password: "correct_password"
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user.email).toBe("login@test.local");
  });

  it("returns 401 on wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@test.local",
      password: "wrong_password"
    });
    expect(res.status).toBe(401);
  });

  it("returns 401 for non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@test.local",
      password: "irrelevant"
    });
    expect(res.status).toBe(401);
  });

  it("returns 400 when fields are missing", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "login@test.local" });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------

describe("GET /api/auth/me", () => {
  let token;

  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Me Tester",
      email: "me@test.local",
      password: "password123",
      role: "customer"
    });
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "me@test.local",
      password: "password123"
    });
    token = loginRes.body.token;
  });

  it("returns the current user when authenticated", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@test.local");
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 with a malformed token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not_a_real_token");
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/auth/me/password
// ---------------------------------------------------------------------------

describe("PATCH /api/auth/me/password", () => {
  let token;

  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Pass Tester",
      email: "pass@test.local",
      password: "old_password",
      role: "customer"
    });
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "pass@test.local",
      password: "old_password"
    });
    token = loginRes.body.token;
  });

  it("updates password with correct current password", async () => {
    const res = await request(app)
      .patch("/api/auth/me/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "old_password", newPassword: "new_password" });

    expect(res.status).toBe(200);

    // Verify new password works
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "pass@test.local",
      password: "new_password"
    });
    expect(loginRes.status).toBe(200);
  });

  it("returns 401 with incorrect current password", async () => {
    const res = await request(app)
      .patch("/api/auth/me/password")
      .set("Authorization", `Bearer ${token}`)
      .send({ currentPassword: "wrong", newPassword: "new_password" });

    expect(res.status).toBe(401);
  });
});
