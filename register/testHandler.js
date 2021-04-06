module.exports = (io, socket) => {
  console.log('Socket.io init success', socket.id)
  const onTest = (data) => {
    socket.emit('test', { msg: data })
  }
  const onTestBroadcast = (data) => {
    socket.broadcast.emit('test', { msg: data })
  }
  socket.on('test', onTest)
  socket.on('testBroadcast', onTestBroadcast)
}