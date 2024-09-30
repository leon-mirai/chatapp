const http = require("http");
const express = require("express");
const { setupPeerServer } = require("../peerServer"); 
const { expect } = require("chai");

describe("PeerServer", () => {
  let app, server, peerServer;

  beforeEach((done) => {
    // create a mock Express app
    app = express();

    // reate a mock HTTP server
    server = http.createServer(app);

    // initialize PeerServer and mount it on the /peerjs path
    peerServer = setupPeerServer(server);
    app.use("/peerjs", peerServer); //attach PeerServer to the express app

    // start the server on a random available port
    server.listen(0, () => {
      // gt the assigned port if needed
      const port = server.address().port;
      console.log(`Server is listening on port ${port}`);
      done(); // esure the server has started before running tests
    });
  });

  afterEach((done) => {
    // close the server after each test to avoid issues
    if (server && server.listening) {
      server.close((err) => {
        if (err) {
          console.error("Error closing server:", err);
        }
        done(err);
      });
    } else {
      done();
    }
  });

  it("should return a valid PeerServer function", () => {
    // verify that peerServer is a function (middleware)
    expect(peerServer).to.be.a("function");

    // check that the function has properties such as on
    expect(peerServer).to.have.property("on");
  });

  it("should initialize PeerServer and handle connections", () => {
    // check that PeerServer is correctly initialized
    expect(peerServer).to.be.a("function");
    
    // check that the server is listening
    expect(server.listening).to.be.true;
  });
});
