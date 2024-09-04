const userService = require("../services/userService");
const channelService = require("../services/channelService");
const groupService = require("../services/groupService");

const route = (app) => {
  // get all channels
  app.get("/api/channels", (req, res) => {
    try {
      const channels = channelService.readChannels();
      res.status(200).json(channels);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve channels", error });
    }
  });

  // get channels by group ID
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

  // gget a channel by ID
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
      const newChannel = { ...req.body, joinRequests: [] }; // Initialize joinRequests as an empty array
      const channels = channelService.readChannels();

      channels.push(newChannel);
      channelService.writeChannels(channels);

      // Update the corresponding group by adding the new channel's ID
      const groups = groupService.readGroups();
      const group = groups.find((group) => group.id === newChannel.groupId);

      if (group) {
        group.channels.push(newChannel.id);
        groupService.writeGroups(groups);
      }

      res.status(201).json(newChannel);
    } catch (error) {
      res.status(500).json({ message: "Failed to create channel", error });
    }
  });

  // pdate a channel by ID
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

  // Del a channel by ID
  app.delete("/api/channels/:channelId", (req, res) => {
    try {
      const channelId = req.params.channelId.trim();
      let channels = channelService.readChannels();
      const channelExists = channels.some(
        (channel) => channel.id === channelId
      );

      if (channelExists) {
        // filter out the channel from the list
        channels = channels.filter((channel) => channel.id !== channelId);

        // rite the updated channels list
        channelService.writeChannels(channels);

        res.status(200).json({ message: "Channel deleted successfully" });
      } else {
        res.status(404).json({ message: "Channel not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete channel", error });
    }
  });

  // user requests to join a channel
  app.post("/api/channels/:channelId/request-join", (req, res) => {

    try {
      const channelId = req.params.channelId.trim();
      const { userId } = req.body;

      //vlidate userId
      if (!userId || typeof userId !== "string" || userId.trim() === "") {
        return res.status(400).json({ message: "Invalid userId" });
      }

      const channels = channelService.readChannels();
      const channel = channels.find((ch) => ch.id === channelId);

      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      //check if the user has already requested to join
      if (channel.joinRequests && channel.joinRequests.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User has already requested to join the channel" });
      }

      // ad user to join requests
      channel.joinRequests = channel.joinRequests || [];
      channel.joinRequests.push(userId);

      // save the updated channels list
      channelService.writeChannels(channels);

      res.status(200).json({ message: "Join request sent successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Failed to request to join the channel",
        error: error.message,
      });
    }
  });

  //adin approves or rejects a join request
  app.post("/api/channels/:channelId/approve-join", (req, res) => {
    const { channelId } = req.params;
    const { userId } = req.body;
    const { approve } = req.body;

    let channels = channelService.readChannels();
    let channel = channels.find((channel) => channel.id === channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    if (approve) {
      // approved the user
      channel.members.push(userId);
    }

    // rm the user from the joinRequests array
    channel.joinRequests = channel.joinRequests.filter((id) => id !== userId);

    channelService.writeChannels(channels);

    res
      .status(200)
      .json({ message: approve ? "User approved" : "Join request rejected" });
  });

  // rremove a user from a channel
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

  // ban a user from a channel
  app.post("/api/channels/:channelId/ban", (req, res) => {
    const { channelId } = req.params;
    const { userId } = req.body;
    let channels = channelService.readChannels();
    let channel = channels.find((channel) => channel.id === channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // is user already banned
    if (channel.blacklist.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is already banned from this channel" });
    }

    // add the user to the blacklist
    channel.blacklist.push(userId);
    channelService.writeChannels(channels);

    res.status(200).json({ message: "User banned successfully" });
  });

  // check if a user is a member of a channel
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
