const { Server } = require('socket.io');
const { createServer } = require('http');
const { setupSocket } = require('../sockets'); // Your custom socket setup function
const { expect } = require('chai');
const clientIo = require('socket.io-client'); // Import the client

let io, server, client;

describe('Socket.IO Basic Test', () => {
  let port; // Store the port number

  beforeEach((done) => {
    // Create a new HTTP server and Socket.IO instance before each test
    server = createServer();

    // Start the server on a random available port
    server.listen(0, () => {
      // Get the assigned port
      port = server.address().port;
      console.log(`Server started on port ${port}`);

      // Initialize Socket.IO after the server starts
      io = new Server(server);

      // Mock the database object
      const mockDb = {
        collection: () => ({
          // Mock any required collection methods if needed
          findOne: async () => null,
          insertOne: async () => null,
        }),
      };

      // Setup the socket with the mocked db
      setupSocket(io, mockDb); // Pass mockDb as the db

      done(); // Ensure the server is started before tests run
    });
  });

  afterEach((done) => {
    // Ensure the client is disconnected
    if (client && client.connected) {
      client.disconnect();
      console.log('Client disconnected');
    }

    // Close the server to free up the port
    if (server && server.listening) {
      server.close(() => {
        console.log('Server closed');
        done();
      });
    } else {
      done();
    }
  });

  it('should handle basic socket connection', (done) => {
    // Connect a socket.io-client to the server using the assigned port
    client = clientIo(`http://localhost:${port}`);

    // Handle 'connect' event
    client.on('connect', () => {
      console.log('Client connected');
      expect(client.connected).to.be.true; // Verify the client is connected
      done(); // End the test
    });

    client.on('connect_error', (err) => {
      console.error('Client connection error:', err);
      done(err); // Fail the test if there's a connection error
    });
  });
});
