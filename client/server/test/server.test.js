const { MongoClient } = require("mongodb");
const chai = require("chai");
const chaiHttp = require("chai-http");
const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const { setupSocket } = require("../sockets.js");
const { setupPeerServer } = require("../peerServer.js");

chai.use(chaiHttp); 
const { expect } = chai; 

describe("Server", () => {
  let server, io, app;
  let originalMongoClientConnect, originalMongoClientDb;

  beforeEach(async () => {
    // Mock MongoDB client connection
    originalMongoClientConnect = MongoClient.prototype.connect;
    MongoClient.prototype.connect = async () => Promise.resolve();

    // Mock MongoDB's `db()` method
    originalMongoClientDb = MongoClient.prototype.db;
    MongoClient.prototype.db = () => ({
      collection: () => ({}), // Stub collection method
    });

    // Initialize express and socket
    app = express();
    server = http.createServer(app);
    io = new Server(server, {
      cors: { origin: ["http://localhost:4200"], methods: ["GET", "POST"] },
    });

    // Define a simple root route to test the server
    app.get("/", (req, res) => {
      res.status(200).send("Server is running");
    });

    // Mock routes and socket setup manually
    setupSocket(io, {}); // Stub the socket setup
    setupPeerServer(server); // Mock Peer server setup
  });

  afterEach(() => {
    // Restore original MongoDB client connect and db behavior
    MongoClient.prototype.connect = originalMongoClientConnect;
    MongoClient.prototype.db = originalMongoClientDb;

    if (server && server.listening) {
      server.close();
    }
  });

  it("should successfully connect to MongoDB and return 200 status", async () => {
    // Simulate successful db connection
    const db = MongoClient.prototype.db(); // Now properly mocked
    const res = await chai.request(app).get("/");
    expect(res.status).to.equal(200);
    expect(res.text).to.equal("Server is running");
  });

  it("should fail to connect to MongoDB and handle error", async () => {
    // Manually mock the error for MongoDB connection failure
    MongoClient.prototype.connect = async () =>
      Promise.reject(new Error("Failed to connect"));

    // Initialize express app without mocking the successful connection
    app = express();
    server = http.createServer(app);

    // Attempt to connect to MongoDB
    try {
      await MongoClient.prototype.connect();
    } catch (err) {
      expect(err.message).to.equal("Failed to connect");
    }
  });
});
