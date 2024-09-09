const userService = require("../services/userService");
const channelService = require("../services/channelService");
const groupService = require("../services/groupService");

const route = (app, db) => {
  // Get every single group that exists
  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await groupService.readGroups(db); // Read all groups from MongoDB
      res.status(200).json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to get groups", error });
    }
  });

  // Get all groups for the specific user
  app.get("/api/groups", async (req, res) => {
    const userId = req.query.userId; // Get the userId from the query parameter
    try {
      const groups = await groupService.readGroups(db);
      const userGroups = groups.filter((group) =>
        group.members.includes(userId)
      ); // Filter groups by membership
      res.status(200).json(userGroups); // Return the filtered groups
    } catch (error) {
      res.status(500).json({ message: "Failed to get user groups", error });
    }
  });

  // Get a group by ID
  app.get("/api/groups/:groupId", async (req, res) => {
    const { groupId } = req.params;
    try {
      const group = await groupService.getGroupById(db, groupId);
      if (group) {
        res.status(200).json(group);
      } else {
        res.status(404).json({ message: "Group not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get group", error });
    }
  });

  // Create a new group
  app.post("/api/groups", async (req, res) => {
    const newGroup = req.body;
    try {
      const adminUser = await userService.getUserById(db, newGroup.admins[0]);
      if (adminUser) {
        await groupService.createGroup(db, newGroup);
        adminUser.groups.push(newGroup.id); // Add the new group ID to the user's groups
        await userService.updateUser(db, adminUser);
        res.status(201).json(newGroup);
      } else {
        res.status(404).json({ message: "Admin user not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to create group", error });
    }
  });

  // Update route to use async properly
  app.put(
    "/api/groups/:groupId",
    groupService.checkGroupAdmin(db),
    async (req, res) => {
      const { groupId } = req.params;
      const updatedGroup = req.body;

      try {
        // Assuming the `updateGroup` is an async function
        const result = await groupService.updateGroup(
          db,
          groupId,
          updatedGroup
        );

        if (result) {
          res.status(200).json({
            message: "Group updated successfully",
            group: updatedGroup,
          });
        } else {
          res.status(404).json({ message: "Group not found" });
        }
      } catch (error) {
        res.status(500).json({ message: "Failed to update group", error });
      }
    }
  );

  // Delete a group by ID
  app.delete("/api/groups/:groupId", async (req, res) => {
    const { groupId } = req.params;
    try {
      const groupExists = await groupService.getGroupById(db, groupId);
      if (!groupExists) {
        return res.status(404).json({ message: "Group not found" });
      }

      // 1. Delete all channels associated with this group
      await channelService.deleteGroupChannels(db, groupId);

      // 2. Remove the group reference from all users
      await userService.removeGroupFromUsers(db, groupId);

      // 3. Delete the group itself
      await groupService.deleteGroup(db, groupId);

      res.status(200).json({ message: "Group deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete group", error });
    }
  });

  // Add a member to a group and update the user's groups array
  app.post("/api/groups/:groupId/members", async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    try {
      const group = await groupService.getGroupById(db, groupId);
      const user = await userService.getUserById(db, userId);
      if (!group || !user) {
        return res.status(404).json({ message: "Group or User not found" });
      }

      if (!group.members.includes(userId)) {
        group.members.push(userId);
        await groupService.updateGroup(db, groupId, group);

        if (!user.groups.includes(groupId)) {
          user.groups.push(groupId);
          await userService.updateUser(db, user);
        }

        res
          .status(200)
          .json({ message: "Member added successfully and user updated" });
      } else {
        res
          .status(400)
          .json({ message: "User is already a member of the group" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to add member", error });
    }
  });

  // Remove a member from a group and its channels
  app.delete("/api/groups/:groupId/members/:userId", async (req, res) => {
    const { groupId, userId } = req.params;
    try {
      const group = await groupService.getGroupById(db, groupId);
      const user = await userService.getUserById(db, userId);

      if (group && user) {
        await groupService.removeUserFromGroup(db, groupId, userId);
        await userService.removeGroupFromUser(db, userId, groupId);
        await channelService.removeUserFromGroupChannels(db, groupId, userId);

        res
          .status(200)
          .json({ message: "Member removed and cascade deletion successful" });
      } else {
        res.status(404).json({ message: "Group or User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to remove member", error });
    }
  });

  // Add an admin to a group and update the user's role
  app.post("/api/groups/:groupId/admins", async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    try {
      const group = await groupService.getGroupById(db, groupId);
      const user = await userService.getUserById(db, userId);

      if (!group || !user) {
        return res.status(404).json({ message: "Group or User not found" });
      }

      if (group.admins.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User is already an admin of the group" });
      }

      group.admins.push(userId);
      await groupService.updateGroup(db, groupId, group);

      if (!user.roles.includes("GroupAdmin")) {
        user.roles.push("GroupAdmin");
        await userService.updateUser(db, user);
      }

      res
        .status(200)
        .json({ message: "Admin added and user promoted to GroupAdmin" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add admin", error });
    }
  });

  // Remove an admin from a group
  app.delete("/api/groups/:groupId/admins/:userId", async (req, res) => {
    const { groupId, userId } = req.params;
    try {
      const group = await groupService.getGroupById(db, groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      group.admins = group.admins.filter((admin) => admin !== userId);
      await groupService.updateGroup(db, groupId, group);
      res.status(200).json({ message: "Admin removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove admin", error });
    }
  });

  // Check if a user is a member of a group
  app.get("/api/groups/:groupId/members/:userId", async (req, res) => {
    const { groupId, userId } = req.params;
    try {
      const group = await groupService.getGroupById(db, groupId);
      if (group) {
        const isMember = group.members.includes(userId);
        res.status(200).json({ isMember });
      } else {
        res.status(404).json({ message: "Group not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to check group membership", error });
    }
  });

  // Check if a user is an admin of a group
  app.get("/api/groups/:groupId/admins/:userId", async (req, res) => {
    const { groupId, userId } = req.params;
    try {
      const group = await groupService.getGroupById(db, groupId);
      if (group) {
        const isAdmin = group.admins.includes(userId);
        res.status(200).json({ isAdmin });
      } else {
        res.status(404).json({ message: "Group not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to check admin status", error });
    }
  });

  // Request to join a group
  app.post("/api/groups/:groupId/request-join", async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    try {
      const group = await groupService.getGroupById(db, groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      if (group.members.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User is already a member of the group" });
      }

      if (group.joinRequests.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User has already requested to join" });
      }

      group.joinRequests.push(userId);
      await groupService.updateGroup(db, groupId, group);

      res.status(200).json({ message: "Join request sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to request join", error });
    }
  });

  // Approve a join request
  app.post("/api/groups/:groupId/approve-join", async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    try {
      const group = await groupService.getGroupById(db, groupId);
      const user = await userService.getUserById(db, userId);

      if (!group || !user) {
        return res.status(404).json({ message: "Group or User not found" });
      }

      if (!group.joinRequests.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User did not request to join the group" });
      }

      group.members.push(userId);
      group.joinRequests = group.joinRequests.filter((id) => id !== userId);
      await groupService.updateGroup(db, groupId, group);

      if (!user.groups.includes(groupId)) {
        user.groups.push(groupId);
        await userService.updateUser(db, user);
      }

      res.status(200).json({ message: "User approved and added to group" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to approve join request", error });
    }
  });

  // Reject a join request
  app.post("/api/groups/:groupId/reject-join", async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    try {
      const group = await groupService.getGroupById(db, groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      if (!group.joinRequests.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User did not request to join" });
      }

      group.joinRequests = group.joinRequests.filter((id) => id !== userId);
      await groupService.updateGroup(db, groupId, group);

      res.status(200).json({ message: "Join request rejected" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject join request", error });
    }
  });
};

module.exports = { route };
