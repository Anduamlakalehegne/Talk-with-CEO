const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const User = require('../models/User');  // Now using User model for OTP and Chat handling

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // SMTP server host
    port: parseInt(process.env.EMAIL_PORT, 10), // SMTP port (465 for SSL)
    secure: true, // true for 465, false for other ports (587 for TLS)
    auth: {
        user: process.env.EMAIL_USER, // Email username (your email address)
        pass: process.env.EMAIL_PASS, // Email password
    },
    tls: {
        rejectUnauthorized: false, // Allow self-signed certificates if necessary
    },
});

// Function to send OTP to the user's email and create a chat session
const sendOtp = async (contactInfo) => {
    const otp = uuidv4().slice(0, 6);  // Generate 6-digit OTP
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);  // OTP expiry time (10 minutes)

    // Find or create a user with the given contactInfo
    let user = await User.findOne({ contactInfo });
    if (!user) {
        // If user doesn't exist, create a new one with the generated OTP and a new chatId
        user = new User({
            contactInfo,
            otp,
            otpExpiry,
            chatId: uuidv4(),  // Generate a unique chat ID for this user
        });
        await user.save();
    } else {
        // If user exists, update their OTP and expiry time
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();
    }

    // Send OTP and Chat ID to user via email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: contactInfo,
        subject: 'Your OTP Code and Chat ID',
        text: `Your OTP is: ${otp}`,
        html: `
            <h1>Your OTP Code</h1>
            <p>Use the following code to verify your email:</p>
            <h2 style="color: #4CAF50;">${otp}</h2>
            <p>This code will expire in 10 minutes.</p>
        `,
    };

    await transporter.sendMail(mailOptions);

    // Return the chatId for reference
    return { chatId: user.chatId };
};

// Function to validate OTP entered by the user
const validateOtp = async (contactInfo, otp) => {
    const user = await User.findOne({ contactInfo });
    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
        throw new Error('Invalid or expired OTP');
    }

    // Mark the user as verified
    user.isVerified = true;
    await user.save();

    return { message: 'OTP validated successfully' };
};

// Function to register the user after OTP verification
const registerUser = async (contactInfo, name, username) => {
    const user = await User.findOne({ contactInfo });
    if (!user || !user.isVerified) {
        throw new Error('OTP not verified');
    }

    // Register the user by adding their name and username
    user.name = name;
    user.username = username;
    user.isRegistered = true;  // Mark the user as fully registered

    await user.save();

    return { message: 'User registered successfully' };
};

module.exports = { sendOtp, validateOtp, registerUser };
