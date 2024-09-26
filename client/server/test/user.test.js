const express = require("express");
const { ObjectId } = require("mongodb");
const route = require("../routes/user").route;
const createMockDB = require("../services/mockDB");
const proxyquire = require("proxyquire");
const chai = require("chai");
const chaiHttp = require("chai-http");
const { getUserById } = require("../services/userService");

chai.use(chaiHttp);
const { expect } = chai;

describe(" get - /api/users/current (get crrent users)", () => {
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

describe(" - get /api/users (get all users}", () => {
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

describe(" - get /api/users/:userId", () => {
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

describe(" - post /api/users (Account Creation)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  it("should create a new user account successfully", (done) => {
    const mockDB = createMockDB(); // Mock the database

    // Mock the userService functions
    const mockUserService = {
      generateUserId: () => "abcd", // Simulate user ID generation
      createUser: async (db, user) => {
        return { insertedId: "someObjectId" }; // Simulate successful DB insertion
      },
    };

    // Use proxyquire to mock userService in the route
    const { route: userRoute } = proxyquire("../routes/user", {
      "../services/userService": mockUserService, // Proxy userService
    });

    // Register the route with the app and mockDB
    userRoute(app, mockDB);

    // Sample user details for the test
    const sampleUser = {
      username: "testUser",
      email: "test@example.com",
      roles: ["ChatUser"],
      groups: [], // No groups initially
      password: "123456",
    };

    // Send POST request to create a user
    chai
      .request(app)
      .post("/api/users")
      .send(sampleUser)
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(201); // Expect a 201 status for success
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("message", "Account request created");
        expect(res.body.user).to.include({
          username: "testUser",
          email: "test@example.com",
        });
        expect(res.body.user).to.have.property("id", "abcd"); // Check generated userId
        done();
      });
  });
});

describe(" -put /api/users (superadmin completes regist", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  it("should complete the user registration successfully", (done) => {
    const userId = new ObjectId(); // Sample userId
    const sampleUser = {
      _id: userId,
      username: "testUser",
      email: "test@example.com",
      valid: false,
    };

    const updatedUser = {
      ...sampleUser,
      username: "updatedUser",
      email: "updated@example.com",
      valid: true,
    };

    // Mock the userService functions
    const mockUserService = {
      getUserById: async (db, userId) => sampleUser, // Return a user object
      findUserByUsernameOrEmail: async (db, username, email, currentUserId) =>
        null, // No existing user found
      updateUser: async (db, user) => ({ modifiedCount: 1 }), // Simulate successful update
    };

    // Use proxyquire to mock userService in the route
    const { route: userRoute } = proxyquire("../routes/user", {
      "../services/userService": mockUserService, // Proxy userService
    });

    // Register the route with the app and mockDB
    userRoute(app, createMockDB());

    // Sample request payload to update the user
    const requestPayload = {
      username: "updatedUser",
      email: "updated@example.com",
    };

    // Send PUT request to complete registration
    chai
      .request(app)
      .put(`/api/users/${userId.toHexString()}/complete-registration`)
      .send(requestPayload)
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200); // Expect a 200 status for success
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property(
          "message",
          "User registration completed"
        );
        expect(res.body.user).to.include({
          username: "updatedUser",
          email: "updated@example.com",
          valid: true,
        });
        done();
      });
  });
});

describe(" put- /api/users/:userId (Update User)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  it("should update the user successfully", (done) => {
    const userId = new ObjectId(); // Sample userId
    const existingUser = {
      _id: userId,
      username: "existingUser",
      email: "existing@example.com",
      groups: [],
    };

    const updatedUserData = {
      username: "updatedUser",
      email: "updated@example.com",
      groups: [new ObjectId().toHexString()], // Send group IDs as strings
    };

    const updatedUser = {
      ...existingUser,
      ...updatedUserData,
      groups: updatedUserData.groups.map((groupId) => new ObjectId(groupId)), // Convert to ObjectId
    };

    // Mock the userService functions
    const mockUserService = {
      getUserById: async (db, userId) => existingUser, // Return existing user
      updateUser: async (db, user) => ({ modifiedCount: 1 }), // Simulate successful update
    };

    // Use proxyquire to mock userService in the route
    const { route: userRoute } = proxyquire("../routes/user", {
      "../services/userService": mockUserService, // Proxy userService
    });

    // Register the route with the app and mockDB
    userRoute(app, createMockDB());

    // Send PUT request to update the user
    chai
      .request(app)
      .put(`/api/users/${userId.toHexString()}`)
      .send(updatedUserData)
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);  // Expect a 200 status for success
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("username", "updatedUser");
        expect(res.body).to.have.property("email", "updated@example.com");
        
        // Compare ObjectId objects directly
        expect(res.body.groups).to.be.an("array");
        res.body.groups.forEach((groupId, index) => {
          expect(new ObjectId(groupId).equals(updatedUser.groups[index])).to.be.true;
        });
        
        done();
      });
  });

  it("should return 404 if the user is not found", (done) => {
    const userId = new ObjectId(); // Sample userId

    // Mock the userService functions
    const mockUserService = {
      getUserById: async (db, userId) => null, // Simulate user not found
    };

    const { route: userRoute } = proxyquire("../routes/user", {
      "../services/userService": mockUserService,
    });

    userRoute(app, createMockDB());

    // Send PUT request to update the user
    chai
      .request(app)
      .put(`/api/users/${userId.toHexString()}`)
      .send({ username: "updatedUser", email: "updated@example.com" })
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(404);  // Expect a 404 status for "User not found"
        expect(res.body).to.have.property("message", "User not found");
        done();
      });
  });
});

