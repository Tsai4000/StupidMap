const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String },
  room: { type: String }
})
module.exports = MessageSchema