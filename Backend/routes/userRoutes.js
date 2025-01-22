// routes/userRoutes.js
const express = require('express');
const { sendOtp, validateOtp, registerUser } = require('../controllers/userController');
const User = require('../models/User'); 

const router = express.Router();

// Route to send OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { contactInfo } = req.body;

        // Check if email or phone number already exists in the database
        const existingUser = await User.findOne({ contactInfo });
        if (existingUser) {
            return res.status(400).json({ error: 'Email or Phone Number already exists' });
        }

        // Proceed with OTP generation and sending process if email is not registered
        const { chatId } = await sendOtp(contactInfo);
        res.status(200).json({ message: 'OTP sent successfully', chatId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route to validate OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { contactInfo, otp } = req.body;
        await validateOtp(contactInfo, otp);
        res.status(200).json({ message: 'OTP validated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route to register the user
router.post('/register', async (req, res) => {
    try {
        const { contactInfo, name, username } = req.body;
        await registerUser(contactInfo, name, username);
        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}); 

module.exports = router;
