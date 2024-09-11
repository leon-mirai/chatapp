const { ObjectId } = require("mongodb");
const userService = require("../services/userService");
const channelService = require("../services/channelService");
const groupService = require("../services/groupService");

const route = (app, db) => {
  // Get every single group that exists (e.g., admin route)
  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await groupService.readGroups(db);
      res.status(200).json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to get groups", error });
    }
  });

  // Get all groups for a specific user (using ObjectId for userId)
  app.get("/api/users/:userId/groups", async (req, res) => {
    const userId = req.params.userId.trim();

    try {
      const groups = await groupService.readGroups(db);

      // Filter groups by membership and join requests
      const userGroups = groups.filter(
        (group) =>
          group.members.includes(new ObjectId(userId)) ||
          group.joinRequests.includes(new ObjectId(userId))
      );

      res.status(200).json(userGroups);
    } catch (error) {
      console.error("Failed to get user groups:", error);
      res.status(500).json({ message: "Failed to get user groups", error });
    }
  });

  // Get a group by ID (using ObjectId for groupId)
  app.get("/api/groups/:groupId", async (req, res) => {
    const { groupId } = req.params;
    try {
      const group = await groupService.getGroupById(db, new ObjectId(groupId));
      if (group) {
        res.status(200).json(group);
      } else {
        res.status(404).json({ message: "Group not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get group", error });
    }
  });

  // Create a new group (using ObjectId for admin user)
  app.post("/api/groups", async (req, res) => {
    const newGroup = req.body;
    try {
      const adminUser = await userService.getUserById(
        db,
        new ObjectId(newGroup.admins[0])
      );
      if (adminUser) {
        await groupService.createGroup(db, newGroup);
        adminUser.groups.push(newGroup._id); // Add the new group ObjectId to the user's groups
        await userService.updateUser(db, adminUser);
        res.status(201).json(newGroup);
      } else {
        res.status(404).json({ message: "Admin user not found" });
      }
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Failed to create group", error });
    }
  });

  // Update a group by ID (using ObjectId for groupId)
  app.put(
    "/api/groups/:groupId",
    groupService.checkGroupAdmin(db),
    async (req, res) => {
      const { groupId } = req.params;
      const updatedGroup = req.body;

      try {
        const result = await groupService.updateGroup(
          db,
          new ObjectId(groupId),
          updatedGroup
        );
        if (result.matchedCount > 0) {
          res
            .status(200)
            .json({
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

  // Remove a member from a group and its channels (using ObjectId for groupId and userId)
  app.delete("/api/groups/:groupId/members/:userId", async (req, res) => {
    const { groupId, userId } = req.params;

    try {
      const group = await groupService.getGroupById(db, new ObjectId(groupId));
      const user = await userService.getUserById(db, new ObjectId(userId));

      if (group && user) {
        await groupService.removeUserFromGroup(
          db,
          new ObjectId(userId),
          new ObjectId(groupId)
        );
        await channelService.removeUserFromGroupChannels(
          db,
          new ObjectId(groupId),
          new ObjectId(userId)
        );
        await userService.removeGroupFromUser(
          db,
          new ObjectId(userId),
          new ObjectId(groupId)
        );

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

  // Add a member to a group and update the user's groups array (using ObjectId for groupId and userId)
  app.post("/api/groups/:groupId/members", async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    try {
      const group = await groupService.getGroupById(db, new ObjectId(groupId));
      const user = await userService.getUserById(db, new ObjectId(userId));

      if (!group || !user) {
        return res.status(404).json({ message: "Group or User not found" });
      }

      if (!group.members.includes(new ObjectId(userId))) {
        group.members.push(new ObjectId(userId));
        await groupService.updateGroup(db, new ObjectId(groupId), group);

        if (!user.groups.includes(groupId)) {
          user.groups.push(new ObjectId(groupId));
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

  // Add an admin to a group (using ObjectId for groupId and userId)
  app.post("/api/groups/:groupId/admins", async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    try {
      const group = await groupService.getGroupById(db, new ObjectId(groupId));
      const user = await userService.getUserById(db, new ObjectId(userId));

      if (!group || !user) {
        return res.status(404).json({ message: "Group or User not found" });
      }

      if (group.admins.includes(new ObjectId(userId))) {
        return res
          .status(400)
          .json({ message: "User is already an admin of the group" });
      }

      group.admins.push(new ObjectId(userId));
      await groupService.updateGroup(db, new ObjectId(groupId), group);

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

  // Remove an admin from a group (using ObjectId for groupId and userId)
  app.delete("/api/groups/:groupId/admins/:userId", async (req, res) => {
    const { groupId, userId } = req.params;
    try {
      const group = await groupService.getGroupById(db, new ObjectId(groupId));
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      group.admins = group.admins.filter(
        (admin) => !admin.equals(new ObjectId(userId))
      );
      await groupService.updateGroup(db, new ObjectId(groupId), group);

      res.status(200).json({ message: "Admin removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove admin", error });
    }
  });

  // Request to join a group (using ObjectId for groupId and userId)
  app.post("/api/groups/:groupId/request-join", async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    try {
      const group = await groupService.getGroupById(db, new ObjectId(groupId));
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      if (group.members.includes(new ObjectId(userId))) {
        return res
          .status(400)
          .json({ message: "User is already a member of the group" });
      }

      if (group.joinRequests.includes(new ObjectId(userId))) {
        return res
          .status(400)
          .json({ message: "User has already requested to join" });
      }

      group.joinRequests.push(new ObjectId(userId));
      await groupService.updateGroup(db, new ObjectId(groupId), group);

      res.status(200).json({ message: "Join request sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to request join", error });
    }
  });

  // Approve a join request (using ObjectId for groupId and userId)
  app.post("/api/groups/:groupId/approve-join", async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    try {
      const group = await groupService.getGroupById(db, new ObjectId(groupId));
      const user = await userService.getUserById(db, new ObjectId(userId));

      if (!group || !user) {
        return res.status(404).json({ message: "Group or User not found" });
      }

      if (!group.joinRequests.includes(new ObjectId(userId))) {
        return res
          .status(400)
          .json({ message: "User did not request to join the group" });
      }

      group.members.push(new ObjectId(userId));
      group.joinRequests = group.joinRequests.filter(
        (id) => !id.equals(new ObjectId(userId))
      );
      await groupService.updateGroup(db, new ObjectId(groupId), group);

      if (!user.groups.includes(new ObjectId(groupId))) {
        user.groups.push(new ObjectId(groupId));
        await userService.updateUser(db, user);
      }

      res.status(200).json({ message: "User approved and added to group" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to approve join request", error });
    }
  });

  // Reject a join request (using ObjectId for groupId and userId)
  app.post("/api/groups/:groupId/reject-join", async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    try {
      const group = await groupService.getGroupById(db, new ObjectId(groupId));
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      if (!group.joinRequests.includes(new ObjectId(userId))) {
        return res
          .status(400)
          .json({ message: "User did not request to join" });
      }

      group.joinRequests = group.joinRequests.filter(
        (id) => !id.equals(new ObjectId(userId))
      );
      await groupService.updateGroup(db, new ObjectId(groupId), group);

      res.status(200).json({ message: "Join request rejected" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject join request", error });
    }
  });
};

module.exports = { route };
