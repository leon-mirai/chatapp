const { ObjectId } = require("mongodb"); // Import ObjectId from MongoDB
const groupService = require("./groupService");
const channelService = require("./channelService");

const generateUserId = () => {
  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Create a new user in the collection
const createUser = async (db, user) => {
  const newUser = {
    ...user,
    _id: new ObjectId(), // Create a new ObjectId for the user
    groups: user.groups.map((group) => new ObjectId(group)), // Ensure group IDs are ObjectIds
  };
  return await db.collection("users").insertOne(newUser);
};

// Get all users from the database
async function readUsers(db) {
  try {
    const users = await db.collection("users").find().toArray();
    return users;
  } catch (error) {
    console.error("Error reading users from MongoDB:", error);
    return [];
  }
}

async function getUserById(db, userId) {
  try {
    if (!ObjectId.isValid(userId)) {
      console.error("Invalid ObjectId:", userId);
      return null; // Return null if invalid ObjectId
    }

    // Fetch the user by ObjectId
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    return user;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw error;
  }
}

// Check if a username or email already exists, excluding the current user during updates
async function findUserByUsernameOrEmail(db, username, email, currentUserId) {
  try {
    const existingUser = await db.collection("users").findOne({
      $or: [{ username }, { email }],
      _id: { $ne: new ObjectId(currentUserId) }, // Exclude the current user from the check
    });
    return existingUser;
  } catch (error) {
    console.error("Error finding user by username or email:", error);
    throw error;
  }
}

async function updateUser(db, user) {
  try {
    const { _id, ...userWithoutId } = user; // Destructure to remove _id from the user object

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(_id) }, // Match by ObjectId
      { $set: userWithoutId } // Set the updated user document excluding _id
    );
    return result;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Delete a user from the database
// Cascade delete user by removing from all groups and channels before deleting user
async function deleteUser(db, userId) {
  try {
    // Convert userId to ObjectId
    const userObjectId = new ObjectId(userId);

    // Remove user from all groups
    await groupService.removeUserFromGroups(db, userObjectId);

    // Remove user from all channels
    await channelService.removeUserFromChannels(db, userObjectId);

    // Delete user from the users collection
    const result = await db
      .collection("users")
      .deleteOne({ _id: userObjectId });

    if (result.deletedCount === 0) {
      throw new Error("User not found");
    }

    return { message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// Remove group from user's group list when they leave a group
async function leaveGroup(db, userId, groupId) {
  try {
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) }, // Ensure userId is an ObjectId
      { $pull: { groups: new ObjectId(groupId) } } // Ensure groupId is an ObjectId
    );
    if (result.matchedCount === 0) {
      throw new Error("User not found");
    }
    return result;
  } catch (error) {
    console.error("Error removing group from user:", error);
    throw error;
  }
}

// Remove group from all users' groups array
async function removeGroupFromUsers(db, groupId) {
  try {
    const groupObjectId = new ObjectId(groupId); // Ensure groupId is an ObjectId

    // Remove the group (as ObjectId) from the 'groups' array of all users who have this group
    const result = await db.collection("users").updateMany(
      { groups: groupObjectId }, // Match users that have this groupId (as ObjectId) in their groups array
      { $pull: { groups: groupObjectId } } // Pull groupId (as ObjectId) from users' groups array
    );

    if (result.modifiedCount === 0) {
      throw new Error("No users were found with the specified group.");
    }

    console.log(
      `Group ${groupObjectId} removed from ${result.modifiedCount} users.`
    );
    return result;
  } catch (error) {
    console.error("Error removing group from all users:", error.message);
    throw error;
  }
}

/// Remove group from user's groups array
async function removeGroupFromUser(db, userId, groupId) {
  try {
    const userObjectId = new ObjectId(userId); // Convert userId to ObjectId
    const groupObjectId = new ObjectId(groupId); // Convert groupId to ObjectId

    // Log for debugging
    console.log(
      `Attempting to remove group ${groupObjectId} from user ${userObjectId}`
    );

    // Ensure the user exists
    const user = await db.collection("users").findOne({ _id: userObjectId });
    if (!user) {
      throw new Error("User not found");
    }

    console.log(`User found: ${user._id}, with groups: ${user.groups}`);

    // Ensure the group is in the user's groups array using the equals method
    const groupExists = user.groups.some((group) =>
      group.equals(groupObjectId)
    );

    if (!groupExists) {
      throw new Error("Group was not in the user's groups list.");
    }

    // Remove the group from the user's groups array
    const result = await db.collection("users").updateOne(
      { _id: userObjectId },
      { $pull: { groups: groupObjectId } } // Use ObjectId for the pull operation
    );

    if (result.modifiedCount === 0) {
      throw new Error("Failed to remove the group from user's groups list.");
    }

    console.log(`Group ${groupObjectId} removed from user ${userId}'s groups.`);
    return result;
  } catch (error) {
    console.error("Error removing group from user:", error.message);
    throw error;
  }
}

module.exports = {
  generateUserId,
  readUsers,
  getUserById,
  findUserByUsernameOrEmail,
  updateUser,
  deleteUser,
  leaveGroup,
  createUser,
  removeGroupFromUsers,
  removeGroupFromUser,
};
