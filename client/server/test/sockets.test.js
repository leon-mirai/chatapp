const { Server } = require('socket.io');
const { createServer } = require('http');
const { setupSocket } = require('../sockets'); // Your custom socket setup function
const { expect } = require('chai');
const clientIo = require('socket.io-client'); // Import the client

let io, server, client;

describe('Socket.IO Basic Test', () => {
  beforeEach((done) => {
    // Create a new HTTP server and Socket.IO instance before each test
    server = createServer();
    io = new Server(server);

    // Mock the database object
    const mockDb = {
      collection: () => ({}), // Simplify the mock without collection methods
    };

    // Setup the socket with the mocked db
    setupSocket(io, mockDb); // Pass mockDb as the db

    // Start the server on port 3000
    server.listen(3000, () => {
      console.log('Server started on port 3000');
      done(); // Ensure the server is started before tests run
    });
  });

  afterEach((done) => {
    // Ensure the client is disconnected
    if (client && client.connected) {
      client.disconnect();
      console.log('Client disconnected');
    }

    // No need to close the server or socket
    done();
  });

  it('should handle basic socket connection', (done) => {
    // Connect a socket.io-client to the server
    client = clientIo('http://localhost:3000'); // Use the imported clientIo

    // Handle 'connect' event
    client.on('connect', () => {
      console.log('Client connected');
      expect(client.connected).to.be.true; // Verify the client is connected
      done(); // End the test
    });

    client.on('error', (err) => {
      console.error('Client connection error:', err);
      done(err); // Fail the test if there's a connection error
    });
  });
});
