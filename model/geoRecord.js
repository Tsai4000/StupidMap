const GeoRecordSchema = require('./schema/geoRecord')
const db = require('../DBConnection')
const GeoRecordModel = db.model('GeoRecord', GeoRecordSchema)

module.exports = GeoRecordModel