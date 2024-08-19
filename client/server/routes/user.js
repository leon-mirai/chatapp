const users = require("../data/users");

const route = (app) => {
  app.get("/api/users/:id", (req, res) => {
    const userId = req.params.id.trim();

    const user = users.find((user) => user.id === String(userId));

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
