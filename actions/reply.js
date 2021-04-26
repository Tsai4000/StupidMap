const ReplyModel = require('../model/reply')
const handleError = require('../error/errorHandle')
const utils = require('../util/util')

exports.deleteReplyPhysically = (reqbody) => {
  ReplyModel.deleteMany({ belong: reqbody.belong }, (err) => {
    if (err) return handleError(err)
  })
}