const userSockets = new Map(); // username => socketId

export const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('🟢 New socket connected:', socket.id);

    socket.on('register', (username) => {
      userSockets.set(username, socket.id);
      console.log(`✅ Registered ${username} with socket ID: ${socket.id}`);
    });

    socket.on('private_message', ({ sender, receiver, text }) => {
      const targetSocketId = userSockets.get(receiver);

      if (targetSocketId) {
        io.to(targetSocketId).emit('private_message', { sender, receiver, text });
        console.log(`📩 ${sender} ➡️ ${receiver}: ${text}`);
      } else {
        console.log(`❌ ${receiver} not connected`);
      }

      // Echo to sender as confirmation
      socket.emit('private_message', { sender, receiver, text });
    });

    socket.on('disconnect', () => {
      for (const [user, id] of userSockets.entries()) {
        if (id === socket.id) {
          userSockets.delete(user);
          console.log(`🔴 ${user} disconnected`);
          break;
        }
      }
    });
  });
};
