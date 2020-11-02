const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
chai.use(chaiHttp);
const modelName = 'leads';
let loggedInUser, token, user,encodedObject;
let leadData, leadId;
const cronJob = require('./../../controllers/CronJobController/leadtransitions');

describe('login', () => {
  afterEach(() => {
    let key;
    for (key in this) {
      delete this[key];
    };
  });
  before((done) => { //Before each test we empty the database
    commonFunction.sequalizedDb(['user_details','notes', 'histories', 'sales_stage_transitions', 'lost_lead_fields', 'sales_stage_counters', 'leads_clients', 'sales_stages', 'users', 'permission_sets', 'user_roles']).then(() => {
      const role = generatedSampleData.createdSampleData("user_roles", 1);
      const permission = generatedSampleData.createdSampleData("permission_sets", 1);
      user = generatedSampleData.createdSampleData("users", 1)[0]
      commonFunction.addDataToTable("user_roles", role[0]).then((role_data) => {
        user.role_id = role_data.id
        commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_data) => {
          user.permission_set_id = permission_data.id;
          commonFunction.addDataToTable("users", user).then((data) => {
            done();
          });
        })
      });
    });
  });

  it('it should be login user with token and credential', () => {
    return chai.request(server)
      .post('/api/users/login')
      .send(user)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.token.should.be.a('string');
        token = res.body.token;
        loggedInUser = res.body.user;
        res.body.user.should.be.a('object');
        res.body.user.first_name.should.be.eql(user.first_name);
        res.body.user.last_name.should.be.eql(user.last_name);
        res.body.user.email.should.be.eql(user.email);
      }).catch(function (err) {
        return Promise.reject(err);
      });
  });
});

describe('/GET not get client Convertion Graph', () => {
  it('it should give 422 error when there is no sales stage available', () => {
    encodedObject = commonFunction.encodeToBase64({
      date: ""
    });
    return chai.request(server)
      .get('/api/lead/convertionGraph/'+encodedObject)
      .set({
        Authorization: token
      })
      .then((res) => {
        res.should.have.status(200);
        res.body.should.have.property("Percentage");
        if (res.body.Percentage) {
          res.body.Percentage.should.be.an("Array");
          res.body.Percentage.length.should.be.eql(0);
        }
      }).catch(function (err) {
        return Promise.reject(err);
      });
  });
})


describe('/POST get client Convertion Graph', () => {
  before((done) => {
    let sales_stages = [{
        id: 1,
        name: 'Unqualified',
        description: 'Still to Contact',
        default_id: 1,
        close_probability: 0,
        priority_order: 0
      }, {
        id: 2,
        name: 'Quotation / Proposal',
        description: 'Issued Quote',
        default_id: 2,
        close_probability: 50,
        priority_order: 1
      }, {
        id: 3,
        name: 'Negotiation',
        description: 'Closing the Sale',
        default_id: 3,
        close_probability: 60,
        priority_order: 2
      }, {
        id: 4,
        name: 'Confirmation',
        description: 'Invoice Issued',
        default_id: 4,
        close_probability: 95,
        priority_order: 3
      }, {
        id: 5,
        name: 'Paid',
        description: 'Funds Received',
        default_id: 5,
        close_probability: 100,
        priority_order: 4
      },
      {
        id: 6,
        name: 'Need Analysis',
        description: 'Initial Discussions',
        default_id: 6,
        close_probability: 25,
        priority_order: 5
      },
      {
        id: 7,
        name: 'Lost Leads',
        description: 'Lost Sale',
        default_id: 7,
        close_probability: 0,
        priority_order: 6
      },
      {
        id: 8,
        name: 'CONVERT TO CLIENT',
        description: 'YOU DID IT!',
        default_id: 8,
        close_probability: 0,
        priority_order: 7
      }
    ];

    commonFunction.addBulkDataToTable("sales_stages", sales_stages).then((data) => {
      leadData = generatedSampleData.createdSampleData("leads_clients", 25);
      leadData.forEach((element, indx) => {
        element.id = indx - 1;
        if (indx < 5) {
          element["sales_stage_id"] = 7;
        } else if (indx < 10) {
          element["sales_stage_id"] = 1;
        } else if (indx < 15) {
          element["sales_stage_id"] = 4;
        } else {
          element["sales_stage_id"] = 8;
        }
        element["user_id"] = loggedInUser.id;
      });
      commonFunction.addBulkDataToTable("leads_clients", leadData).then((data) => {
        done();
      });
    });
  });



  it('it should Get get leads Conversion Graph data', () => {
    encodedObject = commonFunction.encodeToBase64({
      date: ""
    });
    return chai.request(server)
      .get('/api/lead/convertionGraph/'+encodedObject)
      .set({
        Authorization: token
      })
      .then((res) => {
        res.should.have.status(200)
        res.body.should.have.property("Percentage");
        if (res.body.Percentage) {
          res.body.Percentage.should.be.an("Array");
          res.body.Percentage.length.should.not.eql(0);
          res.body.Percentage[0].should.be.an("Array");
        }
      }).catch(function (err) {
        return Promise.reject(err);
      });
  });
});

