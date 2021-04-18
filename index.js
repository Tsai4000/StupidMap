const express = require('express')
const fetch = require('node-fetch')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const http = require('http')
const socket = require('socket.io')
const UserModel = require('./model/user')
const GeoModel = require('./model/geo')
const GeoRecordModel = require('./model/geoRecord')
const GeoAction = require('./actions/geo')
const errorMiddleware = require('./error/errorMiddleware')
const {
  BadRequest,
  NotFound,
  Conflict,
  Unauthorized
} = require('./error/errors')
const handleError = require('./error/errorHandle')
const utils = require('./util/util')

const app = express()
const server = http.createServer(app)
const io = socket(server)

const port = 5000
require('dotenv').config()

app.use(bodyParser.json())
app.use(express.urlencoded())
app.set('secret', process.env.SECRET)

app.post('/api/user', (req, res, next) => {
  UserModel.find({ username: req.body.username, email: req.body.email })
    .then(async data => {
      if (data.length !== 0) {
        next(new Conflict('user exist'))
      } else {
        const userBody = await utils.handleUserPassword(req.body)
        UserModel.create(userBody)
          .then(() => res.status(200).json({ msg: 'ok' }))
          .catch(err => next(new BadRequest(handleError(err))))
      }
    }).catch(next)
})

app.post('/api/login', (req, res, next) => {
  UserModel.find({ username: req.body.username })
    .then(data => {
      if (data.length && utils.passwordHash(req.body.password, data[0].salt) === data[0].password) {
        return res.status(200).json({
          msg: 'Login success',
          token: jwt.sign(utils.handleUserBodyNoPW(data[0]), app.get('secret'))
        })
      } else {
        next(new Unauthorized('login failed'))
      }
    }).catch(next)
})


const registerTestHandler = require('./register/testHandler')
const registerRoomChat = require('./register/roomChat')
const registerDirectMessage = require('./register/directMessage')
const joinGeoRoom = (socket) => {
  GeoModel.findOne({ username: socket.decoded.username })
    .then(async data => {
      if (data) {

        socket.geoRoom = 'testRoom'
        socket.join(socket.geoRoom)
        socket.broadcast.in(socket.geoRoom).emit('message', { msg: `${socket.id} join room` })
      }
    })
}

const onConnection = (socket) => {
  joinGeoRoom(socket)
  registerTestHandler(io, socket)
  registerRoomChat(io, socket)
  registerDirectMessage(io, socket)
}

io.use((socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(socket.handshake.query.token, app.get('secret'), (err, decoded) => {
      if (err) return next(new Unauthorized('Authentication error'))
      socket.decoded = decoded
      next()
    })
  } else {
    next(new Error('Authentication error'))
  }
}).on("connection", onConnection)

const appAuth = express.Router()

appAuth.use((req, res, next) => {
  console.log('check auth')
  const token = req.body.token || req.query.token || (req.headers['authorization'] && req.headers['authorization'].replace('Bearer ', ''))
  if (token) {
    jwt.verify(token, app.get('secret'), (err, decoded) => {
      if (err) {
        next(new BadRequest('Failed to authenticate token.'))
      } else {
        req.decoded = decoded
        next()
      }
    })
  } else {
    next(new Unauthorized('Unauthorized'))
  }
})

appAuth.post('/api/geo', (req, res, next) => {
  console.log('POST geo')
  GeoModel.aggregate([
    { $match: { username: req.decoded.username } },
    { $project: { _id: false, __v: false } }])
    .then(async data => {
      if (data.length === 0) {
        const geoResult = await fetch(utils.handleGeoCodeApiPath(req.body.lat, req.body.lng, process.env.GOOGLE_API_KEY)).then(geoCode => geoCode.json())
        const geoBody = {
          username: req.decoded.username,
          update: Date.now(),
          districtRoom: utils.handleGeoCodeLocation(geoResult),
          ...req.body
        }
        GeoModel.create(geoBody)
          .then(() => res.status(200).json({ msg: "Confirm location" }))
          .catch(err => next(new BadRequest(handleError(err))))
      } else {
        GeoRecordModel.create(data[0])
        GeoAction.updateGeo(res, data[0].username, req.body).catch(next)
      }
    }).catch(next)

})

appAuth.put('/api/geo', (req, res, next) => {
  console.log('PUT geo')
  GeoModel.aggregate([
    { $match: { username: req.decoded.username } },
    { $project: { _id: false, __v: false } }])
    .then(data => {
      if (data.length === 0) next(new BadRequest('Bad Request'))
      else {
        GeoRecordModel.create(data[0])
        GeoAction.updateGeo(res, data[0].username, req.body).catch(next)
      }
    }).catch(next)
})


app.use('', appAuth)
app.use(errorMiddleware)

server.listen(port, () => {
  console.log('Server is running at port : ' + port)
})