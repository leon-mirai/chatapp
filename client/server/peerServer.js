const { ExpressPeerServer } = require("peer");

function setupPeerServer(server) {
  const peerServer = ExpressPeerServer(server, {
    path: "/peerjs",
    debug: true,
    allow_discovery: true, // allows peers to discover each other
  });

  // return the configured peerServer instance
  return peerServer;
}

module.exports = { setupPeerServer };
