const ReplySchema = require('./schema/reply')
const db = require('../DBConnection')
const ReplyModel = db.model('Reply', ReplySchema)

module.exports = ReplyModel
