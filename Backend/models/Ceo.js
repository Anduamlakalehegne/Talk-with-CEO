const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CeoSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  resetPasswordToken: String,  // Token for password reset
  resetPasswordExpiry: Date,   // Expiry for the reset password token
  createdAt: { type: Date, default: Date.now },
});

// Password hashing before saving
CeoSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
CeoSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Ceo = mongoose.model('Ceo', CeoSchema);
module.exports = Ceo;
