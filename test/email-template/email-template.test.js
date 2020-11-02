const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const faker = require('faker');
// const { encrypt, decrypt } = require('../../services/commonFunction');

// const EmailTemplates = require('../../models').email_templates;
const should = chai.should();
const commonFunction = require('../commonFunction');
const server = require('../../app');
const generatedSampleData = require('../sampleData');
const db = require('../../models');
const ImageLogs = db.image_logs;
let email_templates, user, token, loggedInUser, customEmailTemplateId, defaultEmailTemplateId, filePath;

chai.use(chaiHttp);
const templateUpdatedData = {
  "newEmailName": "updated template",
  "emailOptions": {
    "paddingTop": "10",
    "paddingRight": "10",
    "paddingBottom": "10",
    "paddingLeft": "10",
    "backgroundColor": "#273142",
    "font": {
      "family": "Tahoma, Geneva, sans-serif",
      "size": 16,
      "weight": "normal",
      "color": "#4d4d4d"
    },
    "direction": "ltr",
    "width": 600
  },
  "elements": [
    {
      "type": "divider",
      "defaults": {
        "padding": [
          "15",
          "15",
          "15",
          "15"
        ],
        "backgroundColor": "#ffffff",
        "border": {
          "size": 1,
          "style": "solid",
          "color": "#DADFE1"
        },
        "compiledHtmlString": "<ripple-divider _nghost-c21=\"\" style=\"background-color: rgb(255, 255, 255); padding: 15px; display: block;\"><div _ngcontent-c21=\"\" style=\"border: 1px solid rgb(218, 223, 225); border-radius: 0px;\"></div></ripple-divider>"
      },
      "id": "id1556197499351RAND32322"
    },
    {
      "type": "rawHtml",
      "defaults": {
        "html": ""
      },
      "id": "id1556197499352RAND80698"
    }
  ]
}

