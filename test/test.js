const supertest = require('supertest')
const api = supertest('http://localhost:5000')
const expect = require('expect.js')
const UserAction = require('../actions/user')
const GeoAction = require('../actions/geo')
let authToken

const testUser = {
  username: 'testUser',
  password: 'testpassword',
}

describe('test user API', () => {
  it('POST user should response 200 with msg ok', done => {
    api.post('/api/user')
      .set('Accept', 'application/json')
      .send({ email: 'testEmail@gmail.com', ...testUser })
      .expect(200)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('msg')
        expect(res.body.msg).to.equal('ok')
        done()
      })
  })
  it('POST user should response 400 with BadRequest', done => {
    api.post('/api/user')
      .set('Accept', 'application/json')
      .send(testUser)
      .expect(400)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('status')
        expect(res.body.status).to.equal('error')
        expect(res.body).to.have.key('message')
        expect(res.body.message).to.equal('Field email is required')
        done()
      })
  })
  it('POST user should response 409 with user exist', done => {
    api.post('/api/user')
      .set('Accept', 'application/json')
      .send({ email: 'testEmail@gmail.com', ...testUser })
      .expect(409)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('status')
        expect(res.body.status).to.equal('error')
        expect(res.body).to.have.key('message')
        expect(res.body.message).to.equal('user exist')
        done()
      })
  })
  it('POST login should response 200 with token', done => {
    api.post('/api/login')
      .set('Accept', 'application/json')
      .send(testUser)
      .expect(200)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('token')
        authToken = res.body.token
        done()
      })
  })
  it('POST login should response 401 with login failed', done => {
    api.post('/api/login')
      .set('Accept', 'application/json')
      .send({ username: 'testUser', password: 'wrongpw' })
      .expect(401)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('status')
        expect(res.body.status).to.equal('error')
        expect(res.body).to.have.key('message')
        expect(res.body.message).to.equal('login failed')
        done()
      })
  })
})

describe('test geo API', () => {
  it('POST geo should response 400 with Bad Request', done => {
    api.post('/api/geo')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send({ wrong: 'wrong' })
      .expect(400)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('status')
        expect(res.body.status).to.equal('error')
        expect(res.body).to.have.key('message')
        expect(res.body.message).to.equal('Field lat is required')
        done()
      })
  })
  it('PUT geo should response 400 with Bad Request', done => {
    api.put('/api/geo')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send({ wrong: 'wrong' })
      .expect(400)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('status')
        expect(res.body.status).to.equal('error')
        expect(res.body).to.have.key('message')
        expect(res.body.message).to.equal('Bad Request')
        done()
      })
  })
  it('POST geo should response 200 with Confirm location or update success', done => {
    api.post('/api/geo')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send({ lat: 24.96, lng: 121.49 })
      .expect(200)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('msg')
        // expect(res.body.msg).to.equal('Confirm location')
        done()
      })
  })
  it('POST geo should response 401 with Unauthorized', done => {
    api.post('/api/geo')
      .set('Accept', 'application/json')
      .send({ lat: 24.96, lng: 121.49 })
      .expect(401)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('status')
        expect(res.body.status).to.equal('error')
        expect(res.body).to.have.key('message')
        expect(res.body.message).to.equal('Unauthorized')
        done()
      })
  })
  it('PUT geo should response 200 with Confirm location or update success', done => {
    api.put('/api/geo')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send({ lat: 24.96, lng: 121.49 })
      .expect(200)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('msg')
        // expect(res.body.msg).to.equal('Confirm location')
        done()
      })
  })
})

const testPost = {
  title: 'testTitle',
  content: 'testContent',
  category: 'testCatetory',
}

let postID

