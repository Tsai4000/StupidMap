const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  salt: { type: String },
  role: { type: String, default: 'user' },
  deleted: { type: String, default: false }
})
module.exports = UserSchema