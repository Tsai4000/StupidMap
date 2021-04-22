const PostSchema = require('./schema/post')
const db = require('../DBConnection')
const PostModel = db.model('Post', PostSchema)

module.exports = PostModel
