const express = require("express");
const { ObjectId } = require("mongodb");
const proxyquire = require("proxyquire");
const chai = require("chai");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);
const { expect } = chai;

describe(" get - /api/groups (get all groups)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  it("should return a list of groups", (done) => {
    const groups = [
      {
        _id: "group1",
        name: "Tech Enthusiasts",
        admins: ["2222"],
        members: ["1111"],
        channels: ["channel1"],
        joinRequests: ["4444"],
      },
      {
        _id: "group2",
        name: "Book Club",
        admins: ["8888"],
        members: ["8888"],
        channels: ["channel3"],
        joinRequests: [],
      },
    ];

    const mockGroupService = {
      readGroups: async () => groups,
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {};

    route(app, mockDB);

    chai
      .request(app)
      .get("/api/groups")
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.equal(2); // Expect two groups
        expect(res.body[0]).to.have.property("name", "Tech Enthusiasts"); 
        expect(res.body[1]).to.have.property("name", "Book Club");
        done();
      });
  });
});

describe("get - /api/users/:userId/groups (get all groups for a user)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  it("should return a list of groups for the user", (done) => {
    const userId = new ObjectId("614c1b3e4c13ab1cce000004"); 

    const groups = [
      {
        _id: new ObjectId(),
        name: "Tech Enthusiasts",
        members: [userId],
        joinRequests: [],
      },
      {
        _id: new ObjectId(),
        name: "Book Club",
        members: [new ObjectId()],
        joinRequests: [userId],
      },
    ];

    const mockGroupService = {
      readGroups: async () => groups,
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {};
    route(app, mockDB);

    chai
      .request(app)
      .get(`/api/users/${userId}/groups`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.equal(2);
        done();
      });
  });

  it("should return an empty list if the user has no groups", (done) => {
    const userId = new ObjectId("614c1b3e4c13ab1cce000005");

    const groups = [
      {
        _id: new ObjectId(),
        name: "Tech Enthusiasts",
        members: [new ObjectId()],
        joinRequests: [new ObjectId()],
      },
    ];

    const mockGroupService = {
      readGroups: async () => groups,
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {};
    route(app, mockDB);

    chai
      .request(app)
      .get(`/api/users/${userId}/groups`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.equal(0);
        done();
      });
  });
});

describe("GET - /api/groups/:groupId (get group by ID)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test 1: Successfully fetching a group by ID
  it("should return the group when a valid group ID is provided", (done) => {
    const groupId = new ObjectId(); // Valid group ID

    const group = {
      _id: groupId,
      name: "Tech Enthusiasts",
      members: ["1111"],
      admins: ["2222"],
      channels: ["channel1"],
      joinRequests: ["4444"],
    };

    const mockGroupService = {
      getGroupById: async (db, id) => {
        return id.equals(groupId) ? group : null;
      },
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .get(`/api/groups/${groupId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("name", "Tech Enthusiasts");
        done();
      });
  });

  // Test 2: Group not found
  it("should return 404 when group is not found", (done) => {
    const groupId = new ObjectId(); // Valid group ID, but does not exist in DB

    const mockGroupService = {
      getGroupById: async (db, id) => null, // Simulate no group found
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .get(`/api/groups/${groupId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "Group not found");
        done();
      });
  });
});

