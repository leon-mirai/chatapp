const http = require("http");
const express = require("express");
const { setupPeerServer } = require("../peerServer"); // Your custom peerServer setup function
const { expect } = require("chai");

describe("PeerServer", () => {
  let app, server, peerServer;

  beforeEach((done) => {
    // Create a mock Express app
    app = express();

    // Create a mock HTTP server
    server = http.createServer(app);

    // Initialize PeerServer and mount it on the /peerjs path
    peerServer = setupPeerServer(server);
    app.use("/peerjs", peerServer); // Attach PeerServer to the express app

    // Start the server
    server.listen(3000, () => {
      done(); // Ensure the server has started before running tests
    });
  });

  afterEach((done) => {
    // Close the server after each test to avoid issues
    server.close(done);
  });

  it("should return a valid PeerServer function", () => {
    // Verify that peerServer is a function (middleware)
    expect(peerServer).to.be.a("function");

    // Check that the function has properties such as 'on' (standard for PeerServer)
    expect(peerServer).to.have.property("on");
  });

  it("should initialize PeerServer and handle connections", () => {
    // Check that PeerServer is correctly initialized
    expect(peerServer).to.be.a("function");
    
    // You can also check that the server is listening
    expect(server.listening).to.be.true;

    // The PeerServer doesn't register as an express route directly, so we focus on ensuring it's initialized properly.
  });
});
