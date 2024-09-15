// peerServer.js
const { ExpressPeerServer } = require('peer');

function setupPeerServer(server) {
  // Create a PeerJS server with optional configurations
  const peerServer = ExpressPeerServer(server, {
    path: '/peerjs',
    debug: true,  // Enable debug mode for more insights
  });

  // Return the configured peerServer instance
  return peerServer;
}

module.exports = { setupPeerServer };
