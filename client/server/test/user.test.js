const express = require("express");
const { ObjectId } = require("mongodb");
const route = require("../routes/user").route; // Import the route
const createMockDB = require("../services/mockDB");
const proxyquire = require("proxyquire");
const chai = require("chai");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);
const { expect } = chai;

describe("User Route - /api/users/current", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Set up session middleware
    app.use((req, res, next) => {
      req.session = {}; // Simulate session
      next();
    });
  });

  it("should return the current user when authenticated", (done) => {
    const userId = "605c72ef35073e2f58c0286e"; // Sample ObjectId

    // Middleware to set req.session.userId
    app.use((req, res, next) => {
      req.session.userId = userId;
      next();
    });

    // Mock DB behavior to return a user
    const mockDB = createMockDB({
      findOne: async (query) => {
        if (query._id.equals(new ObjectId(userId))) {
          return {
            _id: query._id,
            username: "testUser",
            email: "test@example.com",
          };
        }
        return null;
      },
    });

    // Register the route with the mock DB
    route(app, mockDB);

    chai
      .request(app)
      .get("/api/users/current")
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("username", "testUser");
        done();
      });
  });

  it("should return 401 if user is not authenticated", (done) => {
    const mockDB = createMockDB({});

    route(app, mockDB);

    chai
      .request(app)
      .get("/api/users/current")
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(401);
        expect(res.body).to.have.property("message", "User not authenticated");
        done();
      });
  });

  it("should return 404 if user not found", (done) => {
    const userId = "605c72ef35073e2f58c0286e";

    app.use((req, res, next) => {
      req.session.userId = userId;
      next();
    });

    const mockDB = createMockDB({
      findOne: async () => null,
    });

    route(app, mockDB);

    chai
      .request(app)
      .get("/api/users/current")
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "User not found");
        done();
      });
  });
});

describe("User Route - GET /api/users", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  it("should return a list of users", (done) => {
    const users = [
      { _id: new ObjectId(), username: "user1", email: "user1@example.com" },
      { _id: new ObjectId(), username: "user2", email: "user2@example.com" },
    ];

    // Create a mock for the userService
    const mockUserService = {
      readUsers: async () => users,
    };

    // Use proxyquire to replace userService in routes/user.js
    const route = proxyquire("../routes/user", {
      "../services/userService": mockUserService,
    }).route;

    const mockDb = {}; // Mock DB object

    // Register the route
    route(app, mockDb);

    // Make a GET request to /api/users
    chai
      .request(app)
      .get("/api/users")
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.equal(2); // Expect two users
        expect(res.body[0]).to.have.property("username", "user1");
        expect(res.body[1]).to.have.property("username", "user2");
        done();
      });
  });
});

describe("User Route - GET /api/users/:userId", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  it("should return a user when a valid ObjectId is provided", (done) => {
    const userId = "605c72ef35073e2f58c0286e"; // Mock valid ObjectId

    // Create a mock for the userService
    const mockUserService = {
      getUserById: async (db, id) => ({
        _id: id,
        username: "testUser",
        email: "test@example.com",
      }),
      getUserByUsername: async () => null, // Should not be called in this test
    };

    // Use proxyquire to replace userService in routes/user.js
    const route = proxyquire("../routes/user", {
      "../services/userService": mockUserService,
    }).route;

    const mockDb = {}; // Mock DB object

    // Register the route
    route(app, mockDb);

    // Make a GET request to /api/users/:userId
    chai
      .request(app)
      .get(`/api/users/${userId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("username", "testUser");
        done();
      });
  });

  it("should return a user when a valid username is provided", (done) => {
    const username = "testUser"; // Mock valid username

    // Create a mock for the userService
    const mockUserService = {
      getUserById: async () => null, // Should not be called in this test
      getUserByUsername: async (db, name) => ({
        username: name,
        email: "test@example.com",
      }),
    };

    // Use proxyquire to replace userService in routes/user.js
    const route = proxyquire("../routes/user", {
      "../services/userService": mockUserService,
    }).route;

    const mockDb = {}; // Mock DB object

    // Register the route
    route(app, mockDb);

    // Make a GET request to /api/users/:userId (where userId is a username)
    chai
      .request(app)
      .get(`/api/users/${username}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("username", "testUser");
        done();
      });
  });

  it("should return 404 if user is not found by ObjectId", (done) => {
    const userId = "605c72ef35073e2f58c0286e"; // Mock valid ObjectId

    // Create a mock for the userService
    const mockUserService = {
      getUserById: async () => null, // Return null to simulate user not found
      getUserByUsername: async () => null, // Should not be called in this test
    };

    // Use proxyquire to replace userService in routes/user.js
    const route = proxyquire("../routes/user", {
      "../services/userService": mockUserService,
    }).route;

    const mockDb = {}; // Mock DB object

    // Register the route
    route(app, mockDb);

    // Make a GET request to /api/users/:userId
    chai
      .request(app)
      .get(`/api/users/${userId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "User not found");
        done();
      });
  });

  it("should return 404 if user is not found by username", (done) => {
    const username = "nonexistentUser"; // Mock invalid username

    // Create a mock for the userService
    const mockUserService = {
      getUserById: async () => null, // Should not be called in this test
      getUserByUsername: async () => null, // Return null to simulate user not found
    };

    // Use proxyquire to replace userService in routes/user.js
    const route = proxyquire("../routes/user", {
      "../services/userService": mockUserService,
    }).route;

    const mockDb = {}; // Mock DB object

    // Register the route
    route(app, mockDb);

    // Make a GET request to /api/users/:userId (where userId is a username)
    chai
      .request(app)
      .get(`/api/users/${username}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "User not found");
        done();
      });
  });

  it("should return 500 if there is a server error", (done) => {
    const userId = "605c72ef35073e2f58c0286e"; // Mock valid ObjectId

    // Create a mock for the userService to throw an error
    const mockUserService = {
      getUserById: async () => {
        throw new Error("Server error");
      },
      getUserByUsername: async () => null, // Should not be called in this test
    };

    // Use proxyquire to replace userService in routes/user.js
    const route = proxyquire("../routes/user", {
      "../services/userService": mockUserService,
    }).route;

    const mockDb = {}; // Mock DB object

    // Register the route
    route(app, mockDb);

    // Make a GET request to /api/users/:userId
    chai
      .request(app)
      .get(`/api/users/${userId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(500);
        expect(res.body).to.have.property("message", "Failed to get user");
        done();
      });
  });
});

