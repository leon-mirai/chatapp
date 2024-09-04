const userService = require("../services/userService");
const groupService = require("../services/groupService");
const channelService = require("../services/channelService");

const route = (app) => {
  // get all users
  app.get("/api/users", (req, res) => {
    const users = userService.readUsers();
    res.status(200).json(users);
  });

  // get user by ID
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

  //user requests account creation with minimal details
  app.post("/api/users", (req, res) => {
    const newUser = {
      ...req.body, // spreader
      id: userService.generateUserId(),
      username: "",
      email: "",
      roles: ["ChatUser"],
      groups: [],
      password: "123",
      valid: false, // invalid until registered
    };

    const users = userService.readUsers();
    users.push(newUser);
    userService.writeUsers(users);
    res.status(201).json({ message: "Account request created", user: newUser });
  });

  // superAdmin completes user registration
  app.put("/api/users/:userId/complete-registration", (req, res) => {
    const { userId } = req.params;
    const { username, email } = req.body;
    const users = userService.readUsers();
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex !== -1) {
      // check for existing username or email
      const existingUser = users.find(
        (user) =>
          (user.username === username || user.email === email) &&
          user.id !== userId
      );
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Username or email already exists" });
      }

      // complete registration and mark as valid
      users[userIndex] = {
        ...users[userIndex],
        username,
        email,
        valid: true,
      };
      userService.writeUsers(users);
      res.status(200).json({
        message: "User registration completed",
        user: users[userIndex],
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });

  // update user details
  app.put("/api/users/:userId", (req, res) => {
    const userId = req.params.userId.trim();
    const updatedUser = req.body;
    const users = userService.readUsers();
    const userIndex = users.findIndex((user) => user.id === String(userId));

    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updatedUser };
      userService.writeUsers(users);
      res.status(200).json(users[userIndex]);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });

  // self-delete a user account
  app.delete("/api/users/:userId", (req, res) => {
    try {
      const userId = req.params.userId.trim();
      let users = userService.readUsers();

      const user = users.find((user) => user.id === userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // rmove user from all groups and channels
      let groups = groupService.readGroups();
      groups = groups.map((group) => {
        group.members = group.members.filter((memberId) => memberId !== userId);
        group.admins = group.admins.filter((adminId) => adminId !== userId);
        group.joinRequests = group.joinRequests.filter(
          (joinRequest) => joinRequest !== userId
        );
        return group;
      });
      groupService.writeGroups(groups);

      let channels = channelService.readChannels();
      channels = channels.map((channel) => {
        channel.members = channel.members.filter(
          (memberId) => memberId !== userId
        );
        return channel;
      });
      channelService.writeChannels(channels);

      // delete the user from the users array
      users = users.filter((user) => user.id !== userId);
      userService.writeUsers(users);

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete user", error: error.message });
    }
  });

  // delete user (admin-initiated deletion)
  app.delete("/api/users/:userId/delete-user", (req, res) => {
    try {
      const { userId } = req.params;
      let users = userService.readUsers();

      const user = users.find((user) => user.id === userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // remove user from all groups and channels
      let groups = groupService.readGroups();
      groups = groups.map((group) => {
        group.members = group.members.filter((memberId) => memberId !== userId);
        group.admins = group.admins.filter((adminId) => adminId !== userId);
        return group;
      });
      groupService.writeGroups(groups);

      let channels = channelService.readChannels();
      channels = channels.map((channel) => {
        channel.members = channel.members.filter(
          (memberId) => memberId !== userId
        );
        return channel;
      });
      channelService.writeChannels(channels);

      // delete the user from the users array
      users = users.filter((user) => user.id !== userId);
      userService.writeUsers(users);

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete user", error: error.message });
    }
  });

  // leave a group
  app.post("/api/users/:userId/groups/:groupId/leave", (req, res) => {
    try {
      const userId = req.params.userId.trim();
      const groupId = req.params.groupId.trim();

      let users = userService.readUsers();
      let groups = groupService.readGroups();
      let channels = channelService.readChannels();

      const user = users.find((user) => user.id === userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const group = groups.find((group) => group.id === groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      // remove group reference from user
      user.groups = user.groups.filter((group) => group !== groupId);

      // remove user from group members and admins
      group.members = group.members.filter((memberId) => memberId !== userId);
      group.admins = group.admins.filter((adminId) => adminId !== userId);

      // update channels to remove the user from any channels in this group
      channels = channels.map((channel) => {
        if (channel.groupId === groupId) {
          channel.members = channel.members.filter(
            (memberId) => memberId !== userId
          );
        }
        return channel;
      });

      // write updates back to the files
      userService.writeUsers(users);
      groupService.writeGroups(groups);
      channelService.writeChannels(channels);

      res.status(200).json({
        message: "Left the group and removed from channels successfully",
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to leave group", error: error.message });
    }
  });

  // register interest in a group
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

  // promote a user to GroupAdmin or SuperAdmin
  app.post("/api/users/:userId/promote", (req, res) => {
    try {
      const { userId } = req.params;
      const { newRole } = req.body;

      let users = userService.readUsers();
      const user = users.find((user) => user.id === userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // check if the user already has the role
      if (user.roles.includes(newRole)) {
        return res
          .status(400)
          .json({ message: `User is already a ${newRole}` });
      }

      // add the new role to the user's roles
      user.roles.push(newRole);

      // persist the updated user data
      userService.writeUsers(users);

      res
        .status(200)
        .json({ message: `User promoted to ${newRole} successfully` });
    } catch (error) {
      console.error("Error promoting user:", error);
      res
        .status(500)
        .json({ message: "An error occurred while promoting the user" });
    }
  });
};

module.exports = { route };
