const mongoose = require('mongoose')

const GeoSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  update: { type: Number, required: true }
})

module.exports = GeoSchema