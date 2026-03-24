const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes will be imported here
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const boardRoutes = require('./routes/boards');
const listRoutes = require('./routes/lists');
const folderRoutes = require('./routes/folders');
const docRoutes = require('./routes/docs');
const whiteboardRoutes = require('./routes/whiteboards');
const captchaRoutes = require('./routes/captcha').router;
const fileRoutes = require('./routes/files');
const nodeRoutes = require('./routes/nodes');
const graphRoutes = require('./routes/graphs');
const knowledgeRoutes = require('./routes/knowledge');
const missionRoutes = require('./routes/missions');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');
const messageRoutes = require('./routes/messages');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/docs', docRoutes);
app.use('/api/whiteboards', whiteboardRoutes);
app.use('/api/captcha', captchaRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/graphs', graphRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/messages', messageRoutes);

const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.io for Collaborative Whiteboard
io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  socket.on('join-whiteboard', (whiteboardId) => {
    socket.join(whiteboardId);
  });

  socket.on('join-chat', (userId) => {
    socket.join(userId);
    console.log(`Operator ${userId} joined Command Channel`);
  });

  socket.on('send-message', (data) => {
    // data = { senderId, receiverId, content, senderName }
    if (data.receiverId) {
      // Send to both receiver and sender (to sync multiple tabs)
      io.to(data.receiverId).to(data.senderId).emit('receive-message', data);
    } else {
      // Team Chat: Send to everyone
      io.emit('receive-message', data);
    }
  });

  socket.on('edit-message', (data) => {
    if (data.receiverId) {
      io.to(data.receiverId).to(data.senderId).emit('message-edited', data);
    } else {
      io.emit('message-edited', data);
    }
  });

  socket.on('delete-message', (data) => {
    if (data.receiverId) {
      io.to(data.receiverId).to(data.senderId).emit('message-deleted', data.id);
    } else {
      io.emit('message-deleted', data.id);
    }
  });

  socket.on('pin-message', (data) => {
    if (data.receiverId) {
      io.to(data.receiverId).to(data.senderId).emit('message-pinned', data);
    } else {
      io.emit('message-pinned', data);
    }
  });

  socket.on('react-message', (data) => {
    if (data.receiverId) {
      io.to(data.receiverId).to(data.senderId).emit('message-reacted', data);
    } else {
      io.emit('message-reacted', data);
    }
  });

  socket.on('call-user', (data) => {
    // data = { to, signal, from, name, type }
    io.to(data.to).emit('incoming-call', { 
      signal: data.signal, 
      from: data.from, 
      name: data.name, 
      type: data.type 
    });
  });

  socket.on('answer-call', (data) => {
    // data = { to, signal }
    io.to(data.to).emit('call-accepted', data.signal);
  });

  socket.on('reject-call', (data) => {
    // data = { to }
    io.to(data.to).emit('call-rejected');
  });

  socket.on('end-call', (data) => {
    // data = { to }
    io.to(data.to).emit('call-ended');
  });

  socket.on('ice-candidate', (data) => {
    // data = { to, candidate }
    io.to(data.to).emit('ice-candidate', data.candidate);
  });

  socket.on('canvas-update', (data) => {
    socket.to(data.whiteboardId).emit('remote-canvas-update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from socket');
  });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

server.listen(PORT, () => {
  console.log(`Server with Socket.io is running on port ${PORT}`);
});
