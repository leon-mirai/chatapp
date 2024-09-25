const request = require("supertest"); // Using Supertest for HTTP requests
const chai = require("chai"); // Using Chai for assertions
const express = require("express");
const { route } = require("../routes/api-login");
const { expect } = chai; // Extract 'expect' from Chai

let app, db;

before(() => {
  // Create mock Express app
  app = express();
  app.use(express.json());

  // Mock the database object (default behavior for "no user found")
  db = {
    collection: () => ({
      findOne: async () => null, // Mock findOne to return null (user not found)
    }),
  };

  // Apply routes with mocked db
  route(app, db);
});

describe("POST /api/auth", () => {
  it("should return 401 when no user is found", async () => {
    const res = await request(app)
      .post("/api/auth")
      .send({ email: "test@example.com", password: "wrongpassword" });

    expect(res.status).to.equal(401);
    expect(res.body).to.have.property(
      "message",
      "Invalid username or password"
    );
  });

  it("should return 200 when user is valid", async () => {
    // Modify the db mock to simulate a valid user found in the database
    db.collection = () => ({
      findOne: async () => ({
        _id: "605c72ef35073e2f58c0286e",
        email: "test@example.com",
        username: "testuser",
        password: "correctpassword",  // Include password in the mock
        valid: true, // Simulate a valid user account
      }),
    });

    const res = await request(app)
      .post("/api/auth")
      .send({ email: "test@example.com", password: "correctpassword" });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Login successful");
    expect(res.body.user).to.have.property("username", "testuser");
  });

  it("should return 401 when the password is incorrect", async () => {
    // Mock the database to return a user
    db.collection = () => ({
      findOne: async () => ({
        _id: '12345',
        email: 'test@example.com',
        username: 'testuser',
        password: 'correctpassword',  // Mock the correct password in the DB
        valid: true,
      }),
    });

    const res = await request(app)
      .post('/api/auth')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message', 'Invalid username or password');
  });
});
