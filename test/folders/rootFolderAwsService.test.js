const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const faker = require('faker');

const commonFunction = require('../commonFunction');
const server = require('../../app');
const generatedSampleData = require('../sampleData');
const rootFolderAwsService = require('../../services/rootFolderAwsService');
const should = chai.should();

chai.use(chaiHttp);
let user;

describe('CommmonFunction MediaController', () => {
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });

    before((done) => { //Before each test we empty the database
        commonFunction.sequalizedDb(['users', 'files_folders', 'files_folders_accesses', 'file_properties', 'user_roles', 'permission_sets']).then(() => {
            role = generatedSampleData.createdSampleData("user_roles", 1);
            permission = generatedSampleData.createdSampleData("permission_sets", 1);
            user = generatedSampleData.createdSampleData("users", 2)

            commonFunction.addDataToTable("user_roles", role[0]).then((role_data) => {
                user[0].role_id = role_data.id;
                user[1].role_id = role_data.id;
                commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_data) => {
                    user[0].permission_set_id = permission_data.id;
                    user[1].permission_set_id = permission_data.id;
                    commonFunction.addDataToTable("users", user[0]).then((data) => {
                        commonFunction.addDataToTable("users", user[1]).then((data) => {
                            sharedWithUser = data;
                            done();
                        });
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


    it('it should not created new rootFolder for new user if data not valid', () => {
        return rootFolderAwsService.createRootFolderForUser()
            .then((res) => {
                console.log('rootFolderAwsService', res);
                res.success.should.be.eql(false);
                res.message.should.be.eql('Invalid data');
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });


    it('it should created new rootFolder for new user', () => {
        return rootFolderAwsService.createRootFolderForUser(loggedInUser.email, loggedInUser.id)
            .then((res) => {
                // console.log('rootFolderAwsService', res);
                res.success.should.be.eql(true);
                res.message.should.be.eql('folder created.');
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });


    it('it should not create same rootFolder for new user', () => {
        return rootFolderAwsService.createRootFolderForUser(loggedInUser.email, loggedInUser.id)
            .then((res) => {
                console.log('rootFolderAwsService', res);
                res.success.should.be.eql(false);
                res.message.should.be.eql('folder already exist.');
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    after((done) => {
        // remove main root folder
        commonFunction.removeFolderFromAws(loggedInUser.email).then(() => {
            commonFunction.removeFolderFromAws(user[0].email).then(() => {
                done();
            })
        })
    })
});
