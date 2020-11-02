// 'use strict';
// const chai = require('chai');
// const googleAppAuth = require('../../helpers/googleAuthHelper');
// const commonFunction = require('../commonFunction');
// const expect = chai.expect;
// let auth;
// describe('googleHelper', () => {
//     afterEach(() => {
//         let key;
//         for (key in this) {
//             delete this[key];
//         };
//     });
//
//     describe("Setting google helper", () => {
//         it("In Google Helper - Create intance of google helper ", () => {
//             auth = new googleAppAuth();
//             expect(auth).be.a('object');
//             expect(auth.googleTokenData).to.a('object');
//         })
//     });
//
//     describe("Google Helper's methods", () => {
//         auth = new googleAppAuth();
//         it("In Google Helper - get getAccessUrl google helper ", () => {
//             let url = auth.getAccessUrl();
//             expect(url.then).be.a('function');
//             expect(url.catch).be.a('function');
//         })
//
//         // it("In Google Helper - call authorize without paramere", async() => {
//         //     let isAuth = await auth.authorize();
//         //     expect(isAuth).be.a('string');
//         //     expect(isAuth).be.eql('Code is required');
//         // })
//
//         // it("In Google Helper - call authorize with code but without callback paramere", async() => {
//         //     let isAuth = await auth.authorize('test');
//         //     expect(isAuth).be.a('string');
//         //     expect(isAuth).be.eql('Callback should be function');
//         // })
//
//         it("In Google Helper - call authorize with code,callback paramere", async() => {
//             auth.authorize('test', (err, token) => {
//                 expect(err).be.a('object');
//                 expect(err.data).be.a('object');
//                 expect(err.error).be.a('string');
//                 expect(err.error).be.eql('invalid_grant');
//             });
//         })
//
//         it("In Google Helper - call createTokenRequest without userName parameter", async() => {
//             let isSave = await auth.createTokenRequest();
//             expect(isSave).be.a('string');
//             expect(isSave).be.eql('userName is required');
//         })
//
//         it("In Google Helper - call createTokenRequest with userName parameter", async() => {
//             let isSave = await auth.createTokenRequest("test@test.com");
//             expect(isSave).be.a('boolean');
//         })
//
//         // it("In Google Helper - call saveVauesToDb without user parameter", async() => {
//         //     let isSave = await auth.saveVauesToDb(undefined);
//         //     expect(isSave).be.a('string');
//         //     expect(isSave).be.eql('user is required');
//         // })
//
//         // it("In Google Helper - call saveVauesToDb with user and without token parameter", async() => {
//         //     let isSave = await auth.saveVauesToDb("test@test.com");
//         //     expect(isSave).be.a('string');
//         //     expect(isSave).be.eql('token is required');
//         // })
//
//         // it("In Google Helper - call saveVauesToDb with user  token and without callback parameter", async() => {
//         //     let isSave = await auth.saveVauesToDb("test@test.com", "testing");
//         //     expect(isSave).be.a('string');
//         //     expect(isSave).be.eql('Callback should be function');
//         // })
//
//         it("In Google Helper - call saveVauesToDb with user  token and  callback parameter", async() => {
//             auth.saveVauesToDb("test@test.com", "testing", (is) => {
//                 expect(is).be.a('boolean');
//             });
//         })
//
//         it("In Google Helper - call updateCurrentToken without user parameter", async() => {
//             let token = await auth.updateCurrentToken();
//             expect(token).be.a('string');
//             expect(token).be.eql('user is required');
//         })
//
//         it("In Google Helper - call updateCurrentToken with parameter", async() => {
//             let token = await auth.updateCurrentToken("test@test.com", "testtoken", "testrefreshtoken");
//             expect(token).be.a('boolean');
//             expect(token).be.eql(true);
//         })
//
//
//         it("In Google Helper - call getAccessToken without email_user parameter", async() => {
//             let token = await auth.getAccessToken();
//             expect(token).be.a('string');
//             expect(token).be.eql('email_user is required');
//         })
//
//         it("In Google Helper - call getAccessToken with email_user parameter", async() => {
//             let token = await auth.getAccessToken("test@test.com");
//             expect(token).be.a('object');
//         })
//
//         it("In Google Helper - call getAccessToken with email_user parameter", async() => {
//             let token = await auth.getAccessToken("test@test.com");
//             expect(token).be.a('object');
//         })
//
//         it("In Google Helper - call clearToken without emailUserName parameter", async() => {
//             let token = await auth.clearToken();
//             expect(token).be.a('string');
//             expect(token).be.eql('emailUserName is required');
//         })
//
//         it("In Google Helper - call refresh token", async() => {
//             let token = await auth.refresh();
//             expect(token).be.a('boolean');
//             expect(token).be.eql(true);
//         })
//         it("In Google Helper - call clearToken with emailUserName parameter", async() => {
//             let token = await auth.clearToken("test@test.com");
//             expect(token).be.a('boolean');
//         })
//
//     });
//
// });
