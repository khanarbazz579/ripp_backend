/**
 * Created by cis on 27/8/18.
 */
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const should = chai.should();
chai.use(chaiHttp);

let loggedInUser, token,section,sectionsBody, user, data = {
    name: null,
    type: 1,
    fields: [{
            custom_field_id: 10,
            value: "something",
            option: "notEqul"
        },
        {
            custom_field_id: 11,
            value: "something 2",
            option: "notEqul 2"
        }
    ],
    created_at: new Date(),
    updated_at: new Date()
};

describe('login', () => {
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });
    before((done) => { //Before each test we empty the database
        commonFunction.sequalizedDb(['custom_filter_fields','custom_filters','users','user_roles','permission_sets','company_details','contact_details','lead_client_details','custom_fields','sections']).then(() => {
            const role = generatedSampleData.createdSampleData("user_roles", 1);
            const permission = generatedSampleData.createdSampleData("permission_sets", 1);
            user = generatedSampleData.createdSampleData("users", 1)[0]
            commonFunction.addDataToTable("user_roles", role[0]).then((role_data) => {
                user.role_id = role_data.id
                commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_data) => {
                    user.permission_set_id = permission_data.id;
                    commonFunction.addDataToTable("users", user).then((data) => {
                        section = generatedSampleData.createdSampleData('sections',1);
                        commonFunction.addDataToTable("sections",section[0]).then((data) =>{
                            sectionsBody= data
                            taskModelWithData = generatedSampleData.createdSampleData("call_lists", 1);
                            taskModelWithData[0].custom_filter_id = sectionsBody.id;
                            taskModelWithData[0].name = sectionsBody.name;
                        done();
                    });
                });
                });
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

describe('/POST Custom Filter', () => {
    it('it should not POST a Custom Filter without Authorization', () => {
        return chai.request(server)
            .post('/api/customFilter')
            .send(data)
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
})
describe('/POST Custom Filter with Authorization without field id', () => {
    it('it should not POST a Custom Filter without field id with Authorization ', () => {
        return chai.request(server)
            .post('/api/customFilter')
            .set({
                Authorization: token
            })
            .send(data)
            .then((res) => {
                res.should.have.status(422)
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/POST Custom Filter with Authorization', () => {
    before((done) => {
        const sections = generatedSampleData.createdSampleData("sections", 1);
        commonFunction.addDataToTable("sections", sections[0]).then((sdata) => {
          const custom_fields = generatedSampleData.createdSampleData("custom_fields", 1);
          custom_fields[0].section_id = sdata.id;
          custom_fields[0].id = 1;
          commonFunction.addDataToTable("custom_fields", custom_fields[0]).then((addedData) => {
            data.fields[0].custom_field_id = addedData.id;
            data.fields[1].custom_field_id = addedData.id;
            done();
          });
        });
    })
    it('it should POST a Custom Filter with Authorization', () => {
        data.name = "Filter One";
        return chai.request(server)

            .post('/api/customFilter')
            .set({
                Authorization: token
            })
            .send(data)
            .then((res) => {
                res.should.have.status(201);
                res.body.success.should.be.eql(true);
                res.body.should.have.property("data");
                data = res.body.data;
                res.body.data.should.be.a("Object");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/GET Custom Filter with Authorization', () => {
    it('it should get a Custom Filter with Authorization', () => {
        return chai.request(server)
            .get('/api/customFilter/' + data.type)
            .set({
                Authorization: token
            })
            .send()
            .then((res) => {
                res.should.have.status(200);
                res.body.should.have.property("data");
                res.body.data.should.be.a("Array");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});


describe('/UPDATE Custom Filter without Authorization', () => {
    it('it should not UPDATE a Custom Filter without Authorization', () => {
        return chai.request(server)
            .put('/api/customFilter')
            .send(data)
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/UPDATE Custom Filter with Authorization', () => {
    it('it should  UPDATE a Custom Filter with Authorization', () => {
        data.name = "updated name"
        data.fields[0].value = "updated value";
        return chai.request(server)
            .put('/api/customFilter')
            .set({
                Authorization: token
            })
            .send(data)
            .then((res) => {
                res.should.have.status(201);
                res.body.success.should.be.eql(true);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/BULKUPDATE Custom Filter with Authorization', () => {
    it('it should  bulkupdate a Custom Filter with Authorization', () => {
        data.priority_order = 3;
        return chai.request(server)
            .put('/api/customFilter/bulkUpdate')
            .set({
                Authorization: token
            })
            .send([data])
            .then((res) => {
                res.should.have.status(201);
                res.body.success.should.be.eql(true);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});


describe('/DELETE Custom Filter with Authorization', () => {
    it('it should DELETE a Custom Filter with Authorization', () => {
        return chai.request(server)
            .delete('/api/customFilter/' + data.id)
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.have.property("data")
                res.body.data.should.have.property("id");
                res.body.data.id.should.be.eql(data.id.toString());
                res.body.success.should.be.eql(true);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

// describe('/BULKUPDATE Custom Filter without dataId', () => {
//     it('it should not bulkupdate a Custom Filter with Authorization', () => {
//         data.id = {};
//         return chai.request(server)
//             .put('/api/customFilter/bulkUpdate')
//             .send([data])
//             .set({
//                 Authorization: token
//             })
//             .then((res) => {
//                 res.should.have.status(422);
//                 res.body.success.should.be.eql(false);
//             }).catch(function (err) {
//                 return Promise.reject(err);
//             });
//     });
// });


describe('/UPDATE Custom Filter with Authorization', () => {
    it('it should not UPDATE a Custom Filter with Authorization and not without its field id', () => {
        data.fields[0].value = "updated value",
        data.fields[0].id = {};
        return chai.request(server)
            .put('/api/customFilter')
            .set({
                Authorization: token
            })
            .send(data)
            .then((res) => {
                res.should.have.status(422);
                res.body.success.should.be.eql(false);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/UPDATE Custom Filter with Authorization but incurrect data', () => {
    it('it should not UPDATE a Custom Filter with Authorization', () => {
        data.id = {};
        return chai.request(server)
            .put('/api/customFilter')
            .set({
                Authorization: token
            })
            .send(data)
            .then((res) => {
                res.should.have.status(422);
                res.body.success.should.be.eql(false);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
})
