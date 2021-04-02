const UserSchema = require('./schema/user')
const db = require('../DBConnection')
exports.UserModel = db.model('User', UserSchema)
