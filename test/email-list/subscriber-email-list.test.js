// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const commonFunction = require("../commonFunction");
// const server = require("../../app");
// const generatedSampleData = require("../sampleData");
// const should = chai.should();
// let email_lists,
//   segment_lists,
//   email_list_id=[],
//   subscriberList = [],
//   segmentId,
//   token,
//   user,
//   createdList = [];

// chai.use(chaiHttp);

// describe("Email List TESTS", () => {
//   /*
//    * Test the email list, segments and subcriber routes
//    */
//   afterEach(() => {
//     let key;
//     for (key in this) {
//       delete this[key];
//     }
//   });

//   beforeEach(() => {
//     if (createdList && createdList.length == 2) {
//       createdList[0].priority_order = 1;
//       createdList[1].priority_order = 2;
//     }
//   });

 
//   before(done => {
//     /* Before each test we empty the database */
//     commonFunction.sequalizedDb(["email_lists", "subscribers", "contacts", "custom_filter_fields", "custom_fields", "sections", "smtp_statistics", "segment_lists", "clicked_links", "template_links", "user_details", "users", "user_roles", "permission_sets"]).then(() => {
//         email_lists = generatedSampleData.createdSampleData("email_lists", 1);
//         subscribers = generatedSampleData.createdSampleData("subscribers", 1);
//         contacts = generatedSampleData.createdSampleData("contacts", 3);
//         segment_lists = generatedSampleData.createdSampleData("segment_lists", 1);

//         const role = generatedSampleData.createdSampleData("user_roles", 1);
//         const permission = generatedSampleData.createdSampleData("permission_sets", 1);
//         user = generatedSampleData.createdSampleData("users", 1)[0];
//         commonFunction.addDataToTable("user_roles", role[0]).then(role_data => {
//             user.role_id = role_data.id;
//             section = generatedSampleData.createdSampleData("sections", 1);
//             commonFunction.addDataToTable("sections", section[0])
//                 .then((data) => {
//                     sectionBody = data;
//                     customField = generatedSampleData.createdSampleData("custom_fields", 1);
//                     customField[0].type = "BOTH";
//                     customField[0].table_name = "contacts";
//                     customField[0].section_id = sectionBody.id;
//                     commonFunction.addDataToTable("custom_fields", customField[0])
//                         .then((data) => {
//                             customFieldBody = data;
//                             // done();
//                         });
//                 });
//             commonFunction.addDataToTable("permission_sets", permission[0]).then(permission_data => {
//                 user.permission_set_id = permission_data.id;
//                 commonFunction.addDataToTable("users", user).then(data => {
//                     done();
//                 });
//             });
//         });
//     });
// });

//   it("it should be login user with token and credential", () => {
//     return chai
//       .request(server)
//       .post("/api/users/login")
//       .send(user)
//       .then(res => {
//         res.should.have.status(200);
//         res.body.should.be.a("object");
//         res.body.token.should.be.a("string");
//         token = res.body.token;
//         loggedInUser = res.body.user;
//         res.body.user.should.be.a("object");
//         res.body.user.first_name.should.be.eql(user.first_name);
//         res.body.user.last_name.should.be.eql(user.last_name);
//         res.body.user.email.should.be.eql(user.email);
//       })
//       .catch(function (err) {
//         return Promise.reject(err);
//       });
//   });

//   it("It should POST an Email List to create a new List and get list data successfully", () => {
//     return chai
//         .request(server)
//         .post("/api/emaillist")
//         .set({
//             Authorization: token
//         })
//         .send(email_lists[0])
//         .then(res => {
//             res.should.have.status(200);
//             const body = res.body;
//             body.should.be.a("object");
//             body.success.should.be.eql(true);
//             body.data.should.be.a("object"); 
//             createdList.push(body.data);
//             body.data.id.should.a("number");
//             //to be used in add segment case
//             email_list_id.push(res.body.data.id);
//         })
//         .catch(function (err) {
//             return Promise.reject(err);
//         });
// });

//     /* getListSubscribers/:listId test cases*/
//     describe("/Get List Subscribers ", () => {
//         it("it should not get the list subscribers without token", () => {
//             return chai.request(server)
//                 .get(`/api/emaillist/getListSubscribers/${email_list_id[0]}`)
//                 .then(response => {
//                     response.should.have.status(401);
//                 })
//                 .catch(function (err) {
//                     return Promise.reject(err);
//                 });
//         });
//         it("it should get the list subscribers with token", () => {
//             return chai.request(server)
//                 .get(`/api/emaillist/getListSubscribers/${email_list_id[0]}`)
//                 .set({ Authorization: token })
//                 .then(response => {
//                     const body = response.body;
//                     subscriberList = body.data;
//                     response.should.have.status(200);
//                     body.should.have.property("data");
//                     body.data.should.be.a("array");
//                     body.should.have.property("success");
//                     body.success.should.be.eql(true);
//                 })
//                 .catch(function (err) {
//                     return Promise.reject(err);
//                 });
//         });
//     });

//   // Get Email list 
//   describe("/Get Subscriber Email List - API(/api/emaillist)", () => {
//     console.log("subscriberList >>>>>>>>>",subscriberList);
    
//     before((done) => {
//     let listObj = {
//                id: subscriberList[0].id,
//                list:[]
//  }
//       encodedObject = commonFunction.encodeToBase64(listObj);
//           done();
//       });

//     it("it should not GET Email List Count data without token", () => {
//       return chai
//         .request(server)
//         .get("/api/emaillist/getEmailList/"+encodedObject)
//         .then(res => {
//           res.should.have.status(401);
//         })
//         .catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//     it("it should GET Email List count details with token", () => {
//       return chai
//         .request(server)
//         .get("/api/emaillist/getEmailList/"+encodedObject)
//         .set({
//           Authorization: token
//         })
//         .then(res => {
//           const body = res.body;
//           res.should.have.status(200);
//           body.success.should.be.eql(true);
//           body.should.have.property("listData");
//         })
//         .catch(function (err) {
//           return Promise.reject(err);
//         });
//     });

//   });

 

//   // Get Email list 
//   describe("/Get Subscriber Email List - API(/api/emaillist)", () => {
    

//   });
 

//   after(done => {
//     done();
//   });
// });
