// routes/chatRoutes.js
const express = require('express');
const { sendMessage, getChatHistory, getAllChats, validateChatId } = require('../controllers/chatController');

const router = express.Router();

// Route to send a message to CEO
router.post('/send-message', async (req, res) => {
    try {
        const { chatId, text, sender } = req.body;
        await sendMessage(chatId, text, sender);
        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route to get chat history by chatId
router.get('/get-chat-history/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const messages = await getChatHistory(chatId);
        res.status(200).json({ messages });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route to get all chats
router.get('/get-all-chats', async (req, res) => {
    try {
        const chats = await getAllChats();
        res.status(200).json({ chats });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route to validate chatId
router.post('/validate-chat-id', async (req, res) => {
    try {
        const { chatId } = req.body;
        const { exists, chatId: returnedChatId } = await validateChatId(chatId);

        if (exists) {
            res.status(200).json({ isValid: true, chatId: returnedChatId });
        } else {
            res.status(404).json({ isValid: false, message: 'Chat ID not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error validating chatId' });
    }
});

module.exports = router;
