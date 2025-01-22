// models/User.js
const mongoose = require('mongoose');

// Update User schema to include OTP verification and Chat history
const UserSchema = new mongoose.Schema({ 
  contactInfo: { type: String, required: true, unique: true },  // Email or phone number
  name: { type: String },
  username: { type: String },
  isVerified: { type: Boolean, default: false },  // OTP verification status
  isRegistered: { type: Boolean, default: false },  // Registration status
  otp: { type: String },  // OTP code
  otpExpiry: { type: Date },  // OTP expiry time
  chatId: { type: String, unique: true },  // Chat ID
  messages: [  // Chat history
    {
      sender: { type: String, enum: ['user', 'ceo'], required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  status: { 
    type: String, 
    enum: ['new', 'pending', 'completed'], 
    default: 'new',  // Default status for new chats
  },
  createdAt: { type: Date, default: Date.now },  // Date of account creation
});

const User = mongoose.model('Users', UserSchema);
module.exports = User;
