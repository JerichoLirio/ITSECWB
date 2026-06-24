const mongoose = require('mongoose');

// Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'technician', 'admin'], required: true },
  profilePicture: { type: String }, // File path, reconsider if we should implement customized profile pictures
  description: { type: String },
  rememberMeUntil: { type: Date },  // Specs said that this expires in three weeks until loggin in again                 
  createdAt: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('User', userSchema);