describe('Email-template Test-cases', () => {
  afterEach(() => {
    let key;
    for (key in this) {
      delete this[key];
    };
  });

  before((done) => { // Before each test we empty the database
    commonFunction.sequalizedDb(['users', 'user_roles', 'permission_sets', 'email_templates', 'image_logs'])
      .then(() => {
        email_templates = [];
        email_templates[0] = generatedSampleData.createdSampleData("email_templates", 1,
          { "type": "custom" });
        email_templates[1] = generatedSampleData.createdSampleData("email_templates", 1,
          { "type": "default" });

        const role = generatedSampleData.createdSampleData("user_roles", 1);
        const permission = generatedSampleData.createdSampleData("permission_sets", 1);
        user = generatedSampleData.createdSampleData("users", 1)[0];

        commonFunction.addDataToTable("user_roles", role[0])
          .then((role_data) => {
            user.role_id = role_data.id;
            commonFunction.addDataToTable("permission_sets", permission[0])
              .then((permission_data) => {
                user.permission_set_id = permission_data.id;
                commonFunction.addDataToTable("users", user)
                  .then((userData) => {
                    done();
                  });
              });
          });

      });
  });

  it('it should able to login user with the credentials', () => {
    return chai
      .request(server)
      .post('/api/users/login')
      .send(user)
      .then((response) => {
        response.should.have.status(200);
        response.body.should.be.a('object');
        response.body.token.should.be.a('string');
        token = response.body.token;
        loggedInUser = response.body.user;
        response.body.user.should.be.a('object');
        response.body.user.first_name.should.be.eql(user.first_name);
        response.body.user.last_name.should.be.eql(user.last_name);
        response.body.user.email.should.be.eql(user.email);
      })
      .catch(function (err) {
        return Promise.reject(err);
      });
  });


  // Email-template create route
  describe('create template', () => {

    it('it should not POST and not able to create a custom email-template without token', () => {
      return chai
        .request(server)
        .post('/api/template/create')
        .send(email_templates[0][0])
        .then((response) => {
          response.should.have.status(401);
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

    it('it should not POST and not able to create a default email-template without token', () => {
      return chai
        .request(server)
        .post('/api/template/create')
        .send(email_templates[1][0])
        .then((response) => {
          response.should.have.status(401);
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

    it('it should be able to create a custom email-template with a template object', () => {
      return chai
        .request(server)
        .post('/api/template/create')
        .set({ Authorization: token })
        .send(email_templates[0][0])
        .then((response) => {
          customEmailTemplateId = response.body.data.id;
          response.should.have.status(201);
          response.body.should.be.a('object');
          response.body.success.should.be.eql(true);
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

    it('it should be able to create a default email-template with a template object', () => {
      return chai
        .request(server)
        .post('/api/template/create')
        .set({ Authorization: token })
        .send(email_templates[1][0])
        .then((response) => {
          defaultEmailTemplateId = response.body.data.id;
          response.should.have.status(201);
          response.body.should.be.a('object');
          response.body.success.should.be.eql(true);
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

    it('it should not able to create an email-template with an empty template object', () => {
      const emailTemplate = Object.assign({}, email_templates[0][0]);
      emailTemplate.template = {};

      return chai.request(server)
        .post('/api/template/create')
        .set({ Authorization: token })
        .send(emailTemplate)
        .then((response) => {
          response.should.have.status(422);
          response.body.success.should.be.eql(false);
          response.body.message.should.be.eql('template data not valid');
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

  });


  // Email-template fetch by ID route
  describe('fetch template by ID', () => {

    it('it should not GET and not able to fetch email-template with template id but without token', () => {
      return chai
        .request(server)
        .get(`/api/templates/${customEmailTemplateId}`)
        .then((response) => {
          response.should.have.status(401);
        })
        .catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should GET and able to fetch email-template with token and template id', () => {
      return chai
        .request(server)
        .get(`/api/template/${customEmailTemplateId}`)
        .set({ Authorization: token })
        .then((response) => {
          console.log('223--response--', response.body);

          response.should.have.status(200);
          response.body.should.be.a('object');
          response.body.data.should.be.a('object');
          response.body.success.should.be.eql(true);
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

    it('it should not GET and not able to fetch email-template with token and invalid template id', () => {
      return chai
        .request(server)
        .get(`/api/template/${faker.random.number()}`)
        .set({ Authorization: token })
        .then((response) => {
          console.log('238--response--', response.body);
          // { data: null, success: true }
          // @TODO
          // response.body.data.should.be.eql(null);
          response.body.success.should.be.eql(true);
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

  });


  // Email-template fetch by type route
  describe('fetch template by type', () => {

    it('it should not GET and not able to fetch email-template with custom type but without token', () => {
      return chai
        .request(server)
        .get('/api/templates/custom')
        .then((response) => {
          response.should.have.status(401);
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

    it('it should GET and able to fetch email-template with custom type and with token', () => {
      return chai
        .request(server)
        .get('/api/templates/custom')
        .set({ Authorization: token })
        .then((response) => {
          response.should.have.status(200);
          response.body.should.be.a('object');
          response.body.data.should.be.a('array');
          response.body.success.should.be.eql(true);
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

    it('it should not GET and not able to fetch email-template with default type but without token', () => {
      return chai
        .request(server)
        .get('/api/templates/default')
        .then((response) => {
          response.should.have.status(401)
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

    it('it should GET and able to fetch email-template with default type and with token', () => {
      return chai
        .request(server)
        .get('/api/templates/default')
        .set({ Authorization: token })
        .then((response) => {
          response.should.have.status(200);
          response.body.should.be.a('object');
          response.body.data.should.be.a('array');
          response.body.success.should.be.eql(true);
        }).catch((err) => {
          return Promise.reject(err);
        });
    });
  });


  // Email-template update route
  describe('update template', () => {
    it('it should not be able to update the email-template with template id but without token', () => {
      return chai
        .request(server)
        .put(`/api/template/${customEmailTemplateId}`)
        .then((response) => {
          response.should.have.status(401);
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

    it('it should not be able to update the email-template without template object and with id and token', () => {
      const emailTemplateToUpdate = Object.assign({}, email_templates[0][0]);
      emailTemplateToUpdate.template = {};

      return chai
        .request(server)
        .put(`/api/template/${customEmailTemplateId}`)
        .send(emailTemplateToUpdate)
        .set({ Authorization: token })
        .then((response) => {
          response.should.have.status(422);
          response.body.success.should.be.eql(false);
          response.body.message.should.be.eql('template data not valid');
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

    it('it should be able to update the custom email-template without template object and with id and token', () => {
      const customEmailTemplateToUpdate = Object.assign({}, email_templates[0][0]);
      customEmailTemplateToUpdate.template = templateUpdatedData;

      return chai
        .request(server)
        .put(`/api/template/${customEmailTemplateId}`)
        .send(customEmailTemplateToUpdate)
        .set({ Authorization: token })
        .then((response) => {
          // { data: [ 1 ], success: true }
          response.should.have.status(200);
          response.body.data.should.be.eql([1]);
          response.body.success.should.be.eql(true);
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

    it('it should be able to update the default email-template without template object and with id and token', () => {
      const defaultEmailTemplateToUpdate = Object.assign({}, email_templates[0][0]);
      defaultEmailTemplateToUpdate.template = templateUpdatedData;

      return chai
        .request(server)
        .put(`/api/template/${defaultEmailTemplateId}`)
        .send(defaultEmailTemplateToUpdate)
        .set({ Authorization: token })
        .then((response) => {
          // { data: [ 1 ], success: true }
          response.should.have.status(200);
          response.body.data.should.be.eql([1]);
          response.body.success.should.be.eql(true);
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

  });

  // Email-template uploadImage route
  describe('uploadImage route', () => {

    // it('it should not able to upload image without token', () => {
    //   return chai
    //     .request(server)
    //     .post('/api/template/upload/image')
    //     .field({"dimensions":"35,40"})
    //     .attach('image', 'test/test-image/Googlelogo.png')
    //     .then((response) => {
    //       response.should.have.status(401);
    //     }).catch((err) => {
    //       return Promise.reject(err);
    //     });
    // });

    it('it should be able to upload image with token', () => {
      return chai
        .request(server)
        .post('/api/template/upload/image')
        .set({ Authorization: token })
        .field({"dimensions":"35,40"})
        .attach('image', 'test/test-image/Googlelogo.png')
        .then((response) => {
          filePath = response.body.data.key;
          response.body.success.should.be.eql(true);
          response.body.data.should.be.a('object');
        }).catch((err) => {
          return Promise.reject(err);
        });
    });
  });

  // Email-template upload image update
  describe('upload image update route', () => {

    beforeEach((done) => {
      function getYesterdaysDate() {
        var date = new Date();
        date.setDate(date.getDate() - 1);
        return date;
      }
      // console.log('440--getYesterdaysDate()--', getYesterdaysDate());
      ImageLogs.update(
        {
          created_at: getYesterdaysDate()
        },
        {
          where: { path: filePath }
        })
        .then(() => {
          done();
        })
        .catch(err => {
          // console.log('436--err--', err);
          return Promise.reject(err);
        });
    });

    it('it should be able to upload an image again with token', () => {
      return chai
        .request(server)
        .post('/api/template/upload/image')
        .set({ Authorization: token })
        .field({"dimensions":"35,40"})
        .attach('image', 'test/test-image/Googlelogo.png')
        .then((response) => {
          // console.log('448--response.body--', response.body);
          filePath = response.body.data.key;
          response.body.success.should.be.eql(true);
          response.body.data.should.be.a('object');
        }).catch((err) => {
          return Promise.reject(err);
        });
    });
  });

  // Email-template delete route
  describe('delete template', () => {

    it('it should not able to delete the email-template with template id but without token', () => {
      return chai
        .request(server)
        .delete(`/api/template/${customEmailTemplateId}`)
        .then((response) => {
          response.should.have.status(401);
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

    it('it should be able to delete the custom email-template with template id and with token', () => {
      return chai
        .request(server)
        .delete(`/api/template/${customEmailTemplateId}`)
        .set({ Authorization: token })
        .then((response) => {
          response.should.have.status(200);
          expect(+response.body.id).to.equal(customEmailTemplateId);
          response.body.success.should.be.eql(true);
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

    it('it should be able to delete the default email-template with template id and with token', () => {
      return chai
        .request(server)
        .delete(`/api/template/${defaultEmailTemplateId}`)
        .set({ Authorization: token })
        .then((response) => {
          response.should.have.status(200);
          expect(+response.body.id).to.equal(defaultEmailTemplateId);
          response.body.success.should.be.eql(true);
        }).catch((err) => {
          return Promise.reject(err);
        });
    });

    it('it should not be able to delete the email-template with invalid template id and with token', () => {
      return chai
        .request(server)
        .delete(`/api/template/${faker.random.number()}`)
        .set({ Authorization: token })
        .then((response) => {
          response.should.have.status(404);
          response.body.success.should.be.eql(false);
          response.body.message.should.be.eql('Template not found');
        }).catch((err) => {
          return Promise.reject(err);
        });
    });
  });

  after((done) => {
    done();
  });

});
