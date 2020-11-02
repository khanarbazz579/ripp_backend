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

let loggedInUser, token, user, data = {
    name: "LOST_LEAD_IDENTIFIER1",
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
        commonFunction.sequalizedDb(['sales_stage_transitions','leads_clients','lost_lead_identifiers', 'users', 'permission_sets', 'user_roles']).then(() => {
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

describe('/POST LOST_LEAD_IDENTIFIER', () => {
    it('it should not POST a LOST_LEAD_IDENTIFIER  without Authorization', () => {
        return chai.request(server)
            .post('/api/lead/lostLeadIdentifier')
            .send(data)
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

})

describe('/GET LOST_LEAD_IDENTIFIER', () => {
    it('It should get lostLeadIdentifier array of length zero form default database', () => {
        return chai.request(server)
            .get('/api/lead/lostLeadIdentifier')
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.data.should.be.a('array');
                res.body.data.length.should.be.eql(0);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
})

describe('/POST  should not POST LOST_LEAD_IDENTIFIER', () => {
    it('it should not POST a lostLeadIdentifier without content', () => {
        return chai.request(server)
            .post('/api/lead/lostLeadIdentifier')
            .set({
                Authorization: token
            })
            .send({
                name: null
            })
            .then((res) => {
                res.should.have.status(422);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
})

describe('/POST authorization LOST_LEAD_IDENTIFIER', () => {
    it('it should  POST a lostLeadIdentifier with authorization', () => {
        return chai.request(server)
            .post('/api/lead/lostLeadIdentifier')
            .send(data)
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(201);
                res.body.success.should.be.eql(true);
                res.body.should.be.a('object');
                res.body.should.have.property('data');
                const receiveddata = res.body.data;
                receiveddata.should.have.property('id');
                receiveddata.should.have.property('name');
                receiveddata.should.have.property('created_at');
                receiveddata.should.have.property('updated_at');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

})

describe('/GET token LOST_LEAD_IDENTIFIER', () => {
    it('it should not get any lostLeadIdentifier in without access token', () => {
        return chai.request(server)
            .get('/api/lead/lostLeadIdentifier')
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
})

describe('/GET array LOST_LEAD_IDENTIFIER', () => {
    it('it should get lostLeadIdentifier array form created lostLeadIdentifier', () => {
        return chai.request(server)
            .get('/api/lead/lostLeadIdentifier')
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.data.should.be.a('array');
                data.id = res.body.data[0].id;
                res.body.data.length.should.not.eql(0);
                res.body.data[0].name.should.be.eql(data.name);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/PUT LOST_LEAD_IDENTIFIER Id', () => {
    it('It should update lostLeadIdentifier with lostLeadIdentifier  Id', () => {
        return chai.request(server)
            .put('/api/lead/lostLeadIdentifier/' + data.id)
            .send(data)
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.data.should.be.a('object');
                res.body.data.id.should.be.eql(data.id);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/PUT update LOST_LEAD_IDENTIFIER', () => {
    it('It should not update lostLeadIdentifier without lostLeadIdentifier Id', () => {
        return chai.request(server)
            .put('/api/lead/lostLeadIdentifier/' + data.id)
            .send(data)
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/DELETE LOST_LEAD_IDENTIFIER', () => {
    it('it should not delete a lostLeadIdentifier without access token', () => {
        return chai.request(server)
            .delete('/api/lead/lostLeadIdentifier/' + data.id)
            .send()
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

});

describe('/DELETE success LOST_LEAD_IDENTIFIER', () => {
    it('it should delete a lostLeadIdentifier with and lostLeadIdentifier Id and access token', () => {
        return chai.request(server)
            .delete('/api/lead/lostLeadIdentifier/' + data.id)
            .send()
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.data.should.be.a('string');
                res.body.data.should.be.eql(data.id.toString());
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});