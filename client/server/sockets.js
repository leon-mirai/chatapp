const { ObjectId } = require('mongodb');
const channelService = require("./services/channelService.js");

function setupSocket(io, db) {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on('message', async (message) => {
      console.log('Received message:', message);
    
      try {
        // Add the message to the channel in the database
        await channelService.addMessageToChannel(db, message.channelId, {
          sender: new ObjectId(message.senderId), // Use ObjectId for storage
          content: message.content,
        });
        
        // Send the message back to all clients, including the username for display
        io.emit('message', {
          sender: message.senderName, // Send the username for display
          content: message.content,
        });
      } catch (err) {
        console.error('Error adding message to channel:', err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

module.exports = { setupSocket };
