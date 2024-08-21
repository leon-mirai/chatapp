const fs = require('fs');
const path = require('path');

const channelsPath = path.join(__dirname, '../data/channels.json');

function readChannels() {
  try {
    const channelsData = fs.readFileSync(channelsPath, 'utf-8');
    return JSON.parse(channelsData || '[]');  // Fallback to an empty array if the file is empty
  } catch (error) {
    console.error('Error reading channels file:', error);
    return [];  // Return an empty array if there's an error reading the file
  }
}

function writeChannels(channels) {
  try {
    fs.writeFileSync(channelsPath, JSON.stringify(channels, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to channels file:', error);
  }
}

module.exports = {
  readChannels,
  writeChannels,
};
