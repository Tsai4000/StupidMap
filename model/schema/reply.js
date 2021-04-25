const mongoose = require('mongoose')

const ReplySchema = new mongoose.Schema({
  belong: { type: mongoose.ObjectId, required: true },
  floor: { type: Number, required: true },
  author: { type: String, required: true },
  content: { type: String, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

module.exports = ReplySchema