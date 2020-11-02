// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const User = require('../../models').users;
// const commonFunction = require('../commonFunction');
// const server = require('../../app');
// const CreatedSampleData = require('../sampleData');
// const should = chai.should();
// const modelName = 'users';
// let userUpdate;
// let token;
// let sampleUser = CreatedSampleData.createdSampleData(modelName, 1);
// let user = sampleUser[0];

// chai.use(chaiHttp);

// afterEach(() => {
//   let key;
//   for (key in this) {
//     delete this[key];
//   };
// });

// describe('Users', () => {
//   /*
//    * Test the user get route
//    */
//   describe('/POST User', () => {
//     before((done) => { //Before each test we empty the database
//       commonFunction.sequalizedDb().then(() => {
//         done();
//       });
//     });
//     it('it should not POST a user without email field', () => {
//       let user1 = {
//         first_name: "rajesh",
//         last_name: "tiwari",
//       };
//       return chai.request(server)
//         .post('/api/users')
//         .send(user1)
//         .then((res) => {
//           res.should.have.status(200);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('Please enter an email to register.');
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });
//   });

//   it('it should not POST a user without first_name field', () => {
//     let user1 = {
//       last_name: "tiwari",
//       email: "tiwari@gmail.com"
//     };
//     return chai.request(server)
//       .post('/api/users')
//       .send(user1)
//       .then((res) => {
//         res.should.have.status(200);
//         res.body.should.be.a('object');
//         res.body.success.should.be.eql(false);
//         res.body.message.should.be.eql('Please enter a firstname to register.');
//       }).catch(function (err) {
//         return Promise.reject(err);
//       });
//   });
//   it('it should not POST a user without last_name field', () => {
//     let user1 = {
//       first_name: "tiwari",
//       email: "tiwari@gmail.com"
//     };
//     return chai.request(server)
//       .post('/api/users')
//       .send(user1)
//       .then((res) => {
//         res.should.have.status(200);
//         res.body.should.be.a('object');
//         res.body.success.should.be.eql(false);
//         res.body.message.should.be.eql('Please enter a lastname to register.');
//       }).catch(function (err) {
//         return Promise.reject(err);
//       });
//   });


//   describe('/POST User', () => {
//     it('it should POST a user to create a new user', () => {
//       return chai.request(server)
//         .post('/api/users')
//         .send(user)
//         .then((res) => {
//           res.should.have.status(201);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(true);
//           res.body.message.should.be.eql('Successfully created new user.');
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });
//   });

//   describe('/POST User', () => {
//     it('it should not POST a user to with same email Id', () => {
//       return chai.request(server)
//         .post('/api/users')
//         .send(user)
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('user already exists with that email');
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });
//   });

//   describe('/Login User', () => {
//     it('it should login user with token and credential', () => {
//       return chai.request(server)
//         .post('/api/users/login')
//         .send(user)
//         .then((res) => {
//           res.should.have.status(200);
//           res.body.should.be.a('object');
//           res.body.token.should.be.a('string');
//           token = res.body.token;
//           res.body.user.should.be.a('object');
//           res.body.user.first_name.should.be.eql(user.first_name);
//           res.body.user.last_name.should.be.eql(user.last_name);
//           res.body.user.email.should.be.eql(user.email);
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });
//   });


//   describe('/GetUser Data', () => {

//     it('it should not GET all user data without token', () => {
//       return chai.request(server)
//         .get('/api/users')
//         .then((res) => {
//           res.should.have.status(401);
//           res.body.should.be.a('object');
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should GET all user', () => {
//       return chai.request(server)
//         .get('/api/users')
//         .set({
//           Authorization: token
//         })
//         .then((res) => {
//           res.should.have.status(200);
//           res.body.success.should.be.eql(true);
//           res.body.message.should.be.eql('user recieved successfully');
//           const data = res.body.data;
//           data.should.be.a('array');
//           data[0].first_name.should.be.eql(user.first_name);
//           data[0].last_name.should.be.eql(user.last_name);
//           data[0].email.should.be.eql(user.email);
//           data.length.should.be.eql(1);
//           userUpdate = data[0];
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });
//   });

//   // for single user
//   describe('/GetUser detail', () => {

