// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const PasswordResets = require('../../models').password_resets;
// const commonFunction = require('../commonFunction');
// const server = require('../../app');
// const generatedSampleData = require('../sampleData');
// const should = chai.should();
// let token, shared_user, sharedWithUser, uploadedFile, loggedInUser;

// chai.use(chaiHttp);

// describe('Shared User Auth Test', () => {
  
//   afterEach(() => {
//     let key;
//     for (key in this) {
//       delete this[key];
//     };
//   });

//   before((done) => { 
//       commonFunction.sequalizedDb(['password_resets', 'share_files_folders', 'share_guest_users', 'users', 'files_folders', 'files_folders_accesses', 'file_properties', 'share_files_folders', 'user_roles', 'permission_sets']).then(() => {
//             role = generatedSampleData.createdSampleData("user_roles", 1);
//             permission = generatedSampleData.createdSampleData("permission_sets", 1);
//             user = generatedSampleData.createdSampleData("users", 2)
//             commonFunction.addDataToTable("user_roles", role[0]).then((role_data) => {
//                 user[0].role_id = role_data.id;
//                 user[1].role_id = role_data.id;
//                 commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_data) => {
//                   user[0].permission_set_id = permission_data.id;
//                   user[1].permission_set_id = permission_data.id;
//                   commonFunction.addDataToTable("users", user[0]).then((data) => {
//                     commonFunction.addDataToTable("share_guest_users", { 
//                       email : "gourav.pwd@cisinlabs.com", 
//                       url_token: "asdfasfsa123n3n42", 
//                       first_name: "Gourav",
//                       last_name: "S",
//                       is_confirm: 0,
//                       password: "123456"
//                     }).then((shared_guest) => {
//                       sharedWithUser = shared_guest;
//                       done();
//                     });
//                   });
//                 })
//             });
//         });
//   });

//   it('it should be login user with token and credential', () => {
//       return chai.request(server)
//           .post('/api/users/login')
//           .send(user[0])
//           .then((res) => {
//               res.should.have.status(200);
//               res.body.should.be.a('object');
//               res.body.token.should.be.a('string');
//               token = res.body.token;
//               loggedInUser = res.body.user;
//               res.body.user.should.be.a('object');
//               res.body.user.first_name.should.be.eql(user[0].first_name);
//               res.body.user.last_name.should.be.eql(user[0].last_name);
//               res.body.user.email.should.be.eql(user[0].email);
//           })
//           .catch(function (err) {
//               return Promise.reject(err);
//           });
//   });

//   describe('Upload files', () => {
//         before((done) => {
//             commonFunction.addDataToTable('files_folders', {
//                 original_name: user[0].email,
//                 created_by: loggedInUser.id,
//                 entity_type: 'FOLDER',
//                 is_guest: 1
//             }).then((file_folder_data) => {
//                 commonFunction.addDataToTable('files_folders_accesses', {
//                     name: user[0].email,
//                     file_folder_id: file_folder_data.id,
//                     user_id: loggedInUser.id,
//                     permission: 'EDIT',
//                     entity_type: 'FOLDER',
//                     parent_id: null,
//                     file_property_id: null,
//                     refrence_id: null,
//                     master_name: user[0].email,
//                     count: 0,
//                     is_guest: 1
//                 }).then((data_file_folder_access) => {
//                     rootData = data_file_folder_access;
//                     done();
//                 });
//             });
//         });

//         it('a file', function () {
//             return chai
//                 .request(server)
//                 .post('/api/files/upload')
//                 .set({ Authorization: token })
//                 .field('selectedFolder', rootData.name)
//                 .field('selectedFolderId', rootData.id)
//                 .field('fileWithExtention', 'Googlelogo.png')
//                 .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
//                 .then((res) => {
//                     uploadedFile = res.body;
//                     uploadedFile.should.be.a('object');
//                     uploadedFile.success.should.be.eql(true);
//                     uploadedFile.message.should.be.eql('File uploaded successfully!');
//                 }).catch(function (err) {
//                     return Promise.reject(err);
//                 });
//         });
//     });

