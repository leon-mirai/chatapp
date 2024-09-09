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

function checkGroupAdmin(db) {
  return async function (req, res, next) {
    try {
      const userId = req.user.id; // Assuming `req.user` is populated correctly.
      const groupId = req.params.groupId;

      // Fetch the group from the MongoDB collection
      const group = await db.collection("groups").findOne({ _id: groupId });

      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      if (!group.admins.includes(userId)) {
        return res
          .status(403)
          .json({ message: "You are not authorized to manage this group" });
      }

      // If the user is an admin, proceed to the next middleware/route handler
      next();
    } catch (error) {
      console.error("Error in checkGroupAdmin middleware:", error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  };
}

module.exports = {
  readGroups,
  writeGroup,
  checkGroupAdmin,
};
