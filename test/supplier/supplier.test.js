const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
chai.use(chaiHttp);
const modelName = 'suppliers';
let loggedInUser, token, user;
let supplierData, _id, supplierDetailBody, supplierAdditionalBody,encodedObject;

describe('Suppliers', () => {
  describe('login', () => {
    afterEach(() => {
      let key;
      for (key in this) {
        delete this[key];
      };
    });
    // before((done) => { //Before each test we empty the database
    //   commonFunction.sequalizedDb([`user_details`,'users', 'suppliers', "user_roles", "permission_sets"]).then(() => {
    //     commonFunction.addDataToTable("user_roles", 1).then((data) => {
    //         roleBody = data
    //         permissionSet = generatedSampleData.createdSampleData("permission_sets", 1);
    //         commonFunction.addDataToTable("permission_sets", permissionSet[0]).then((data) => {
    //             setBody = data;
    //             user = generatedSampleData.createdSampleData("users", 1);
    //             user[0].role_id = roleBody.id;
    //             user[0].permission_set_id = setBody.id;
    //             commonFunction.addDataToTable("users", user[0]).then((data) => {
    //                 userBody = data;
    //                 // user = generatedSampleData.createdSampleData("users", 1);
    //                 supplierData = generatedSampleData.createdSampleData("supplier", 5);
    //                 console.log("SUPPLIER DATA ------------>",supplierData); 
    //                 // commonFunction.addDataToTable("users", user[0]).then((data) => {
    //                   done();
    //                 });
    //               });
    //             });
    //         })
    //     })  
    
    before((done) => { //Before each test we empty the database
        commonFunction.sequalizedDb(['user_details','notes','contact_details', 'contacts','suppliers','supplier_details', 'form_default_fields', 'custom_fields', 'sections', 'users', 'permission_sets', 'user_roles']).then(() => {
          const role = generatedSampleData.createdSampleData("user_roles", 1);
          const permission = generatedSampleData.createdSampleData("permission_sets", 1);
          user = generatedSampleData.createdSampleData("users", 1)[0]  
          commonFunction.addDataToTable("user_roles", role[0]).then((role_data) => {
            user.role_id = role_data.id
            commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_data) => {
              user.permission_set_id = permission_data.id;
              commonFunction.addDataToTable("users", user).then((data) => {
                  supplierData = generatedSampleData.createdSampleData("suppliers", 5);
                  commonFunction.addDataToTable("suppliers", supplierData[0]).then((data) => {
                    supplierBody = data;
                    contacts = generatedSampleData.createdSampleData("contacts", 1);
                    contacts[0].entity_id = supplierBody.id;
                    contacts[0].entity_type = "SUPPLIER";
                    commonFunction.addDataToTable("contacts", contacts[0]).then((data) => {
                        contactBody = data;
                        section = generatedSampleData.createdSampleData("sections", 1);
                        commonFunction.addDataToTable("sections", section[0]).then((data) => {
                            sectionBody  = data;
                            customField = generatedSampleData.createdSampleData("custom_fields", 1);
                            customField[0].section_id = sectionBody.id;
                            commonFunction.addDataToTable("custom_fields", customField[0]).then((data) => {
                                customFieldBody = data;
                                done();
                            });
                        });
                    })
                });
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



  describe('/POST suppliers', () => {
      
    it('it should not POST a supplier without Authorization', () => {
      return chai.request(server)
        .post('/api/supplier')
        .send(supplierData[0])
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    
    it('it should not POST a supplier without valid supplier data', () => {
        return chai.request(server)
          .post('/api/supplier')
          .set({
            Authorization: token
          })
          .send()
          .then((res) => {
            res.should.have.status(422);
          }).catch(function (err) {
            return Promise.reject(err);
          });
      });
  });

  describe('/POST supplier', () => {
    it('it should POST a supplier', () => {
      return chai.request(server)
        .post('/api/supplier')
        .set({
          Authorization: token
        }).send(supplierData[0])
        .then((res) => {
          if (res) {
            res.should.have.status(201)
            res.body.success.should.be.eql(true);
            res.body.should.be.a('object');
            const data = res.body.data;
            _id = data.id;
            data.should.have.property('id');
            data.should.have.property('created_at');
            data.should.have.property('updated_at');
          }
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/GET supplier count', () => {
    it('it should not POST a supplier count without Authorization', () => {
      return chai.request(server)
        .get('/api/supplier')
        .send()
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should get supplier count one', () => {
      return chai.request(server)
        .get('/api/supplier/count')
        .set({
          Authorization: token
        }).send(supplierData[0])
        .then((res) => {
          if (res) {
            res.should.have.status(200)
            res.body.success.should.be.eql(true);
            res.body.should.be.a('object');
            const count = res.body.count;
            count.should.be.eql(2);
          }
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });


 
  describe('/GET  supplier', () => {
    it('it should not GET a supplier without valid Authorization', () => {
      return chai.request(server)
        .get('/api/supplier')
        .send()
        .then((res) => {
          res.should.have.status(401);
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
    
    it('it should get  all  suppliers from supplier table', () => {
      return chai.request(server)
        .get('/api/supplier')
        .set({
          Authorization: token
        }).send()
        .then((res) => {
          if (res) {
            res.should.have.status(200)
            res.body.success.should.be.eql(true);
            res.body.should.be.a('object');
            const data = res.body.data[0];
            _id = data.id;
            data.should.have.property('id');
            data.should.have.property('created_at');
            data.should.have.property('updated_at');
            data.should.have.property('contacts');
          }
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should get filtered suppliers from supplier table', () => {
        const filter = {
          saleStageIds: [],
          customFilterIds:[],
          entityType:"SUPPLIER"
      }
      encodedObject = commonFunction.encodeToBase64(filter);
      return chai.request(server)
        .get('/api/supplier/filterData/'+encodedObject)
        .set({
          Authorization: token
        })
        .send(filter)
        .then((res) => {
          if (res) {
            res.should.have.status(200)
            res.body.success.should.be.eql(true);
            res.body.should.be.a('object');
            const data = res.body.data[0];
            _id = data.id;
            data.should.have.property('id');
            data.should.have.property('created_at');
            data.should.have.property('updated_at');
          }
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/POST supplier', () => {
    it('it should POST a supplier on supplier detail', () => {
      return chai.request(server)
        .post('/api/supplier/detail')
        .set({ Authorization: token })
        .field('first_name', "Gourav")
        .field('last_name', "S")
        .field('email', "gourav.s")
        .field('company_name', "My company")
        .then((res) => {
          if (res) {
            res.should.have.status(200)
            res.body.success.should.be.eql(true);
            res.body.should.be.a('object');
            const data = res.body.supplier;
            data.should.have.property('id');
            data.should.have.property('created_at');
            data.should.have.property('updated_at');
            supplierDetailBody = data;
          }
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should UPDATE a supplier on supplier detail', () => {
      return chai.request(server)
        .post('/api/supplier/detail')
        .set({ Authorization: token })
        .field('first_name', "Gourav")
        .field('last_name', "S")
        .field('email', "gourav.s")
        .field('id', supplierDetailBody.id)
        .then((res) => {
          if (res) {
            res.should.have.status(200)
            res.body.success.should.be.eql(true);
            res.body.should.be.a('object');
            res.body.supplier.should.have.property('id');
            res.body.supplier.should.have.property('created_at');
            res.body.supplier.should.have.property('updated_at');
          }
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/POST supplier', () => {

    before((done) => {
      let field = []
      let supplierAdditionalFields = generatedSampleData.createdSampleData("supplier_details", 1);
      supplierAdditionalFields[0].custom_field_id = customFieldBody.id;
      supplierAdditionalFields[0].supplier_id = supplierBody.id;
      supplierAdditionalFields[0].field_id = 1;
      // supplierAdditionalFields[0].lead
      commonFunction.addDataToTable("supplier_details", supplierAdditionalFields[0]).then((data) => {
          supplierAdditionalBody = data;
          supplierAdditionalBody.field_value = "My updated value";
          field.push(supplierAdditionalBody)
          supplierDetailBody.fields = JSON.stringify(field)
          done();
      });
    });

    it('it should POST a supplier with supplier additional detail', () => {
      return chai.request(server)
        .post('/api/supplier/detail')
        .set({ Authorization: token })
        .field('first_name', "Gourav")
        .field('last_name', "S")
        .field('email', "gourav.s")
        .field('company_name', "My company")
        .field('fields', supplierDetailBody.fields)       
        .then((res) => {
          if (res) {
            res.should.have.status(200)
            res.body.success.should.be.eql(true);
            res.body.should.be.a('object');
            const data = res.body.supplier;
            data.should.have.property('id');
            data.should.have.property('created_at');
            data.should.have.property('updated_at');
            // data.fields[0].field_value.should.be.eql(supplierAdditionalBody.field_value)
            let field = [];
            supplierAdditionalBody = data.fields[0]; 
            // supplierAdditionalBody.field_value = "I just updated";;
            field.push(supplierAdditionalBody);
            // supplierDetailBody.fields = JSON.stringify(field);
          }
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });

    it('it should UPDATE a supplier with supplier additional detail', () => {
     
      return chai.request(server)
        .post('/api/supplier/detail')
        .set({ Authorization: token })
        .field('fields', supplierDetailBody.fields)       
        .field('id', supplierDetailBody.id)
        .then((res) => {
          if (res) {
            res.should.have.status(200)
            res.body.success.should.be.eql(true);
            res.body.should.be.a('object');
            // res.body.supplier.fields[0].field_value.should.be.eql(supplierAdditionalBody.field_value)
            // let deleted_id = res.body.supplier.fields[0].id;
            // supplierDetailBody.deleted_field_id = JSON.stringify(deleted_id);
          }
        }).catch(function (err) {
          return Promise.reject(err);
        });
    });
  });

  describe('/DELETE Supplier Additional Fields', () => {
    it('it should DELETE supplier additional fields', () => {
        return chai.request(server)
            .post('/api/supplier/detail')
            .set({ Authorization: token })
            .field('fields', supplierDetailBody.fields)
            // .field('deleted_field_id', supplierDetailBody.deleted_field_id)
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.supplier.should.be.a('object')
                res.body.message.should.be.eql("Supplier Updated Successfully"); 
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
  });

  // describe('/POST Create Supplier Additional Fields', () => {
  //     before((done) => {
  //         supplierAdditionalBody = generatedSampleData.createdSampleData("supplier_details", 1);
  //         done()
  //     });

  //     it('it should POST a supplier additional fields', () => {
  //         return chai.request(server)
  //             .post('/api/supplier/additional')
  //             .set({ Authorization: token })
  //             .send(supplierAdditionalBody[0])
  //             .then((res) => {
  //               console.log("it should POST a supplier additional fields>>>>>>>>>>>>>>>>",res.body);
  //                 res.should.have.status(200);
                  
  //                 res.body.success.should.be.eql(true);
  //                 res.body.supplierAdditionalField.should.be.a('object')
  //                 res.body.supplierAdditionalField.supplier_id.should.be.eql(supplierAdditionalBody[0].supplier_id)
  //                 res.body.supplierAdditionalField.field_value.should.be.eql(supplierAdditionalBody[0].field_value)
  //             }).catch(function (err) {
  //                 return Promise.reject(err.message);
  //             });
  //     });
  // });

  // describe('/PUT Supplier', () => {

  //     before((done) => {
  //         supplierData = generatedSampleData.createdSampleData("suppliers", 1);
  //         commonFunction.addDataToTable("suppliers", supplierData[0]).then((data) => {
  //           supplierData = data;
  //           done();
  //         });
  //     });

  //     it('it should UPDATE Supplier', () => {
  //         return chai.request(server)
  //             .put('/api/supplier/' + supplierData.id)
  //             .set({ Authorization: token })
  //             .send({ 'first_name': 'My name' })
  //             .then( (response) => {
  //                 response.should.have.status(200);
  //                 response.should.be.json;
  //                 response.body.should.be.a('object');
  //                 response.body.supplier.first_name.should.be.eql("My name")
  //             }).catch(function (err) {
  //                 return Promise.reject(err);
  //             });
  //     });
  // });

});
