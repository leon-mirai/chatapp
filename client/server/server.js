const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// serve front end
const uiPath = path.join(__dirname, "../dist/client/browser");
app.use(express.static(uiPath));

// import routes
const login = require("./routes/api-login.js");
const user = require("./routes/user.js");
const group = require("./routes/group.js");
const channel = require("./routes/channel.js");

// use routes
login.route(app);
user.route(app);
group.route(app);
channel.route(app);

// catch-all to serve the Angular
app.get("*", function (request, response) {
  response.sendFile(
    path.resolve(__dirname, "../dist/client/browser/index.html")
  );
});

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
