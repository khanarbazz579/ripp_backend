const chai = require('chai');
const chaiHttp = require('chai-http');
const passwordResets = require('../../models').password_resets;
const commonFunction = require('../commonFunction');
const server = require('../../app');
const generatedSampleData = require('../sampleData');
const should = chai.should();
let token, user;

chai.use(chaiHttp);

describe('Auth TESTS', () => {
  /*
   * Test the user get route
   */
  afterEach(() => {
    let key;
    for (key in this) {
      delete this[key];
    };
  });

  before((done) => { //Before each test we empty the database
      commonFunction.sequalizedDb(['sales_stage_transitions','leads_clients','user_details','users','user_roles','permission_sets',]).then(() => {
          const role = generatedSampleData.createdSampleData("user_roles", 1);
          const permission = generatedSampleData.createdSampleData("permission_sets", 1);
          let users = generatedSampleData.createdSampleData("users", 1)
          commonFunction.addDataToTable("user_roles", role[0]).then((user_role) => {
            users[0].role_id = user_role.id;
              commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_set) => {
                users[0].permission_set_id = permission_set.id;  
                user = users[0];
                delete user.password;
                done();
              })
          });
      });
  });
  
  

  describe('/POST User', () => {
    it('it should POST a user to create a new user', () => {
      return chai.request(server)
        .post('/api/users')
        .send(user)
        .then((res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.success.should.be.eql(true);
          res.body.message.should.be.eql('Successfully created new user.');
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });


  describe('/PostPassword', () => {
    let passwordResetToken;
    before((done) => {
      passwordResets.findOne({
        where: {
          email: user.email
        }
      }).then((res) => {
        passwordResetToken = res.dataValues.token;
        done();
      }).catch(function (err) {
        return Promise.reject(err);
      })
    });

    it('it should not save password without token', () => {

      return chai.request(server)
        .post('/api/resetPassrword')
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });


    it('it should not save password with invalid token', () => {
      return chai.request(server)
        .post('/api/resetPassword')
        .then((res) => {
          res.should.have.status(200);
          res.body.success.should.be.eql(false);
          res.body.message.should.be.eql('Password reset token is invalid.');
          res.body.should.be.a('object');
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });


    it('save password it should get success message', () => {
      return chai.request(server)
        .post('/api/resetPassword')
        .send({
          fpcode: passwordResetToken,
          new_password: 'test@123',
          confirm_password: 'test@123'
        })
        .then((res) => {
          res.should.have.status(200);
          res.body.success.should.be.eql(true);
          res.body.user.should.be.a('array');
          user["password"] = 'test@123';
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

  });


  describe('/Login User', () => {
    it('it should login user with token and credential', () => {
      return chai.request(server)
        .post('/api/users/login')
        .send(user)
        .then((res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.token.should.be.a('string');
          token = res.body.token;
          res.body.user.should.be.a('object');
          res.body.user.first_name.should.be.eql(user.first_name);
          res.body.user.last_name.should.be.eql(user.last_name);
          res.body.user.email.should.be.eql(user.email);
          res.body.access.should.be.a('object');
          res.body.access.set.should.be.a('object');
          res.body.access.permissions.should.be.a('object');
          res.body.access.role.should.be.a('object');
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });


  describe('/FOGET PASSWORD', () => {

    it('it should not genrate token of user with invaild email address', () => {

      return chai.request(server)
        .post('/api/forgetPassword')
        .send({
          reminder_email: "somthing@saom.com"
        })
        .then((res) => {
          res.should.have.status(422);
          res.body.success.should.be.eql(false);
          res.body.message.should.be.eql('No account with that email address exists.');
          res.body.should.be.a('object');
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    // it('forget Password it should get success message', () => {
    //   return chai.request(server)
    //     .post('/api/forgetPassword')
    //     .send({
    //       reminder_email: "firstname@mailinator.com"
    //     })
    //     .then((res) => {
    //       console.log("===============================================>",res.body);
    //       res.should.have.status(201);
    //       res.body.success.should.be.eql(true);
    //       res.body.user.should.be.a("Object");
    //     }).catch(function (err) {
    //       return Promise.reject(err);
    //     });
    // });
  });
  after((done) => {
    // remove main root folder
    commonFunction.removeFolderFromAws('firstname@mailinator.com').then(() => {
      done();
    })
  })

});