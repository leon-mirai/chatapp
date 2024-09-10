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
    const channel = await channelsCollection.findOne({
      _id: ObjectId(channelId),
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
    const channelsCollection = db.collection("channels");
    const channel = await channelsCollection.findOne({
      _id: ObjectId(channelId),
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
    const result = await db.collection("channels").updateMany(
      { groupId: groupId }, // Find all channels in the group
      { $pull: { members: userId } } // Remove user from the members array
    );
    if (result.modifiedCount === 0) {
      throw new Error("No channels were updated");
    }
  } catch (error) {
    console.error("Error removing user from group channels:", error);
    throw error;
  }
}

async function deleteGroupChannels(db, groupId) {
  try {
    const result = await db
      .collection("channels")
      .deleteMany({ groupId: groupId });

    // Instead of throwing an error, just log a message if no channels were found.
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
    throw error; // Let any other unexpected errors propagate
  }
}

async function getChannelsByGroupId(db, groupId) {
  try {
    console.log("Looking for channels with group ID: ", groupId);

    // Find all channels with the matching groupId
    const channels = await db
      .collection("channels")
      .find({ groupId: groupId })
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
    console.log("Creating channel with data:", channel); // Add this log to see the input data

    const result = await db.collection("channels").insertOne(channel); // Ensure collection name is "channels"

    console.log("Insert result:", result); // Add this to check the MongoDB response

    return result.ops ? result.ops[0] : { ...channel, _id: result.insertedId };
  } catch (error) {
    console.error("Error inserting channel into MongoDB:", error);
    throw error;
  }
}

async function updateChannelById(db, channelId, updatedChannelData) {
  try {
    const result = await db.collection("channels").updateOne(
      { id: channelId }, // Match the custom channel ID
      { $set: updatedChannelData } // Update the channel with new data
    );

    return result.modifiedCount > 0 ? updatedChannelData : null;
  } catch (error) {
    console.error("Error updating channel:", error);
    throw error;
  }
}

async function deleteChannelById(db, channelId) {
  try {
    const result = await db.collection("channels").deleteOne({ id: channelId });
    if (result.deletedCount === 0) {
      throw new Error("Channel not found");
    }
    return result;
  } catch (error) {
    console.error("Error deleting channel:", error);
    throw error; // Make sure to re-throw the error so it can be handled properly in the route
  }
}

async function requestJoinChannel(db, channelId, userId) {
  try {
    const channelsCollection = db.collection("channels");

    // Check if the channel exists
    const channel = await channelsCollection.findOne({ id: channelId });

    if (!channel) {
      throw new Error("Channel not found");
    }

    // Check if the user is already a member of the channel
    if (channel.members.includes(userId)) {
      return {
        success: false,
        message: "User is already a member of the channel",
      };
    }

    // Check if the user has already requested to join
    if (channel.joinRequests.includes(userId)) {
      return { success: false, message: "User has already requested to join" };
    }

    // Add the user to the joinRequests array
    channel.joinRequests.push(userId);

    // Update the channel in the database
    await channelsCollection.updateOne(
      { id: channelId },
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
    const channelsCollection = db.collection("channels");

    // Find the channel by its ID
    const channel = await channelsCollection.findOne({ id: channelId });

    if (!channel) {
      throw new Error("Channel not found");
    }

    // Check if the user has requested to join
    if (!channel.joinRequests.includes(userId)) {
      return { success: false, message: "No join request found for this user" };
    }

    if (approve) {
      // Approve: Add the user to members and remove from joinRequests
      channel.members.push(userId);
      channel.joinRequests = channel.joinRequests.filter(id => id !== userId);
    } else {
      // Reject: Simply remove the user from joinRequests
      channel.joinRequests = channel.joinRequests.filter(id => id !== userId);
    }

    // Update the channel in the database
    await channelsCollection.updateOne(
      { id: channelId },
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
  approveJoinRequest
};
