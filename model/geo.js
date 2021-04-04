const GeoSchema = require('./schema/geo')
const db = require('../DBConnection')
const GeoModel = db.model('Geo', GeoSchema)

module.exports = GeoModel
