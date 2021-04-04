const bcrypt = require('bcryptjs')

exports.passwordHash = (password, salt) => {
  return bcrypt.hashSync(password, salt)
}

exports.handleUserPassword = async (user) => {
  const salt = await bcrypt.genSalt(10)
  const newUser = {
    username: user.username,
    password: this.passwordHash(user.password, salt),
    email: user.email,
    salt: salt,
  }
  return newUser
}