describe('Test post and reply api', () => {
  it('POST post api should return 200', (done) => {
    api.post('/api/post')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send(testPost)
      .expect(200)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('msg')
        expect(res.body.msg).to.equal('Post created')
        done()
      })
  })
  it('POST post api should return 400 without title', (done) => {
    api.post('/api/post')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send({ wrong: 'wrong' })
      .expect(400)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('status')
        expect(res.body.status).to.equal('error')
        expect(res.body).to.have.key('message')
        expect(res.body.message).to.equal('Field title is required')
        done()
      })
  })
  it('GET posts api should return 200', (done) => {
    const amount = 10
    const sortby = 'created_at'
    api.get(`/api/posts?sort=${sortby}&amount=${amount}`)
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send()
      .expect(200)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('posts')
        expect(res.body.posts.length).to.not.greaterThan(amount)
        expect(res.body.posts[0]).to.have.keys(['_id', 'author', 'title'])
        postID = res.body.posts[0]._id
        done()
      })
  })
  it('GET posts api should return 200', (done) => {
    const amount = 10
    const sortby = 'created_at'
    api.get(`/api/posts?sort=${sortby}&amount=${amount}`)
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send()
      .expect(200)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('posts')
        expect(res.body.posts.length).to.not.greaterThan(amount)
        expect(res.body.posts[0]).to.have.keys(['_id', 'author', 'title'])
        postID = res.body.posts[0]._id
        done()
      })
  })
  it('GET post api should return 200', (done) => {
    api.get(`/api/post/${postID}`)
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send()
      .expect(200)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.keys(['originalPost', 'replies'])
        expect(res.body.replies).to.not.greaterThan(10)
        expect(res.body.originalPost).to.have.keys(['_id', 'author', 'title', 'category'])
        done()
      })
  })

  it('POST reply api should return 200', (done) => {
    api.post('/api/reply')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send({ belong: postID, content: 'testReplyContent' })
      .expect(200)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('msg')
        expect(res.body.msg).to.equal('Reply created')
        done()
      })
  })
  it('POST reply api should return 400 without title', (done) => {
    api.post('/api/reply')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send({ wrong: 'wrong' })
      .expect(400)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('status')
        expect(res.body.status).to.equal('error')
        expect(res.body).to.have.key('message')
        expect(res.body.message).to.equal('Bad Request')
        done()
      })
  })

})

const io = require('socket.io-client')
describe('Test socket server', () => {
  let client
  let client2
  beforeEach(async () => {
    client = io('http://localhost:5000', {
      query: { token: authToken }
    })
    client2 = io('http://localhost:5000', {
      query: { token: authToken }
    })
  })

  afterEach(() => {
    client.close()
    client2.close()
  })
  // it('connection', done => {
  //   const client = io('http://localhost:5000')
  //   client.on('connect', () => {
  //     client.close()
  //     done()
  //   })
  // })
  // it('disconnection', done => {
  //   const client = io('http://localhost:5000')
  //   client.on('connect', () => {
  //     client.close()
  //   })
  //   client.on('disconnect', () => {
  //     done()
  //   })
  // })
  it('test client emit', done => {
    const testmsg = Math.random().toString()
    client.on('test', (data) => {
      expect(data).to.have.key('msg')
      expect(data.msg).to.equal(testmsg)
      done()
    })
    client.emit('test', testmsg)
  })
  it('test serverside emit', done => {
    const testmsg = Math.random().toString()
    client.on('test', (data) => {
      expect(data).to.have.key('msg')
      expect(data.msg).to.equal(testmsg)
      done()
    })
    client2.on('test', (data) => {
      const err = 'should not recieve msg'
      done(err)
    })
    client2.emit('testBroadcast', testmsg)
  })
  it('test join room', done => {
    setTimeout(() => {
      io('http://localhost:5000', {
        query: { token: authToken }
      })
    }, 200)//client3 join room
    client2.on('message', (data) => {
      console.log(data.msg)
      expect(data).to.have.key('msg')
      done()
    })
  })
  it('test room message', done => {
    const testMsg = 'test'
    setTimeout(() => {
      client.emit('roomMessage', testMsg)
    }, 200)
    client2.on('message', (data) => {
      console.log(data)
      expect(data).to.have.key('msg')
      expect(data.msg).to.equal(testMsg)
      expect(data).to.have.key('room')
      expect(data.room).to.equal('testRoom')
      expect(data).to.have.key('from')
      expect(data.from).to.equal(client.id)
      done()
    })
  })
  it('test all message', done => {
    const testMsg = 'test'
    setTimeout(() => {
      client.emit('roomMessage', testMsg)
    }, 200)
    client2.on('message', (data) => {
      console.log(data)
      expect(data).to.have.key('msg')
      expect(data.msg).to.equal(testMsg)
      expect(data).to.have.key('from')
      expect(data.from).to.equal(client.id)
      done()
    })
  })
  it('test direct message', done => {
    const testMsg = 'test'
    setTimeout(() => {
      client.emit('directMessage', { targetId: client2.id, message: testMsg })
    }, 200)
    client2.on('message', (data) => {
      console.log(data)
      expect(data).to.have.key('msg')
      expect(data.msg).to.equal(testMsg)
      expect(data).to.have.key('from')
      expect(data.from).to.equal(client.id)
      done()
    })
  })
  // it('test emit error', done => {
  //   const testmsg = Math.random().toString()
  //   // const clientErr = io('http://localhost:5000', {
  //   //   query: { token: 'wrong' }
  //   // })
  //   client.on('error', (data) => {
  //     expect(data).to.have.key('msg')
  //     expect(data.msg).to.equal('test')
  //     done()
  //   })
  //   client.emit('test', testmsg)
  // })
})

describe('Delete test data', () => {
  before(() => {
    GeoAction.deleteGeoPhysically({ username: 'testUser' })
    UserAction.deleteUserPhysically(testUser)
  })
  it('Deleted', (done) => {
    // search test data should fail
    done()
  })
})