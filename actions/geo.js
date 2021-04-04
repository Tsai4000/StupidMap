const handleError = require('../error/errorHandle')
const GeoModel = require('../model/geo')

exports.updateGeo = (res, username, lat, lng) => {
  GeoModel.updateOne({ username }, { $set: { lat: lat, lng: lng, update: Date.now() } }, (err, ent) => {
    if (err) return res.status(400).json({ msg: handleError(err) })
    console.log(ent)
    return res.status(200).json({ msg: 'update success' })
  })
}