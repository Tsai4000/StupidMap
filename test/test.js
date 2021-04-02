const supertest = require('supertest')
const api = supertest('http://localhost:5000')
const expect = require('expect.js')
const UserAction = require('../actions/user')
let authToken

const testUser = {
  username: 'testUser',
  password: 'testpassword',
}

describe('test user API', () => {


  it('POST create_user should response 200 with msg ok', (done) => {
    api.post('/api/create_user')
      .set('Accept', 'application/json')
      .send({ email: 'testEmail@gmail.com', ...testUser })
      .expect(200)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('msg')
        expect(res.body.msg).to.equal('ok')
      })
  })
  it('POST create_user should response 400 with request not correct', (done) => {
    api.post('/api/create_user')
      .set('Accept', 'application/json')
      .send(testUser)
      .expect(400)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('msg')
        expect(res.body.msg).to.equal('request not correct')
      })
  })
  it('POST create_user should response 405 with user exist', (done) => {
    api.post('/api/create_user')
      .set('Accept', 'application/json')
      .send({ email: 'testEmail@gmail.com', ...testUser })
      .expect(405)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('msg')
        expect(res.body.msg).to.equal('user exist')
      })
  })
  it('POST login should response 200 with token', (done) => {
    api.post('/api/login')
      .set('Accept', 'application/json')
      .send(testUser)
      .expect(200)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('token')
        authToken = res.body.token
      })
  })
  it('POST login should response 401 with login failed', (done) => {
    api.post('/api/login')
      .set('Accept', 'application/json')
      .send({ username: 'testUser', password: 'wrongpw' })
      .expect(401)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('msg')
        expect(res.body.msg).to.equal('login failed')
      })
  })
  it('POST logout should response 200 with msg ok', (done) => {
    api.post('/api/logout')
      .set('Accept', 'application/json')
      .set('Authorization', authToken)
      .send()
      .expect(200)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('msg')
        expect(res.body.msg).to.equal('ok')
      })
  })
  it('POST logout should response 401 with msg unauthorized', (done) => {
    api.post('/api/logout')
      .set('Accept', 'application/json')
      .set('Authorization', 'Bearer WrOnGToKeN')
      .send()
      .expect(401)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('msg')
        expect(res.body.msg).to.equal('unauthorized')
      })
  })
  after(() => {
    UserAction.deleteUserPhysically({ email: 'testEmail@gmail.com', ...testUser })
  })

})
