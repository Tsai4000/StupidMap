const MessageSchema = require('./schema/message')
const db = require('../DBConnection')
const MessageModel = db.model('message', MessageSchema)

module.exports = MessageModel
