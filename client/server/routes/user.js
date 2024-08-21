const userService = require("../services/userService");

const route = (app) => {
  // Get all users
  app.get("/api/users", (req, res) => {
    const users = userService.readUsers();
    res.status(200).json(users);
  });

  // Get user by ID
  app.get("/api/users/:id", (req, res) => {
    const userId = req.params.id.trim();
    const users = userService.readUsers();
    const user = users.find((user) => user.id === String(userId));

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });

  // Create a new user
  app.post("/api/users", (req, res) => {
    const newUser = req.body;
    const users = userService.readUsers();

    // Check if username already exists
    if (users.find((user) => user.username === newUser.username)) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Add the new user
    users.push(newUser);
    userService.writeUsers(users); // Write updated users to the JSON file
    res.status(201).json(newUser);
  });

  // Update a user
  app.put("/api/users/:id", (req, res) => {
    const userId = req.params.id.trim();
    const updatedUser = req.body;
    const users = userService.readUsers();
    const userIndex = users.findIndex((user) => user.id === String(userId));

    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      userService.writeUsers(users); // Write updated users to the JSON file
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });
};

module.exports = { route };
