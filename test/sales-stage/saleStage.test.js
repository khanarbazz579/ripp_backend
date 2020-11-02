/**
 * Created by cis on 27/8/18.
 */
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');

chai.use(chaiHttp);
const modelName = 'sales_stages';
let loggedInUser, data, token, user;

afterEach(() => {
  let key;
  for (key in this) {
    delete this[key];
  };
});

describe('SALES Stages', () => {
  
  describe('login', () => {
    afterEach(() => {
      let key;
      for (key in this) {
        delete this[key];
      };
    });
    before((done) => { //Before each test we empty the database
      commonFunction.sequalizedDb(['sales_stage_transitions', 'lost_lead_fields', 'sales_stage_counters','company_details', 'companies', 'contact_details', 'contacts', 'form_default_fields', 'lead_client_details', 'custom_fields', 'sections', 'leads_clients', 'sales_stages', 'users', 'permission_sets', 'user_roles']).then(() => {
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

  describe('/POST sales Stages', () => {
    before((done) => { //Before each test we empty the database
      data = generatedSampleData.createdSampleData(modelName, 1)[0];
      done();
    });

    it('it should not POST a Sales Stages without Authorization', () => {
      return chai.request(server)
        .post('/api/saleStage')
        .send(data)
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/POST sales Stages', () => {
    before((done) => { //Before each test we empty the database
      commonFunction.clearTable(modelName);
      done();
    });
    it('It should get Sales Stages array of length zero form blank database', () => {
      return chai.request(server)
        .get('/api/saleStage/1')
        .set({ Authorization: token })
        .then((res) => {
          res.should.have.status(200);
          res.body.success.should.be.eql(true);
          res.body.stages.should.be.a('array');
          res.body.stages.length.should.be.eql(0);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/POST sales Stages', () => {
    it('it should not POST a Sales Stages without content', () => {
      return chai.request(server)
        .post('/api/saleStage')
        .set({ Authorization: token })
        .send({})
        .then((res) => {
          res.should.have.status(204);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

  });

  describe('/POST sales Stages', () => {
    it('it should  POST a Sales Stages with authorization', () => {
      return chai.request(server)
        .post('/api/saleStage')
        .send({ data })
        .set({ Authorization: token })
        .then((res) => {
          res.should.have.status(201);
          res.body.success.should.be.eql(true);
          res.body.should.be.a('object');
          const stage = res.body.stage;
          stage.should.have.property('id');
          stage.should.have.property('description');
          stage.should.have.property('name');
          stage.should.have.property('created_at');
          stage.should.have.property('updated_at');
          stage.should.have.property('close_probability');
          stage.should.have.property('default_id');
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });


  describe('/GET sales Stages', () => {
    it('it should not get any Sales stage in without access token', () => {
      return chai.request(server)
        .get('/api/saleStage/1')
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/GET sales Stages', () => {
    it('it should get Sales stage array form created Sales stage', () => {
      return chai.request(server)
        .get('/api/saleStage/1')
        .set({ Authorization: token })
        .then((res) => {
          res.should.have.status(200);
          res.body.success.should.be.eql(true);
          res.body.pipeline.should.be.a('array');
          // data.id = res.body.pipeline[0].id;
          // res.body.pipeline.length.should.not.eql(0);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/PUT sales Stages', () => {
    it('It should update saleStage with Sales satage Id', () => {
      return chai.request(server)
        .put('/api/saleStage/' + data.id)
        .send(data)
        .set({ Authorization: token })
        .then((res) => {
          res.should.have.status(200);
          res.body.success.should.be.eql(true);
          res.body.stage.should.be.a('object');
          res.body.stage.id.should.be.eql(data.id);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/PUT sales Stages', () => {
    it('It should not update saleStage without saleStage Id', () => {
      return chai.request(server)
        .put('/api/saleStage/' + data.id)
        .send(data)
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });
  describe('/PUT sales Stage  sales stage is checked status without authorization', () => {
    it('It should not update  sales stage is checked status without authorization', () => {
      return chai.request(server)
        .post('/api/saleStage/setCheckStatus')
        .send({})
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });
  
  describe('/PUT sales Stages is check status without required fields', () => {
    it('It should not create sales stage is checked status in stage checked table', () => {
      const checkedInfo = {
       stage_id : data.id
      }
      return chai.request(server)
        .post('/api/saleStage/setCheckStatus')
        .send(checkedInfo)
        .set({ Authorization: token })
        .then((res) => {
          res.should.have.status(422);
          res.body.success.should.be.eql(false);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/PUT sales Stages is check status', () => {
    it('It should create sales stage is checked status in stage checked table', () => {
      const checkedInfo = {
       stage_id : data.id,
       type : '1',
       is_checked : false
      }
      return chai.request(server)
        .post('/api/saleStage/setCheckStatus')
        .send(checkedInfo)
        .set({ Authorization: token })
        .then((res) => {
          res.should.have.status(201);
          res.body.success.should.be.eql(true);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/PUT update sales Stages is check status', () => {
    it('It should Update sales stage is checked status in stage checked table', () => {
      const checkedInfo = {
       stage_id : data.id,
       type : '1',
       is_checked : true
      }
      return chai.request(server)
        .post('/api/saleStage/setCheckStatus')
        .send(checkedInfo)
        .set({ Authorization: token })
        .then((res) => {
          res.should.have.status(201);
          res.body.success.should.be.eql(true);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });


  describe('/PUT saleStageBulkUpdate', () => {
    it('It should not update saleStage without saleStage Id', () => {
      return chai.request(server)
        .post('/api/saleStage/bulkUpdate')
        .send(data)
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/PUT saleStage Bulk Update', () => {
    it('It should update saleStage with Sales satage Id', () => {
      return chai.request(server)
        .post('/api/saleStage/bulkUpdate')
        .send([data])
        .set({ Authorization: token })
        .then((res) => {
          res.should.have.status(201);
          res.body.success.should.be.eql(true);
          res.body.should.have.property("stage");
          res.body.should.have.property("message");
          res.body.stage.should.be.a('Array');
          res.body.message.should.be.eql('Sales Stage updated successfully.');
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/DELETE sales Stages', () => {
    it('it should not delete a saleStage without access token', () => {
      return chai.request(server)
        .delete('/api/saleStage/' + data.id)
        .send()
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/DELETE sales Stages', () => {
    it('it should delete a saleStage with and saleStage Id and access token', () => {
      return chai.request(server)
        .delete('/api/saleStage/' + data.id)
        .send()
        .set({ Authorization: token })
        .then((res) => {
          res.should.have.status(200);
          res.body.success.should.be.eql(true);
          res.body.stage_id.should.be.a('string');
          res.body.stage_id.should.be.eql(data.id.toString());
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

});
