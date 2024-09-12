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
      { _id: new ObjectId(group._id) },
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
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = new ObjectId(req.user.id);
      const groupId = new ObjectId(req.params.groupId);

      if (!groupId) {
        return res.status(400).json({ message: "Group ID is required" });
      }

      const group = await db.collection("groups").findOne({ _id: groupId });
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
    const result = await db.collection("groups").updateOne(
      { _id: new ObjectId(groupId) }, // Match by ObjectId
      { $pull: { members: new ObjectId(userId) } } // Use ObjectId for comparison, do not convert to string
    );

    if (result.matchedCount === 0) {
      throw new Error("Group not found");
    }
    if (result.modifiedCount === 0) {
      throw new Error("User was not in the group's members list.");
    }

    console.log("User successfully removed from group.");
    return result;
  } catch (error) {
    console.error("Error removing user from group:", error.message);
    throw error;
  }
}

// Remove user from all groups
async function removeUserFromGroups(db, userId) {
  try {
    const result = await db.collection("groups").updateMany(
      {}, // Update all groups
      {
        $pull: {
          members: new ObjectId(userId), // Remove userId as ObjectId from members array
          admins: new ObjectId(userId), // Remove userId as ObjectId from admins array
        },
      }
    );

    if (result.matchedCount === 0) {
      console.log("User was not found in any groups.");
    } else {
      console.log(`User removed from ${result.modifiedCount} groups.`);
    }
  } catch (error) {
    console.error("Error removing user from groups:", error.message);
    throw error;
  }
}

// Get group by ObjectId
async function getGroupById(db, groupId) {
  try {
    const groupObjectId = new ObjectId(groupId);
    const group = await db.collection("groups").findOne({ _id: groupObjectId });
    return group;
  } catch (error) {
    console.error("Error getting group by ID:", error);
    throw error;
  }
}

// Update a group in the database by ObjectId
async function updateGroup(db, groupId, updatedGroupData) {
  try {
    const result = await db.collection("groups").updateOne(
      { _id: new ObjectId(groupId) }, // Match group by ObjectId
      { $set: updatedGroupData } // Update only the specified fields
    );
    return result;
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
}

// Create a new group (ensure admins and other relevant fields use ObjectId)
async function createGroup(db, group) {
  try {
    // Ensure admins array contains ObjectId
    group.admins = group.admins.map(adminId => new ObjectId(adminId)); 

    // Assign a new ObjectId to the group
    group._id = new ObjectId(); 

    // Insert the group into the database
    const result = await db.collection("groups").insertOne(group);

    return result;
  } catch (error) {
    console.error("Error inserting group into MongoDB:", error);
    throw error;
  }
}


// Delete a group by ObjectId
async function deleteGroup(db, groupId) {
  try {
    const groupObjectId = new ObjectId(groupId);
    const result = await db
      .collection("groups")
      .deleteOne({ _id: groupObjectId });
    if (result.deletedCount === 0) {
      throw new Error("Group not found");
    }
    return result;
  } catch (error) {
    console.error("Error deleting group:", error);
    throw error;
  }
}

// Check if a user is an admin of the group
async function isAdminOfGroup(db, groupId, userId) {
  const group = await getGroupById(db, groupId);
  if (!group) throw new Error("Group not found");
  return group.admins.includes(new ObjectId(userId));
}

// Remove an admin from a group
async function removeAdminFromGroup(db, groupId, userId) {
  try {
    const groupObjectId = new ObjectId(groupId);
    const userObjectId = new ObjectId(userId);

    const result = await db
      .collection("groups")
      .updateOne({ _id: groupObjectId }, { $pull: { admins: userObjectId } });

    if (result.matchedCount === 0) {
      throw new Error("Group not found");
    }
    return result;
  } catch (error) {
    console.error("Error removing admin from group:", error);
    throw error;
  }
}

// Add a channel to a group
async function addChannelToGroup(db, groupId, channelId) {
  try {
    const groupObjectId = new ObjectId(groupId); // Ensure groupId is ObjectId
    const channelObjectId = new ObjectId(channelId); // Ensure channelId is ObjectId

    const result = await db.collection("groups").updateOne(
      { _id: groupObjectId }, // Match by ObjectId
      { $addToSet: { channels: channelObjectId } } // Add channelId as ObjectId, ensure no duplicates
    );

    if (result.matchedCount === 0) {
      throw new Error("Group not found");
    }

    return result;
  } catch (error) {
    console.error("Error adding channel to group:", error.message);
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