describe('/POST leads Lost Lead Graph', () => {
  before((done) => {
    const fieldsSampleData = generatedSampleData.createdSampleData("lost_lead_fields", 4);
    commonFunction.addBulkDataToTable("lost_lead_fields", fieldsSampleData).then((data) => {
      done();
      encodedObject = commonFunction.encodeToBase64({
        date: ""
      });
    });
  });

  it('it should Get leads Lost Lead Graph data', () => {
    return chai.request(server)
      .get('/api/lead/lostLeadGraph/'+encodedObject)
      .set({
        Authorization: token
      })
      .then((res) => {
        res.should.have.status(200)
        res.body.should.have.property("Percentage");
        if (res.body.Percentage) {
          res.body.Percentage.should.be.an("Array");
          res.body.Percentage.length.should.not.eql(0);
          res.body.Percentage[0].should.be.an("Array");
        }
      }).catch(function (err) {
        return Promise.reject(err);
      });
  });
});



describe('/POST get leads Total Time TO Convert Graph', () => {
  before((done) => {
    const TransitionSampleData = [{
        "id": "1",
        "lead_client_id": "11",
        "current_ss_id": "5",
        "old_ss_id": "0",
        "created_at": "2018-10-24 15:05:37",
        "updated_at": "2018-10-22 15:05:37"
      },
      {
        "id": "2",
        "lead_client_id": "11",
        "current_ss_id": "3",
        "old_ss_id": "5",
        "created_at": "2018-10-22 15:06:07",
        "updated_at": "2018-10-22 15:06:07"
      },
      {
        "id": "3",
        "lead_client_id": "12",
        "current_ss_id": "3",
        "old_ss_id": "0",
        "created_at": "2018-10-22 15:13:11",
        "updated_at": "2018-10-22 15:13:11"
      },
      {
        "id": "4",
        "lead_client_id": "6",
        "current_ss_id": "2",
        "old_ss_id": "7",
        "created_at": "2018-10-22 15:13:24",
        "updated_at": "2018-10-22 15:13:24"
      },
      {
        "id": "5",
        "lead_client_id": "4",
        "current_ss_id": "5",
        "old_ss_id": "7",
        "created_at": "2018-10-22 15:13:26",
        "updated_at": "2018-10-22 15:13:26"
      },
      {
        "id": "6",
        "lead_client_id": "4",
        "current_ss_id": "1",
        "old_ss_id": "5",
        "created_at": "2018-10-22 15:13:29",
        "updated_at": "2018-10-22 15:13:29"
      },
      {
        "id": "7",
        "lead_client_id": "4",
        "current_ss_id": "3",
        "old_ss_id": "1",
        "created_at": "2018-10-22 15:13:32",
        "updated_at": "2018-10-22 15:13:32"
      },
      {
        "id": "8",
        "lead_client_id": "11",
        "current_ss_id": "8",
        "old_ss_id": "3",
        "created_at": "2018-10-22 15:13:52",
        "updated_at": "2018-10-22 15:13:52"
      },
      {
        "id": "9",
        "lead_client_id": "13",
        "current_ss_id": "3",
        "old_ss_id": "0",
        "created_at": "2018-10-23 10:54:57",
        "updated_at": "2018-10-23 10:54:57"
      }
    ]
    commonFunction.addBulkDataToTable("sales_stage_transitions", TransitionSampleData).then((data) => {
      done();
    });
  });
  
  it('it should Get get leads Total Time TO Convert Graph data', () => {
    encodedObject = commonFunction.encodeToBase64({
      date: ""
    });
    return chai.request(server)
      .post('/api/lead/totalTimeTOConvert/'+encodedObject)
      .set({
        Authorization: token
      })
      .then((res) => {
        res.should.have.status(200)
        // res.body.should.have.property("Percentage");
        if (res.body.Percentage) {
          res.body.Percentage.should.be.an("Array");
          res.body.Percentage.length.should.not.eql(0);
          res.body.Percentage[0].should.be.an("Array");
        }
      }).catch(function (err) {
        return Promise.reject(err);
      });
  });
});



describe('/POST get Stage Transistion Graph', () => {
  it('it should Get get Stage Transistion Graph data', () => {
    encodedObject = commonFunction.encodeToBase64({
      date: "2018-10-22 15:13:52"
    });
    return chai.request(server)
      .get('/api/lead/stageTransistionGraph/'+encodedObject)
      .set({
        Authorization: token
      })
      .then((res) => {
        res.should.have.status(200)
        res.body.should.have.property("Percentage");
        if (res.body.Percentage) {
          res.body.Percentage.should.be.an("Array");
          res.body.Percentage.length.should.not.eql(0);
          res.body.Percentage[0].should.be.an("Array");
        }
      }).catch(function (err) {
        return Promise.reject(err);
      });
  });
});


describe('/GET get check cron job function', () => {
  it('it should check cron job function', async () => {
    let res = await cronJob.storeDailyRecords();
    return res.success.should.be.eql(true);
  });
});


describe('/POST get lead precentage calcultaion', () => {
  it('Get lost lead precentage calcultaion exculded unqualified lead', () => {
    return chai.request(server)
      .get('/api/lead/lostLeadPercentage')
      .set({
        Authorization: token
      })
      .then((res) => {
        let percentage = ((5 / 20) * 100).toFixed(2);
        res.should.have.status(200)
        res.body.success.should.be.eql(true);
        if (res.body.percentage) {
          res.body.percentage.should.be.eql(percentage);
        };
      }).catch(function (err) {
        return Promise.reject(err);
      });
  });
});