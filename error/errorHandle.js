const mongoose = require('mongoose')

const handleError = (err) => {
  var errmsg = ""
  for (var errName in err.errors) {
    switch (err.errors[errName].type) {
      case mongoose.Error.ValidationError.REQUIRED:
        errmsg = `Field ${errName} is required`
        break
      case mongoose.Error.ValidationError.NOTVALID:
        errmsg = `Field ${errName} is not valid`
        break
    }
  }
  return errmsg
}

module.exports = handleError