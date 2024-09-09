const { ObjectId } = require("mongodb");

// Generate unique user ID (we'll use MongoDB's ObjectId)
const generateUserId = () => {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Get all users
async function readUsers(db) {
  try {
    const usersCollection = db.collection("users");
    const users = await usersCollection.find().toArray();
    return users;
  } catch (error) {
    console.error("Error reading users from MongoDB:", error);
    return [];
  }
}

// Write user to the database (add or update)
async function writeUser(db, user) {
  try {
    const usersCollection = db.collection("users");
    const result = await usersCollection.updateOne(
      { _id: ObjectId(user._id) }, 
      { $set: user }, 
      { upsert: true } // Create the user if it doesn't exist
    );
    return result;
  } catch (error) {
    console.error("Error writing user to MongoDB:", error);
  }
}

module.exports = {
  readUsers,
  writeUser,
  generateUserId,
};
