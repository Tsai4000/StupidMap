const UserSchema = require('./schema/user')
const db = require('../DBConnection')
const UserModel = db.model('User', UserSchema)

module.exports = UserModel
