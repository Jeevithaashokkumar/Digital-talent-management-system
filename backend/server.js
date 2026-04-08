const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { sendNotificationEmail } = require('./utils/mailer');

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
const queryRoutes = require('./routes/queryRoutes');
const callRoutes = require('./routes/callRoutes');
const prisma = require('./utils/prisma');

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
app.use('/api/queries', queryRoutes);
app.use('/api/calls', callRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const userSocketMap = new Map(); // socket.id -> userId
const callTimeouts = new Map(); // callerId -> timeoutHandler

// Socket.io for Collaborative Whiteboard
io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  socket.on('join-whiteboard', (whiteboardId) => {
    socket.join(whiteboardId);
  });

  socket.on('join-chat', async (userId) => {
    socket.join(userId);
    userSocketMap.set(socket.id, userId);
    console.log(`Operator ${userId} joined Command Channel`);
    
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: true }
      });
      io.emit('user-status-change', { userId, isOnline: true });
    } catch (e) {
      console.error('Status update error:', e);
    }
  });

  socket.on('send-message', async (data) => {
    // data = { senderId, receiverId, content, senderName }
    if (data.receiverId) {
      // Check if receiver is online
      const receiverSockets = Array.from(userSocketMap.entries())
        .filter(([_, id]) => id === data.receiverId)
        .map(([sockId, _]) => sockId);

      const isOnline = receiverSockets.length > 0;

      if (isOnline) {
        // Send to both receiver and sender (to sync multiple tabs)
        io.to(data.receiverId).to(data.senderId).emit('receive-message', data);
        console.log(`Notification: Real-time message delivered to ${data.receiverId}`);
      } else {
        // Receiver is offline -> Send Email Alert
        try {
          const receiver = await prisma.user.findUnique({ where: { id: data.receiverId } });
          if (receiver && receiver.email) {
            const subject = `New Message from ${data.senderName || 'someone'}`;
            const content = `
              <p>You have a new message waiting for you in DTMS Command Center.</p>
              <p><strong>From:</strong> ${data.senderName || 'DTMS User'}</p>
              <p><strong>Message:</strong> "${data.content}"</p>
              <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px;">View Message</a></p>
            `;
            await sendNotificationEmail(receiver.email, subject, content);
            
            // Store notification record
            await prisma.notification.create({
              data: {
                userId: data.receiverId,
                type: 'message',
                email: receiver.email,
                subject,
                body: content
              }
            });
            console.log(`Notification: Email alert sent to offline user ${data.receiverId}`);
          }
        } catch (e) {
          console.error('Offline notification error:', e);
        }
        // Still emit to sender so their UI updates
        io.to(data.senderId).emit('receive-message', data);
      }
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

  socket.on('call-user', async (data) => {
    // data = { to, signal, from, name, type }
    console.log(`Call Event: ${data.from} (${data.name}) -> ${data.to} [${data.type}]`);
    io.to(data.to).emit('incoming-call', { 
      signal: data.signal, 
      from: data.from, 
      name: data.name, 
      type: data.type 
    });

    // Send immediate email notification for the incoming call
    try {
      const receiver = await prisma.user.findUnique({ where: { id: data.to } });
      if (receiver && receiver.email) {
        const subject = `URGENT: Incoming ${data.type || 'voice'} call from ${data.name}`;
        const body = `
          <div style="text-align: center; padding: 20px;">
            <h2 style="color: #6366f1;">Incoming Call Detected</h2>
            <p style="font-size: 18px;"><strong>${data.name}</strong> is attempting to establish a <strong>${data.type || 'voice'}</strong> connection with you.</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background-color: #6366f1; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Respond to Signal</a>
            </div>
          </div>
        `;
        await sendNotificationEmail(receiver.email, subject, body);
        console.log(`Notification: Real-time call alert sent to ${receiver.email}`);
      }
    } catch (e) {
      console.error('Call initiation email error:', e);
    }

    // Set timeout for missed call (30 seconds)
    const timeoutId = setTimeout(async () => {
      console.log(`Call Time-out: ${data.from} -> ${data.to} (Missed Call)`);
      try {
        const receiver = await prisma.user.findUnique({ where: { id: data.to } });
        if (receiver && receiver.email) {
          const subject = `Missed ${data.type || 'voice'} call from ${data.name}`;
          const body = `<p>You missed a <strong>${data.type || 'voice'}</strong> call from <strong>${data.name}</strong>.</p><p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">Call them back</a></p>`;
          
          await sendNotificationEmail(receiver.email, subject, body);
          await prisma.callLog.create({
            data: {
              callerId: data.from,
              receiverId: data.to,
              type: data.type || 'voice',
              status: 'missed'
            }
          });
          await prisma.notification.create({
            data: {
              userId: data.to,
              type: 'call',
              email: receiver.email,
              subject,
              body
            }
          });
        }
        io.to(data.to).emit('call-missed');
        io.to(data.from).emit('call-missed');
      } catch (e) {
        console.error('Missed call log error:', e);
      }
      callTimeouts.delete(data.from);
    }, 30000);

    callTimeouts.set(data.from, timeoutId);
  });

  socket.on('answer-call', async (data) => {
    // data = { to, signal, from, type }
    console.log(`Call Answered: ${data.from} -> ${data.to}`);
    
    // Clear missed call timeout
    const timeout = callTimeouts.get(data.to);
    if (timeout) {
      clearTimeout(timeout);
      callTimeouts.delete(data.to);
    }

    // When call is answered, we log it as 'connected'
    try {
      if (data.to && data.from) {
        await prisma.callLog.create({
          data: {
            callerId: data.to, 
            receiverId: data.from,
            type: data.type || 'voice',
            status: 'connected'
          }
        });
      }
    } catch (e) { console.error('Call log error:', e); }

    io.to(data.to).emit('call-accepted', data.signal);
  });

  socket.on('reject-call', async (data) => {
    // data = { to, from, type }
    
    // Clear missed call timeout
    const timeout = callTimeouts.get(data.to);
    if (timeout) {
      clearTimeout(timeout);
      callTimeouts.delete(data.to);
    }

    try {
      if (data.to && data.from) {
        await prisma.callLog.create({
          data: {
            callerId: data.to,
            receiverId: data.from,
            type: data.type || 'voice',
            status: 'rejected'
          }
        });
      }
    } catch (e) { console.error('Call log error:', e); }

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

  socket.on('disconnect', async () => {
    console.log('User disconnected from socket:', socket.id);
    const userId = userSocketMap.get(socket.id);
    if (userId) {
      userSocketMap.delete(socket.id);
      // Multi-tab check: only set offline if no other sockets for this user exist
      const stillOnline = Array.from(userSocketMap.values()).includes(userId);
      if (!stillOnline) {
        try {
          const lastSeen = new Date();
          await prisma.user.update({
            where: { id: userId },
            data: { isOnline: false, lastSeen }
          });
          io.emit('user-status-change', { userId, isOnline: false, lastSeen });
        } catch (e) {
          console.error('Disconnect status error:', e);
        }
      }
    }
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
