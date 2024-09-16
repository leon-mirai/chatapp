// peerServer.js
const { ExpressPeerServer } = require('peer');

function setupPeerServer(server) {
  // Create a PeerJS server with optional configurations
  const peerServer = ExpressPeerServer(server, {
  path: '/peerjs',
  debug: true,
  allow_discovery: true // Allows peers to discover each other
});


  // Return the configured peerServer instance
  return peerServer;
}

module.exports = { setupPeerServer };