//   describe('REGISTER Shared Guest User', () => {
//     shared_user = {};

//     before((done) => { 
//       commonFunction.addDataToTable("share_files_folders", {
//         file_folder_id: uploadedFile.data.file_folder_id,
//         file_folder_access_id: uploadedFile.data.id,
//         user_id: sharedWithUser.id,
//         created_by: loggedInUser.id,
//         permission: 'VIEW',
//         status: 'SHARED',
//         user_type: 'SHARE_GUEST'
//       }).then((shared_file_folder_access) => {
//         done();
//       })
//     });

//     it('it should not POST guest user without firstname', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/register')
//         .send(shared_user)
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('First name not entered.');
//           shared_user = {
//             first_name: "Gourav"
//           };
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should not POST guest user without lastname', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/register')
//         .send(shared_user)
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('Last name not entered.');
//           shared_user['last_name'] = "s";
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should not POST guest user without email', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/register')
//         .send(shared_user)
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('Email not entered.');
//           shared_user['email'] = "gourav.pwd@cisinlabs.com";
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should not POST guest user without password', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/register')
//         .send(shared_user)
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('Password not entered.');
//           shared_user['password'] = "12345";
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should not POST guest user without password less than 6', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/register')
//         .send(shared_user)
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('Password should be upto 6 characters.');
//           shared_user['password'] = "123456";
//           shared_user['email'] = "gouravpwd";
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should not POST guest user without invalid email', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/register')
//         .send(shared_user)
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('A valid email address was not entered.');
//           shared_user['email'] = "gourav.pwd@cisinlabs.com";
//           sharedWithUser['password'] = "123456";
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should POST guest user', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/register')
//         .send(sharedWithUser)
//         .then((res) => {
//           res.should.have.status(200);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(true);
//           res.body.message.should.be.eql('Registered successfully!');
//           shared_user = {};
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });
//   });

//   describe('LOGIN Shared Guest User', () => {

//     it('it should not login without user name', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/login')
//         .send(shared_user)
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('Email not entered.');
//           shared_user['email'] = "gourav.pwd@cisinlabs.com";
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should not login without password', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/login')
//         .send(shared_user)
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('Password not entered.');
//           shared_user['password'] = "12345";
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should not login without password less than 6', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/login')
//         .send(shared_user)
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('Password should be upto 6 characters.');
//           shared_user['password'] = "1234567";
//           shared_user['email'] = "gouravpwd";
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should not login without invalid email', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/login')
//         .send(shared_user)
//         .then((res) => {
//           res.should.have.status(422);  
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('A valid email address was not entered.');
//           shared_user['email'] = "gourav.pwd@cisinlabs.com";
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should not login without user confirmation', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/login')
//         .send(shared_user)
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('Invalid password');
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should UPDATE share guest user', () => {
//       return chai.request(server)
//         .put('/api/sharedLink/update/abc')
//         .send({ is_confirm : 1})
//         .then((res) => {
//           res.should.have.status(401);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('It should have requested user id.');
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should UPDATE share guest user', () => {
//       return chai.request(server)
//         .put('/api/sharedLink/update/'+sharedWithUser.id)
//         .send({ is_confirm : 1})
//         .then((res) => {
//           res.should.have.status(200);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(true);
//           res.body.user.id.should.be.eql(sharedWithUser.id);
//           res.body.user.first_name.should.be.eql(sharedWithUser.first_name);
//           res.body.user.last_name.should.be.eql(sharedWithUser.last_name);
//           res.body.user.is_confirm.should.be.eql(1);
//           res.body.message.should.be.eql('Share user updated successfully.');
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should not login without invalid user credentials', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/login')
//         .send(shared_user)
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('Invalid password');
//           shared_user['password'] = "123456";
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should login user with token and credential', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/login')
//         .send(sharedWithUser)
//         .then((res) => {
//           res.should.have.status(200);
//           res.body.should.be.a('object');
//           res.body.token.should.be.a('string');
//           token = res.body.token;
//           res.body.user.should.be.a('object');
//           res.body.user.first_name.should.be.eql(sharedWithUser.first_name);
//           res.body.user.last_name.should.be.eql(sharedWithUser.last_name);
//           res.body.user.email.should.be.eql(sharedWithUser.email);
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });
//   });
  
