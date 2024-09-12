const path = require("path");
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const port = 3000;

// MongoDB connection URI
const mongoUrl = "mongodb://127.0.0.1:27017";
const client = new MongoClient(mongoUrl);

async function connectToDb() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    // Select the database
    const db = client.db("chatappDB");

    // Middleware
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(
      cors({
        origin: "http://localhost:4200", // Replace with your frontend URL
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    // Serve front end
    const uiPath = path.join(__dirname, "../dist/client/browser");
    app.use(express.static(uiPath));

    // Import routes (pass the `db` object to the routes)
    const login = require("./routes/api-login.js");
    const user = require("./routes/user.js");
    const group = require("./routes/group.js");
    const channel = require("./routes/channel.js");

    // Use routes (passing the database connection)
    login.route(app, db);
    user.route(app, db);
    group.route(app, db);
    channel.route(app, db);

    // Catch-all route to serve the Angular app
    app.get("*", function (request, response) {
      response.sendFile(
        path.resolve(__dirname, "../dist/client/browser/index.html")
      );
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
  }
}

connectToDb();
