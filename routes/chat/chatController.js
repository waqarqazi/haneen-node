// chatController.js

// Example function to send a chat message
const sendMessage = (socket, message) => {
  socket.emit('message', message); // Emit the message event to the sender
  socket.broadcast.emit('message', message); // Broadcast the message to all other users
};

module.exports = {
  sendMessage,
};
