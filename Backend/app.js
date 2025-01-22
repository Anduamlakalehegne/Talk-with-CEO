const express = require('express');
const http = require('http');
const socketIo = require('socket.io'); // Import socket.io
const dotenv = require('dotenv');
const { getChatHistory, sendMessage } = require('./controllers/chatController');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { User } = require('./models/User'); // Assuming User model for chat data
const cors = require('cors');

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server for socket.io

// Socket.io setup with CORS configuration to allow connections from the frontend
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173', // Allow frontend (localhost:5173) to connect
    methods: ['GET', 'POST'], // Allow only GET and POST methods
    allowedHeaders: ['Content-Type'], // Allow Content-Type header
    credentials: true, // Allow cookies or credentials
  }
});

// Middleware to parse JSON
app.use(express.json());

// Enable CORS for HTTP requests
app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend to make HTTP requests
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true, // Allow cookies or credentials
}));

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

// WebSocket communication setup
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle user joining a specific chat room (chatId)
  socket.on('joinChat', (chatId) => {
    socket.join(chatId); // Join the chat room
    console.log(`User joined chat room: ${chatId}`);
  });

  // Handle incoming messages
  socket.on('sendMessage', async (messageData) => {
    const { chatId, text, sender } = messageData;

    try {
      // Save the message to the database
      await sendMessage(chatId, text, sender);

      // Emit the new message to all clients in this chat room
      io.to(chatId).emit('newMessage', messageData);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
