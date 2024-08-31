const fs = require('fs');
const path = require('path');

const groupsPath = path.join(__dirname, '../data/groups.json');

function readGroups() {
  try {
    const groupsData = fs.readFileSync(groupsPath, 'utf-8');
    return JSON.parse(groupsData || '[]');  // fallback to an empty array if the file is empty
  } catch (error) {
    console.error('Error reading groups file:', error);
    return [];  // return an empty array if there's an error reading the file
  }
}

function writeGroups(groups) {
  try {
    fs.writeFileSync(groupsPath, JSON.stringify(groups, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to groups file:', error);
  }
}

function checkGroupAdmin(req, res, next) {
  const userId = req.user.id;  // assuming req.user contains the authenticated user's data
  const groupId = req.params.groupId;  // assuming the groupId is passed in the request parameters

  // fetch the group from the database
  Group.findById(groupId, (err, group) => {
    if (err || !group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // check if the user is an admin of the group
    if (!group.admins.includes(userId)) {
      return res.status(403).json({ message: "You are not authorized to manage this group" });
    }

    // user is authorized, go to the next middleware or route handler
    next();
  });
}

module.exports = {
  readGroups,
  writeGroups,
  checkGroupAdmin,
};
