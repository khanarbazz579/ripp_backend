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

let loggedInUser, token, user, data;

describe('DEFAULT_FORM_FIELDS', () => {

  describe('login', () => {
    afterEach(() => {
      let key;
      for (key in this) {
        delete this[key];
      };
    });
    before((done) => { //Before each test we empty the database
      commonFunction.sequalizedDb(['company_details','contact_details','lead_client_details',"custom_fields",'sections','users', 'form_default_fields', 'user_roles']).then(() => {
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

  describe('/POST DEFAULT_FORM_FIELDS', () => {
    data = {
      name: "DEFAULT_FORM_FIELDS",
      model_name: "first_name",
      item_type: '1',
      custom_field_id: 1
    };
    it('it should not POST a DEFAULT_FORM_FIELDS defaultFields without Authorization', () => {
      return chai.request(server)
        .post('/api/defaultFields')
        .send(data)
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/GET DEFAULT_FORM_FIELDS', () => {
    it('It should get defaultFields array of length zero form default database', () => {
      return chai.request(server)
        .get('/api/defaultFields')
        .set({
          Authorization: token
        })
        .then((res) => {
          res.should.have.status(200);
          res.body.success.should.be.eql(true);
          res.body.defaultFields.should.be.a('array');
          res.body.defaultFields.length.should.be.eql(0);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/POST DEFAULT_FORM_FIELDS', () => {
    before((done) => {
      const sections = generatedSampleData.createdSampleData('sections', 1);
      const customField = generatedSampleData.createdSampleData('custom_fields', 1);
      commonFunction.addDataToTable("sections", sections[0]).then((Sdata) => {
        customField[0].section_id = Sdata.id;
        commonFunction.addDataToTable("custom_fields", customField[0]).then((customField_data) => {
          data.custom_field_id = customField_data.id;
          done();
        })
      })
    });

    it('it should not POST a defaultFields without content', () => {
      return chai.request(server)
        .post('/api/defaultFields')
        .set({
          Authorization: token
        })
        .send({})
        .then((res) => {
          res.should.have.status(204);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should  POST a DefaultFields with authorization', () => {
      return chai.request(server)
        .post('/api/defaultFields')
        .send({
          data
        })
        .set({
          Authorization: token
        })
        .then((res) => {
          res.should.have.status(201);
          res.body.success.should.be.eql(true);
          res.body.should.be.a('object');
          const defaultFields = res.body.defaultFields;
          defaultFields.should.have.property('id');
          defaultFields.should.have.property('is_required');
          defaultFields.should.have.property('name');
          defaultFields.should.have.property('created_at');
          defaultFields.should.have.property('updated_at');
          defaultFields.should.have.property('custom_field_id');
          defaultFields.should.have.property('model_name');
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  })

  describe('/GET DEFAULT _FORM_ FIELDS', () => {
    it('it should not get any DefaultFields in without access token', () => {
      return chai.request(server)
        .get('/api/defaultFields')
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should get formDefaultFields array form created formDefaultFields', () => {
      return chai.request(server)
        .get('/api/defaultFields')
        .set({
          Authorization: token
        })
        .then((res) => {
          res.should.have.status(200);
          res.body.success.should.be.eql(true);
          res.body.defaultFields.should.be.a('array');
          data.id = res.body.defaultFields[0].id;
          res.body.defaultFields.length.should.not.eql(0);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should get formDefaultFields of lead type array form created formDefaultFields', () => {
      return chai.request(server)
        .get('/api/defaultFields/1')
        .set({
          Authorization: token
        })
        .then((res) => {
          res.should.have.status(200);
          res.body.success.should.be.eql(true);
          res.body.defaultFields.should.be.a('array');
          data.id = res.body.defaultFields[0].id;
          res.body.defaultFields.length.should.not.eql(0);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should get formDefaultFields and extra custom fields in the fields of lead type', () => {
      return chai.request(server)
        .get('/api/defaultFields/extraCustomFields/1')
        .set({
          Authorization: token
        })
        .then((res) => {
          res.should.have.status(200);
          res.body.success.should.be.eql(true);
          res.body.should.have.property('defaultFields');
          res.body.should.have.property('extraField');
          res.body.defaultFields.should.be.a('array');
          res.body.extraField.should.be.a('array');
          data.id = res.body.defaultFields[0].id;
          res.body.defaultFields.length.should.not.eql(0);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/PUT DEFAULT_FORM_FIELDS', () => {
    it('It should update DefaultFields with leadDefaultFields  Id', () => {
      return chai.request(server)
        .put('/api/defaultFields/' + data.id)
        .send(data)
        .set({
          Authorization: token
        })
        .then((res) => {
          console.log("===============================================",res.body)
          res.should.have.status(201);
          res.body.success.should.be.eql(true);
          res.body.defaultFields.should.be.a('object');
          res.body.defaultFields.id.should.be.eql(data.id);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('It should bulk update DefaultFields without leadDefaultFields  Id', () => {
      return chai.request(server)
        .post('/api/defaultFields/bulkUpdate')
        .send([data])
        .set({
          Authorization: token
        })
        .then((res) => {
          res.should.have.status(201);
          res.body.success.should.be.eql(true);
          res.body.should.have.property("data");
          res.body.should.have.property("message");
          res.body.message.should.be.a('String');
          res.body.data.should.be.a('Array');
          res.body.message.should.be.eql('updated successfully.');
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('It should not update fromDefaultFields without formDefaultFields Id', () => {
      return chai.request(server)
        .put('/api/defaultFields/' + data.id)
        .send(data)
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  })

  describe('/DELETE DEFAULT_FORM_FIELDS', () => {
    it('it should not delete a fromDefaultFields without access token', () => {
      return chai.request(server)
        .delete('/api/defaultFields/' + data.id)
        .send()
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should delete a formDefaultFields with and formDefaultFields Id and access token', () => {
      return chai.request(server)
        .delete('/api/defaultFields/' + data.id)
        .send()
        .set({
          Authorization: token
        })
        .then((res) => {
          res.should.have.status(200);
          res.body.success.should.be.eql(true);
          res.body.DefaultFields.should.be.a('string');
          res.body.DefaultFields.should.be.eql(data.id.toString());
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

});