const chai = require('chai');
const chaiHttp = require('chai-http');
const commonFunction = require('../commonFunction');
const server = require('../../app');
const generatedSampleData = require('../sampleData');
const should = chai.should();
let token, user;

chai.use(chaiHttp);

describe('ACCOUNT TIMEZONE TESTS', () => {
    /*
     * Test the user get route
     */
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });

    describe('login', () => {
        afterEach(() => {
            let key;
            for (key in this) {
                delete this[key];
            };
        });
        before((done) => { //Before each test we empty the database
            commonFunction.sequalizedDb(['leads_clients','users', 'permission_sets', 'user_roles', 'accounts', 'timezones']).then(() => {
                const role = generatedSampleData.createdSampleData("user_roles", 1);
                const permission = generatedSampleData.createdSampleData("permission_sets", 1);
                const timezones = generatedSampleData.createdSampleData("timezones", 1);
                timezones[0].id = 1;
                const accounts = generatedSampleData.createdSampleData("accounts", 1);
                user = generatedSampleData.createdSampleData("users", 1)[0]
                commonFunction.addDataToTable("user_roles", role[0]).then((role_data) => {
                    user.role_id = role_data.id
                    commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_data) => {
                        user.permission_set_id = permission_data.id;
                        commonFunction.addDataToTable("timezones", timezones[0]).then((timezones_data) => {
                            accounts[0].timezone_id = timezones_data.id;
                            commonFunction.addDataToTable("accounts", accounts[0]).then((account_data) => {
                                user.account_id = account_data.id;
                                commonFunction.addDataToTable("users", user).then((data) => {
                                    done();
                                });
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

    describe("getting all the timezone in form of array", () => {
        it("it should not fetch the timezone from database without authentications token", ()=>{
            return chai.request(server)
            .get('/api/timezone/getAll')
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
        })
        it("it should fetch the timezone from database with authentications token", ()=>{
            return chai.request(server)
            .get('/api/timezone/getAll')
            .set({
                Authorization : token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.have.property("data");
                res.body.data.should.be.a("array");
                res.body.data.length.should.be.eql(1);
            }).catch(function (err) {
                return Promise.reject(err);
            });
        });
    });

    describe("setting the timezone in the users account", () => {
        it("it should not set the timezone in users account without authentications token", ()=>{
            return chai.request(server)
            .post('/api/timezone/setTimezone')
            .send({
                timezone_id : null
            })
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
        })
        it("it should set the timezone in users account authentications token", ()=>{
            return chai.request(server)
            .post('/api/timezone/setTimezone')
            .set({
                Authorization : token
            })
            .send({
                timezone_id : 1
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.should.have.property("data");
                res.body.data.should.be.a("array");
                res.body.data.length.should.be.eql(1);
            }).catch(function (err) {
                return Promise.reject(err);
            });
        });
    })
});