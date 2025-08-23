const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { sequelize } = require('./models/index');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const hostname = '0.0.0.0'; // Binding to all IP addresses

// Setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
app.use(cors({
  origin:"*",
  methods: ['GET', 'POST', 'PUT'],
}))


const sessions = {}; // { sessionCode: SessionState }

// Body parser for JSON
app.use(express.json());

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/decks', require('./routes/deck'));
app.use('/api/cards', require('./routes/card'));
app.use('/api/users', require('./routes/user'));
app.get('/api/health', (req,res) => {
  res.json({ success: true, message: `Backend is running - ${Date.now()}` });
})

//Serve Card images in this link
app.use('/images', express.static(path.join(__dirname, 'images')));
//Serve public assets
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO Logic
io.on('connection', (socket) => {
  
  console.log('A user connected:', socket.id);

  // Join session
  socket.on('join-session', ({ sessionCode, role, state }) => {
    const roomExists = io.sockets.adapter.rooms.has(sessionCode);

    if (role === 'counselor') {
      // Create a new room and store initial state
      socket.join(sessionCode);
      sessions[sessionCode] = state;
      console.log(sessions,"Sessions");
      console.log(`Counselor (${socket.id}) created room ${sessionCode}`);
      socket.emit('sessionJoined', { success: true, state });
    } else if (role === 'querent') {
      console.log(sessions,"Sessions");
      console.log("sessionCode",sessionCode);
      console.log(roomExists,"roomExists",sessions?.[sessionCode],'sessions[sessionCode]');
      if (roomExists && sessions[sessionCode]) {
        socket.join(sessionCode);
        const state = sessions[sessionCode];
        console.log(`Querent (${socket.id}) joined room ${sessionCode}`);
        socket.emit('sessionJoined', { success: true, state });
        io.to(sessionCode).emit('userJoined', { userId: socket.id });
      } else {
        console.log(`Querent (${socket.id}) failed to join room ${sessionCode}`);
        socket.emit('sessionJoined', { success: false, message: 'Session not found.' });
      }
    }
  });

  // State update from counselor or querent
  socket.on('stateUpdate', ({ sessionCode, newState }) => {
    sessions[sessionCode] = newState;
    socket.to(sessionCode).emit('stateUpdate', newState);
  });

  // Cleanup on disconnect (optional: session timeout handling)
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // optional: handle cleanup or log which rooms the user left
  });
});

// Start
const PORT = process.env.PORT || 80;
server.listen(PORT,hostname,async  () => {
  await sequelize.authenticate();
  console.log(`Server running at http://${hostname}:${PORT}/`);
  console.log('Database connected successfully');
});
