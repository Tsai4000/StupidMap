const UserModel = require('../model/user')
const handleError = require('../error/errorHandle')
const utils = require('../util/util')

exports.deleteUserPhysically = (reqbody) => {
  if (reqbody.username && reqbody.password) {
    UserModel.find({ username: reqbody.username })
      .then(data => {
        if (data.length && utils.passwordHash(reqbody.password, data[0].salt) === data[0].password) {
          UserModel.deleteOne(data[0], (err) => {
            if (err) return handleError(err)
          })
        }
      }).catch(console.log)
  }
}