describe("POST - /api/groups (create new group)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test Case 1: Successfully creating a group
  it("should create a group successfully", (done) => {
    const adminId = new ObjectId(); // Valid admin ID
    const newGroup = {
      name: "Tech Enthusiasts",
      admins: [adminId.toString()], // Admin ID as string
      members: [],
      channels: [],
    };

    const mockUserService = {
      getUserById: async (db, id) => ({ _id: adminId, groups: [] }), // Simulate found admin
      updateUser: async () => true, // Simulate successful user update
    };

    const mockGroupService = {
      createGroup: async (db, group) => ({ insertedId: new ObjectId() }), // Simulate successful group creation
    };

    const route = proxyquire("../routes/group", {
      "../services/userService": mockUserService,
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post("/api/groups")
      .send(newGroup)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(201);
        expect(res.body).to.have.property(
          "message",
          "Group created successfully"
        );
        expect(res.body.group).to.have.property("name", "Tech Enthusiasts");
        done();
      });
  });

  // Test Case 2: Admin user not found
  it("should return 404 if the admin user is not found", (done) => {
    const adminId = new ObjectId(); // Valid admin ID but does not exist
    const newGroup = {
      name: "Book Club",
      admins: [adminId.toString()], // Admin ID as string
      members: [],
      channels: [],
    };

    const mockUserService = {
      getUserById: async (db, id) => null, // Simulate admin not found
    };

    const mockGroupService = {
      createGroup: async () => null, // No need for group creation in this case
    };

    const route = proxyquire("../routes/group", {
      "../services/userService": mockUserService,
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post("/api/groups")
      .send(newGroup)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "Admin user not found");
        done();
      });
  });

  // Test Case 3: Invalid Admin User ID
  it("should return 400 if admin user ID is invalid", (done) => {
    const invalidAdminId = "invalid-id"; // Invalid ObjectId string
    const newGroup = {
      name: "Art Lovers",
      admins: [invalidAdminId], // Invalid admin ID
      members: [],
      channels: [],
    };

    const mockUserService = {}; // No need to mock userService since validation fails earlier

    const mockGroupService = {}; // No need to mock groupService since validation fails earlier

    const route = proxyquire("../routes/group", {
      "../services/userService": mockUserService,
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post("/api/groups")
      .send(newGroup)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message", "Invalid Admin User ID");
        done();
      });
  });
});

describe("PUT - /api/groups/:groupId (update group)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test Case 1: Successfully updating a group
  it("should update the group successfully", (done) => {
    const groupId = new ObjectId(); // Valid group ID
    const updatedGroup = {
      name: "Updated Tech Enthusiasts",
      admins: [new ObjectId().toString()], // Admin IDs as string
      members: [new ObjectId().toString()], // Member IDs as string
      channels: [new ObjectId().toString()], // Channel IDs as string
      blacklist: [new ObjectId().toString()], // Blacklist user IDs as string
    };

    const mockGroupService = {
      updateGroup: async (db, id, group) => ({
        matchedCount: 1, // Simulate successful update
      }),
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .put(`/api/groups/${groupId}`)
      .send(updatedGroup)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property(
          "message",
          "Group updated successfully"
        );
        expect(res.body.group).to.have.property(
          "name",
          "Updated Tech Enthusiasts"
        );
        done();
      });
  });

  // Test Case 2: Group not found
  it("should return 404 when group is not found", (done) => {
    const groupId = new ObjectId(); // Valid group ID but does not exist
    const updatedGroup = {
      name: "Non-existent Group",
      admins: [new ObjectId().toString()],
      members: [new ObjectId().toString()],
      channels: [new ObjectId().toString()],
      blacklist: [new ObjectId().toString()],
    };

    const mockGroupService = {
      updateGroup: async (db, id, group) => ({
        matchedCount: 0, // Simulate group not found
      }),
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .put(`/api/groups/${groupId}`)
      .send(updatedGroup)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "Group not found");
        done();
      });
  });
});

describe("DELETE - /api/groups/:groupId (delete group)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test Case 1: Successfully deleting a group
  it("should delete the group successfully", (done) => {
    const groupId = new ObjectId(); // Valid group ID

    const mockGroupService = {
      deleteGroup: async (db, id) => ({
        deletedCount: 1, // Simulate successful deletion
      }),
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .delete(`/api/groups/${groupId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property(
          "message",
          "Group deleted successfully"
        );
        done();
      });
  });

  // Test Case 2: Group not found
  it("should return 404 when the group is not found", (done) => {
    const groupId = new ObjectId(); // Valid group ID but does not exist

    const mockGroupService = {
      deleteGroup: async (db, id) => ({
        deletedCount: 0, // Simulate group not found
      }),
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .delete(`/api/groups/${groupId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "Group not found");
        done();
      });
  });
});

