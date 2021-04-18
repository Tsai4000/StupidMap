const fetch = require('node-fetch')
const handleError = require('../error/errorHandle')
const GeoModel = require('../model/geo')
const { BadRequest } = require('../error/errors')
const utils = require('../util/util')

exports.updateGeo = async (res, username, updateGeoBody) => {
  if (!updateGeoBody.lat || !updateGeoBody.lng) return Promise.reject(new BadRequest('Bad Request'))
  const geoResult = await fetch(utils.handleGeoCodeApiPath(updateGeoBody.lat, updateGeoBody.lng, process.env.GOOGLE_API_KEY)).then(data => data.json())
  const geoBody = {
    update: Date.now(),
    districtRoom: utils.handleGeoCodeLocation(geoResult),
    ...updateGeoBody
  }
  GeoModel.updateOne({ username }, { $set: geoBody }, (err, ent) => {
    if (err || ent.n === 0 || ent.nModified === 0) {
      return Promise.reject(new BadRequest(handleError(err)))
    }
    console.log(ent)
    return res.status(200).json({ msg: 'update success' })
  })
}

exports.deleteGeoPhysically = (reqbody) => {
  GeoModel.deleteOne(reqbody, (err) => {
    if (err) return handleError(err)
  })
}