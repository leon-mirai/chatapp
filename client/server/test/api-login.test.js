const chai = require("chai");
const chaiHttp = require("chai-http");
const express = require("express");
const { route } = require("../routes/api-login");
const { expect } = chai;

chai.use(chaiHttp); 

let app, db;

beforeEach(() => {
  
  app = express();
  app.use(express.json());

  // Default mock database behavior (no user found)
  db = {
    collection: () => ({
      findOne: async () => null, 
    }),
  };
});

describe("POST /api/auth", () => {
  it("should return 401 when no user is found", async () => {
    
    route(app, db);

    const res = await chai
      .request(app)
      .post("/api/auth")
      .send({ email: "test@example.com", password: "wrongpassword" });

    expect(res.status).to.equal(401);
    expect(res.body).to.have.property("message", "Invalid username or password");
  });

  it("should return 200 when user is valid", async () => {
    
    db.collection = () => ({
      findOne: async () => ({
        _id: "605c72ef35073e2f58c0286e",
        email: "test@example.com",
        username: "testuser",
        password: "correctpassword", 
        valid: true, 
      }),
    });

    
    route(app, db);

    const res = await chai
      .request(app)
      .post("/api/auth")
      .send({ email: "test@example.com", password: "correctpassword" });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message", "Login successful");
    expect(res.body.user).to.have.property("username", "testuser");
  });

  it("should return 401 when the password is incorrect", async () => {
    
    db.collection = () => ({
      findOne: async () => ({
        _id: "12345",
        email: "test@example.com",
        username: "testuser",
        password: "correctpassword", 
        valid: true,
      }),
    });

    
    route(app, db);

    const res = await chai
      .request(app)
      .post("/api/auth")
      .send({ email: "test@example.com", password: "wrongpassword" });

    expect(res.status).to.equal(401);
    expect(res.body).to.have.property("message", "Invalid username or password");
  });
});
