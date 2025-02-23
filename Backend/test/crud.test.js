const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app'); // Adjust the path to your Express app
const expect = chai.expect;

chai.use(chaiHttp);

// Generate unique test data for each run
const uniquePhone = `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
const uniqueEmail = `testuser_${Date.now()}@example.com`;

const testUser = {
  fullname: { firstname: "Test", lastname: "User" },
  phonenumber: uniquePhone,
  email: uniqueEmail,
  password: "Password@123"
};

let authToken;
let userId;

describe('User CRUD Operations', function () {

  // ------------------
  // CREATE OPERATIONS (4 tests)
  // ------------------
  describe('Create Operations', function () {
    it('should register a new user successfully', function (done) {
      chai.request(server)
        .post('/users/register')
        .send(testUser)
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('token');
          expect(res.body).to.have.property('user');
          userId = res.body.user._id;
          done();
        });
    });

    it('should fail registration when required fields are missing', function (done) {
      chai.request(server)
        .post('/users/register')
        .send({
          fullname: { firstname: "Incomplete", lastname: "" },
          phonenumber: uniquePhone, // you can reuse or generate a new one
          email: "incomplete@example.com",
          password: "Password@123"
        })
        .end(function (err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should fail registration with an existing email/phone', function (done) {
      // Attempt to register with the same testUser data
      chai.request(server)
        .post('/users/register')
        .send(testUser)
        .end(function (err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should fail registration with invalid email format', function (done) {
      chai.request(server)
        .post('/users/register')
        .send({
          fullname: { firstname: "Invalid", lastname: "Email" },
          phonenumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          email: "invalid-email",
          password: "Password@123"
        })
        .end(function (err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  // ------------------
  // READ OPERATIONS (4 tests)
  // ------------------
  describe('Read Operations', function () {
    // Login before running the read tests
    before(function (done) {
      chai.request(server)
        .post('/users/login')
        .send({
          phonenumber: testUser.phonenumber,
          password: testUser.password
        })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          authToken = res.body.token;
          done();
        });
    });

    it('should fetch user profile with a valid token', function (done) {
      chai.request(server)
        .get('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('_id');
          done();
        });
    });

    it('should not fetch user profile without a token', function (done) {
      chai.request(server)
        .get('/users/profile')
        .end(function (err, res) {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should not fetch user profile with an invalid token', function (done) {
      chai.request(server)
        .get('/users/profile')
        .set('Authorization', 'Bearer invalidtoken')
        .end(function (err, res) {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should return profile with required fields', function (done) {
      chai.request(server)
        .get('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('fullname');
          expect(res.body).to.have.property('phonenumber');
          expect(res.body).to.have.property('email');
          done();
        });
    });
  });

  // ------------------
  // UPDATE OPERATIONS (4 tests)
  // ------------------
  describe('Update Operations', function () {
    it('should update user settings successfully', function (done) {
      chai.request(server)
        .put('/users/update-settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ language: "fr", nightMode: true })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('user');
          done();
        });
    });

    it('should update profile picture successfully', function (done) {
      // Instead of reading from a file, use a Buffer to simulate an image upload.
      chai.request(server)
        .put('/users/update-profile')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('profilePicture', Buffer.from('fake image content'), 'sample.jpg')
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('user');
          done();
        });
    });

    it('should fail update when not authenticated', function (done) {
      chai.request(server)
        .put('/users/update-settings')
        .send({ language: "de" })
        .end(function (err, res) {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should update settings even when provided invalid field values (current behavior)', function (done) {
      // If your API doesn't validate the type, we expect a 200 here.
      chai.request(server)
        .put('/users/update-settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ language: 123 }) // invalid type for language
        .end(function (err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  // ------------------
  // DELETE OPERATIONS (4 tests)
  // ------------------
  describe('Delete Operations', function () {
    it('should not delete account without a token', function (done) {
      chai.request(server)
        .delete('/users/delete')
        .end(function (err, res) {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should not delete account with an invalid token', function (done) {
      chai.request(server)
        .delete('/users/delete')
        .set('Authorization', 'Bearer invalidtoken')
        .end(function (err, res) {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should delete account successfully', function (done) {
      chai.request(server)
        .delete('/users/delete')
        .set('Authorization', `Bearer ${authToken}`)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should not allow login after account deletion', function (done) {
      chai.request(server)
        .post('/users/login')
        .send({
          phonenumber: testUser.phonenumber,
          password: testUser.password
        })
        .end(function (err, res) {
          // Login should now fail after deletion
          expect(res).to.have.status(401);
          done();
        });
    });
  });

});
