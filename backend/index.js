import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 🗺️ Track users and their socket IDs
const userSockets = new Map(); // username => socketId

io.on('connection', (socket) => {
  console.log('🟢 New socket connected:', socket.id);

  // Register the username with this socket
  socket.on('register', (username) => {
    userSockets.set(username, socket.id);
    console.log(`✅ Registered ${username} -> ${socket.id}`);
  });

  // Handle private messages
  socket.on('private_message', ({ sender, receiver, text }) => {
    const targetSocketId = userSockets.get(receiver);

    if (targetSocketId) {
      io.to(targetSocketId).emit('private_message', {
        sender,
        receiver,
        text
      });
      console.log(`📩 ${sender} ➡️ ${receiver}: ${text}`);
    } else {
      console.log(`❌ ${receiver} not connected`);
    }
  });

  // Cleanup on disconnect
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

app.get('/', (req, res) => {
  res.send('✅ Socket server running');
});

const PORT = 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
