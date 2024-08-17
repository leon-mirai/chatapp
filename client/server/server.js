const path = require("path");

const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
const uiPath = path.join(__dirname, "../dist/client/browser");
app.use(express.static(uiPath));

const login = require("./routes/api-login.js");
const user = require("./routes/user.js");

login.route(app);
user.route(app);

app.get("*", function (request, response) {
  response.sendFile(
    path.resolve(__dirname, "../dist/client/browser/index.html")
  );
});

app.listen(3000, function () {
  console.log("Server is running on", 3000);
});
