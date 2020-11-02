const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');

chai.use(chaiHttp);

let loggedInUser, token, users, campaignBody, email_lists, campaignList, subscriberList, email_list = createdList = [], contactIdToSend = [];

let sendData = {
  'query': {
    search: '',
    status: 'ALL',
    sort_order: ''
  }
}
let orderData = {
  'order': {
    search: '',
    sort_order: ''
  }
}

let emailSearch = {
  'query': {
    search: ''
  }
}


describe('Create Campaigns ', () => {
  afterEach(() => {
    let key;
    for (key in this) {
      delete this[key];
    };
  });
  before((done) => {
    commonFunction.sequalizedDb(['call_outcomes_transitions', 'histories', 'leads_clients', 'users', 'notifications', 'call_outcomes', 'user_roles', 'permission_sets', 'campaigns', 'email_lists']).then(() => {
      email_lists = generatedSampleData.createdSampleData("email_lists", 1);
      subscribers = generatedSampleData.createdSampleData("subscribers", 1);
      contacts = generatedSampleData.createdSampleData("contacts", 3);

      const role = generatedSampleData.createdSampleData("user_roles", 1);
      const permission = generatedSampleData.createdSampleData("permission_sets", 1);
      users = generatedSampleData.createdSampleData("users", 1)
      commonFunction.addDataToTable("user_roles", role[0]).then((user_role) => {
        commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_set) => {
          users[0].role_id = user_role.id;
          users[0].permission_set_id = permission_set.id;
          users[0].email = "ripple.cis2018@gmail.com";
          commonFunction.addDataToTable("users", users[0]).then((data) => {
            user = data;
            done();
          });

        });
      });
    });
  });

  it('it should be login user with token and credential', () => {
    return chai.request(server)
      .post('/api/users/login')
      .send(users[0])
      .then((res) => {
        console.log(res.body)
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.token.should.be.a('string');
        token = res.body.token;
        loggedInUser = res.body.user;
        res.body.user.should.be.a('object');
        res.body.user.first_name.should.be.eql(users[0].first_name);
        res.body.user.last_name.should.be.eql(users[0].last_name);
        res.body.user.email.should.be.eql(users[0].email);
      }).catch(function (err) {
        return Promise.reject(err);
      });
  });



  describe('/POST Subscriber List save', () => {

    before((done) => {
      subscriberListBody = generatedSampleData.createdSampleData("subscriber_lists", 1);
      subscriberListBody[0].subscriber_mails = []
      subscriberListBody[0].subscriber_mails.push({ email: 'ashish.d@cisinlabs.com' })
      subscriberListBody[0].subscriber_mails.push({ email: 'rajan.y@cisinlabs.com' })
      subscriberListBody[0].user_id = users[0].id
      done();
    });

    it('it should not save subscriber list without authentication', () => {
      return chai.request(server)
        .post('/api/subscriber_list')
        .send(subscriberListBody[0])
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should save Subscriber list ', () => {
      return chai.request(server)
        .post('/api/subscriber_list')
        .set({ Authorization: token })
        .send(subscriberListBody[0])
        .then((res) => {
          res.body.success.should.be.eql(true);
          res.body.data.should.have.property('id');
          res.body.data.should.have.property('user_id');
          res.body.data.should.have.property('name');
          res.body.data.should.have.property('description');
          res.should.have.status(201);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/POST Get Subscriber List', () => {
    it('it should not GET  Subscriber List without access token', () => {
      encodedObject = commonFunction.encodeToBase64(orderData);
      return chai.request(server)
        .get('/api/subscriber_list/get_all/'+encodedObject)
        // .send(orderData)
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should GET Subscriber Lists', () => {
      encodedObject = commonFunction.encodeToBase64(orderData);
      return chai.request(server)
        .get('/api/subscriber_list/get_all/'+encodedObject)
        // .send(orderData)
        .set({ Authorization: token })
        .then((res) => {
          subscriberList = res.body.data.rows
          res.should.have.status(201);
          res.body.success.should.be.eql(true);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  // Save email list and subscribers for the list headers of campaign test cases
  describe('/POST save email list and subscribers---->', () => {
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
          email_list.push(res.body.data.id);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });


    for (let i = 0; i < 3; i++) {
      it("adding contacts to list to check bulk options", () => {
        return chai.request(server)
          .post("/api/emaillist/addcontact")
          .set({
            Authorization: token
          })
          .send(Object.assign(contacts[i], {
            entity_id: 1
          }))
          .then(res => {
            const body = res.body;
            contactIdToSend.push(body.data.id)
            res.should.have.status(200);
            body.should.be.a("object");
            body.success.should.be.eql(true);
            body.data.should.be.a("object");
            body.data.id.should.a("number");
          })
          .catch(function (err) {
            return Promise.reject(err);
          });
      });
    }

    /* add subscriber test cases*/
    it('it should add contact to list with token', () => {
      return chai
        .request(server)
        .post(`/api/emaillist/addContactToList`)
        .set({ Authorization: token })
        .send({
          "listId": email_list[0].id,
          "contactId": contactIdToSend
        })
        .then((response) => {
          const body = response.body;
          response.should.have.status(200);
          body.success.should.be.eql(true);
          body.should.have.property("data");
          body.data.should.be.a("array");
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/POST Campaign save', () => {

    before((done) => {
      campaignBody = generatedSampleData.createdSampleData("campaigns", 1);
      campaignBody[0].user_id = users[0].id;
      campaignBody[0].our_subscribers = [{ id: subscriberList[0].id }];
      campaignBody[0].list_headers = JSON.stringify({
        "x-list-id": [email_list[0].id],
        "x-segment-id": []
      });
      done();
    });

    it('it should not save Campaign with ready state without authentication', () => {
      return chai.request(server)
        .post('/api/campaigns')
        .send(campaignBody[0])
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should save Campaign with ready state', () => {
      return chai.request(server)
        .post('/api/campaigns')
        .set({ Authorization: token })
        .send(campaignBody[0])
        .then((res) => {
          res.body.data.should.have.property('id');
          res.body.data.should.have.property('user_id');
          res.body.data.should.have.property('name');
          res.body.data.should.have.property('from_name');
          res.body.data.should.have.property('from_email');
          res.body.data.should.have.property('reply_email');
          res.body.data.should.have.property('subject_line');
          res.body.data.should.have.property('preheader_text');
          res.body.data.should.have.property('scheduled_time');
          res.body.data.should.have.property('status');
          res.body.data.should.have.property('email_percentage');
          res.body.data.should.have.property('is_scheduled');
          res.body.message.should.be.eql('Campaign created');
          res.should.have.status(201);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

  });

  describe('/POST Campaign save', () => {

    before((done) => {
      campaignBody = generatedSampleData.createdSampleData("campaigns", 1);
      campaignBody[0].user_id = users[0].id;
      campaignBody[0].our_subscribers = [];
      campaignBody[0].status = 'DRAFT';
      campaignBody[0].list_headers = JSON.stringify({
        "x-list-id": [email_list[0].id],
        "x-segment-id": []
      });
      done();
    });

    it('it should not save Campaign with draft state without authentication', () => {
      return chai.request(server)
        .post('/api/campaigns')
        .send(campaignBody[0])
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should save Campaign with draft state', () => {
      return chai.request(server)
        .post('/api/campaigns')
        .set({ Authorization: token })
        .send(campaignBody[0])
        .then((res) => {
          console.log('312-----------------res.body: ', res.body);
          res.body.data.should.have.property('id');
          res.body.data.should.have.property('user_id');
          res.body.data.should.have.property('name');
          res.body.data.should.have.property('from_name');
          res.body.data.should.have.property('from_email');
          res.body.data.should.have.property('reply_email');
          res.body.data.should.have.property('subject_line');
          res.body.data.should.have.property('preheader_text');
          res.body.data.should.have.property('scheduled_time');
          res.body.data.should.have.property('status');
          res.body.data.should.have.property('email_percentage');
          res.body.data.should.have.property('is_scheduled');
          res.body.message.should.be.eql('Campaign created');
          res.should.have.status(201);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/GET Campaign', () => {
    it('it should not GET  Campaign with all status List without access token', () => {
      encodedObject = commonFunction.encodeToBase64(sendData);
      return chai.request(server)
        .get('/api/campaigns/get_all/'+encodedObject)
        // .send(sendData)
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should GET Camapign List with all status', () => {
      encodedObject = commonFunction.encodeToBase64(sendData);
      return chai.request(server)
        .get('/api/campaigns/get_all/'+encodedObject)
        // .send(sendData)
        .set({ Authorization: token })
        .then((res) => {
          campaignList = res.body.result.data
          res.should.have.status(201);
          res.body.success.should.be.eql(true);
          res.body.result.data.should.be.a('array');
          campaignList = res.body.result.data;
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });


  describe('/UPDATE Campaign', () => {

    before((done) => {
      campaignBody.name = null;
      done();
    });

    it('it should not UPDATE a Campaign without access token', () => {
      return chai.request(server)
        .put('/api/campaigns/update/' + campaignList[1].id)
        .send(campaignBody)
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/UPDATE Campaign', () => {
    before((done) => {
      campaignBody[0].name = "New Campaign Name";
      done();
    });
    it('it should UPDATE a Campaign', () => {
      return chai.request(server)
        .put('/api/campaigns/update/' + campaignList[1].id)
        .set({ Authorization: token })
        .send(campaignBody[0])
        .then((res) => {
          res.should.have.status(201);
          res.body.success.should.be.eql(true);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/Get CampaignById Call Outcome', () => {
    it('it should not get a Campaign without access token', () => {
      return chai.request(server)
        .get('/api/campaigns/' + campaignList[0].id)
        .then((res) => {
          console.log(res.body)
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    // /campaigns/:id
    it('it should get a Campaign with access token', () => {
      return chai.request(server)
        .get('/api/campaigns/' + campaignList[0].id)
        .set({ Authorization: token })
        .then((res) => {
          console.log('415---res.body---', res.body);
          res.should.have.status(201);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

  });

  describe('/DELETE Call Outcome', () => {
    it('it should not DELETE a Campaign without access token', () => {
      return chai.request(server)
        .post('/api/campaigns/delete')
        .send({ id: [campaignList[0].id] })
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should DELETE Campaign', () => {
      return chai.request(server)
        .post('/api/campaigns/delete')
        .send({ id: [campaignList[0].id] })
        .set({ Authorization: token })
        .then((res) => {
          res.should.have.status(200);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });
  describe('/Get All Campaign with status', () => {
    it('it should not get all Campaign with status without access token', () => {
      encodedObject = commonFunction.encodeToBase64({});
      return chai.request(server)
        .get('/api/campaigns/get_status_count/'+encodedObject)
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should get all Campaign with status', () => {
      encodedObject = commonFunction.encodeToBase64({});
      return chai.request(server)
        .get('/api/campaigns/get_status_count/'+encodedObject)
        .set({ Authorization: token })
        .then((res) => {
          res.body.should.have.property('allCount');
          res.body.should.have.property('completeCount');
          res.body.should.have.property('deleteCount');
          res.body.should.have.property('readyCount');
          res.body.should.have.property('sendingCount');
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/Get Email Template', () => {
    it('it should not get email Template without access token', () => {
      encodedObject = commonFunction.encodeToBase64({});
      return chai.request(server)
        .get('/api/campaigns/email_template/custom/'+encodedObject)
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should get email template', () => {
      encodedObject = commonFunction.encodeToBase64(emailSearch);
      return chai.request(server)
        .get('/api/campaigns/email_template/custom/'+encodedObject)
        // .send(emailSearch)
        .set({ Authorization: token })
        .then((res) => {
          console.log("-------------------------res.body-----------------------------",res.body);
          res.should.have.status(201);
          res.body.success.should.be.eql(true);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/GET  Campaign', () => {
    it('it should not GET  Campaign List with status sending without access token', () => {
      encodedObject = commonFunction.encodeToBase64(sendData);
      return chai.request(server)
        .get('/api/campaigns/get_all/'+encodedObject)
        // .send(sendData)
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should GET Camapign List with status sending', () => {
      
      encodedObject = commonFunction.encodeToBase64({
        'query': {
          search: '',
          status: 'SENDING',
          sort_order: ''
        }
      });
      return chai.request(server)
        .get('/api/campaigns/get_all/'+encodedObject)
        // .send(data)
        .set({ Authorization: token })
        .then((res) => {
          campaignList = res.body.result.data
          res.should.have.status(201);
          res.body.success.should.be.eql(true);
          res.body.result.data.should.be.a('array');
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/GET  Campaign', () => {
    it('it should not GET  Campaign List with status draft without access token', () => {
      encodedObject = commonFunction.encodeToBase64(sendData);
      return chai.request(server)
        .get('/api/campaigns/get_all/'+encodedObject)
        // .send(sendData)
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should GET Camapign List with status draft', () => {
      encodedObject = commonFunction.encodeToBase64({
        'query': {
          search: '',
          status: 'DRAFT',
          sort_order: ''
        }
      });
      return chai.request(server)
        .get('/api/campaigns/get_all/'+encodedObject)
        // .send(data)
        .set({ Authorization: token })
        .then((res) => {
          campaignList = res.body.result.data
          res.should.have.status(201);
          res.body.success.should.be.eql(true);
          res.body.result.data.should.be.a('array');
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/GET Campaign', () => {
    it('it should not GET  Campaign List with status completed without access token', () => {
      encodedObject = commonFunction.encodeToBase64(sendData);
      return chai.request(server)
        .get('/api/campaigns/get_all/'+encodedObject)
        // .send(sendData)
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should GET Camapign List with status completed', () => {
      encodedObject = commonFunction.encodeToBase64({
        'query': {
          search: '',
          status: 'COMPLETED',
          sort_order: ''
        }
      });
      return chai.request(server)
        .get('/api/campaigns/get_all/'+encodedObject)
        // .send(data)
        .set({ Authorization: token })
        .then((res) => {
          campaignList = res.body.result.data
          res.should.have.status(201);
          res.body.success.should.be.eql(true);
          res.body.result.data.should.be.a('array');
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/POST Get Campaign', () => {
    it('it should not GET  Campaign List with status deleted without access token', () => {
      encodedObject = commonFunction.encodeToBase64(sendData);
      return chai.request(server)
        .get('/api/campaigns/get_all/'+encodedObject)
        // .send(sendData)
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should GET Camapign List with status deleted', () => {
      encodedObject = commonFunction.encodeToBase64({
        'query': {
          search: '',
          status: 'DELETED',
          sort_order: ''
        }
      });
      return chai.request(server)
        .get('/api/campaigns/get_all/'+encodedObject)
        // .send(data)
        .set({ Authorization: token })
        .then((res) => {
          campaignList = res.body.result.data
          res.should.have.status(201);
          res.body.success.should.be.eql(true);
          res.body.result.data.should.be.a('array');
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });
});