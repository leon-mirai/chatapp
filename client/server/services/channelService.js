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

// rite channel to the database (add or update)
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
    const channel = await db
      .collection("channels")
      .findOne({ _id: new ObjectId(channelId) }); 
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
    const groupObjectId = new ObjectId(groupId); 
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
    const channelObjectId = new ObjectId(channelId); 
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
    const channel = await db.collection("channels").findOne({ _id: channelId });

    if (!channel) {
      return { success: false, message: "Channel not found" };
    }

    // Filter the members array to remove the userId using ObjectId comparison
    channel.members = channel.members.filter(
      (member) => !member.equals(userId)
    );

    // Update the channel with the modified members array
    const result = await db
      .collection("channels")
      .updateOne({ _id: channelId }, { $set: { members: channel.members } });

    if (result.modifiedCount > 0) {
      return {
        success: true,
        message: "User removed from channel successfully",
      };
    } else {
      return { success: false, message: "Failed to remove user from channel" };
    }
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
    const groupObjectId = new ObjectId(groupId); 
    const userObjectId = new ObjectId(userId); 

    // Log for debugging
    console.log(
      `Attempting to remove user ${userObjectId} from all channels in group ${groupObjectId}`
    );

    // Find all channels associated with the groupId and remove the userObjectId from the members array
    const result = await db.collection("channels").updateMany(
      { groupId: groupObjectId }, // Match all channels by groupId
      { $pull: { members: userObjectId } } // Pull userId as ObjectId from members array
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
    const groupObjectId = new ObjectId(groupId); 
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
    const groupObjectId = new ObjectId(groupId); 
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

// Service function to update a channel by ID
async function updateChannelById(db, channelId, updatedData) {
  try {
    // Ensure ObjectId conversion for groupId and members
    if (updatedData.groupId) {
      updatedData.groupId = new ObjectId(updatedData.groupId);
    }

    if (updatedData.members) {
      updatedData.members = updatedData.members.map(
        (memberId) => new ObjectId(memberId)
      );
    }

    const result = await db
      .collection("channels")
      .updateOne({ _id: channelId }, { $set: updatedData });
    return result.modifiedCount > 0 ? updatedData : null;
  } catch (error) {
    console.error("Error updating channel:", error);
    throw error;
  }
}

async function deleteChannelById(db, channelId) {
  try {
    const channelObjectId = new ObjectId(channelId); 
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
    const channelsCollection = db.collection("channels");
    // Ensure both channelId and userId are treated as ObjectId
    const channelObjectId = new ObjectId(channelId);
    const userObjectId = new ObjectId(userId);

    // Check if the user has already requested to join
    const channel = await channelsCollection.findOne({
      _id: channelObjectId,
      joinRequests: userObjectId,
    });

    if (channel) {
      return { success: false, message: "User has already requested to join" };
    }

    // Add user to joinRequests
    const result = await channelsCollection.updateOne(
      { _id: channelObjectId },
      { $addToSet: { joinRequests: userObjectId } } // Use $addToSet to avoid duplicates
    );

    if (result.modifiedCount === 0) {
      return { success: false, message: "Failed to add join request" };
    }

    return { success: true, message: "Join request sent successfully" };
  } catch (error) {
    console.error("Error in requestJoinChannel:", error);
    throw error; // Rethrow the error so it can be caught in the route handler
  }
}

async function approveJoinRequest(db, channelId, userId, approve) {
  try {
    const channelObjectId = new ObjectId(channelId); 
    const userObjectId = new ObjectId(userId); 
    const channelsCollection = db.collection("channels");

    const channel = await channelsCollection.findOne({ _id: channelObjectId });

    if (!channel) {
      throw new Error("Channel not found");
    }

    // Ensure we're comparing ObjectId to ObjectId
    if (!channel.joinRequests.some((id) => id.equals(userObjectId))) {
      return { success: false, message: "No join request found for this user" };
    }

    if (approve) {
      // Add user to members and remove from joinRequests
      channel.members.push(userObjectId);
    }

    // Always remove the user from joinRequests regardless of approval or rejection
    channel.joinRequests = channel.joinRequests.filter(
      (id) => !id.equals(userObjectId)
    );

    // Update the channel in the database
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

// Ban a user from a channel
async function banUserFromChannel(db, channelId, userId) {
  try {
    const channelsCollection = db.collection("channels");

    // Ensure channelId is properly converted to ObjectId
    const channelObjectId = new ObjectId(channelId);

    // Fetch the channel to check if the user is already banned
    const channel = await channelsCollection.findOne({ _id: channelObjectId });

    if (!channel) {
      throw new Error("Channel not found");
    }

    // Check if the user is already in the blacklist
    if (channel.blacklist.includes(userId)) {
      return { success: false, message: "User is already banned" };
    }

    // Remove the user from the members array if they exist there
    await channelsCollection.updateOne(
      { _id: channelObjectId },
      { $pull: { members: userId } } // Remove the userId from the members array
    );

    // Add the user to the blacklist
    await channelsCollection.updateOne(
      { _id: channelObjectId },
      { $push: { blacklist: userId } } // Add the userId to the blacklist array
    );

    return { success: true, message: "User banned successfully" };
  } catch (error) {
    console.error("Error banning user from channel:", error);
    throw error;
  }
}

async function isUserInChannel(db, channelId, userId) {
  try {
    const channelsCollection = db.collection("channels");

    // Find the channel by its ObjectId
    const channel = await channelsCollection.findOne({ _id: channelId });

    if (!channel) {
      throw new Error("Channel not found");
    }

    // Convert each member in the members array to ObjectId
    const isMember = channel.members.some((memberId) =>
      memberId.equals(userId)
    );

    return isMember;
  } catch (error) {
    console.error("Error checking if user is in channel:", error);
    throw error;
  }
}

async function updateChannel(db, channelId, updatedChannelData) {
  try {
    const result = await db
      .collection("channels")
      .updateOne(
        { _id: new ObjectId(channelId) },
        { $set: updatedChannelData }
      );

    if (result.matchedCount === 0) {
      throw new Error("Channel not found");
    }

    return result;
  } catch (error) {
    console.error("Error updating channel:", error);
    throw error;
  }
}

async function leaveChannel(db, channelId, userId) {
  try {
    const result = await db
      .collection("channels")
      .updateOne(
        { _id: new ObjectId(channelId) },
        { $pull: { members: new ObjectId(userId) } }
      );

    if (result.modifiedCount === 0) {
      throw new Error("Channel not found or user not a member of the channel");
    }

    return result;
  } catch (error) {
    console.error("Error removing user from channel:", error);
    throw error;
  }
}

async function addMessageToChannel(db, channelId, message) {
  try {
    const channelsCollection = db.collection("channels");

    // Push the new message (with ObjectId for the sender) into the messages array
    const result = await channelsCollection.updateOne(
      { _id: new ObjectId(channelId) },
      { $push: { messages: message } }
    );

    if (result.matchedCount === 0) {
      console.error(`Channel with ID ${channelId} not found.`);
    }
  } catch (error) {
    console.error("Error adding message to channel:", error);
    throw error;
  }
}

// Fetch the chat history for a specific channel
async function getChatHistory(db, channelId) {
  try {
    const channel = await db.collection("channels").findOne(
      { _id: new ObjectId(channelId) },
      { projection: { messages: 1 } } // Only return the 'messages' field
    );

    if (!channel) {
      console.error(`Channel with ID ${channelId} not found.`);
      return [];
    }

    return channel.messages || [];
  } catch (error) {
    console.error("Error retrieving chat history:", error);
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
  banUserFromChannel,
  isUserInChannel,
  updateChannel,
  leaveChannel,
  addMessageToChannel,
  getChatHistory,
};
