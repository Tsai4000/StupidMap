const UserModel = require('../model/user')
const handleError = require('../error/errorHandle')

exports.deleteUserPhysically = (reqbody) => {
  UserModel.deleteOne(reqbody, (err) => {
    if (err) return handleError(err)
  })
}