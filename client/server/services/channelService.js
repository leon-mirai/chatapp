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
      { _id: new ObjectId(channel._id) },
      { $set: channel },
      { upsert: true }
    );
    return result;
  } catch (error) {
    console.error("Error writing channel to MongoDB:", error);
  }
}

// Get a channel by ObjectId
async function getChannelById(db, channelId) {
  try {
    const channel = await db.collection("channels").findOne({ _id: new ObjectId(channelId) }); // Use ObjectId for channel ID
    if (!channel) {
      console.error(`Channel with ID ${channelId} not found.`);
      return null;
    }
    return channel;
  } catch (error) {
    console.error("Error retrieving channel by ID:", error);
    throw error;
  }
}


// Check if user is in the group associated with the channel
async function isUserInGroup(db, groupId, userId) {
  try {
    const groupObjectId = new ObjectId(groupId); // Convert to ObjectId
    const groupsCollection = db.collection("groups");
    const group = await groupsCollection.findOne({ _id: groupObjectId });

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
    const channelObjectId = new ObjectId(channelId); // Convert to ObjectId
    const channelsCollection = db.collection("channels");
    const channel = await channelsCollection.findOne({
      _id: channelObjectId,
    });

    if (!channel) {
      throw new Error("Channel not found");
    }

    // Validate if the user is in the group associated with the channel
    if (!(await isUserInGroup(db, channel.groupId, userId))) {
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
    const channelObjectId = new ObjectId(channelId); // Convert to ObjectId
    const channelsCollection = db.collection("channels");
    const channel = await channelsCollection.findOne({
      _id: channelObjectId,
    });

    if (!channel) {
      throw new Error("Channel not found");
    }

    channel.members = channel.members.filter((member) => member !== userId);
    await writeChannel(db, channel);

    return { message: "User removed from channel successfully", success: true };
  } catch (error) {
    console.error("Error removing user from channel:", error);
    throw error;
  }
}

// Remove a user from all channels
async function removeUserFromChannels(db, userId) {
  try {
    // Update all channels to remove the user from members and blacklist arrays
    const result = await db.collection("channels").updateMany(
      {}, // Update all channels
      {
        $pull: {
          members: userId, // Remove user from members array
          blacklist: userId, // Remove user from blacklist array
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `User ${userId} removed from ${result.modifiedCount} channels.`
      );
    } else {
      console.log(`User ${userId} was not found in any channels.`);
    }

    return result;
  } catch (error) {
    console.error("Error removing user from channels:", error);
    throw error;
  }
}

// Remove user from all channels within a group
async function removeUserFromGroupChannels(db, groupId, userId) {
  try {
    const groupObjectId = new ObjectId(groupId); // Convert groupId to ObjectId
    const userObjectId = new ObjectId(userId); // Convert userId to ObjectId

    // Log for debugging
    console.log(
      `Attempting to remove user ${userObjectId} from all channels in group ${groupObjectId}`
    );

    // Find all channels associated with the groupId
    const result = await db.collection("channels").updateMany(
      { groupId: groupObjectId }, // Match all channels by groupId
      { $pull: { members: userObjectId.toString() } } // Use userObjectId as a string for the members array
    );

    // Check if any channels were updated
    if (result.modifiedCount === 0) {
      console.log(
        "No channels were updated, user might not be in any channels or group not found."
      );
    } else {
      console.log(
        `User ${userObjectId} removed from ${result.modifiedCount} channels.`
      );
    }

    return result;
  } catch (error) {
    console.error("Error removing user from group channels:", error.message);
    throw error;
  }
}

async function deleteGroupChannels(db, groupId) {
  try {
    const groupObjectId = new ObjectId(groupId); // Convert groupId to ObjectId
    const result = await db
      .collection("channels")
      .deleteMany({ groupId: groupObjectId });

    if (result.deletedCount === 0) {
      console.log(`No channels found for group ${groupId}.`);
    } else {
      console.log(
        `Deleted ${result.deletedCount} channels for group ${groupId}.`
      );
    }

    return result;
  } catch (error) {
    console.error("Error deleting group channels:", error);
    throw error;
  }
}

async function getChannelsByGroupId(db, groupId) {
  try {
    const groupObjectId = new ObjectId(groupId); // Convert groupId to ObjectId
    console.log("Looking for channels with group ID: ", groupObjectId);

    const channels = await db
      .collection("channels")
      .find({ groupId: groupObjectId })
      .toArray();

    console.log("Found channels:", channels);
    return channels;
  } catch (error) {
    console.error("Error getting channels by group ID: ", error);
    throw error; // Rethrow the error so it can be caught in the route handler
  }
}

async function createChannel(db, channel) {
  try {
    console.log("Creating channel with data:", channel);
    const result = await db.collection("channels").insertOne(channel);

    return result.ops ? result.ops[0] : { ...channel, _id: result.insertedId };
  } catch (error) {
    console.error("Error inserting channel into MongoDB:", error);
    throw error;
  }
}

async function updateChannelById(db, channelId, updatedChannelData) {
  try {
    const channelObjectId = new ObjectId(channelId); // Convert channelId to ObjectId
    const result = await db.collection("channels").updateOne(
      { _id: channelObjectId }, // Match by ObjectId
      { $set: updatedChannelData }
    );

    return result.modifiedCount > 0 ? updatedChannelData : null;
  } catch (error) {
    console.error("Error updating channel:", error);
    throw error;
  }
}

async function deleteChannelById(db, channelId) {
  try {
    const channelObjectId = new ObjectId(channelId); // Convert channelId to ObjectId
    const result = await db
      .collection("channels")
      .deleteOne({ _id: channelObjectId });
    if (result.deletedCount === 0) {
      throw new Error("Channel not found");
    }
    return result;
  } catch (error) {
    console.error("Error deleting channel:", error);
    throw error;
  }
}

async function requestJoinChannel(db, channelId, userId) {
  try {
    const channelObjectId = new ObjectId(channelId); // Convert channelId to ObjectId
    const channelsCollection = db.collection("channels");

    const channel = await channelsCollection.findOne({ _id: channelObjectId });

    if (!channel) {
      throw new Error("Channel not found");
    }

    if (channel.members.includes(userId)) {
      return {
        success: false,
        message: "User is already a member of the channel",
      };
    }

    if (channel.joinRequests.includes(userId)) {
      return { success: false, message: "User has already requested to join" };
    }

    channel.joinRequests.push(userId);

    await channelsCollection.updateOne(
      { _id: channelObjectId },
      { $set: { joinRequests: channel.joinRequests } }
    );

    return { success: true, message: "Join request sent successfully" };
  } catch (error) {
    console.error("Error in requestJoinChannel:", error);
    throw error;
  }
}

async function approveJoinRequest(db, channelId, userId, approve) {
  try {
    const channelObjectId = new ObjectId(channelId); // Convert channelId to ObjectId
    const channelsCollection = db.collection("channels");

    const channel = await channelsCollection.findOne({ _id: channelObjectId });

    if (!channel) {
      throw new Error("Channel not found");
    }

    if (!channel.joinRequests.includes(userId)) {
      return { success: false, message: "No join request found for this user" };
    }

    if (approve) {
      channel.members.push(userId);
      channel.joinRequests = channel.joinRequests.filter((id) => id !== userId);
    } else {
      channel.joinRequests = channel.joinRequests.filter((id) => id !== userId);
    }

    await channelsCollection.updateOne(
      { _id: channelObjectId },
      { $set: { members: channel.members, joinRequests: channel.joinRequests } }
    );

    return { success: true };
  } catch (error) {
    console.error("Error in approveJoinRequest:", error);
    throw error;
  }
}

module.exports = {
  readChannels,
  writeChannel,
  joinChannel,
  getChannelById,
  isUserInGroup,
  removeUserFromChannel,
  removeUserFromChannels,
  removeUserFromGroupChannels,
  deleteGroupChannels,
  getChannelsByGroupId,
  createChannel,
  updateChannelById,
  deleteChannelById,
  requestJoinChannel,
  approveJoinRequest,
};
