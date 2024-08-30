const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "../data/users.json");

const generateUserId = () => {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

function readUsers() {
  try {
    const usersData = fs.readFileSync(usersPath, "utf-8");
    return JSON.parse(usersData);
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to users file:", error);
  }
}

module.exports = {
  readUsers,
  writeUsers,
  generateUserId,
};
