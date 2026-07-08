const app = require('./src/app');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const config = require('./src/config/config');
const socketService = require('./src/services/socketService');

const allowedOrigins = config.cors.allowedOrigins;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

socketService.setIO(io);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    socket.user = { id: decoded.id };
    return next();
  } catch (error) {
    console.warn('Socket auth failed:', error.message);
    return next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  if (socket.user?.id) {
    const roomName = `user_${socket.user.id}`;
    socket.join(roomName);
    console.log(`📢 Socket ${socket.id} joined user room: ${roomName}`);
  }

  socket.on('join_chat', (data) => {
    const { room } = data;
    socket.join(room);
    console.log(`📢 Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('send_message', (data) => {
    const { room, message, sender } = data;
    io.to(room).emit('receive_message', { message, sender, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

const PORT = config.port || 5000;
server.listen(PORT, () => {
  console.log(`🚀 CTGPRO Server running on port ${PORT}`);
});