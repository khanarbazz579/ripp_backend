const chai = require('chai');
const chaiHttp = require('chai-http');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const server = require('../../app');

const seed = require('../../seeders/20190614060501-permissions');
const models = require('../../models');

const should = chai.should();
const expect = chai.expect;

let loggedInUser, token, user, permission_set, permissions, adminRole, defaultRole;

chai.use(chaiHttp);

let tables = [
  'notes',
  'sales_stage_transitions',
  'lost_lead_fields',
  'sales_stage_counters',
  'company_details',
  'companies',
  'contact_details',
  'contacts',
  'form_default_fields',
  'lead_client_details',
  'leads_clients',
  'sales_stages',
  'user_has_permissions',
  'user_has_permission_sets',
  'permission_sets_has_permissions',
  'permission',
  'permission_sets',
  "notifications",
  'user_details',
  'supplier_details',
  'suppliers',
  'custom_fields',
  'sections',
  'users',
  "user_roles"
];

describe('Permissions Access', () => {

  let req, res, next;

  before((done) => {
    commonFunction.sequalizedDb(tables)
      .then(() => {
        role = generatedSampleData.createdSampleData("user_roles", 1);
        permission = generatedSampleData.createdSampleData("permission_sets", 1);
        user = generatedSampleData.createdSampleData("users", 2);
        user[0].email = 'ripple.cis2018@gmail.com';

        return commonFunction.addDataToTable("user_roles", role[0])
          .then((role_data) => {
            adminRole = role_data;
            user[1].role_id = role_data.id;
            return commonFunction.addDataToTable("user_roles", role[1])
          })
          .then((role_data) => {
            defaultRole = role_data;
            user[0].role_id = role_data.id;
            permission[0].created_by = 1;
            return commonFunction.addDataToTable("permission_sets", permission[0])
          })
          .then((permission_data) => {
            permission_set = permission_data;
            user[0].permission_set_id = permission_data.id;
            user[1].permission_set_id = permission_data.id;
            return commonFunction.addDataToTable("users", user[0])
          })
          .then((data) => {

            user[0].id = data.id;
            return commonFunction.addDataToTable("users", user[1])
          })
          .then((data) => {
            user[1].id = data.id;
            return commonFunction.addDataToTable('user_has_permission_sets', {
              user_id: user[0].id,
              permission_set_id: user[1].permission_set_id
            });

          })
          .then(() => {
            seed.up(models.sequelize.queryInterface, models.Sequelize);
            done();
          })
          .catch(err => {
            console.log(err)
          })
      })
  });

  it('it should be login user with token and credential', () => {
    return chai.request(server)
      .post('/api/users/login')
      .send(user[0])
      .then((res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.token.should.be.a('string');
        token = { Authorization: res.body.token };
        loggedInUser = res.body.user;
        res.body.user.should.be.a('object');
        res.body.user.first_name.should.be.eql(user[0].first_name);
        res.body.user.last_name.should.be.eql(user[0].last_name);
        res.body.user.email.should.be.eql(user[0].email);
      })
      .catch(function (err) {
        return Promise.reject(err);
      });
  });

  it('Should not have access to admin routes', () => {
    return chai.request(server)
      .get('/api/permissions/sets?')
      .set(token)
      .then((res) => {
        res.should.have.status(403);
        res.body.should.be.a('object');
        res.body.message.should.be.a('string');
        res.body.status.should.be.eql(false);
        res.body.message.should.be.eql('Unauthorized access: You do not have required role access!');
      })
      .catch(function (err) {
        return Promise.reject(err);
      });
  });

  // it('Should throw error when passing invalid permission name', async () => {

  //   await models.permission.destroy({
  //     where: {
  //       permission: seed.structure['activities']['calls'] ? 'calls' : ''
  //     }
  //   });

  //   return chai.request(server)
  //     .get('/api/tasks/1')
  //     .set(token)
  //     .then((res) => {
  //       res.should.have.status(403);
  //       res.body.should.be.a('object');
  //       res.body.status.should.be.eql(false);
  //       res.body.message.message.should.be.eql('Error: Invalid permissions!');
  //     })
  //     .catch(function (err) {
  //       return Promise.reject(err);
  //     });

  // })


  it('Should have access to admin routes', async () => {
    await models.users.update({
      role_id: adminRole.id
    }, {
        where: { id: loggedInUser.id }
      })

    return chai.request(server)
      .get('/api/permissions/sets?')
      .set(token)
      .then((res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.payload.should.be.a('array');
        res.body.status.should.be.eql(true);
      })
      .catch(function (err) {
        return Promise.reject(err);
      });
  });

  it('Should throw error when not logged in', async () => {
    await models.users.update({
      role_id: adminRole.id
    }, {
        where: { id: loggedInUser.id }
      })

    return chai.request(server)
      .get('/api/permissions/sets?')
      .then((res) => {
        res.should.have.status(401);
        res.error.text.should.be.eql('Unauthorized');
      })
      .catch(function (err) {
        return Promise.reject(err);
      });
  });

  // it('Should not pass multiple permissions applied on a route', async () => {

  //   await models.users.update({
  //     role_id: defaultRole.id
  //   }, {
  //       where: { id: loggedInUser.id }
  //     })

  //   let task = generatedSampleData.createdSampleData("tasks", 1);
  //   task[0].user_id = loggedInUser.id;
  //   task[0].contact_id = 1;
  //   task[0].reminder = 10;
  //   return chai.request(server)
  //     .post('/api/tasks')
  //     .set(token)
  //     .send(task[0])
  //     .then((res) => {
  //       res.should.have.status(403);
  //       res.body.should.be.a('object');
  //       res.body.message.should.be.a('string');
  //       res.body.status.should.be.eql(false);
  //       res.body.message.should.be.eql('Unauthorized access: You do not have required permissions!');
  //     }).catch(function (err) {
  //       return Promise.reject(err);
  //     });
  // });

  it('Should pass multiple permissions applied on a route', async () => {

    let permissions = await models.permission.findAll({
      where: {
        permission: { $in: ['calls', 'add call'] }
      },
      raw: true
    });

    for (let i = 0; i < permissions.length; i++) {
      await models.user_has_permissions.create({
        user_id: loggedInUser.id,
        permission_id: permissions[i].id
      })
    }

    let task = generatedSampleData.createdSampleData("tasks", 1);
    task[0].user_id = loggedInUser.id;
    task[0].contact_id = 1;
    task[0].reminder = 10;
    return chai.request(server)
      .post('/api/tasks')
      .set(token)
      .send(task[0])
      .then((res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.success.should.be.eql(true);
        res.body.message.should.be.eql('Task created successfully.');
        res.body.task.should.be.a('object');
        res.body.task.user_id.should.be.eql(task[0].user_id);
        res.body.task.contact_id.should.be.eql(task[0].contact_id);
        res.body.task.reason_for_call.should.be.eql(task[0].reason_for_call);
        res.body.task.task_type.should.be.eql(task[0].task_type);
      }).catch(function (err) {
        return Promise.reject(err);
      });
  });

  // it('Should pass single permissions applied on a route', () => {
  //   return chai.request(server)
  //     .post('/api/allTasks')
  //     .set(token)
  //     .then((res) => {
  //       res.should.have.status(422);
  //       res.body.should.be.a('object');
  //       res.body.success.should.be.eql(false);
  //       res.body.message.should.be.eql('It should have requested type.')
  //     }).catch(function (err) {
  //       return Promise.reject(err);
  //     });
  // })

  after((done) => {
    commonFunction.sequalizedDb(tables)
      .then(() => {
        done();
      })
  })
});