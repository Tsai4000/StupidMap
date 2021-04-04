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
        done()
      })
  })
  it('POST create_user should response 400 with request not correct', (done) => {
    api.post('/api/create_user')
      .set('Accept', 'application/json')
      .send(testUser)
      .expect(401)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('msg')
        // expect(res.body.msg).to.equal('request not correct')
        done()
      })
  })
  it('POST create_user should response 409 with user exist', (done) => {
    api.post('/api/create_user')
      .set('Accept', 'application/json')
      .send({ email: 'testEmail@gmail.com', ...testUser })
      .expect(409)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('msg')
        expect(res.body.msg).to.equal('user exist')
        done()
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
        done()
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
        // expect(res.body.msg).to.equal('login failed')
        done()
      })
  })
  // it('POST logout should response 200 with msg ok', (done) => {
  //   api.post('/api/logout')
  //     .set('Accept', 'application/json')
  //     .set('Authorization', authToken)
  //     .send()
  //     .expect(200)
  //     .end((err, res) => {
  //       if (err) done(err)
  //       expect(res.body).to.have.key('msg')
  //       expect(res.body.msg).to.equal('ok')
  //     })
  // })
  // it('POST logout should response 401 with msg unauthorized', (done) => {
  //   api.post('/api/logout')
  //     .set('Accept', 'application/json')
  //     .set('Authorization', 'Bearer WrOnGToKeN')
  //     .send()
  //     .expect(401)
  //     .end((err, res) => {
  //       if (err) done(err)
  //       expect(res.body).to.have.key('msg')
  //       expect(res.body.msg).to.equal('unauthorized')
  //     })
  // })
  // after(() => {
  //   UserAction.deleteUserPhysically({ email: 'testEmail@gmail.com', ...testUser })
  // })

})
describe('test geo API', () => {

  it('POST geo should response 200 with Confirm location or update success', (done) => {
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
  it('POST geo should response 401 with Unauthorized', (done) => {
    api.post('/api/geo')
      .set('Accept', 'application/json')
      .send({ lat: 24.96, lng: 121.49 })
      .expect(401)
      .end((err, res) => {
        if (err) done(err)
        expect(res.body).to.have.key('msg')
        expect(res.body.msg).to.equal('Unauthorized')
        done()
      })
  })
  // it('POST geo should response 400 with Bad Request', (done) => {
  //   api.post('/api/geo')
  //     .set('Accept', 'application/json')
  //     .set('Authorization', authToken)
  //     .send({ wrong: 'wrong' })
  //     .expect(400)
  //     .end((err, res) => {
  //       if (err) done(err)
  //       expect(res.body).to.have.key('msg')
  //       // done()
  //     })
  // })
})