const fs = require("fs");
const path = require("path");

const channelsPath = path.join(__dirname, "../data/channels.json");
const groupsPath = path.join(__dirname, "../data/groups.json");

function readChannels() {
  try {
    const channelsData = fs.readFileSync(channelsPath, "utf-8");
    return JSON.parse(channelsData || "[]");
  } catch (error) {
    console.error("Error reading channels file:", error);
    return [];
  }
}

function writeChannels(channels) {
  try {
    fs.writeFileSync(channelsPath, JSON.stringify(channels, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to channels file:", error);
  }
}

function readGroups() {
  try {
    const groupsData = fs.readFileSync(groupsPath, "utf-8");
    return JSON.parse(groupsData || "[]");
  } catch (error) {
    console.error("Error reading groups file:", error);
    return [];
  }
}

function isUserInGroup(groupId, userId) {
  const groups = readGroups();
  const group = groups.find((group) => group.id === groupId);
  if (!group) {
    console.error(`Group with ID ${groupId} not found.`);
    return false; // Group not found
  }
  return group.members.includes(userId);
}

function joinChannel(channelId, userId) {
  const channels = readChannels();
  const channel = channels.find((channel) => channel.id === channelId);

  if (!channel) {
    throw new Error("Channel not found");
  }

  // Validate if the user is in the group associated with the channel
  if (!isUserInGroup(channel.groupId, userId)) {
    throw new Error("User is not a member of the group");
  }

  if (!channel.members.includes(userId)) {
    channel.members.push(userId);
    writeChannels(channels);
    console.log(`User ${userId} successfully joined channel ${channelId}`); // Log the success
    return { message: "User joined the channel successfully" };
  } else {
    console.log(`User ${userId} is already a member of channel ${channelId}`);
    return { message: "User is already a member of the channel" };
  }
}


module.exports = {
  readChannels,
  writeChannels,
  joinChannel,
  readGroups,
  isUserInGroup,
};
