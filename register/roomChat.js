const MessageModel = require('../model/message')
module.exports = (io, socket) => {
  console.log(`${socket.id} room chat`)
  const onMessageInRoom = (data) => {
    MessageModel.create({
      message: data,
      from: socket.id,
      room: socket.geoRoom
    })
    socket.broadcast.in(socket.geoRoom).emit('message', { msg: data, room: socket.geoRoom, from: socket.id })
  }
  const onMessageForAll = (data) => {
    MessageModel.create({
      message: data,
      from: socket.id,
      room: "all"
    })
    socket.broadcast.emit('message', { msg: data, from: socket.id })
  }
  socket.on('roomMessage', onMessageInRoom)
  socket.on('allMessage', onMessageForAll)
}