import jwt from 'jsonwebtoken';

const userSockets = new Map(); // username => socketId

export const registerSocketHandlers = (io) => {
  //Middleware to verify token during socket handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Missing auth token"));
    }

    try {
      const payload = jwt.verify(token, 'your_secret_key'); // replace with process.env.JWT_SECRET in prod
      socket.username = payload.username; // attach to socket for later use
      next();
    } catch (err) {
      console.error("❌ Invalid token:", err.message);
      return next(new Error("Authentication failed"));
    }
  });

  io.on('connection', (socket) => {
    const username = socket.username;
    userSockets.set(username, socket.id);
    console.log(`🟢 ${username} connected with socket ID: ${socket.id}`);

    socket.on('private_message', ({ sender, receiver, text }) => {
      const targetSocketId = userSockets.get(receiver);

      if (targetSocketId) {
        io.to(targetSocketId).emit('private_message', {
          sender,
          receiver,
          text
        });
        console.log(`${sender} => ${receiver}: ${text}`);
      } else {
        console.log(`${receiver} not connected`);
      }

      // Echo back to sender
      socket.emit('private_message', {
        sender,
        receiver,
        text
      });
    });

    socket.on('disconnect', () => {
      for (const [user, id] of userSockets.entries()) {
        if (id === socket.id) {
          userSockets.delete(user);
          console.log(`${user} disconnected`);
          break;
        }
      }
    });
  });
};
