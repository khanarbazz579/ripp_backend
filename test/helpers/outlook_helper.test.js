// 'use strict';
// const chai = require('chai');
// const authHelper = require('../../helpers/authHelper');
// const { credentials, authForData } = require('../../config/outlookmailapp');
// const commonFunction = require('../commonFunction');
// const expect = chai.expect;
// let auth;
//
// describe('outlookHelper', () => {
//     afterEach(() => {
//         let key;
//         for (key in this) {
//             delete this[key];
//         };
//     });
//
//     describe("Setting outlook helper", () => {
//
//         it("In Outlook Helper - Create intance of outlook helper without credentials ", () => {
//             auth = new authHelper();
//             expect(auth).be.a('object');
//             expect(auth.terror).to.a('string');
//             expect(auth.terror).to.eql('credentials is required');
//         })
//
//         it("In Outlook Helper - Create intance of outlook helper without authForData ", () => {
//             auth = new authHelper(credentials);
//             expect(auth).be.a('object');
//             expect(auth.terror).to.a('string');
//             expect(auth.terror).to.eql('authForData is required');
//         })
//
//         it("In Outlook Helper - Create intance of outlook helper with credentials,authForData ", () => {
//             auth = new authHelper(credentials, authForData);
//             expect(auth).be.a('object');
//             expect(auth.terror).to.a('undefined');
//             expect(auth.credentials).to.eql(credentials);
//             expect(auth.authForData).to.eql(authForData);
//         })
//     });
//
//     describe("Outlook Helper Methods", () => {
//         auth = new authHelper(credentials, authForData);
//         it("In Outlook Helper - Create get getAuthUrl", () => {
//             let authUrl = auth.getAuthUrl();
//             expect(authUrl).to.a('string');
//         })
//
//         it("In Outlook Helper - Create get getTokenFromCode without auth code", async() => {
//             let authToken = await auth.getTokenFromCode();
//             expect(auth.terror).to.a('string');
//             expect(authToken).to.a('string');
//             expect(authToken).to.eql('auth code is required');
//         })
//
//         it("In Outlook Helper - Create get getTokenFromCode with auth code", async() => {
//             let authToken = await auth.getTokenFromCode('ss', 1);
//             expect(authToken.message).to.a('string');
//             expect(authToken.message).to.eql('Response Error: 400 Bad Request');
//         })
//
//         it("In Outlook Helper - Create get getAccessToken without email_user parameter", async() => {
//             let authToken = await auth.getAccessToken();
//             expect(authToken).to.a('string');
//             expect(authToken).to.eql('User name required');
//         })
//
//         it("In Outlook Helper - Create get getAccessToken with invalid email_user parameter", async() => {
//             let authToken = await auth.getAccessToken('test');
//             expect(authToken).to.a('boolean');
//             expect(authToken).to.eql(false);
//         })
//
//         it("In Outlook Helper - Create get saveVauesToDb without token parameter", async() => {
//             let authToken = await auth.saveVauesToDb();
//             expect(authToken).to.a('string');
//             expect(authToken).to.eql('token is required');
//         })
//
//         it("In Outlook Helper - Create get saveVauesToDb with token parameter", async() => {
//             let token = {
//                 token: {
//                     id_token: 'test',
//                     access_token: "",
//                     refresh_token: ""
//                 }
//             };
//             let authToken = await auth.saveVauesToDb(token);
//             expect(authToken).to.a('boolean');
//             expect(authToken).to.eql(false);
//         })
//
//         it("In Outlook Helper - Create get saveVauesToDb with token and invalid res parameter", async() => {
//             let token = {
//                     token: {
//                         id_token: 'test',
//                         access_token: "",
//                         refresh_token: ""
//                     }
//                 },
//                 res = "test";
//             let authToken = await auth.saveVauesToDb(token, res);
//             expect(authToken).to.a('string');
//             expect(authToken).to.eql('invalid value for res');
//         })
//
//         it("In Outlook Helper - Create get saveVauesToDb with token and res parameter", async() => {
//             let token = {
//                     token: {
//                         id_token: 'test',
//                         access_token: "",
//                         refresh_token: ""
//                     }
//                 },
//                 res = true;
//             let authToken = await auth.saveVauesToDb(token, res);
//             expect(authToken).to.a('boolean');
//             expect(authToken).to.eql(true);
//         })
//
//         it("In Outlook Helper - Create get saveVauesToDb with token and res parameter", async() => {
//             let token = {
//                 token: {
//                     id_token: 'test',
//                     access_token: "",
//                     refresh_token: ""
//                 }
//             }
//             let res = true;
//             let authToken = await auth.saveVauesToDb(token, res);
//             expect(authToken).to.a('boolean');
//             expect(authToken).to.eql(true);
//         })
//
//         // it("In Outlook Helper - Create clearToken with without emailUserName parameter", async() => {
//         //     let authToken = await auth.clearToken();
//         //     expect(authToken).to.a('string');
//         //     expect(authToken).to.eql('emailUserName is required');
//         // })
//
//         // it("In Outlook Helper - Create clearToken with with emailUserName parameter", async() => {
//         //     let authToken = await auth.clearToken(`test@test.com`);
//         //     expect(authToken).to.a('boolean');
//         //     expect(authToken).to.eql(true);
//         // })
//
//         it("In Outlook Helper - Create createTokenRequest with with userName parameter", async() => {
//             let authToken = await auth.createTokenRequest();
//             expect(authToken).to.a('string');
//             expect(authToken).to.eql('userName is required');
//         })
//
//         it("In Outlook Helper - Create createTokenRequest with with userName parameter", async() => {
//             let authToken = await auth.createTokenRequest(`test@test.com`);
//             expect(authToken).to.a('boolean');
//         })
//
//         it("In Outlook Helper - Create refresh tokens", async() => {
//             let authToken = await auth.refresh();
//             expect(authToken).to.a('boolean');
//         })
//
//     })
// });
