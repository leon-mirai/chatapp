const userService = require("../services/userService");

const route = (app) => {
  // Get all users
  app.get("/api/users", (req, res) => {
    const users = userService.readUsers();
    res.status(200).json(users);
  });

  // Get user by ID
  app.get("/api/users/:userId", (req, res) => {
    const userId = req.params.userId.trim();
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
    userService.writeUsers(users);
    res.status(201).json(newUser);
  });

  // Update a user
  app.put("/api/users/:userId", (req, res) => {
    const userId = req.params.userId.trim();
    const updatedUser = req.body;
    const users = userService.readUsers();
    const userIndex = users.findIndex((user) => user.id === String(userId));

    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      userService.writeUsers(users);
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });

  // Delete user (Self-Deletion)
  app.delete("/api/users/:userId", (req, res) => {
    try {
      const userId = req.params.userId.trim();
      let users = userService.readUsers();

      // Check if the user exists
      const user = users.find((user) => user.id === userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Proceed to delete the user
      users = users.filter((user) => user.id !== userId);
      userService.writeUsers(users);

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete user", error: error.message });
    }
  });

  // Leave a group
  app.post("/api/users/:userId/groups/:groupId/leave", (req, res) => {
    const userId = req.params.userId.trim();
    const groupId = req.params.groupId.trim();
    const users = userService.readUsers();
    const user = users.find((user) => user.id === userId);

    if (user) {
      user.groups = user.groups.filter((group) => group !== groupId);
      userService.writeUsers(users);
      res.status(200).json({ message: "Left the group successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });

  // Register interest in a group
  app.post(
    "/api/users/:userId/groups/:groupId/register-interest",
    (req, res) => {
      const userId = req.params.userId.trim();
      const groupId = req.params.groupId.trim();
      const users = userService.readUsers();
      const user = users.find((user) => user.id === userId);

      if (user) {
        if (!user.interests) {
          user.interests = [];
        }
        if (!user.interests.includes(groupId)) {
          user.interests.push(groupId);
          userService.writeUsers(users);
          res.status(200).json({ message: "Interest registered successfully" });
        } else {
          res
            .status(400)
            .json({ message: "Already registered interest in this group" });
        }
      } else {
        res.status(404).json({ message: "User not found" });
      }
    }
  );
};

module.exports = { route };
