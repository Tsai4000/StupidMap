const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
  author: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String },
  nowFloor: { type: Number, required: true, default: 1 }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

module.exports = PostSchema