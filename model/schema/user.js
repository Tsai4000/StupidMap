const mongoose = require('mongoose')

exports.UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: 'user' },
  deleted: { type: String, default: false }
})