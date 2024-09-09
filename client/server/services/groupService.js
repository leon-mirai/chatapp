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
      const userId = req.user.id;
      const groupId = req.params.groupId;

      const group = await db
        .collection("groups")
        .findOne({ _id: ObjectId(groupId) });
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      if (!group.admins.includes(userId)) {
        return res
          .status(403)
          .json({ message: "You are not authorized to manage this group" });
      }

      next();
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

module.exports = {
  readGroups,
  writeGroup,
  checkGroupAdmin,
  removeUserFromGroup, // <-- New function added here
  removeUserFromGroups,
  getGroupById,
  updateGroup,
};
