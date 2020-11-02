const chai = require("chai");
const chaiHttp = require("chai-http");
const commonFunction = require("../commonFunction");
const server = require("../../app");
const generatedSampleData = require("../sampleData");
const should = chai.should();
let email_lists,
  segment_lists,
  email_list_id,
  segmentId,
  token,
  user,
  createdList = [];

chai.use(chaiHttp);

describe("Email List TESTS", () => {
  /*
   * Test the email list, segments and subcriber routes
   */
  afterEach(() => {
    let key;
    for (key in this) {
      delete this[key];
    }
  });

  beforeEach(() => {
    if (createdList && createdList.length == 2) {
      createdList[0].priority_order = 1;
      createdList[1].priority_order = 2;
    }
  });

  before(done => {
    //Before each test we empty the database
    commonFunction
      .sequalizedDb(["leads_clients", "email_lists", "segment_lists", "subscribers", "user_details", "users", "user_roles", "permission_sets"])
      .then(() => {
        email_lists = generatedSampleData.createdSampleData("email_lists", 1);
        segment_lists = generatedSampleData.createdSampleData("segment_lists", 1);
        subscribers = generatedSampleData.createdSampleData("subscribers", 1);

        const role = generatedSampleData.createdSampleData("user_roles", 1);
        const permission = generatedSampleData.createdSampleData("permission_sets", 1);
        user = generatedSampleData.createdSampleData("users", 1)[0];
        commonFunction.addDataToTable("user_roles", role[0]).then(role_data => {
          user.role_id = role_data.id;
          commonFunction
            .addDataToTable("permission_sets", permission[0])
            .then(permission_data => {
              user.permission_set_id = permission_data.id;
              commonFunction.addDataToTable("users", user).then(data => {
                done();
              });
            });
        });
      });
  });

  it("it should be login user with token and credential", () => {
    return chai
      .request(server)
      .post("/api/users/login")
      .send(user)
      .then(res => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.token.should.be.a("string");
        token = res.body.token;
        loggedInUser = res.body.user;
        res.body.user.should.be.a("object");
        res.body.user.first_name.should.be.eql(user.first_name);
        res.body.user.last_name.should.be.eql(user.last_name);
        res.body.user.email.should.be.eql(user.email);
      })
      .catch(function (err) {
        return Promise.reject(err);
      });
  });

  // Add Email list
  describe("/POST Email List - API(/api/emaillist)", () => {
    it("it should not POST and able to Create an Email List without token", () => {
      return chai
        .request(server)
        .post("/api/emaillist/")
        .send(email_lists[0])
        .then(res => {
          res.should.have.status(401);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    for (let i = 0; i < 2; i++) {
      it("It should POST an Email List to create a new List and get list data successfully", () => {
        return chai
          .request(server)
          .post("/api/emaillist")
          .set({
            Authorization: token
          })
          .send(email_lists[0])
          .then(res => {
            res.should.have.status(200);
            const body = res.body;
            body.should.be.a("object");
            body.success.should.be.eql(true);
            body.data.should.be.a("object");
            createdList.push(body.data);
            body.data.id.should.a("number");

            //to be used in add segment case
            email_list_id = res.body.data.id;
          })
          .catch(function (err) {
            return Promise.reject(err);
          });
      });
    }

    it("It should not POST an Email List without List Name", () => {
      //deleting list_name before passing
      let list = email_lists[0];
      delete list.list_name;
      return chai
        .request(server)
        .post("/api/emaillist")
        .set({
          Authorization: token
        })
        .send(email_lists[0])
        .then(res => {
          res.should.have.status(422);
          res.body.should.be.a("object");
          res.body.success.should.be.eql(false);
          res.body.message.should.be.eql("List Name is required.");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  // Get Email list 
  describe("/Get Email List - API(/api/emaillist)", () => {
    it("it should not GET Email List Count data without token", () => {
      return chai
        .request(server)
        .get("/api/emaillist/count")
        .then(res => {
          res.should.have.status(401);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should GET Email List count details with token", () => {
      return chai
        .request(server)
        .get("/api/emaillist/count")
        .set({
          Authorization: token
        })
        .then(res => {
          const body = res.body;
          res.should.have.status(200);
          body.success.should.be.eql(true);
          body.should.have.property("listCount").that.is.a("number");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should not GET all Email List data without token", () => {
      return chai
        .request(server)
        .get("/api/emaillist")
        .then(res => {
          res.should.have.status(401);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should GET All Email List details with token", () => {
      return chai
        .request(server)
        .get("/api/emaillist")
        .set({
          Authorization: token
        })
        .then(res => {
          const body = res.body;
          res.should.have.status(200);
          body.success.should.be.eql(true);
          body.data.should.be.a("array");
          const firstdata = body.data[0];
          firstdata.should.have.property("id").that.is.a("number");
          firstdata.should.have.property("list_name").that.is.a("string");
          firstdata.should.have.property("list_description");
          firstdata.should.have.property("from_name");
          firstdata.should.have.property("from_email");
          firstdata.should.have.property("reply_email");
          firstdata.should.have.property("created_by");
          firstdata.should.have.property("createdAt");
          firstdata.should.have.property("updatedAt");

          //to be used in add segment case
          segment_list_id = res.body.data.id;
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  // Search email list
  describe('/GET searchEmailList - API(/api/emaillist/searchEmailList)', () => {
    it("it should not search email list without token", () => {
      return chai
        .request(server)
        .get("/api/emaillist/searchEmailList?searchFor=a")
        .then(res => {
          res.should.have.status(401);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should search email list without token", () => {
      return chai
        .request(server)
        .get("/api/emaillist/searchEmailList?searchFor=a")
        .set({ Authorization: token })
        .then(res => {
          res.should.have.status(200);
          const body = res.body;
          body.should.be.a("object");
          body.success.should.be.eql(true);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });
  })

  // Email list name update test cases
  describe('/Update Email list name - API(/api/emaillist/updateListName/:list_id)', () => {

    it('it should not update an Email list name without token', () => {
      return chai
        .request(server)
        .patch(`/api/emaillist/updateListName/${email_list_id}`)
        .then((response) => {
          response.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should not udpdate an Email list name with invalid list id and valid token', () => {
      return chai
        .request(server)
        .patch(`/api/emaillist/updateListName/abc`)
        .set({ Authorization: token })
        .then((response) => {
          response.should.have.status(422);
          response.body.success.should.be.eql(false);
          response.body.message.should.be.eql('Invalid Route');
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should udpdate an Email list name with token', () => {
      let udpatedEmailList = email_lists[0];
      udpatedEmailList.list_name = 'updatedName';
      return chai
        .request(server)
        .patch(`/api/emaillist/updateListName/${email_list_id}`)
        .send(udpatedEmailList)
        .set({ Authorization: token })
        .then((response) => {
          response.should.have.status(200);
          response.body.success.should.be.eql(true);
          response.body.message.should.be.eql('Email list name updated successfully.');
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

  });

  // Update email list
  describe("/PUT Email List - API(/api/emaillist/<list_id>)", () => {
    it("it should not update an Email List details without token", () => {
      return chai
        .request(server)
        .put("/api/emaillist/" + email_list_id)
        .send(email_lists[0])
        .then(res => {
          const body = res.body;
          res.should.have.status(401);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should not update an Email List with invalid email list id and show user centric message", () => {
      return chai
        .request(server)
        .put("/api/emaillist/undefined")
        .set({ Authorization: token })
        .send(email_lists[0])
        .then(res => {
          res.should.have.status(422);
          res.body.should.have.property("message");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should update an Email List details with token", () => {
      return chai
        .request(server)
        .put("/api/emaillist/" + email_list_id)
        .send(email_lists[0])
        .set({
          Authorization: token
        })
        .then(res => {
          const body = res.body;
          res.should.have.status(200);
          body.success.should.be.eql(true);
          body.data.should.be.a("object");
          body.should.have.property("message");
          const firstdata = body.data;
          firstdata.should.have.property("list_description");
          firstdata.should.have.property("from_name");
          firstdata.should.have.property("from_email");
          firstdata.should.have.property("reply_email");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should not update an Email List for unknown data and show user centric message", () => {
      let list = email_lists[0];
      list.created_by = "someone from earth";
      return chai
        .request(server)
        .put("/api/emaillist/abc")
        .set({
          Authorization: token
        })
        .send(list)
        .then(res => {
          res.should.have.status(422);
          res.body.should.have.property("message");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  // Segments route
  describe("/POST Segment - API(/api/emaillist/<list_id>/addsegment)", () => {
    it("it should not POST and able to Create an Segment List without token", () => {
      return chai
        .request(server)
        .post("/api/emaillist/ " + email_list_id + "/addsegment")
        .send(segment_lists[0])
        .then(res => {
          res.should.have.status(401);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("It should POST a Segment to add a Segment to list and get added segment data", () => {
      return chai
        .request(server)
        .post("/api/emaillist/" + email_list_id + "/addsegment")
        .set({
          Authorization: token
        })
        .send(segment_lists[0])
        .then(res => {
          res.should.have.status(200);
          const body = res.body;
          body.should.be.a("object");
          body.success.should.be.eql(true);
          body.data.should.be.a("object");
          body.data.id.should.a("number");
          body.data.should.have.property("id").that.is.a("number");
          body.data.should.have.property("segment_name").that.is.a("string");
          body.data.should.have.property("segment_description");
          body.data.should.have.property("created_by");
          body.data.should.have.property("list_id");
          body.data.should.have.property("createdAt");
          body.data.should.have.property("updatedAt");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("It should not POST a Segment if list reference is deleted or not exist in the database", () => {
      return chai
        .request(server)
        .post("/api/emaillist/undefined/addsegment")
        .set({
          Authorization: token
        })
        .send(segment_lists[0])
        .then(res => {
          res.should.have.status(422);
          const body = res.body;
          body.should.be.a("object");
          body.success.should.be.eql(false);
          body.should.have.property("message");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("It should not POST a Segment without segment name", () => {
      let segment = segment_lists[0];
      delete segment.segment_name;
      return chai
        .request(server)
        .post("/api/emaillist/" + email_list_id + "/addsegment")
        .set({
          Authorization: token
        })
        .send(segment)
        .then(res => {
          res.should.have.status(422);
          const body = res.body;
          body.should.be.a("object");
          body.success.should.be.eql(false);
          body.message.should.be.eql("Segment Name is required.");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("It should not POST a Segment with unknown data and show user centric message", () => {
      return chai
        .request(server)
        .post("/api/emaillist/" + undefined + "/addsegment")
        .set({
          Authorization: token
        })
        .send(segment_lists[0])
        .then(res => {
          res.should.have.status(422);
          res.body.should.have.property("message");
          res.body.message.should.be.eql("Invalid Route.");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should GET All Email List and its segments details with token(include_segments=true)", () => {
      return chai
        .request(server)
        .get("/api/emaillist?include_segments=true")
        .set({
          Authorization: token
        })
        .then(res => {
          const body = res.body;
          res.should.have.status(200);
          body.success.should.be.eql(true);
          body.data.should.be.a("array");
          const firstdata = body.data[0];
          firstdata.should.have.property("id").that.is.a("number");
          firstdata.should.have.property("list_name").that.is.a("string");
          firstdata.should.have.property("list_description");
          firstdata.should.have.property("from_name");
          firstdata.should.have.property("from_email");
          firstdata.should.have.property("reply_email");
          firstdata.should.have.property("created_by");
          firstdata.should.have.property("createdAt");
          firstdata.should.have.property("updatedAt");
          firstdata.should.have.property("segments").that.is.a("array");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe("/Get All Segments of a List - API(/api/emaillist/<list_id>/segments)", () => {
    it("it should not GET Segment List data without token", () => {
      return chai
        .request(server)
        .get("/api/emaillist/" + email_list_id + "/segments")
        .then(res => {
          const body = res.body;
          res.should.have.status(401);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should not GET Segment List for invalid route and show Invalid route message", () => {
      return chai
        .request(server)
        .get("/api/emaillist/" + undefined + "/segments")
        .set({
          Authorization: token
        })
        .then(res => {
          const body = res.body;
          res.should.have.status(422);
          body.should.have.property("message");
          body.message.should.be.eql("Invalid Route.");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should GET All Segments of a list by list_id with token", () => {
      return chai
        .request(server)
        .get("/api/emaillist/" + email_list_id + "/segments")
        .set({
          Authorization: token
        })
        .then(res => {
          const body = res.body;
          res.should.have.status(200);
          body.success.should.be.eql(true);
          body.data.should.be.a("array");
          const firstdata = body.data[0];
          firstdata.should.have.property("id").that.is.a("number");
          segmentId = firstdata.id;
          firstdata.should.have.property("list_name").that.is.a("string");
          firstdata.should.have.property("list_description");
          firstdata.should.have.property("from_name");
          firstdata.should.have.property("from_email");
          firstdata.should.have.property("reply_email");
          firstdata.should.have.property("created_by");
          firstdata.should.have.property("createdAt");
          firstdata.should.have.property("updatedAt");
          firstdata.should.have.property("By").that.is.a("object");
          firstdata.should.have.property("segments").that.is.a("array");
          firstdata.segments[0].should.be.a("object");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should GET All Segments with token", () => {
      return chai
        .request(server)
        .get("/api/emaillist/segments")
        .set({
          Authorization: token
        })
        .then(res => {
          const body = res.body;
          res.should.have.status(200);
          body.success.should.be.eql(true);
          body.data.should.be.a("array");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  // segment update test cases
  describe("/update segment", () => {
    it("it should not update a segment without token", () => {
      return chai
        .request(server)
        .put(`/api/emaillist/segment/${segmentId}`)
        .then(response => {
          response.should.have.status(401);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should update a segment with token", () => {
      return chai
        .request(server)
        .put(`/api/emaillist/segment/${segmentId}`)
        .set({ Authorization: token })
        .send(segment_lists[0])
        .then(response => {
          const body = response.body;
          response.should.have.status(200);
          body.success.should.be.eql(true);
          body.should.have.property("message");
          body.should.have.property("data");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should not update a segment with invalid route", () => {
      return chai
        .request(server)
        .put("/api/emaillist/segment/undefined")
        .set({ Authorization: token })
        .send(segment_lists[0])
        .then(response => {
          const body = response.body;
          response.should.have.status(422);
          body.success.should.be.eql(false);
          body.should.have.property("message");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  // segment delete test cases
  describe("/Delete segment ", () => {
    it("it should not delete a segment without token", () => {
      return chai
        .request(server)
        .delete(`/api/emaillist/deleteSegment/${segmentId}`)
        .then(response => {
          response.should.have.status(401);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should delete a segment with token", () => {
      return chai
        .request(server)
        .delete(`/api/emaillist/deleteSegment/${segmentId}`)
        .set({ Authorization: token })
        .then(response => {
          response.should.have.status(200);
          response.body.success.should.be.eql(true);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  // Email list delete test cases
  describe("/Delete Email List - API(/api/emaillist/:list_id/deleteEmailList)", () => {
    it("it should not delete an Email List without token", () => {
      return chai
        .request(server)
        .delete(`/api/emaillist/deleteEmailList/${email_list_id}`)
        .then(response => {
          response.should.have.status(401);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should delete an Email List with token", () => {
      return chai
        .request(server)
        .delete(`/api/emaillist/deleteEmailList/${email_list_id}`)
        .set({ Authorization: token })
        .then(response => {
          // { data: 1, success: true }
          response.should.have.status(200);
          // response.body.data.should.be.eql(1);
          response.body.success.should.be.eql(true);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should not delete an Email List with token if route is invalid", () => {
      return chai
        .request(server)
        .delete("/api/emaillist/deleteEmailList/undefined")
        .set({ Authorization: token })
        .then(response => {
          response.should.have.status(422);
          response.body.success.should.be.eql(false);
          response.body.should.have.property("message");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe("/Reorder Email List ", () => {
    it("it should not reorder an Email List without token", () => {
      return chai
        .request(server)
        .put("/api/emaillist/reorder")
        .send({
          pos_id: createdList[0].priority_order,
          target_id: createdList[1].priority_order
        })
        .then(response => {
          response.should.have.status(401);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should reorder an Email List with a token", () => {
      return chai
        .request(server)
        .put("/api/emaillist/reorder")
        .set({ Authorization: token })
        .send({
          pos_id: createdList[0].priority_order,
          target_id: createdList[1].priority_order
        })
        .then(res => {
          const body = res.body;
          res.should.have.status(200);
          body.should.have.property("success");
          body.success.should.be.eql(true);
          body.should.have.property("message").that.is.a("string");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe("/Reorder Segment List ", () => {
    it("it should not reorder a Segment List without token", () => {
      return chai
        .request(server)
        .put("/api/emaillist/segments/reorder")
        .send({
          pos_id: createdList[0].priority_order,
          target_id: createdList[1].priority_order
        })
        .then(response => {
          response.should.have.status(401);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it("it should reorder an Segment List with a token", () => {
      return chai
        .request(server)
        .put("/api/emaillist/segments/reorder")
        .set({ Authorization: token })
        .send({
          pos_id: createdList[0].priority_order,
          target_id: createdList[1].priority_order
        })
        .then(res => {
          const body = res.body;
          res.should.have.status(200);
          body.should.have.property("success");
          body.success.should.be.eql(true);
          body.should.have.property("message").that.is.a("string");
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  after(done => {
    done();
  });
});
