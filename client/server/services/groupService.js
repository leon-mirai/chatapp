const { ObjectId } = require("mongodb");

// Get all groups
async function readGroups(db) {
  try {
    const groupsCollection = db.collection("groups");
    const groups = await groupsCollection.find().toArray();
    return groups;
  } catch (error) {
    console.error("Error reading groups from MongoDB:", error);
    return [];
  }
}

// Write group to the database (add or update)
async function writeGroup(db, group) {
  try {
    const groupsCollection = db.collection("groups");
    const result = await groupsCollection.updateOne(
      { _id: ObjectId(group._id) },
      { $set: group },
      { upsert: true }
    );
    return result;
  } catch (error) {
    console.error("Error writing group to MongoDB:", error);
  }
}

// Check if user is an admin of the group
function checkGroupAdmin(db) {
  return async function (req, res, next) {
    try {
      // Ensure that req.user is available, otherwise return an error
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user.id;
      const groupId = req.params.groupId;

      if (!groupId) {
        return res.status(400).json({ message: "Group ID is required" });
      }

      const group = await db.collection("groups").findOne({ id: groupId });
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      if (!group.admins.includes(userId)) {
        return res
          .status(403)
          .json({ message: "You are not authorized to manage this group" });
      }

      next(); // If the user is an admin, proceed
    } catch (error) {
      console.error("Error in checkGroupAdmin middleware:", error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  };
}

// Remove user from a specific group
async function removeUserFromGroup(db, userId, groupId) {
  try {
    // Log inputs to check for correct data
    console.log("Removing user from group:", { userId, groupId });

    // Query by the custom 'id' field
    const result = await db.collection("groups").updateOne(
      { id: groupId }, // Ensure groupId is correct and used as a string
      { $pull: { members: userId, admins: userId } }
    );

    // Log the result to see if any documents were matched
    console.log("Update result:", result);

    if (result.matchedCount === 0) {
      throw new Error("Group not found");
    }
  } catch (error) {
    console.error("Error removing user from group:", error);
    throw error;
  }
}

// Remove user from all groups
async function removeUserFromGroups(db, userId) {
  try {
    await db.collection("groups").updateMany(
      {}, // Update all groups
      { $pull: { members: userId, admins: userId } } // Remove user from members and admins
    );
  } catch (error) {
    console.error("Error removing user from groups:", error);
    throw error;
  }
}

// Get group by custom group ID
async function getGroupById(db, groupId) {
  try {
    console.log("Looking for group with ID:", groupId);
    const group = await db.collection("groups").findOne({ id: groupId });
    console.log("Found group:", group);
    return group;
  } catch (error) {
    console.error("Error getting group by ID:", error);
    throw error;
  }
}

// Update a group in the database
async function updateGroup(db, groupId, updatedFields) {
  try {
    const result = await db.collection("groups").updateOne(
      { id: groupId }, // Match by custom group ID
      { $set: updatedFields } // Only update the specific fields that were passed
    );
    return result;
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
}

// async function updateGroup(db, group) {
//   try {
//     const result = await db.collection("groups").updateOne(
//       { id: group.id }, // Match by custom group ID
//       { $set: group } // Use $set to update the entire group document
//     );
//     return result;
//   } catch (error) {
//     console.error("Error updating group:", error);
//     throw error;
//   }
// }

async function createGroup(db, group) {
  try {
    const result = await db.collection("groups").insertOne(group);
    return result;
  } catch (error) {
    console.error("Error inserting group into MongoDB:", error);
    throw error;
  }
}

async function deleteGroup(db, groupId) {
  try {
    const result = await db.collection("groups").deleteOne({ id: groupId });
    if (result.deletedCount === 0) {
      throw new Error("Group not found");
    }
    return result;
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
}

async function isAdminOfGroup(db, groupId, userId) {
  const group = await getGroupById(db, groupId);
  if (!group) throw new Error("Group not found");
  return group.admins.includes(userId);
}

// Remove an admin from a group
async function removeAdminFromGroup(db, groupId, userId) {
  try {
    const result = await db
      .collection("groups")
      .updateOne({ id: groupId }, { $pull: { admins: userId } });
    if (result.matchedCount === 0) {
      throw new Error("Group not found");
    }
    return result;
  } catch (error) {
    console.error("Error removing admin from group:", error);
    throw error;
  }
}

async function addChannelToGroup(db, groupId, channelId) {
  try {
    console.log(`Adding channel ${channelId} to group ${groupId}`);
    
    // Update the group with the new channel ID
    const result = await db.collection("groups").updateOne(
      { id: groupId }, // Match by group ID
      { $addToSet: { channels: channelId } } // Use $addToSet to avoid duplicates
    );
    
    if (result.matchedCount === 0) {
      throw new Error("Group not found");
    }

    console.log(`Channel ${channelId} added to group ${groupId}`);
    return result;
  } catch (error) {
    console.error("Error adding channel to group:", error);
    throw error;
  }
}


module.exports = {
  readGroups,
  writeGroup,
  checkGroupAdmin,
  removeUserFromGroup,
  removeUserFromGroups,
  getGroupById,
  updateGroup,
  createGroup,
  deleteGroup,
  isAdminOfGroup,
  removeAdminFromGroup,
  addChannelToGroup,
};
