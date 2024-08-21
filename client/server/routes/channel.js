const channelService = require("../services/channelService");

const route = (app) => {
  // Get all channels
  app.get("/api/channels", (req, res) => {
    const channels = channelService.readChannels();
    res.status(200).json(channels);
  });

  // Create a new channel
  app.post("/api/channels", (req, res) => {
    const newchannel = req.body;
    const channels = channelService.readChannels();

    // Add the new channel and save to file
    channels.push(newchannel);
    channelService.writeChannels(channels);

    res.status(201).json(newchannel);
  });

  // Get a channel by ID
  app.get("/api/channels/:id", (req, res) => {
    const channelId = req.params.id.trim();
    const channels = channelService.readChannels();
    const channel = channels.find((channel) => channel.id === channelId);

    if (channel) {
      res.status(200).json(channel);
    } else {
      res.status(404).json({ message: "channel not found" });
    }
  });

  // Update a channel by ID
  app.put("/api/channels/:id", (req, res) => {
    const channelId = req.params.id.trim();
    const updatedchannel = req.body;
    const channels = channelService.readChannels();
    const channelIndex = channels.findIndex((channel) => channel.id === channelId);

    if (channelIndex !== -1) {
      channels[channelIndex] = updatedchannel;
      channelService.writeChannels(channels);
      res.status(200).json(updatedchannel);
    } else {
      res.status(404).json({ message: "channel not found" });
    }
  });

  // Delete a channel by ID
  app.delete("/api/channels/:id", (req, res) => {
    const channelId = req.params.id.trim();
    let channels = channelService.readChannels();
    const channelExists = channels.some((channel) => channel.id === channelId);

    if (channelExists) {
      channels = channels.filter((channel) => channel.id !== channelId);
      channelService.writeChannels(channels);
      res.status(200).json({ message: "channel deleted successfully" });
    } else {
      res.status(404).json({ message: "channel not found" });
    }
  });
};

module.exports = { route };
