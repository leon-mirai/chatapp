const userService = require("../services/userService");
const channelService = require("../services/channelService");
const groupService = require("../services/groupService");

const route = (app, db) => {
  // get all channels
  app.get("/api/channels", async (req, res) => {
    try {
      const channels = await channelService.readChannels(db); // Ensure correct function name
      res.status(200).json(channels);
    } catch (error) {
      console.error("Failed to retrieve channels:", error);
      res.status(500).json({ message: "Failed to retrieve channels", error });
    }
  });

  // get channels by group ID
  app.get("/api/channels/group/:groupId", async (req, res) => {
    try {
      const groupId = req.params.groupId.trim();
      const channels = await channelService.getChannelsByGroupId(db, groupId);
      res.status(200).json(channels);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to retrieve channels by group ID", error });
    }
  });

  // get a channel by ID
  app.get("/api/channels/:channelId", async (req, res) => {
    try {
      const channelId = req.params.channelId.trim();
      const channel = await channelService.getChannelById(db, channelId);

      if (channel) {
        res.status(200).json(channel);
      } else {
        res.status(404).json({ message: "Channel not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve channel", error });
    }
  });

  // create a new channel
  app.post("/api/channels", async (req, res) => {
    try {
      console.log("Request body for channel creation:", req.body); // Add this to check the request body

      const newChannel = { ...req.body };
      const createdChannel = await channelService.createChannel(db, newChannel);

      console.log("Created channel:", createdChannel); // Add this log to verify the created channel

      // update the corresponding group by adding the new channel's ID
      const group = await groupService.addChannelToGroup(
        db,
        newChannel.groupId,
        createdChannel._id
      );

      if (group) {
        res.status(201).json(createdChannel);
      } else {
        res.status(404).json({ message: "Group not found" });
      }
    } catch (error) {
      console.error("Failed to create channel:", error); // Add error details to the console
      res.status(500).json({ message: "Failed to create channel", error });
    }
  });

  // Update a channel by ID
  app.put("/api/channels/:channelId", async (req, res) => {
    try {
      const channelId = req.params.channelId.trim();
      const updatedChannelData = req.body;
      const updatedChannel = await channelService.updateChannelById(
        db,
        channelId,
        updatedChannelData
      );

      if (updatedChannel) {
        res
          .status(200)
          .json({ message: "Channel updated successfully", updatedChannel });
      } else {
        res.status(404).json({ message: "Channel not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update channel", error });
    }
  });

  app.delete("/api/channels/:channelId", async (req, res) => {
    try {
      const channelId = req.params.channelId.trim();
      const deletedChannel = await channelService.deleteChannelById(
        db,
        channelId
      );

      if (deletedChannel.deletedCount > 0) {
        // Check deletedCount instead of just deletedChannel
        res.status(200).json({ message: "Channel deleted successfully" });
      } else {
        res.status(404).json({ message: "Channel not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete channel", error });
    }
  });

  // user requests to join a channel
  app.post("/api/channels/:channelId/request-join", async (req, res) => {
    try {
      const channelId = req.params.channelId.trim();
      const { userId } = req.body;

      if (!userId || typeof userId !== "string" || userId.trim() === "") {
        return res.status(400).json({ message: "Invalid userId" });
      }

      const requestJoinResult = await channelService.requestJoinChannel(
        db,
        channelId,
        userId
      );

      if (requestJoinResult.success) {
        res.status(200).json({ message: "Join request sent successfully" });
      } else {
        res.status(400).json({ message: requestJoinResult.message });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to request to join the channel", error });
    }
  });

  // admin approves or rejects a join request
  app.post("/api/channels/:channelId/approve-join", async (req, res) => {
    const { channelId } = req.params;
    const { userId, approve } = req.body;

    try {
      const result = await channelService.approveJoinRequest(
        db,
        channelId,
        userId,
        approve
      );

      res
        .status(200)
        .json({ message: approve ? "User approved" : "Join request rejected" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to process join request", error });
    }
  });

  // remove a user from a channel
  app.delete("/api/channels/:channelId/members/:userId", async (req, res) => {
    try {
      const channelId = req.params.channelId.trim();
      const userId = req.params.userId.trim();
      const response = await channelService.removeUserFromChannel(
        db,
        channelId,
        userId
      );

      res.status(200).json(response);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to remove user from channel", error });
    }
  });

  // ban a user from a channel
  app.post("/api/channels/:channelId/ban", async (req, res) => {
    const { channelId } = req.params;
    const { userId } = req.body;

    try {
      const result = await channelService.banUserFromChannel(
        db,
        channelId,
        userId
      );

      if (result.success) {
        res.status(200).json({ message: "User banned successfully" });
      } else {
        res.status(400).json({ message: "User is already banned" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to ban user", error });
    }
  });

  // check if a user is a member of a channel
  app.get("/api/channels/:channelId/members/:userId", async (req, res) => {
    try {
      const channelId = req.params.channelId.trim();
      const userId = req.params.userId.trim();
      const isMember = await channelService.isUserInChannel(
        db,
        channelId,
        userId
      );

      res.status(200).json({ isMember });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to check if user is in channel", error });
    }
  });
};

module.exports = { route };
