const User = require('../models/User');  // Now using User model instead of Chat model

const getAllChats = async () => {
    try {
        // Retrieve all chats from the database
        const chats = await User.find(); 
        return chats; 
    } catch (error) { 
        throw new Error('Error fetching chats: ' + error.message); 
    }
};

// Get chat history by chatId
const getChatHistory = async (chatId) => {
    // Find the user by chatId
    const user = await User.findOne({ chatId });
    if (!user) {
        throw new Error('Chat not found');
    }

    return user.messages;  // Return the chat history (messages array)
};

// Send message (either from user or CEO)
const sendMessage = async (chatId, text, sender) => {
    // sender should be either 'user' or 'ceo'
    if (sender !== 'user' && sender !== 'ceo') {
        throw new Error('Invalid sender');
    }

    // Find the user by chatId
    let user = await User.findOne({ chatId });
    if (!user) {
        throw new Error('Chat not found');
    }

    // If the sender is the user and it's the first message, set status to 'new'
    if (sender === 'user' && user.messages.length === 0) {
        user.status = 'new'; // Set the initial status to 'new' for a new conversation
    }

    // If the sender is the CEO and the status is 'new', change status to 'pending'
    if (sender === 'ceo' && user.status === 'new') {
        user.status = 'pending';  // Change status to 'pending' when CEO sends the first message
    }

    // Add the new message to the chat history
    user.messages.push({
        sender,  // The sender can be 'user' or 'ceo'
        text,
        timestamp: new Date(),
    });

    await user.save();

    // If the sender is the CEO and they are closing the chat, set status to 'completed'
    if (sender === 'ceo') {
        // Optionally, you can add logic here to determine when to close the chat
        // For example, when the CEO sends a specific message like "Closing the case"
        if (text.toLowerCase().includes("closing the case") && user.messages.length > 5) {
            user.status = 'completed'; // Set status to 'completed' when CEO closes the case
            await user.save();
        }
    }
};

// Validate chatId
const validateChatId = async (chatId) => {
    // Check if the chatId exists in the database
    const user = await User.findOne({ chatId });

    // Return an object with both the existence check and the chatId
    return {
        exists: user !== null,  // true if chatId exists, false otherwise
        chatId: chatId         // return the original chatId
    };
};

module.exports = { getChatHistory, sendMessage, getAllChats, validateChatId };
