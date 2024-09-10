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
        return res.status(403).json({ message: "You are not authorized to manage this group" });
      }

      next();  // If the user is an admin, proceed
    } catch (error) {
      console.error("Error in checkGroupAdmin middleware:", error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  };
}


// Remove user from a specific group
async function removeUserFromGroup(db, userId, groupId) {
  try {
    const result = await db
      .collection("groups")
      .updateOne(
        { id: groupId },
        { $pull: { members: userId, admins: userId } }
      );
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
    const group = await db.collection("groups").findOne({ id: groupId });
    return group;
  } catch (error) {
    console.error("Error getting group by ID:", error);
    throw error;
  }
}

// Update a group in the database
async function updateGroup(db, group) {
  try {
    const result = await db.collection("groups").updateOne(
      { id: group.id }, // Match by custom group ID
      { $set: group }
    );
    return result;
  } catch (error) {
    console.error("Error updating group:", error);
    throw error;
  }
}

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
};
