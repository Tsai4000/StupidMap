
exports.onConnection = (socket) => {
  console.log('Socket.io init success', socket.id)
}

exports.onDisconnection = (socket) => {
  console.log('Disconnected')
}

exports.onTest = (socket) => {
  console.log('test')
}

