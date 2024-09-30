const express = require("express");
const { ObjectId } = require("mongodb");
const proxyquire = require("proxyquire");
const chai = require("chai");
const chaiHttp = require("chai-http");

chai.use(chaiHttp);
const { expect } = chai;

describe("GET - /api/channels (get all channels)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test Case 1: successfully retrieving all channels
  it("should return a list of channels", (done) => {
    const mockChannels = [
      { _id: "channel1", name: "General", members: [] },
      { _id: "channel2", name: "Tech", members: [] },
    ];

    const mockChannelService = {
      readChannels: async () => mockChannels, // simulate a successful call to get channels
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; 
    route(app, mockDB);

    chai
      .request(app)
      .get("/api/channels")
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.equal(2); // should return 2 cahnels
        expect(res.body[0]).to.have.property("name", "General");
        expect(res.body[1]).to.have.property("name", "Tech");
        done();
      });
  });

  // Test Case 2: simulating a failure when retrieving channels
  it("should return 500 if there's an error retrieving channels", (done) => {
    const mockChannelService = {
      readChannels: async () => {
        throw new Error("Database error");
      }, 
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {};
    route(app, mockDB);

    chai
      .request(app)
      .get("/api/channels")
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(500);
        expect(res.body).to.have.property(
          "message",
          "Failed to retrieve channels"
        );
        done();
      });
  });
});

describe("GET - /api/channels/group/:groupId (get channels by group ID)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test Case 1: Successfully retrieving channels by group ID
  it("should return a list of channels for the specified group", (done) => {
    const groupId = new ObjectId(); // Valid group ID
    const mockChannels = [
      { _id: "channel1", name: "General", groupId },
      { _id: "channel2", name: "Tech", groupId },
    ];

    const mockChannelService = {
      getChannelsByGroupId: async (db, id) => mockChannels, // Simulate successful channel retrieval by groupId
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .get(`/api/channels/group/${groupId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.equal(2); // Should return two channels
        expect(res.body[0]).to.have.property("name", "General");
        expect(res.body[1]).to.have.property("name", "Tech");
        done();
      });
  });

  // Test Case 2: Simulating a failure during channel retrieval by group ID
  it("should return 500 if there's an error retrieving channels by group ID", (done) => {
    const groupId = new ObjectId(); // Valid group ID

    const mockChannelService = {
      getChannelsByGroupId: async () => {
        throw new Error("Database error");
      }, // Simulate an error during channel retrieval
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .get(`/api/channels/group/${groupId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(500);
        expect(res.body).to.have.property(
          "message",
          "Failed to retrieve channels by group ID"
        );
        done();
      });
  });
});

