const express = require('express')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')

const UserModel = require('./model/user')
const GeoModel = require('./model/geo')
const GeoRecordModel = require('./model/geoRecord')
const GeoAction = require('./actions/geo')
const errorMiddleware = require('./error/errorMiddleware');
const {
  BadRequest,
  NotFound,
  Conflict,
  Unauthorized } = require('./error/errors');

const handleError = require('./error/errorHandle')
const utils = require('./util/util')

const app = express()

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
    }).catch(err => {
      next(err)
    })
})

app.post('/api/login', (req, res, next) => {
  UserModel.find({ username: req.body.username })
    .then(data => {
      if (data && utils.passwordHash(req.body.password, data[0].salt) === data[0].password) {
        return res.status(200).json({
          msg: 'Login success',
          token: jwt.sign(data[0].toJSON(), app.get('secret'))
        })
      } else {
        next(new Unauthorized('login failed'))
      }
    }).catch(err => {
      next(err)
    })
})

const appAuth = express.Router()

appAuth.use(function (req, res, next) {
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

appAuth.post('/api/geo', async (req, res, next) => {
  console.log('POST geo')
  GeoModel.findOne({ username: req.decoded.username }, (err, data) => {
    if (err) next(new BadRequest('Bad Request'))
    else if (!data) {
      const geoBody = {
        username: req.decoded.username,
        update: Date.now(),
        ...req.body
      }
      GeoModel.create(geoBody)
        .then(() => res.status(200).json({ msg: "Confirm location" }))
        .catch(err => next(new BadRequest(handleError(err))))
    } else {
      GeoAction.updateGeo(res, data.username, req.body).catch(next)
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

app.listen(port, () => {
  console.log("info", 'Server is running at port : ' + port)
})