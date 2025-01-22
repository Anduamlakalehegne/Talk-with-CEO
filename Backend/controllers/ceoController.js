const Ceo = require('../models/Ceo');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

// Register CEO
const registerCeo = async (req, res) => {
    const { email, username, password } = req.body;

    try {
        // Check if email already exists
        const existingCeo = await Ceo.findOne({ email });
        if (existingCeo) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Create a new CEO
        const newCeo = new Ceo({ email, username, password });
        await newCeo.save();
        res.status(201).json({ message: 'CEO registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Login CEO
const loginCeo = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find CEO by email
        const ceo = await Ceo.findOne({ email });
        if (!ceo) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Compare password
        const isMatch = await ceo.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: ceo._id, email: ceo.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful',
            token,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        // Find CEO by email
        const ceo = await Ceo.findOne({ email });
        if (!ceo) {
            return res.status(400).json({ error: 'Email not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

        ceo.resetPasswordToken = resetToken;
        ceo.resetPasswordExpiry = resetTokenExpiry;
        await ceo.save();

        // Send reset token to CEO's email
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: ceo.email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Please click the link below to reset your password: \n\n ${resetLink}`,
        };

        await transporter.sendMail(mailOptions); 

        res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    try {
        // Find CEO with reset token
        const ceo = await Ceo.findOne({ resetPasswordToken: resetToken, resetPasswordExpiry: { $gt: Date.now() } });
        if (!ceo) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Hash new password and save
        ceo.password = newPassword;
        ceo.resetPasswordToken = undefined;
        ceo.resetPasswordExpiry = undefined;
        await ceo.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { registerCeo, loginCeo, requestPasswordReset, resetPassword };
