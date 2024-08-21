const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Serve the Angular frontend
const uiPath = path.join(__dirname, "../dist/client/browser");
app.use(express.static(uiPath));

// Import routes
const login = require("./routes/api-login.js");
const user = require("./routes/user.js");
const group = require("./routes/group.js");
const channel = require("./routes/channel.js");  // Add the channel routes

// Use the routes
login.route(app);
user.route(app);
group.route(app);
channel.route(app);  // Register the channel routes

// Catch-all to serve the Angular frontend
app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "../dist/client/browser/index.html"));
});

// Start the server
app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
