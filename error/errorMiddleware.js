const { GeneralError } = require('./errors')

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof GeneralError) {
    return res.status(err.getCode()).json({
      status: 'error',
      message: err.message
    })
  }

  return res.status(500).json({
    status: 'error',
    message: 'Server Error'
  })
}


module.exports = errorMiddleware