const channelService = require("../services/channelService");

const route = (app) => {
  // Get all channels
  app.get("/api/channels", (req, res) => {
    try {
      const channels = channelService.readChannels();
      res.status(200).json(channels);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve channels", error });
    }
  });

  // Get channels by group ID
  app.get("/api/channels/group/:groupId", (req, res) => {
    try {
      const groupId = req.params.groupId.trim();
      const channels = channelService.readChannels();
      const groupChannels = channels.filter(
        (channel) => channel.groupId === groupId
      );
      res.status(200).json(groupChannels);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to retrieve channels by group ID", error });
    }
  });

  // Get a channel by ID
  app.get("/api/channels/:channelId", (req, res) => {
    try {
      const channelId = req.params.channelId.trim();
      const channels = channelService.readChannels();
      const channel = channels.find((channel) => channel.id === channelId);

      if (channel) {
        res.status(200).json(channel);
      } else {
        res.status(404).json({ message: "Channel not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve channel", error });
    }
  });

  // Create a new channel
  app.post("/api/channels", (req, res) => {
    try {
      const newChannel = req.body;
      const channels = channelService.readChannels();

      // Add the new channel and save to file
      channels.push(newChannel);
      channelService.writeChannels(channels);

      res.status(201).json(newChannel);
    } catch (error) {
      res.status(500).json({ message: "Failed to create channel", error });
    }
  });

  // Update a channel by ID
  app.put("/api/channels/:channelId", (req, res) => {
    try {
      const channelId = req.params.channelId.trim();
      const updatedChannelData = req.body;
      const channels = channelService.readChannels();
      const channelIndex = channels.findIndex(
        (channel) => channel.id === channelId
      );

      if (channelIndex !== -1) {
        channels[channelIndex] = {
          ...channels[channelIndex],
          ...updatedChannelData,
        };
        channelService.writeChannels(channels);
        res.status(200).json(channels[channelIndex]);
      } else {
        res.status(404).json({ message: "Channel not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update channel", error });
    }
  });

  // Delete a channel by ID
  app.delete("/api/channels/:channelId", (req, res) => {
    try {
      const channelId = req.params.channelId.trim();
      let channels = channelService.readChannels();
      const channelExists = channels.some(
        (channel) => channel.id === channelId
      );

      if (channelExists) {
        // Filter out the channel from the list
        channels = channels.filter((channel) => channel.id !== channelId);

        // TODO: Add cleanup for related data, such as messages or other linked entities

        // Write the updated channels list
        channelService.writeChannels(channels);

        res.status(200).json({ message: "Channel deleted successfully" });
      } else {
        res.status(404).json({ message: "Channel not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete channel", error });
    }
  });

  // Add a user to a channel
  // app.post("/api/channels/:channelId/members", (req, res) => {
  //   try {
  //     const channelId = req.params.channelId.trim();
  //     const { userId } = req.body;
  //     const response = channelService.addUserToChannel(channelId, userId);
  //     res.status(200).json(response);
  //   } catch (error) {
  //     res.status(500).json({ message: "Failed to add user to channel", error });
  //   }
  // });

  // User joins a channel
  app.post("/api/channels/:channelId/join", (req, res) => {
    try {
      const channelId = req.params.channelId.trim();
      const { userId } = req.body;

      // Validate userId
      if (!userId || typeof userId !== "string" || userId.trim() === "") {
        return res.status(400).json({ message: "Invalid userId" });
      }

      // Call the service to join the channel
      const response = channelService.joinChannel(channelId, userId);

      res.status(200).json(response);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to join the channel", error: error.message });
    }
  });

  // Remove a user from a channel
  app.delete("/api/channels/:channelId/members/:userId", (req, res) => {
    try {
      const channelId = req.params.channelId.trim();
      const userId = req.params.userId.trim();
      const response = channelService.removeUserFromChannel(channelId, userId);
      res.status(200).json(response);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to remove user from channel", error });
    }
  });

  // Ban a user from a channel
  app.post("/api/channels/:channelId/ban", (req, res) => {
    try {
      const channelId = req.params.channelId.trim();
      const { userId } = req.body;
      const response = channelService.banUserFromChannel(channelId, userId);
      res.status(200).json(response);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to ban user from channel", error });
    }
  });

  // Check if a user is a member of a channel
  app.get("/api/channels/:channelId/members/:userId", (req, res) => {
    try {
      const channelId = req.params.channelId.trim();
      const userId = req.params.userId.trim();
      const isMember = channelService.isUserInChannel(channelId, userId);
      res.status(200).json({ isMember });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to check if user is in channel", error });
    }
  });
};

module.exports = { route };
