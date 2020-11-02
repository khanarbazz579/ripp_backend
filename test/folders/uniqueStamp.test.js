const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');

const commonFunction = require('../commonFunction');
const server = require('../../app');
const generatedSampleData = require('../sampleData');

const should = chai.should();

let user, token, generatedStamp;

chai.use(chaiHttp);

describe('generateUniqueStamp', () => {
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });

    before((done) => { //Before each test we empty the database
        commonFunction.sequalizedDb(['users', 'user_roles', 'permission_sets']).then(() => {
            role = generatedSampleData.createdSampleData("user_roles", 1);
            permission = generatedSampleData.createdSampleData("permission_sets", 1);
            user = generatedSampleData.createdSampleData("users", 1)

            commonFunction.addDataToTable("user_roles", role[0]).then((role_data) => {
                user[0].role_id = role_data.id;
                commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_data) => {
                    user[0].permission_set_id = permission_data.id;
                    commonFunction.addDataToTable("users", user[0]).then((data) => {
                        userData = data;
                        done();
                    });
                })
            });
        });
    });

    it('it should be login user with token and credential', () => {
        return chai.request(server)
            .post('/api/users/login')
            .send(user[0])
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.token.should.be.a('string');
                token = res.body.token;
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

    // without token test case
    it('it should not generateUnique stamp without access token', () => {
        return chai.request(server)
            .get('/api/generateuniquestamp')
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should be generateUnique stamp', () => {
        return chai.request(server)
            .get('/api/generateuniquestamp')
            .set({ Authorization: token })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.success.should.be.eql(true);
                res.body.data.should.not.be.null;
                generatedStamp = res.body.data;
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });


    it('it should be removed generated stamp', () => {
        return chai.request(server)
            .get('/api/removeuniqueStamp/' + generatedStamp)
            .set({ Authorization: token })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.success.should.be.eql(true);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });
});