describe("GET - /api/channels/:channelId (get channel by ID)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test Case 1: Successfully retrieving a channel by channelId
  it("should return a channel by the specified ID", (done) => {
    const channelId = new ObjectId(); 
    const mockChannel = {
      _id: channelId,
      name: "General",
      members: [],
    };

    const mockChannelService = {
      getChannelById: async (db, id) => mockChannel, // Simulate successful channel retrieval by ID
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; 
    route(app, mockDB);

    chai
      .request(app)
      .get(`/api/channels/${channelId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("name", "General");
        expect(res.body)
          .to.have.property("_id")
          .that.equals(channelId.toString());
        done();
      });
  });

  // Test Case 2: Channel not found for the provided channelId
  it("should return 404 if the channel is not found", (done) => {
    const channelId = new ObjectId(); // Valid channel ID

    const mockChannelService = {
      getChannelById: async (db, id) => null, 
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; 
    route(app, mockDB);

    chai
      .request(app)
      .get(`/api/channels/${channelId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "Channel not found");
        done();
      });
  });

  // Test Case 3: Error during channel retrieval
  it("should return 500 if there is an error retrieving the channel", (done) => {
    const invalidChannelId = "invalid-channel-id"; // Invalid channel ID

    const mockChannelService = {
      getChannelById: async () => {
        throw new Error("Invalid ObjectId"); // Simulate an error during channel retrieval
      },
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {};
    route(app, mockDB);

    chai
      .request(app)
      .get(`/api/channels/${invalidChannelId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(500);
        expect(res.body).to.have.property(
          "message",
          "Failed to retrieve channel"
        );
        done();
      });
  });
});

describe("POST - /api/channels (create new channel)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test Case 1: Successfully creating a new channel and adding it to the group
  it("should create a new channel and add it to the group", (done) => {
    const groupId = new ObjectId(); 
    const channelId = new ObjectId(); 
    const newChannel = {
      name: "General",
      groupId: groupId.toString(),
      members: [new ObjectId().toString()],
    };

    const mockChannelService = {
      createChannel: async (db, channel) => ({
        ...channel,
        _id: channelId, // Simulate the new channel creation
      }),
    };

    const mockGroupService = {
      addChannelToGroup: async (db, groupId, channelId) => true, // Simulate adding the channel to the group
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post("/api/channels")
      .send(newChannel)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(201);
        expect(res.body).to.have.property("name", "General");
        expect(res.body)
          .to.have.property("_id")
          .that.equals(channelId.toString());
        done();
      });
  });

  // Test Case 2: Group not found when trying to add the channel
  it("should return 404 if the group is not found", (done) => {
    const groupId = new ObjectId(); // Valid group ID
    const newChannel = {
      name: "General",
      groupId: groupId.toString(),
      members: [new ObjectId().toString()],
    };

    const mockChannelService = {
      createChannel: async (db, channel) => ({
        ...channel,
        _id: new ObjectId(), // Simulate the new channel creation
      }),
    };

    const mockGroupService = {
      addChannelToGroup: async (db, groupId, channelId) => null, // Simulate group not found
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post("/api/channels")
      .send(newChannel)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "Group not found");
        done();
      });
  });

  // Test Case 3: Error during channel creation
  it("should return 500 if there is an error creating the channel", (done) => {
    const newChannel = {
      name: "General",
      groupId: "invalid-group-id", // Invalid groupId
      members: [new ObjectId().toString()],
    };

    const mockChannelService = {
      createChannel: async () => {
        throw new Error("Invalid ObjectId"); // Simulate an error
      },
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post("/api/channels")
      .send(newChannel)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(500);
        expect(res.body).to.have.property(
          "message",
          "Failed to create channel"
        );
        done();
      });
  });
});

describe("PUT - /api/channels/:channelId (update channel by ID)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test Case 1: Successfully updating a channel
  it("should update the channel successfully", (done) => {
    const channelId = new ObjectId(); // Valid channel ID
    const updatedChannelData = {
      name: "Updated General",
      groupId: new ObjectId().toString(),
      members: [new ObjectId().toString()],
    };

    const mockChannelService = {
      updateChannelById: async (db, id, data) => ({
        ...data,
        _id: channelId,
      }), // Simulate successful channel update
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .put(`/api/channels/${channelId}`)
      .send(updatedChannelData)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property(
          "message",
          "Channel updated successfully"
        );
        expect(res.body.updatedChannel).to.have.property(
          "name",
          "Updated General"
        );
        done();
      });
  });

  // Test Case 2: Channel not found for the provided channelId
  it("should return 404 if the channel is not found", (done) => {
    const channelId = new ObjectId(); // Valid channel ID
    const updatedChannelData = {
      name: "Updated General",
      groupId: new ObjectId().toString(),
      members: [new ObjectId().toString()],
    };

    const mockChannelService = {
      updateChannelById: async (db, id, data) => null, // Simulate channel not found
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .put(`/api/channels/${channelId}`)
      .send(updatedChannelData)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "Channel not found");
        done();
      });
  });

  // Test Case 3: Error during channel update
  it("should return 500 if there is an error updating the channel", (done) => {
    const invalidChannelId = "invalid-channel-id"; // Invalid channel ID
    const updatedChannelData = {
      name: "Updated General",
      groupId: new ObjectId().toString(),
      members: [new ObjectId().toString()],
    };

    const mockChannelService = {
      updateChannelById: async () => {
        throw new Error("Invalid ObjectId");
      }, // Simulate an error
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .put(`/api/channels/${invalidChannelId}`)
      .send(updatedChannelData)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(500);
        expect(res.body).to.have.property(
          "message",
          "Failed to update channel"
        );
        done();
      });
  });
});

describe("DELETE - /api/channels/:channelId (delete channel by ID)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test Case 1: Successfully deleting a channel
  it("should delete the channel successfully", (done) => {
    const channelId = new ObjectId(); // Valid channel ID
    const groupId = new ObjectId(); // Valid group ID

    const mockChannel = {
      _id: channelId,
      groupId: groupId.toString(),
    };

    const mockChannelService = {
      getChannelById: async (db, id) => mockChannel, // Simulate finding the channel
      deleteChannelById: async (db, id) => ({ deletedCount: 1 }), // Simulate successful deletion
    };

    const mockGroupService = {
      removeChannelFromGroup: async (db, groupId, channelId) => true, // Simulate successful removal from group
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
      "../services/groupService": mockGroupService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .delete(`/api/channels/${channelId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(200);
        expect(res.body).to.have.property(
          "message",
          "Channel deleted successfully"
        );
        done();
      });
  });

  // Test Case 2: Channel not found for the provided channelId
  it("should return 404 if the channel is not found", (done) => {
    const channelId = new ObjectId(); // Valid channel ID

    const mockChannelService = {
      getChannelById: async (db, id) => null, // Simulate channel not found
      deleteChannelById: async (db, id) => ({ deletedCount: 0 }), // Simulate no deletion
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .delete(`/api/channels/${channelId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "Channel not found");
        done();
      });
  });

  // Test Case 3: Error during channel deletion
  it("should return 500 if there is an error deleting the channel", (done) => {
    const invalidChannelId = "invalid-channel-id"; // Invalid channel ID

    const mockChannelService = {
      getChannelById: async () => {
        throw new Error("Invalid ObjectId");
      }, // Simulate an error
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .delete(`/api/channels/${invalidChannelId}`)
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(500);
        expect(res.body).to.have.property(
          "message",
          "Failed to delete channel"
        );
        done();
      });
  });
});

describe("POST - /api/channels/:channelId/request-join (request to join channel)", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  // Test Case 1: Successfully requesting to join a channel
  it("should allow the user to request to join the channel", (done) => {
    const channelId = new ObjectId(); // Valid channel ID
    const userId = new ObjectId(); // Valid user ID

    const mockChannel = {
      _id: channelId,
      name: "General",
      members: [],
      joinRequests: [],
    };

    const mockChannelService = {
      getChannelById: async (db, id) => mockChannel, // Simulate finding the channel
      updateChannel: async (db, id, updatedChannel) => updatedChannel, // Simulate updating the channel
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post(`/api/channels/${channelId}/request-join`)
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

  // Test Case 2: User is already a member of the channel
  it("should return 400 if the user is already a member of the channel", (done) => {
    const channelId = new ObjectId(); // Valid channel ID
    const userId = new ObjectId(); // Valid user ID

    const mockChannel = {
      _id: channelId,
      name: "General",
      members: [userId], // User is already a member
      joinRequests: [],
    };

    const mockChannelService = {
      getChannelById: async (db, id) => mockChannel, // Simulate finding the channel
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post(`/api/channels/${channelId}/request-join`)
      .send({ userId: userId.toString() })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(400);
        expect(res.body).to.have.property(
          "message",
          "User is already a member of the channel"
        );
        done();
      });
  });

  // Test Case 3: User has already requested to join the channel
  it("should return 400 if the user has already requested to join the channel", (done) => {
    const channelId = new ObjectId(); // Valid channel ID
    const userId = new ObjectId(); // Valid user ID

    const mockChannel = {
      _id: channelId,
      name: "General",
      members: [],
      joinRequests: [userId], // User has already requested to join
    };

    const mockChannelService = {
      getChannelById: async (db, id) => mockChannel, // Simulate finding the channel
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post(`/api/channels/${channelId}/request-join`)
      .send({ userId: userId.toString() })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(400);
        expect(res.body).to.have.property(
          "message",
          "User has already requested to join the channel"
        );
        done();
      });
  });

  // Test Case 4: Channel not found for the provided channelId
  it("should return 404 if the channel is not found", (done) => {
    const channelId = new ObjectId(); // Valid channel ID
    const userId = new ObjectId(); // Valid user ID

    const mockChannelService = {
      getChannelById: async (db, id) => null, // Simulate channel not found
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post(`/api/channels/${channelId}/request-join`)
      .send({ userId: userId.toString() })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(404);
        expect(res.body).to.have.property("message", "Channel not found");
        done();
      });
  });

  // Test Case 5: Invalid userId format
  it("should return 400 if the userId is invalid", (done) => {
    const channelId = new ObjectId(); // Valid channel ID
    const invalidUserId = "invalid-user-id"; // Invalid user ID

    const mockChannel = {
      _id: channelId,
      name: "General",
      members: [],
      joinRequests: [],
    };

    const mockChannelService = {
      getChannelById: async (db, id) => mockChannel, // Simulate finding the channel
    };

    const route = proxyquire("../routes/channel", {
      "../services/channelService": mockChannelService,
    }).route;

    const mockDB = {}; // Mock DB object
    route(app, mockDB);

    chai
      .request(app)
      .post(`/api/channels/${channelId}/request-join`)
      .send({ userId: invalidUserId })
      .end((err, res) => {
        if (err) return done(err);

        expect(res).to.have.status(400);
        expect(res.body).to.have.property("message", "Invalid userId");
        done();
      });
  });
});

describe("POST - /api/channels/:channelId/approve-join (approve or reject join request)", () => {
    let app;
  
    beforeEach(() => {
      app = express();
      app.use(express.json());
    });
  
    // Test Case 1: Successfully approving a join request
    it("should approve the user's join request", (done) => {
      const channelId = new ObjectId(); // Valid channel ID
      const userId = new ObjectId(); // Valid user ID
  
      const mockChannelService = {
        approveJoinRequest: async (db, channelId, userId, approve) => {
          return { success: true }; // Simulate successful approval
        },
      };
  
      const route = proxyquire("../routes/channel", {
        "../services/channelService": mockChannelService,
      }).route;
  
      const mockDB = {}; // Mock DB object
      route(app, mockDB);
  
      chai
        .request(app)
        .post(`/api/channels/${channelId}/approve-join`)
        .send({ userId: userId.toString(), approve: true })
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message", "User approved");
          done();
        });
    });
  
    // Test Case 2: Successfully rejecting a join request
    it("should reject the user's join request", (done) => {
      const channelId = new ObjectId(); // Valid channel ID
      const userId = new ObjectId(); // Valid user ID
  
      const mockChannelService = {
        approveJoinRequest: async (db, channelId, userId, approve) => {
          return { success: true }; // Simulate successful rejection
        },
      };
  
      const route = proxyquire("../routes/channel", {
        "../services/channelService": mockChannelService,
      }).route;
  
      const mockDB = {}; // Mock DB object
      route(app, mockDB);
  
      chai
        .request(app)
        .post(`/api/channels/${channelId}/approve-join`)
        .send({ userId: userId.toString(), approve: false })
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message", "Join request rejected");
          done();
        });
    });
  
    // Test Case 3: Channel not found for the provided channelId
    it("should return 404 if the channel is not found", (done) => {
      const channelId = new ObjectId(); // Valid channel ID
      const userId = new ObjectId(); // Valid user ID
  
      const mockChannelService = {
        approveJoinRequest: async () => {
          throw new Error("Channel not found");
        }, // Simulate channel not found
      };
  
      const route = proxyquire("../routes/channel", {
        "../services/channelService": mockChannelService,
      }).route;
  
      const mockDB = {}; // Mock DB object
      route(app, mockDB);
  
      chai
        .request(app)
        .post(`/api/channels/${channelId}/approve-join`)
        .send({ userId: userId.toString(), approve: true })
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res).to.have.status(500);
          expect(res.body).to.have.property("message", "Failed to process join request");
          done();
        });
    });

  });
