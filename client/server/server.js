const path = require("path");
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const http = require("http");
const { Server } = require("socket.io");
const { setupSocket } = require("./sockets.js");
const { setupPeerServer } = require("./peerServer.js"); // Import the PeerServer setup
const app = express();
const port = 3000;

// MongoDB connection URI
const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const client = new MongoClient(mongoUrl);

// Create an HTTP server and integrate it with Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
            "http://localhost:4200",
            "https://chat.leonlee.au/",
          ], 
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Integrate the Peer.js server with the existing HTTP server
const peerServer = setupPeerServer(server);
app.use("/peerjs", peerServer); // Serve PeerJS on the '/peerjs' route

// Inside connectToDb()
async function connectToDb() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("chatappDB"); // Ensure 'db' is selected properly

    // Middleware
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    // app.use(
    //   cors({
    //     origin: [
    //       "http://localhost:4200",
    //       "https://chat.leonlee.au/",
    //     ],
    //     methods: ["GET", "POST", "PUT", "DELETE"],
    //     allowedHeaders: ["Content-Type", "Authorization"],
    //   })
    // );

    // Serve static files from the uploads directory
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    // Import and use routes
    const login = require("./routes/api-login.js");
    const user = require("./routes/user.js");
    const group = require("./routes/group.js");
    const channel = require("./routes/channel.js");

    login.route(app, db);
    user.route(app, db);
    group.route(app, db);
    channel.route(app, db);

    // Set up socket handling and pass 'db'
    setupSocket(io, db); // Pass 'db' to the socket

    // Catch-all route to serve the Angular app
    app.get("*", (request, response) => {
      response.sendFile(
        path.resolve(__dirname, "../dist/client/browser/index.html")
      );
    });

    // Start the server
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
  }
}

connectToDb();
