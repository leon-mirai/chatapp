const { Server } = require('socket.io');
const { createServer } = require('http');
const { setupSocket } = require('../sockets'); 
const { expect } = require('chai');
const clientIo = require('socket.io-client'); 

let io, server, client;

describe('Socket.IO Basic Test', () => {
  let port; // Store the port number

  beforeEach((done) => {
    // create a new HTTP server and Socket.IO instance before each test
    server = createServer();

    // start the server on a random available port
    server.listen(0, () => {
      // get the assigned port
      port = server.address().port;
      console.log(`Server started on port ${port}`);

      // initialize Socket.IO after the server starts
      io = new Server(server);

      // mock the database object
      const mockDb = {
        collection: () => ({
          // mock any required collection methods if needed
          findOne: async () => null,
          insertOne: async () => null,
        }),
      };

      // setup the socket with the mocked db
      setupSocket(io, mockDb); // pass mockDb as the db

      done(); // ensure the server is started before tests run
    });
  });

  afterEach((done) => {
    // ensure the client is disconnected
    if (client && client.connected) {
      client.disconnect();
      console.log('Client disconnected');
    }

    // close the server to free up the port
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
    // connect a socket.io-client to the server using the assigned port
    client = clientIo(`http://localhost:${port}`);

    // handle 'connect' event
    client.on('connect', () => {
      console.log('Client connected');
      expect(client.connected).to.be.true; // verify the client is connected
      done(); // end the test
    });

    client.on('connect_error', (err) => {
      console.error('Client connection error:', err);
      done(err); // fail the test if there's a connection error
    });
  });
});
