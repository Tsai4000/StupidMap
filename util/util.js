const bcrypt = require('bcryptjs')
const { BadRequest } = require('../error/errors')

exports.passwordHash = (password, salt) => {
  return bcrypt.hashSync(password, salt)
}

exports.handleUserPassword = async (user) => {
  const salt = await bcrypt.genSalt(10)
  const newUser = {
    username: user.username,
    password: this.passwordHash(user.password, salt),
    email: user.email,
    salt: salt,
  }
  return newUser
}

exports.handleUserBodyNoPW = (userBody) => {
  const newUser = userBody.toObject()
  Object.keys(newUser).map((key) => {
    if (!(key === 'username' || key === 'email' || key === '_id')) delete newUser[key]
  })
  return newUser
}

exports.handleGeoCodeApiPath = (lat, lng, apiKey) => {
  return `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=zh-TW&key=${apiKey}`
}

exports.handleGeoCodeLocation = (geoCodeBody) => {
  if (geoCodeBody.results.length !== 0 && geoCodeBody.results[0].address_components) {
    const district = geoCodeBody.results[0].address_components.find(comp => {
      return comp.types.includes("administrative_area_level_3")
    })
    return district.long_name
  }
  return new BadRequest('no location')
}