//   describe('FORGOT PASSWORD of Shared Guest User', () => {

//     it('it should not genrate token of guest user with invaild email address', () => {

//       return chai.request(server)
//         .post('/api/sharedLink/forgotPassword')
//         .send({
//           reminder_email: "somthing@saom.com"
//         })
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('No account with that email address exists.');
//           res.body.should.be.a('object');
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should genrate token of guest user with valid email address', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/forgotPassword')
//         .send({
//           reminder_email: "gourav.pwd@cisinlabs.com"
//         })
//         .then((res) => {
//           res.body.success.should.be.eql(true);
//           res.body.user.should.be.a("Object");
//           res.body.message.should.be.eql("Reset link sent to your email!");
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//   });

//   describe('RESET PASSWORD of Shared Guest User', () => {
//     let passwordResetToken;
//     before((done) => {
//       PasswordResets.findOne({
//         where: {
//           email: "gourav.pwd@cisinlabs.com"
//         }
//       }).then((res) => {
//         passwordResetToken = res.dataValues.token;
//         done();
//       }).catch(function (err) {
//         return Promise.reject(err);
//       })
//     });

//     it('it should not reset password with invalid token', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/resetPassword')
//         .send({
//           fpcode: "ABCDE",
//           new_password: 'test@123',
//           confirm_password: 'test@123'
//         })
//         .then((res) => {
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('Password reset token is invalid.');
//           res.body.should.be.a('object');
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });


//     it('it should reset password and get success message', () => {
//       return chai.request(server)
//         .post('/api/sharedLink/resetPassword')
//         .send({
//           fpcode: passwordResetToken,
//           new_password: 'test@123',
//           confirm_password: 'test@123'
//         })
//         .then((res) => {
//           res.should.have.status(200);
//           res.body.success.should.be.eql(true);
//           res.body.user.should.be.a('array');
//           user["password"] = 'test@123';
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//   });

//   describe('VERIFY TOKEN of Shared Guest User', () => {

//     it('it should not verify the empty token with empty type', () => {
//       return chai.request(server)
//         .get('/api/sharedLink/verify/sharingToken')
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('Invalid token type.');
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should not verify the empty token with type', () => {
//       return chai.request(server)
//         .get('/api/sharedLink/verify/sharingToken?type=url')
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('Either token is expired or is invalid.');
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should not verify the invalid token with type', () => {
//       return chai.request(server)
//         .get('/api/sharedLink/verify/sharingToken?token=123&type=url')
//         .then((res) => {
//           res.should.have.status(422);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(false);
//           res.body.message.should.be.eql('Either token is expired or is invalid.');
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it('it should verify the token and give user', () => {
//       return chai.request(server)
//         .get('/api/sharedLink/verify/sharingToken?token=asdfasfsa123n3n42&type=url')
//         .then((res) => {
//           res.should.have.status(200);
//           res.body.should.be.a('object');
//           res.body.success.should.be.eql(true);
//           res.body.message.should.be.eql('Token is valid');
//           res.body.user.email.should.be.eql('gourav.pwd@cisinlabs.com');
//         }).catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//   });

//   after((done) => {
//     commonFunction.sequalizedDb(['password_resets', 'share_files_folders', 'share_guest_users', 'users', 'files_folders', 'files_folders_accesses', 'file_properties', 'share_files_folders', 'user_roles', 'permission_sets']).then(() => {
//       done();
//     })
//   });
// });