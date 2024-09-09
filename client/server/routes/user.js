const userService = require("../services/userService");
const groupService = require("../services/groupService");
const channelService = require("../services/channelService");

const route = (app, db) => {
  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await userService.readUsers(db);
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve users", error });
    }
  });

  // Get user by ID
  app.get("/api/users/:userId", async (req, res) => {
    const userId = req.params.userId.trim();
    try {
      const user = await userService.getUserById(db, userId);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get user", error });
    }
  });

  // User requests account creation with minimal details
  app.post("/api/users", async (req, res) => {
    try {
      const newUser = {
        id: userService.generateUserId(),
        username: req.body.username || "",
        email: req.body.email || "",
        roles: req.body.roles || ["ChatUser"],
        groups: req.body.groups || [],
        password: req.body.password || "123",
        valid: false,
      };

      // Insert user into the database
      await userService.createUser(db, newUser); // Make sure this calls the MongoDB collection to insert the document.

      res
        .status(201)
        .json({ message: "Account request created", user: newUser });
    } catch (error) {
      console.error("Failed to create user:", error);
      res.status(500).json({ message: "Failed to create user", error });
    }
  });

  // SuperAdmin completes user registration
  app.put("/api/users/:userId/complete-registration", async (req, res) => {
    const { userId } = req.params;
    const { username, email } = req.body;

    try {
      const user = await userService.getUserById(db, userId);
      if (user) {
        // Check for existing username or email
        const existingUser = await userService.findUserByUsernameOrEmail(
          db,
          username,
          email,
          userId
        );
        if (existingUser) {
          return res
            .status(400)
            .json({ message: "Username or email already exists" });
        }

        // Complete registration and mark as valid
        const updatedUser = { ...user, username, email, valid: true };
        await userService.updateUser(db, updatedUser);
        res
          .status(200)
          .json({ message: "User registration completed", user: updatedUser });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to complete registration", error });
    }
  });

  // Update user details
  app.put("/api/users/:userId", async (req, res) => {
    const userId = req.params.userId.trim();
    const updatedUser = req.body;

    try {
      const user = await userService.getUserById(db, userId);
      if (user) {
        const mergedUser = { ...user, ...updatedUser };
        await userService.updateUser(db, mergedUser);
        res.status(200).json(mergedUser);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update user", error });
    }
  });

  // Delete a user account (self-delete)
  app.delete("/api/users/:userId", async (req, res) => {
    const userId = req.params.userId.trim();
    try {
      const user = await userService.getUserById(db, userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove user from all groups and channels
      await groupService.removeUserFromGroups(db, userId);
      await channelService.removeUserFromChannels(db, userId);

      // Delete user
      await userService.deleteUser(db, userId);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user", error });
    }
  });

  // Delete user (admin-initiated deletion)
  app.delete("/api/users/:userId/delete-user", async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await userService.getUserById(db, userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Remove user from all groups and channels
      await groupService.removeUserFromGroups(db, userId);
      await channelService.removeUserFromChannels(db, userId);

      // Delete user
      await userService.deleteUser(db, userId);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user", error });
    }
  });

  // Leave a group
  app.post("/api/users/:userId/groups/:groupId/leave", async (req, res) => {
    const userId = req.params.userId.trim();
    const groupId = req.params.groupId.trim();

    try {
      // Ensure both the user and group exist in the database
      const user = await userService.getUserById(db, userId);
      const group = await groupService
        .readGroups(db)
        .then((groups) => groups.find((g) => g.id === groupId));

      if (!user || !group) {
        return res.status(404).json({ message: "User or Group not found" });
      }

      // Remove group from user's groups and remove user from group's members
      await userService.leaveGroup(db, userId, groupId);
      await groupService.removeUserFromGroup(db, userId, groupId);

      // Remove user from group's channels
      await channelService.removeUserFromGroupChannels(db, groupId, userId);

      res.status(200).json({ message: "Successfully left the group" });
    } catch (error) {
      console.error("Error leaving group:", error);
      res
        .status(500)
        .json({ message: "Failed to leave group", error: error.message });
    }
  });

  // Register interest in a group
  app.post(
    "/api/users/:userId/groups/:groupId/register-interest",
    async (req, res) => {
      const userId = req.params.userId.trim();
      const groupId = req.params.groupId.trim();

      try {
        // Find the user
        const user = await userService.getUserById(db, userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Find the group
        const group = await groupService.getGroupById(db, groupId);
        if (!group) {
          return res.status(404).json({ message: "Group not found" });
        }

        // Initialize joinRequests array if it doesn't exist
        if (!group.joinRequests) {
          group.joinRequests = [];
        }

        // Check if the user has already requested to join
        if (!group.joinRequests.includes(userId)) {
          // Add user to the joinRequests array
          group.joinRequests.push(userId);

          // Update the group document in the database
          await groupService.updateGroup(db, group);

          res.status(200).json({ message: "Interest registered successfully" });
        } else {
          res
            .status(400)
            .json({ message: "Already registered interest in this group" });
        }
      } catch (error) {
        console.error("Failed to register interest:", error);
        res.status(500).json({ message: "Failed to register interest", error });
      }
    }
  );

  // Promote a user to GroupAdmin or SuperAdmin
  app.post("/api/users/:userId/promote", async (req, res) => {
    const { userId } = req.params;
    const { newRole } = req.body; // newRole should be sent in the request body

    try {
      // Find the user by userId
      const user = await userService.getUserById(db, userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the user already has the role
      if (user.roles.includes(newRole)) {
        return res
          .status(400)
          .json({ message: `User is already a ${newRole}` });
      }

      // Add the new role to the user's roles
      user.roles.push(newRole);

      // Update the user in the database
      await userService.updateUser(db, user);

      res
        .status(200)
        .json({ message: `User promoted to ${newRole} successfully`, user });
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Failed to promote user", error });
    }
  });
};

module.exports = { route };
