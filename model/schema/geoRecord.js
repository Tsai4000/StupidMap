const mongoose = require('mongoose')

const GeoRecordSchema = new mongoose.Schema({
  username: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  update: { type: Number, required: true }
})

module.exports = GeoRecordSchema