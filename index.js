const express = require('express')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')

const UserModel = require('./model/user')
const GeoModel = require('./model/geo')
const GeoRecordModel = require('./model/geoRecord')
const GeoAction = require('./actions/geo')

const handleError = require('./error/errorHandle')
const utils = require('./util/util')

const app = express()

const port = 5000
require('dotenv').config()

app.use(bodyParser.json())
app.use(express.urlencoded())
app.set('secret', process.env.SECRET)


app.post('/api/create_user', (req, res) => {
  UserModel.find({ username: req.body.username, email: req.body.email })
    .then(async data => {
      if (data.length !== 0) {
        console.log('user exist')
        return res.status(409).json({ msg: 'user exist' })
      } else {
        const userBody = await utils.handleUserPassword(req.body)
        UserModel.create(userBody, (err, ent) => {
          if (err) return res.status(401).json({ msg: handleError(err) })
          return res.status(200).json({ msg: 'ok' })
        })
      }
    }).catch(err => {
      console.log(err)
      return res.status(500).json({ msg: 'Server Error' })
    })
})

app.post('/api/login', (req, res) => {
  UserModel.find({ username: req.body.username })
    .then(data => {
      if (data.length === 0) {
        console.log('login failed')
        return res.status(401).json({ msg: 'login failed' })
      } else {
        if (utils.passwordHash(req.body.password, data[0].salt) === data[0].password) {
          return res.status(200).json({
            msg: 'Login success',
            token: jwt.sign(data[0].toJSON(), app.get('secret'))
          })
        } else {
          console.log('login failed')
          return res.status(401).json({ msg: 'login failed' })
        }
      }
    }).catch(err => {
      console.log(err)
      return res.status(500).json({ msg: 'Server Error' })
    })
})

const appAuth = express.Router()

appAuth.use(function (req, res, next) {
  console.log('check auth')
  const token = req.body.token || req.query.token || (req.headers['authorization'] && req.headers['authorization'].replace('Bearer ', ''))
  if (token) {
    jwt.verify(token, app.get('secret'), (err, decoded) => {
      if (err) {
        return res.json({ msg: 'Failed to authenticate token.' })
      } else {
        req.decoded = decoded
        next()
      }
    })
  } else {
    return res.status(401).json({ msg: 'Unauthorized' })
  }
})

// appAuth.post('/api/logout', (req, res) => {
//   UserModel.find(utils.handleUserPassword(req.body))
//     .then(data => {
//       if (data.length === 0) {
//         console.log('login failed')
//         return res.status(401).json({ msg: 'logout failed' })
//       } else {
//         return res.status(200).json({msg: 'Logout success'})
//       }
//     }).catch(err => {
//       console.log(err)
//       return res.status(500).json({ msg: 'Server Error' })
//     })
// })

appAuth.post('/api/geo', (req, res) => {
  console.log('POST geo')
  GeoModel.findOne({ username: req.decoded.username }, (err, data) => {
    if (err || (!req.body.lat || !req.body.lng)) return res.status(400).json({ msg: 'Bad Request' })
    else if (!data) {
      const geoBody = {
        username: req.decoded.username,
        update: Date.now(),
        ...req.body
      }
      GeoModel.create(geoBody, (err, ent) => {
        if (err) return res.status(400).json({ msg: handleError(err) })
        return res.status(200).json({ msg: "Confirm location" })
      })
    } else {
      GeoAction.updateGeo(res, data.username, req.body.lat, req.body.lng)
    }
  }).catch(err => {
    console.log(err)
    return res.status(500).json({ msg: 'Server Error' })
  })
})

appAuth.put('/api/geo', (req, res) => {
  console.log('PUT geo')
  GeoModel.aggregate([
    { $match: { username: req.decoded.username } },
    { $project: { _id: false, __v: false } }])
    .then(data => {
      if (!data) return res.status(400).json({ msg: 'Bad Request' })
      GeoRecordModel.create(data[0])
        .then(() => {
          GeoAction.updateGeo(res, data[0].username, req.body.lat, req.body.lng)
        })
    }).catch(err => {
      return res.status(500).json({ msg: 'Server Error' })
    })
})

app.use('', appAuth)

app.listen(port, () => {
  console.log("info", 'Server is running at port : ' + port);
});