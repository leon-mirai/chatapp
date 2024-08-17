const users = require("../data/users");

const route = (app) => {
  app.post("/api/users/:id", (req, res) => {
    const userId = req.params.id;
    const user = users.find((user) => user.id === userId);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });
};

module.exports = {
  route,
};
