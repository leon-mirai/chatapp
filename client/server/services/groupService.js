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

module.exports = {
  readGroups,
  writeGroups,
};
