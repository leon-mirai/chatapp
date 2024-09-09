const groupService = require('./groupService');
const channelService = require('./channelService')


// Generate unique user ID (for cases when you're not using MongoDB's ObjectId)
const generateUserId = () => {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Create a new user in the collection
const createUser = async (db, user) => {
  try {
    const result = await db.collection('users').insertOne(user);
    return result;
  } catch (error) {
    console.error("Error inserting user into MongoDB:", error);
    throw error;
  }
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

// Get user by custom ID field
async function getUserById(db, userId) {
  try {
    const user = await db.collection("users").findOne({ id: userId });
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
      id: { $ne: currentUserId }, // Exclude the current user from the check
    });
    return existingUser;
  } catch (error) {
    console.error("Error finding user by username or email:", error);
    throw error;
  }
}

// Update a user in the database
async function updateUser(db, user) {
  try {
    const result = await db.collection("users").updateOne(
      { id: user.id }, // Match by the custom user id
      { $set: user }
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
    // Remove user from all groups
    await groupService.removeUserFromGroups(db, userId);

    // Remove user from all channels
    await channelService.removeUserFromChannels(db, userId);

    // Delete user from the users collection
    const result = await db.collection("users").deleteOne({ id: userId });

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
      { id: userId },
      { $pull: { groups: groupId } } // Remove groupId from user's group array
    );
    return result;
  } catch (error) {
    console.error("Error removing group from user:", error);
    throw error;
  }
}

module.exports = {
  readUsers,
  getUserById,
  findUserByUsernameOrEmail,
  updateUser,
  deleteUser,
  leaveGroup,
  generateUserId,
  createUser,
};
