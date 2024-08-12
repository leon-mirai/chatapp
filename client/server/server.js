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
login.route(app);

// app.get("/", (req, res) => {
//     res.send('hi')
// })

app.get("*", function (request, response) {
  response.sendFile(
    path.resolve(__dirname, "../dist/client/browser/index.html")
  );
});
/*Catch all gets any requests and processes it through angular 


*/

app.listen(3000, function () {
  console.log("Server is running on", 3000);
});

//   const express = require("express");
//   const app = express();
//   app.use(express.urlencoded({ extended: true }));
//   app.use(express.json());

//   const path = require("path");
//   const http = require("http").Server(app);
//   app.use(express.static(path.join(__dirname, "../dist/client/")));

//   const cors = require("cors");
//   app.use(cors());

//   const login = require("./routes/api-login.js").route(app);
//   let server = http.listen(3000, function () {
//       console.log("Server is running on", 3000);
//     });