describe("DELETE - /api/groups/:groupId/members/:userId (remove user from group)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test Case 1: Successfully removing a member from the group
  it("should remove the member from the group and its channels successfully", (done) => {
    const groupId = new ObjectId(); // Valid group ID
    const userId = new ObjectId(); // Valid user ID

    const mockGroupService = {
      getGroupById: async (db, id) => ({
        _id: groupId,
        name: "Tech Enthusiasts",
      }), // Simulate found group
      removeUserFromGroup: async () => true, // Simulate successful removal from group
    };

    const mockUserService = {
      getUserById: async (db, id) => ({ _id: userId, name: "John Doe" }), // Simulate found user
      removeGroupFromUser: async () => true, // Simulate successful removal from user's group list
    };

    const mockChannelService = {
      removeUserFromGroupChannels: async () => true, // Simulate successful removal from channels
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
      "../services/userService": mockUserService,
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .delete(`/api/groups/${groupId}/members/${userId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property(
          "message",
          "Member removed and cascade deletion successful"
        );
        done();
      });
  });

  // Test Case 2: Group or User not found
  it("should return 404 when the group or user is not found", (done) => {
    const groupId = new ObjectId(); // Valid group ID
    const userId = new ObjectId(); // Valid user ID

    const mockGroupService = {
      getGroupById: async (db, id) => null, // Simulate group not found
      removeUserFromGroup: async () => null,
    };

    const mockUserService = {
      getUserById: async (db, id) => null, // Simulate user not found
    };

    const mockChannelService = {
      removeUserFromGroupChannels: async () => null, // Simulate no channel removal
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
      "../services/userService": mockUserService,
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .delete(`/api/groups/${groupId}/members/${userId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "Group or User not found");
        done();
      });
  });
});

describe("POST - /api/groups/:groupId/admins (add admin to group)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test Case 1: Successfully adding an admin to the group
  it("should add the user as an admin to the group and promote them to GroupAdmin", (done) => {
    const groupId = new ObjectId(); // Valid group ID
    const userId = new ObjectId(); // Valid user ID

    const mockGroupService = {
      getGroupById: async (db, id) => ({
        _id: groupId,
        name: "Tech Enthusiasts",
        admins: [], // No admins yet
      }), // Simulate found group with no admins
      updateGroup: async () => true, // Simulate successful group update
    };

    const mockUserService = {
      getUserById: async (db, id) => ({
        _id: userId,
        name: "John Doe",
        roles: [], // User doesn't have "GroupAdmin" role yet
      }), // Simulate found user
      updateUser: async () => true, // Simulate successful user update
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
      "../services/userService": mockUserService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post(`/api/groups/${groupId}/admins`)
      .send({ userId: userId.toString() })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property(
          "message",
          "Admin added and user promoted to GroupAdmin"
        );
        done();
      });
  });

  // Test Case 2: Group or User not found
  it("should return 404 if the group or user is not found", (done) => {
    const groupId = new ObjectId(); // Valid group ID
    const userId = new ObjectId(); // Valid user ID

    const mockGroupService = {
      getGroupById: async (db, id) => null, // Simulate group not found
    };

    const mockUserService = {
      getUserById: async (db, id) => null, // Simulate user not found
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
      "../services/userService": mockUserService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post(`/api/groups/${groupId}/admins`)
      .send({ userId: userId.toString() })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "Group or User not found");
        done();
      });
  });
});

describe("DELETE - /api/groups/:groupId/admins/:userId (remove admin from group)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test Case 1: Successfully removing an admin from the group
  it("should remove the admin from the group successfully", (done) => {
    const groupId = new ObjectId(); // Valid group ID
    const userId = new ObjectId(); // Valid user ID

    const mockGroupService = {
      getGroupById: async (db, id) => ({
        _id: groupId,
        name: "Tech Enthusiasts",
        admins: [userId], // User is an admin
      }), // Simulate group with the admin to be removed
      updateGroup: async () => true, // Simulate successful group update
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .delete(`/api/groups/${groupId}/admins/${userId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property(
          "message",
          "Admin removed successfully"
        );
        done();
      });
  });

  // Test Case 2: Group not found
  it("should return 404 if the group is not found", (done) => {
    const groupId = new ObjectId(); // Valid group ID
    const userId = new ObjectId(); // Valid user ID

    const mockGroupService = {
      getGroupById: async (db, id) => null, // Simulate group not found
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .delete(`/api/groups/${groupId}/admins/${userId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "Group not found");
        done();
      });
  });
});

