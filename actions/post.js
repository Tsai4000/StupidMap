const PostModel = require('../model/post')
const handleError = require('../error/errorHandle')
const utils = require('../util/util')

exports.deletePostPhysically = (reqbody) => {
  PostModel.deleteOne({ _id: reqbody._id }, (err) => {
    if (err) return handleError(err)
  })
}