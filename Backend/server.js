// server.js
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const ceoRoutes = require('./routes/ceoRoutes');
const cors = require('cors');
const http = require('http');  // For creating an HTTP server
const { Chat } = require('./models/Chat'); 
const socketIo = require('socket.io'); // Import socket.io
// Use CORS middleware

const router = express.Router();

dotenv.config();

// Connect to the database
connectDB();

// Initialize the app
const app = express();

const server = http.createServer(app);  // Wrap the app in an HTTP server


const io = require('socket.io')(server, {
  cors: {
    origin: "*",  // Allow client to connect from React (adjust if necessary)
    methods: ["GET", "POST"],
  },
});

app.use(cors());


// Middleware to parse JSON bodies
app.use(express.json());

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/ceo', ceoRoutes);

// WebSocket event handling for real-time updates
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
  
    // Handle message sending
    socket.on('send_message', (messageData) => {
      const { chatId, text, sender } = messageData;
      
      // Optionally, save the message to the database
      // Example: await Chat.create({ chatId, text, sender });
  
      // Emit the message to all connected clients in the same chat
      io.emit('receive_message', { chatId, text, sender });
  
      console.log('Message received:', messageData);
    });
  
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });

// Validate Chat ID endpoint
router.post('/api/chats/validate-chat-id', async (req, res) => {
    const { chatId } = req.body;
  
    try {
      const chat = await Chat.findOne({ chatId });
  
      if (chat) {
        res.status(200).json({ isValid: true });
      } else {
        res.status(404).json({ isValid: false, message: 'Chat ID not found' });
      }
    } catch (error) {
      res.status(500).json({ isValid: false, message: 'Server error' });
    }
  });

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
