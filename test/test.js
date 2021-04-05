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


  it('POST user should response 200 with msg ok', (done) => {
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
  it('POST user should response 400 with BadRequest', (done) => {
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
  it('POST user should response 409 with user exist', (done) => {
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
        expect(res.body).to.have.key('status')
        expect(res.body.status).to.equal('error')
        expect(res.body).to.have.key('message')
        expect(res.body.message).to.equal('login failed')
        done()
      })
  })
  // after(() => {
  //   UserAction.deleteUserPhysically({ email: 'testEmail@gmail.com', ...testUser })
  // })

})
describe('test geo API', () => {
  it('POST geo should response 400 with Bad Request', (done) => {
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
  it('PUT geo should response 400 with Bad Request', (done) => {
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
        expect(res.body).to.have.key('status')
        expect(res.body.status).to.equal('error')
        expect(res.body).to.have.key('message')
        expect(res.body.message).to.equal('Unauthorized')
        done()
      })
  })
  it('PUT geo should response 200 with Confirm location or update success', (done) => {
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