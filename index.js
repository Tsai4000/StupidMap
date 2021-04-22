const express = require('express')
const fetch = require('node-fetch')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const http = require('http')
const socket = require('socket.io')
const UserModel = require('./model/user')
const GeoModel = require('./model/geo')
const GeoRecordModel = require('./model/geoRecord')
const PostdModel = require('./model/geoRecord')
const ReplyModel = require('./model/geoRecord')
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
const PostModel = require('./model/post')
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

appAuth.post('/api/post', (req, res, next) => {
  console.log('POST a post')
  PostdModel.create({ author: req.deocded.username, ...req.body })
    .then(() => res.status(200).json({ msg: "Post createdt" }))
    .catch(err => next(new BadRequest(handleError(err))))
})

appAuth.post('/api/reply', async (req, res, next) => {
  try {
    console.log('POST a reply')
    const { nowFloor } = await PostModel.findByIdAndUpdate(req.body.belong, { $inc: { nowFloor: 1 } })
    ReplyModel.create({ author: req.deocded.username, floor: nowFloor + 1, ...req.body })
      .then(() => res.status(200).json({ msg: "Reply created" }))
      .catch(err => next(new BadRequest(handleError(err))))
  } catch (err) { next(err) }
})

appAuth.get('/api/posts', (req, res, next) => {
  console.log(`GET ${req.query.amount} posts, sort by ${req.query.sort}`)
  const sortKey = req.query.sort === "created_at" ? { "created_at": 1 } : { "updated_at": 1 }
  PostModel.aggregate([
    { $sort: sortKey },
    { $project: { _id: 1, author: 1, name: 1 } },
    { $limit: req.query.amount || 10 }])
    .then((data) => res.status(200).json({ posts: data }))
    .catch(err => next(new BadRequest(handleError(err))))
})

appAuth.get('/api/post/:id', (req, res, next) => {
  console.log(`GET a post`)
  ReplyModel.aggregate([
    { $match: { belong: req.parameter.id } },
    { $sort: { floor: 1 } },
    { $project: { _id: 0, belong: 0 } },
    { $limit: 10 }])
    .then(replies => {
      PostModel.findOne({ _id: req.parameter.id })
        .then(op => res.status(200).json({ originalPost: op, replies }))
        .catch(err => next(new BadRequest(handleError(err))))
    })
    .catch(err => next(new BadRequest(handleError(err))))

})

app.use('', appAuth)
app.use(errorMiddleware)

server.listen(port, () => {
  console.log('Server is running at port : ' + port)
})