describe("POST - /api/groups/:groupId/request-join (request to join group)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test Case 1: Successfully requesting to join the group
  it("should allow the user to request to join the group successfully", (done) => {
    const groupId = new ObjectId();
    const userId = new ObjectId();

    const mockGroupService = {
      getGroupById: async (db, id) => ({
        _id: groupId,
        name: "Tech Enthusiasts",
        members: [],
        joinRequests: [],
      }),
      updateGroup: async () => true,
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {};
    route(app, mockDB);

    chai
      .request(app)
      .post(`/api/groups/${groupId}/request-join`)
      .send({ userId: userId.toString() })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property(
          "message",
          "Join request sent successfully"
        );
        done();
      });
  });

  //
  it("should return 404 if the group is not found", (done) => {
    const groupId = new ObjectId();
    const userId = new ObjectId();

    const mockGroupService = {
      getGroupById: async (db, id) => null,
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post(`/api/groups/${groupId}/request-join`)
      .send({ userId: userId.toString() })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "Group not found");
        done();
      });
  });
});

describe("POST - /api/groups/:groupId/approve-join (approve join request)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test Case 1: Successfully approving a user's request to join the group
  it("should approve the user's join request and add them to the group", (done) => {
    const groupId = new ObjectId(); // Valid group ID
    const userId = new ObjectId(); // Valid user ID

    const mockGroupService = {
      getGroupById: async (db, id) => ({
        _id: groupId,
        name: "Tech Enthusiasts",
        members: [], // No members yet
        joinRequests: [userId], // User has requested to join
      }), // Simulate group with join request from user
      updateGroup: async () => true, // Simulate successful group update
    };

    const mockUserService = {
      getUserById: async (db, id) => ({
        _id: userId,
        name: "John Doe",
        groups: [], // User is not part of the group yet
      }), // Simulate found user
      updateUser: async () => true, // Simulate successful user update
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
      "../services/userService": mockUserService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post(`/api/groups/${groupId}/approve-join`)
      .send({ userId: userId.toString() })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property(
          "message",
          "User approved and added to group"
        );
        done();
      });
  });

  // Test Case 2: Group or User not found
  it("should return 404 if the group or user is not found", (done) => {
    const groupId = new ObjectId(); // Valid group ID
    const userId = new ObjectId(); // Valid user ID

    const mockGroupService = {
      getGroupById: async (db, id) => null, // Simulate group not found
    };

    const mockUserService = {
      getUserById: async (db, id) => null, // Simulate user not found
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
      "../services/userService": mockUserService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post(`/api/groups/${groupId}/approve-join`)
      .send({ userId: userId.toString() })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "Group or User not found");
        done();
      });
  });
});

describe("POST - /api/groups/:groupId/reject-join (reject join request)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test Case 1: Successfully rejecting a user's join request
  it("should reject the user's join request successfully", (done) => {
    const groupId = new ObjectId(); // Valid group ID
    const userId = new ObjectId(); // Valid user ID

    const mockGroupService = {
      getGroupById: async (db, id) => ({
        _id: groupId,
        name: "Tech Enthusiasts",
        members: [], // No members yet
        joinRequests: [userId], // User has requested to join
      }), // Simulate group with join request from user
      updateGroup: async () => true, // Simulate successful group update
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post(`/api/groups/${groupId}/reject-join`)
      .send({ userId: userId.toString() })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("message", "Join request rejected successfully");
        done();
      });
  });

  // Test Case 2: Group not found
  it("should return 404 if the group is not found", (done) => {
    const groupId = new ObjectId(); // Valid group ID
    const userId = new ObjectId(); // Valid user ID

    const mockGroupService = {
      getGroupById: async (db, id) => null, // Simulate group not found
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post(`/api/groups/${groupId}/reject-join`)
      .send({ userId: userId.toString() })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "Group not found");
        done();
      });
  });

  // Test Case 3: User did not request to join the group
  it("should return 400 if the user did not request to join the group", (done) => {
    const groupId = new ObjectId(); // Valid group ID
    const userId = new ObjectId(); // Valid user ID

    const mockGroupService = {
      getGroupById: async (db, id) => ({
        _id: groupId,
        name: "Tech Enthusiasts",
        members: [], // No members yet
        joinRequests: [], // User did not request to join
      }), // Simulate group with no join request from user
    };

    const route = proxyquire("../routes/group", {
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post(`/api/groups/${groupId}/reject-join`)
      .send({ userId: userId.toString() })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message", "User did not request to join");
        done();
      });
  });
});