describe("POST /api/users/:userId/promote (promotion)", () => {
  let app;
  let mockUserService;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mocking userService
    mockUserService = {
      getUserById: async (db, userId) => {
        // This will be overwritten in each test case to mock different behaviors
        return null;
      },
      updateUser: async (db, user) => {
        // Simulate successful update
        return { matchedCount: 1, modifiedCount: 1 };
      },
    };

    // Use proxyquire to inject the mocked userService
    const route = proxyquire("../routes/user", {
      "../services/userService": mockUserService,
    }).route;

    // Initialize the app with the mock DB and routes
    const mockDb = {};
    route(app, mockDb);
  });

  it("should promote the user to GroupAdmin successfully", (done) => {
    const userId = "605c72ef35073e2f58c0286e"; // Mock ObjectId
    const newRole = "GroupAdmin";

    // Overwrite the mock behavior to return a user without the role
    mockUserService.getUserById = async () => ({
      _id: new ObjectId(userId),
      username: "testUser",
      roles: ["ChatUser"], // The user doesn't have the new role yet
    });

    chai
      .request(app)
      .post(`/api/users/${userId}/promote`)
      .send({ newRole })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property(
          "message",
          `User promoted to ${newRole} successfully`
        );
        expect(res.body.user).to.have.property("roles").that.includes(newRole);
        done();
      });
  });

  it("should return 404 if user is not found", (done) => {
    const userId = "605c72ef35073e2f58c0286e"; // Mock ObjectId
    const newRole = "GroupAdmin";

    // Overwrite the mock to simulate user not found
    mockUserService.getUserById = async () => null;

    chai
      .request(app)
      .post(`/api/users/${userId}/promote`)
      .send({ newRole })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "User not found");
        done();
      });
  });

  it("should return 400 if the user already has the role", (done) => {
    const userId = "605c72ef35073e2f58c0286e"; // Mock ObjectId
    const newRole = "GroupAdmin";

    // Overwrite the mock to simulate user already having the role
    mockUserService.getUserById = async () => ({
      _id: new ObjectId(userId),
      username: "testUser",
      roles: ["ChatUser", "GroupAdmin"], // The user already has the new role
    });

    chai
      .request(app)
      .post(`/api/users/${userId}/promote`)
      .send({ newRole })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(400);
        expect(res.body).to.have.property(
          "message",
          `User is already a ${newRole}`
        );
        done();
      });
  });
});

describe(" Del -delete /api/groups/:groupId/remove-member/:userId (leave group)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  it("should remove the user from the group successfully", (done) => {
    const groupId = new ObjectId(); // Sample groupId
    const userId = new ObjectId(); // Sample userId

    // Mock the groupService and userService behavior
    const mockDB = createMockDB();
    const mockGroupService = {
      getGroupById: async (db, groupId) => {
        return { _id: groupId, members: [userId] }; // Simulate a group with the user as a member
      },
      removeUserFromGroup: async (db, user, group) => {
        return { success: true }; // Simulate a success response
      },
    };

    const mockUserService = {
      getUserById: async (db, userId) => {
        return { _id: userId, groups: [groupId] }; // Ensure a valid user with the group
      },
      removeGroupFromUser: async (db, userId, groupId) => {
        // Simulate removing the group from the user's groups
        return { success: true };
      },
    };

    const mockChannelService = {
      removeUserFromGroupChannels: async (db, groupId, userId) => {
        return { success: true }; // Simulate channel removal
      },
    };

    // Use proxyquire to mock groupService, userService, and channelService in the route
    const { route: groupRoute } = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService, // Proxy groupService
      "../services/userService": mockUserService, // Proxy userService
      "../services/channelService": mockChannelService, // Proxy channelService
    });

    // Register the route with the app and mockDB
    groupRoute(app, mockDB);

    chai
      .request(app)
      .delete(
        `/api/groups/${groupId.toHexString()}/members/${userId.toHexString()}`
      ) // Correct endpoint for deleting member
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200); // Expect a 200 status for success
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property(
          "message",
          "Member removed and cascade deletion successful"
        );
        done();
      });
  });
});
