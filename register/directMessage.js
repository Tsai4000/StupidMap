const MessageModel = require('../model/message')
module.exports = (io, socket) => {
  console.log(`${socket.id} direct message`)
  const onDirectMessage = (data) => {
    MessageModel.create({
      message: data.message,
      from: socket.id,
      to: data.targetId,
      time: Date.now()
    })
    io.to(data.targetId).emit('message', { msg: data.message, from: socket.id })
  }
  socket.on('directMessage', onDirectMessage)
}