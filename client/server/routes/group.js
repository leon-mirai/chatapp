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
    const userId = new ObjectId(req.params.userId.trim()); // Convert to ObjectId

    try {
      const groups = await groupService.readGroups(db);

      // Filter groups by membership and join requests
      const userGroups = groups.filter(
        (group) =>
          group.members.some((member) => member.equals(userId)) ||
          group.joinRequests.some((request) => request.equals(userId))
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
    // Check if 'admins' array exists and is not empty
    if (!newGroup.admins || newGroup.admins.length === 0) {
      return res.status(400).json({ message: "Admin user is required" });
    }

    // Fetch the admin user from the database using the first admin ID
    const adminUser = await userService.getUserById(
      db,
      new ObjectId(newGroup.admins[0])
    );

    if (!adminUser) {
      return res.status(404).json({ message: "Admin user not found" });
    }

    // Add the admin user to the group's members
    newGroup.members = [adminUser._id];  // Add admin user to the members array

    // Proceed to create the group
    const groupCreationResult = await groupService.createGroup(db, newGroup);

    // Add the newly created group ObjectId to the admin user's groups array
    adminUser.groups.push(groupCreationResult.insertedId);  // Group's ObjectId
    await userService.updateUser(db, adminUser);

    res.status(201).json({ message: "Group created successfully", group: newGroup });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Failed to create group", error });
  }
});


  // Update a group by ID (using ObjectId for groupId)
app.put("/api/groups/:groupId", async (req, res) => {
  const { groupId } = req.params;
  const updatedGroup = req.body;

  try {
    // Ensure all array fields (admins, members, channels, blacklist) use ObjectId
    if (updatedGroup.admins) {
      updatedGroup.admins = updatedGroup.admins.map(adminId => new ObjectId(adminId));
    }
    if (updatedGroup.members) {
      updatedGroup.members = updatedGroup.members.map(memberId => new ObjectId(memberId));
    }
    if (updatedGroup.channels) {
      updatedGroup.channels = updatedGroup.channels.map(channelId => new ObjectId(channelId));
    }
    if (updatedGroup.blacklist) {
      updatedGroup.blacklist = updatedGroup.blacklist.map(userId => new ObjectId(userId));
    }

    // Perform the update
    const result = await groupService.updateGroup(db, new ObjectId(groupId), updatedGroup);

    if (result.matchedCount > 0) {
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
});


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
      // Convert both groupId and userId to ObjectId
      const groupObjectId = new ObjectId(groupId);
      const userObjectId = new ObjectId(userId);

      // Fetch group and user by ObjectId
      const group = await groupService.getGroupById(db, groupObjectId);
      const user = await userService.getUserById(db, userObjectId);

      if (!group || !user) {
        return res.status(404).json({ message: "Group or User not found" });
      }

      // Ensure that joinRequests and members are compared as ObjectId
      if (!group.joinRequests.some((id) => id.equals(userObjectId))) {
        return res
          .status(400)
          .json({ message: "User did not request to join the group" });
      }

      // Add the user to the group members and remove from joinRequests
      group.members.push(userObjectId);
      group.joinRequests = group.joinRequests.filter(
        (id) => !id.equals(userObjectId)
      );

      // Update the group with new members and filtered joinRequests
      await groupService.updateGroup(db, groupObjectId, group);

      // Ensure user has the group added to their groups list
      if (!user.groups.some((id) => id.equals(groupObjectId))) {
        user.groups.push(groupObjectId);
        await userService.updateUser(db, user);
      }

      // Return success
      res.status(200).json({ message: "User approved and added to group" });
    } catch (error) {
      // Handle errors
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
      // Convert both groupId and userId to ObjectId
      const groupObjectId = new ObjectId(groupId);
      const userObjectId = new ObjectId(userId);

      // Fetch the group by ObjectId
      const group = await groupService.getGroupById(db, groupObjectId);

      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      // Ensure the user is in the joinRequests array (as ObjectId)
      if (!group.joinRequests.some((id) => id.equals(userObjectId))) {
        return res
          .status(400)
          .json({ message: "User did not request to join" });
      }

      // Remove the user from the joinRequests array
      group.joinRequests = group.joinRequests.filter(
        (id) => !id.equals(userObjectId)
      );

      // Update the group in the database
      await groupService.updateGroup(db, groupObjectId, group);

      res.status(200).json({ message: "Join request rejected successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject join request", error });
    }
  });

  
};

module.exports = { route };