//     it('it should not GET all user data without token', () => {
//       return chai.request(server)
//         .get('/api/user/detail')
//         .then((res) => {
//           res.should.have.status(401);
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should GET user details', () => {
//       return chai.request(server)
//         .get('/api/user/detail')
//         .set({
//           Authorization: token
//         })
//         .then((res) => {
//           const body = res.body;
//           res.should.have.status(200);
//           body.success.should.be.eql(true);
//           body.message.should.be.eql('user recieved successfully');
//           body.data.should.be.a('object');
//           body.data.should.have.property('id');
//           body.data.should.have.property('first_name');
//           body.data.should.have.property('email');
//           body.data.should.have.property('last_name');
//           body.data.should.have.property('password');
//           body.data.should.have.property('birth_date');
//           body.data.should.have.property('mobile');
//           body.data.should.have.property('landline');
//           body.data.should.have.property('is_deleted');
//           body.data.should.have.property('created_at');
//           body.data.should.have.property('updated_at');
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });
//   });

//   describe('/PUT update User', () => {
//     let newUser;
//     before((done) => { //Before each test we empty the database
//       newUser = CreatedSampleData.createdSampleData('users', 1)[0];
//       newUser['birth_date'] = '18/07/1994';
//       done();
//     });

//     it('it should not update user with wrong user Id', () => {
//       return chai.request(server)
//         .put('/api/users/' + 0)
//         .set({ Authorization: token })
//         .field('first_name', newUser.first_name)
//         .field('last_name', newUser.last_name)
//         .field('email', newUser.email)
//         .field('birth_date', newUser.birth_date)
//         .attach('profile_image', 'test/test-image/Googlelogo.png', 'Googlelogo')
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.success.should.be.eql(false);
//           res.body.should.have.property('message');
//           res.body.should.be.a('object');
//           res.body.message.should.be.eql("user does not exist");
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should not update user password with wrong user password', () => {
//       newUser["current_password"] = "somthingwrong";
//       return chai.request(server)
//         .put('/api/users/' + userUpdate.id)
//         .set({ Authorization: token })
//         .field('first_name', newUser.first_name)
//         .field('last_name', newUser.last_name)
//         .field('email', newUser.email)
//         .field('birth_date', newUser.birth_date)
//         .field('password', newUser.password)
//         .field('current_password', newUser.current_password)
//         .attach('profile_image', 'test/test-image/Googlelogo.png', 'Googlelogo')
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.success.should.be.eql(false);
//           res.body.should.have.property('message');
//           res.body.should.be.a('object');
//           res.body.message.should.be.eql("Password is not valid");
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });


//     it('it should update user with user Id and currect password', () => {
//       newUser["current_password"] = user.password;
//       return chai.request(server)
//         .put('/api/users/' + userUpdate.id)
//         .set({ Authorization: token })
//         .field('first_name', newUser.first_name)
//         .field('last_name', newUser.last_name)
//         .field('email', newUser.email)
//         .field('birth_date', newUser.birth_date)
//         .field('current_password', newUser.current_password)
//         .attach('profile_image', 'test/test-image/Googlelogo.png', 'Googlelogo')
//         .send(newUser)
//         .then((res) => {
//           res.should.have.status(200);
//           res.body.success.should.be.eql(true);
//           res.body.should.have.property('message');
//           res.body.should.be.a('object');
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });


//     // it('it should update users profile picture with user Id and currect password', () => {
//     //   return chai.request(server)
//     //     .put('/api/users/' + userUpdate.id)
//     //     .set({
//     //       Authorization: token,
//     //       ContentType: 'multipart/form-data; boundary=----WebKitFormBoundarykhalb3NQbKBwFHX'
//     //     })
//     //     .send(newUser)
//     //     .then((res) => {
//     //       res.should.have.status(200);
//     //       res.body.success.should.be.eql(true);
//     //       res.body.should.have.property('message');
//     //       res.body.should.be.a('object');
//     //     }).catch(function (err) {
//     //       return Promise.reject(err);
//     //     });
//     // });


//   });


//   // describe('/DELETE  remove User', () => {

//   //   it('it should delete user with token and credential', () => {
//   //     return chai.request(server)
//   //       .delete('/api/users/' + userUpdate.id)
//   //       .set({
//   //         Authorization: token
//   //       })
//   //       .send()
//   //       .then((res) => {

//   //         res.should.have.status(200);
//   //         res.body.should.be.a('object');
//   //       }).catch(function (err) {
//   //         return Promise.reject(err);
//   //       });
//   //   });
//   // });

//   after((done) => {
//     // remove main root folder
//     commonFunction.removeFolderFromAws(user.email).then(() => {
//       done();
//     })
//   })
// });
