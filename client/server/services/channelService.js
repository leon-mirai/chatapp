const { ObjectId } = require("mongodb");

// Get all channels
async function readChannels(db) {
  try {
    const channelsCollection = db.collection("channels");
    const channels = await channelsCollection.find().toArray();
    return channels;
  } catch (error) {
    console.error("Error reading channels from MongoDB:", error);
    return [];
  }
}

// Write channel to the database (add or update)
async function writeChannel(db, channel) {
  try {
    const channelsCollection = db.collection("channels");
    const result = await channelsCollection.updateOne(
      { _id: ObjectId(channel._id) }, 
      { $set: channel }, 
      { upsert: true }
    );
    return result;
  } catch (error) {
    console.error("Error writing channel to MongoDB:", error);
  }
}

// Check if user is in the group associated with the channel
async function isUserInGroup(db, groupId, userId) {
  try {
    const groupsCollection = db.collection("groups");
    const group = await groupsCollection.findOne({ _id: ObjectId(groupId) });

    if (!group) {
      console.error(`Group with ID ${groupId} not found.`);
      return false; // Group not found
    }
    return group.members.includes(userId);
  } catch (error) {
    console.error("Error checking user in group:", error);
    return false;
  }
}

// Join a channel
async function joinChannel(db, channelId, userId) {
  try {
    const channelsCollection = db.collection("channels");
    const channel = await channelsCollection.findOne({ _id: ObjectId(channelId) });

    if (!channel) {
      throw new Error("Channel not found");
    }

    // Validate if the user is in the group associated with the channel
    if (!await isUserInGroup(db, channel.groupId, userId)) {
      throw new Error("User is not a member of the group");
    }

    if (!channel.members.includes(userId)) {
      channel.members.push(userId);
      await writeChannel(db, channel);
      return { message: "User joined the channel successfully" };
    } else {
      return { message: "User is already a member of the channel" };
    }
  } catch (error) {
    console.error("Error joining channel:", error);
    throw error;
  }
}

// Remove a user from a channel
async function removeUserFromChannel(db, channelId, userId) {
  try {
    const channelsCollection = db.collection("channels");
    const channel = await channelsCollection.findOne({ _id: ObjectId(channelId) });

    if (!channel) {
      throw new Error("Channel not found");
    }

    channel.members = channel.members.filter(member => member !== userId);
    await writeChannel(db, channel);

    return { message: "User removed from channel successfully", success: true };
  } catch (error) {
    console.error("Error removing user from channel:", error);
    throw error;
  }
}

module.exports = {
  readChannels,
  writeChannel,
  joinChannel,
  isUserInGroup,
  removeUserFromChannel,
};
