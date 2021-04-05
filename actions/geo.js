const handleError = require('../error/errorHandle')
const GeoModel = require('../model/geo')
const { BadRequest } = require('../error/errors')

exports.updateGeo = async (res, username, updateGeoBody) => {
  if (!updateGeoBody.lat || !updateGeoBody.lng) return Promise.reject(new BadRequest('Bad Request'))
  GeoModel.updateOne({ username }, { $set: { ...updateGeoBody, update: Date.now() } }, (err, ent) => {
    if (err || ent.n === 0 || ent.nModified === 0) {
      return Promise.reject(new BadRequest(handleError(err)))
    }
    console.log(ent)
    return res.status(200).json({ msg: 'update success' })
  })
}