const userService = require("../services/userService");
const groupService = require("../services/groupService");
const channelService = require("../services/channelService");

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

  // Delete user (Self-Deletion) THIS IS VERY PRIMITIVE Doesn't account for cascade deletion
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

  app.delete("/api/users/:userId/delete-user", (req, res) => {
    try {
      const { userId } = req.params;
      let users = userService.readUsers();

      // Check if the user exists
      const user = users.find((user) => user.id === userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // 1. Remove the user from all groups
      let groups = groupService.readGroups();
      groups = groups.map((group) => {
        // Remove user from group members and admins
        group.members = group.members.filter((memberId) => memberId !== userId);
        group.admins = group.admins.filter((adminId) => adminId !== userId);
        return group;
      });
      groupService.writeGroups(groups);

      // 2. Remove the user from all channels
      let channels = channelService.readChannels();
      channels = channels.map((channel) => {
        channel.members = channel.members.filter(
          (memberId) => memberId !== userId
        );
        return channel;
      });
      channelService.writeChannels(channels);

      // 3. Delete the user from the users array
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
  // app.post("/api/users/:userId/groups/:groupId/leave", (req, res) => {
  //   const userId = req.params.userId.trim();
  //   const groupId = req.params.groupId.trim();
  //   const users = userService.readUsers();
  //   const user = users.find((user) => user.id === userId);

  //   if (user) {
  //     user.groups = user.groups.filter((group) => group !== groupId);
  //     userService.writeUsers(users);
  //     res.status(200).json({ message: "Left the group successfully" });
  //   } else {
  //     res.status(404).json({ message: "User not found" });
  //   }
  // });
  // Leave a group
  app.post("/api/users/:userId/groups/:groupId/leave", (req, res) => {
    try {
      const userId = req.params.userId.trim();
      const groupId = req.params.groupId.trim();

      // Fetch users and groups
      let users = userService.readUsers();
      let groups = groupService.readGroups();
      let channels = channelService.readChannels();

      // Find the user
      const user = users.find((user) => user.id === userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Find the group
      const group = groups.find((group) => group.id === groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      // Remove the group from the user's groups array
      user.groups = user.groups.filter((group) => group !== groupId);

      // Remove the user from the group's members array
      group.members = group.members.filter((memberId) => memberId !== userId);

      // If the user is an admin, remove them from the admins array
      group.admins = group.admins.filter((adminId) => adminId !== userId);

      // Update channels to remove the user from any channels in this group
      channels = channels.map((channel) => {
        if (channel.groupId === groupId) {
          channel.members = channel.members.filter(
            (memberId) => memberId !== userId
          );
        }
        return channel;
      });

      // Write updates back to the files
      userService.writeUsers(users);
      groupService.writeGroups(groups);
      channelService.writeChannels(channels);

      res.status(200).json({
        message: "Left the group and removed from channels successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to leave group",
        error: error.message,
      });
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
