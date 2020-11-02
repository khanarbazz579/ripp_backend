const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const queryInterface = require("../../models").sequelize.queryInterface;
chai.use(chaiHttp);
const modelName = 'leads';
let loggedInUser, token, user;
const fs = require("fs");
const {
    users,
    salesStages,
    customFields
} = require('./default-custom-field');
let savedImportId,encodedObject;

describe('multipleLeadUpload', () => {

    describe('login', () => {
        afterEach(() => {
            let key;
            for (key in this) {
                delete this[key];
            };
        });
        before((done) => { //Before each test we empty the database
            commonFunction.sequalizedDb(['user_details','notes', 'sales_stage_transitions', 'lost_lead_fields', 'sales_stage_counters', 'company_details', 'companies', 'contact_details', 'contacts', 'form_default_fields', 'lead_client_details', 'custom_fields', 'sections', 'leads_clients', 'sales_stages', 'multiple_uploads', 'users', 'permission_sets', 'user_roles']).then(() => {
                const role = generatedSampleData.createdSampleData("user_roles", 1);
                const permission = generatedSampleData.createdSampleData("permission_sets", 1);
                commonFunction.addDataToTable("user_roles", role[0]).then((role_data) => {
                    commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_data) => {
                        users.forEach(element => {
                            element.role_id = role_data.id;
                            element.permission_set_id = permission_data.id;
                        });
                        commonFunction.addBulkDataToTable("users", users).then((data) => {
                            user = users[2];
                            user.password = '123456';
                            commonFunction.addBulkDataToTable("sales_stages", salesStages).then((data) => {
                                const sections = generatedSampleData.createdSampleData("sections", 1);
                                commonFunction.addDataToTable("sections", sections[0]).then((data) => {
                                    customFields.forEach(field => {
                                        field.section_id = data.id;
                                    });
                                    commonFunction.addBulkDataToTable("custom_fields", customFields).then((data) => {
                                        done();
                                    });
                                });
                            });
                        })
                    });
                });
            });
        })

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

    describe('CSV Upolad', () => {
        it('It should upload a CSV file to the server', function () {
            return chai
                .request(server)
                .post('/api/multipleUpload/multipleUploadCsvFile')
                .field({
                    refName: "testCSV"
                })
                .set({
                    Authorization: token
                })
                .attach('file', 'test/test-csv/testCSV.csv', 'testCSV.csv')
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property("totalRecord");
                    res.body.should.have.property("fieldArray");
                    res.body.totalRecord.should.be.eql(5);
                    res.body.fieldArray.should.be.a("array");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should upload a full error record CSV file to the server', function () {
            return chai
                .request(server)
                .post('/api/multipleUpload/multipleUploadCsvFile')
                .field({
                    refName: "fullErrorTestCSV"
                })
                .set({
                    Authorization: token
                })
                .attach('file', 'test/test-csv/fullErrorTestCSV.csv', 'fullErrorTestCSV.csv')
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property("totalRecord");
                    res.body.should.have.property("fieldArray");
                    res.body.totalRecord.should.be.eql(56);
                    res.body.fieldArray.should.be.a("array");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should upload a corrected update record CSV file to the server', function () {
            return chai
                .request(server)
                .post('/api/multipleUpload/uploadCorrectedCSV')
                .field({
                    refName: "fullErrorTestCSV"
                })
                .set({
                    Authorization: token
                })
                .attach('file', 'test/test-csv/fullErrorTestCSV.csv', 'fullErrorTestCSV.csv')
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should not upload a CSV file to the server without authentication', function () {
            return chai
                .request(server)
                .post('/api/multipleUpload/multipleUploadCsvFile')
                .attach('file', 'test/test-csv/testCSV.csv', 'testCSV.csv')
                .then((res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

    });

    describe("save the current import stage", () => {
        it('it should save the current user stage in database', function () {
            return chai
                .request(server)
                .post('/api/multipleUpload/saveCurrentStage')
                .send({
                    ref_name: "testCSV2",
                    current_stage: 2,
                    error_count: 32
                })
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not save the current user stage in database without refname', function () {
            return chai
                .request(server)
                .post('/api/multipleUpload/saveCurrentStage')
                .send({
                    ref_name: "",
                    current_stage: 2,
                    error_count: 32
                })
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.should.be.a('object');
                    res.body.message.should.be.eql('refname cant be blank');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should update the current user stage in database', function () {
            return chai
                .request(server)
                .post('/api/multipleUpload/saveCurrentStage')
                .send({
                    ref_name: "testCSV2",
                    current_stage: 5,
                    error_count: 21
                })
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        })


        it('it should not update the current user stage in database', function () {
            return chai
                .request(server)
                .post('/api/multipleUpload/saveCurrentStage')
                .send({
                    ref_name: "testCSV2",
                    current_stage: "dfsdsd",
                    error_count: "sdsd"
                })
                .set({
                    Authorization: token
                })
                .then((res) => {
                    //res.should.have.status(201);
                    res.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        })
    });

    describe("get the current saved import stage", () => {
        it('it should get the current user stage stored in database', function () {
            return chai
                .request(server)
                .get('/api/multipleUpload/getSavedImports')
                .send()
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    savedImportId = res.body.data[0].id;
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe("delete the current saved import stage", () => {
        before((done) => {
            uploadDummyFiles("testCSV2", done);
        });

        it('it should delete the current user stage stored in database', function () {
            return chai
                .request(server)
                .post('/api/multipleUpload/deleteSavedImport')
                .send({
                    deleteFolder : true,
                    importId: savedImportId,
                    refName : "testCSV2"
                })
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.data.should.eql(true);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('Download downloadOriginalCSV CSV ', () => {
        it('It should not downloadOriginalCSV record File without authentication', function () {

            encodedObject = commonFunction.encodeToBase64({
                "refName": 'testCSV'
            });
            return chai
                .request(server)
                .get('/api/multipleUpload/downloadOriginalCSV/'+encodedObject)
                .then((res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should not download Original CSV which does not exist in server with authentication', function () {

            encodedObject = commonFunction.encodeToBase64({
                "refName": 'testCSVsss'
            });
            return chai
                .request(server)
                .get('/api/multipleUpload/downloadOriginalCSV/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.should.have.property('message');
                    res.body.message.should.be.eql('file does not exists on server');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should  downloadOriginalCSV Record CSV File  which exist in server with authentication', function () {

            encodedObject = commonFunction.encodeToBase64({
                "refName": 'testCSV'
            });
            return chai
                .request(server)
                .get('/api/multipleUpload/downloadOriginalCSV/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should  download Original CSV Record ZIP File which exist in server with authentication', function () {
            encodedObject = commonFunction.encodeToBase64({
                "refNames": ['testCSV'],
            });
            return chai
                .request(server)
                .get('/api/multipleUpload/downloadZipFile/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });


    describe('CSV File Error check', () => {

        it('It should not check all the error of CSV file which does not exist in server with authentication', function () {

            encodedObject = commonFunction.encodeToBase64({
                "headerMapping": [],
                "refName": 'dosos123',
                "customFields": []
            });
            return chai
                .request(server)
                .post('/api/multipleUpload/checkRecordswithError')
                // .get('/api/multipleUpload/checkRecordswithError/'+encodedObject)
                .set({
                    Authorization: token
                })
                .send({
                    "headerMapping": [],
                    "refName": 'dosos123',
                    "customFields": []
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.should.have.property('message');
                    res.body.message.should.be.eql('file does not exists on server');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should not check all the error of CSV file which does not exist in server without authentication', function () {
            encodedObject = commonFunction.encodeToBase64({
                "headerMapping": [],
                "refName": 'dosos123',
                "customFields": []
            });
            return chai
                .request(server)
                // .get('/api/multipleUpload/checkRecordswithError/'+encodedObject)
                .post('/api/multipleUpload/checkRecordswithError')
                .send({
                    "headerMapping": [],
                    "refName": 'dosos123',
                    "customFields": []
                })
                .then((res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });


        it('It should check all the error of CSV file uploaded to the server with authentication', function () {

            encodedObject = commonFunction.encodeToBase64({
                "headerMapping": [5, 6, 7, 8, 1, 3, 4],
                "refName": "testCSV"
            });
            return chai
                .request(server)
                // .get('/api/multipleUpload/checkRecordswithError/'+encodedObject)
                .post('/api/multipleUpload/checkRecordswithError')
                .set({
                    Authorization: token
                })
                .send({
                    "headerMapping": [5, 6, 7, 8, 1, 3, 4],
                    "refName": "testCSV"
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.have.property('errorCount');
                    res.body.errorCount.should.be.eql(2);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should get all error of correct CSV file uploaded to the server with authentication', function () {

            encodedObject = commonFunction.encodeToBase64({
                "headerMapping": [5, 6, 7, 8, 1, 3, 4],
                "refName": "fullErrorTestCSV"
            });
            return chai
                .request(server)
                // .get('/api/multipleUpload/checkRecordswithError/'+encodedObject)
                .post('/api/multipleUpload/checkRecordswithError')
                .set({
                    Authorization: token
                })
                .send({
                    "headerMapping": [5, 6, 7, 8, 1, 3, 4],
                    "refName": "fullErrorTestCSV"
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.have.property('errorCount');
                    res.body.errorCount.should.be.eql(56);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });



    describe('Download CSV Error File', () => {

        it('It should not Download CSV Error File without authentication', function () {
            encodedObject = commonFunction.encodeToBase64({
                "refName": 'testCSV'
            });
            return chai
                .request(server)
                .get('/api/multipleUpload/downloadErrorCSV/'+encodedObject)
                .then((res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });


        it('It should not Download CSV Error File  which does not exist in server with authentication', function () {

            encodedObject = commonFunction.encodeToBase64({
                "refName": 'testCSVsss'
            });
            return chai
                .request(server)
                .get('/api/multipleUpload/downloadErrorCSV/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.should.have.property('message');
                    res.body.message.should.be.eql('file does not exists on server');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });


        it('It should  Download CSV Error File  which exist in server with authentication', function () {

            encodedObject = commonFunction.encodeToBase64({
                "refName": 'testCSV'
            });
            return chai
                .request(server)
                .get('/api/multipleUpload/downloadErrorCSV/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });


    describe('get Error List Json of CSV Error File', () => {

        it('It should get Error List Json of CSV Error file which exist in server with authentication', function () {

            encodedObject = commonFunction.encodeToBase64({
                "refName": 'testCSV',
                "pageNo": 1
            });
            return chai
                .request(server)
                .get('/api/multipleUpload/getErrorListJson/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.have.property('res_json');
                    res.body.should.have.property('headerArray');
                    res.body.res_json.should.be.a("array");
                    res.body.headerArray.should.be.a("array");
                    res.body.res_json.length.should.be.eql(2);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should get Error List Json of CSV Error file which exist in server with more then 50 records', function () {

            encodedObject = commonFunction.encodeToBase64({
                "refName": 'fullErrorTestCSV',
                "pageNo": 1
            });
            return chai
                .request(server)
                .get('/api/multipleUpload/getErrorListJson/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.have.property('res_json');
                    res.body.should.have.property('headerArray');
                    res.body.res_json.should.be.a("array");
                    res.body.headerArray.should.be.a("array");
                    res.body.res_json.length.should.be.eql(50);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should get blank Error List array of error file without page no with authentication', function () {

            encodedObject = commonFunction.encodeToBase64({
                "refName": 'testCSV'
            });
            return chai
                .request(server)
                .get('/api/multipleUpload/getErrorListJson/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.have.property('res_json');
                    res.body.should.have.property('headerArray');
                    res.body.res_json.should.be.a("array");
                    res.body.headerArray.should.be.a("array");
                    res.body.res_json.length.should.be.eql(0);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should not get Error List Json of CSV Error file which does not exist in server with authentication', function () {
            encodedObject = commonFunction.encodeToBase64({
                "refName": 'testCSVrendfsom',
                "pageNo": 1
            });
            return chai
                .request(server)
                .get('/api/multipleUpload/getErrorListJson/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.should.have.property('message');
                    res.body.message.should.be.eql('file does not exists on server');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });


        it('It should not get Error List Json of CSV Error file which does exist in server without authentication', function () {

            encodedObject = commonFunction.encodeToBase64({
                "refName": 'testCSV',
                "pageNo": 1
            });
            return chai
                .request(server)
                .get('/api/multipleUpload/getErrorListJson/'+encodedObject)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('update Error Record', () => {

        it('it should not update the error record in csv file in server without authentication', function () {
            const reqObj = {
                "refName": 'testCSV'
            };
            return chai
                .request(server)
                .post('/api/multipleUpload/updateErrorRecord')
                .send(reqObj)
                .then((res) => {
                    res.should.have.status(401);
                })
        })


        it('it should update the error record in csv file in server with authentication', function () {
            const reqObj = {
                "updatedArray": [{
                    "1": "Unqualified Leads",
                    "3": "Alex Brooke",
                    "4": "Bryden ltd",
                    "5": "David ",
                    "6": "Bryden",
                    "7": "bryden@ffff.com",
                    "8": "13333333"
                }, {
                    "1": "Lost Leads",
                    "3": "Alex Brooke",
                    "4": "Hassle the Hoof Ltd",
                    "5": "Richard ",
                    "6": "Hasslehoff",
                    "7": "richard@ggg.com",
                    "8": "444444444"
                }, {
                    "1": "Lost Leads",
                    "3": "Simon Middleton",
                    "4": "Jonesey Electircal ltd ",
                    "5": "Paul",
                    "6": "Jones",
                    "7": "paul@fgggg.com",
                    "8": "4444344443"
                }, {
                    "1": "Lost Leads",
                    "3": "Simon Middleton",
                    "4": "Stand up Ltd",
                    "5": "Bill",
                    "6": "Bailey ",
                    "7": "bill@ffff.com",
                    "8": "4434434"
                }, {
                    "1": "Unqualified Leads",
                    "3": "Simon Middleton",
                    "4": "Buttons ltd ",
                    "5": "Bob",
                    "6": "Robinson ",
                    "7": "bob@ffff.com",
                    "8": "443434443444"
                }],
                "pageNo": 1,
                "refName": "testCSV",
                "correctionCompleated": true
            }

            return chai
                .request(server)
                .post('/api/multipleUpload/updateErrorRecord')
                .set({
                    Authorization: token
                })
                .send(reqObj)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.have.property('updated');
                    res.body.updated.should.be.eql(true);
                })
        });

        it('it should update the error record in csv file in server with more then 50 records', function () {
            const reqObj = {
                "updatedArray": [{
                    "1": "Unqualified Leads",
                    "3": "Alex Brooke",
                    "4": "Bryden ltd",
                    "5": "David ",
                    "6": "Bryden",
                    "7": "bryden@ffff.com",
                    "8": "13333333"
                }, {
                    "1": "Lost Leads",
                    "3": "Alex Brooke",
                    "4": "Hassle the Hoof Ltd",
                    "5": "Richard ",
                    "6": "Hasslehoff",
                    "7": "richard@ggg.com",
                    "8": "444444444"
                }, {
                    "1": "Lost Leads",
                    "3": "Simon Middleton",
                    "4": "Jonesey Electircal ltd ",
                    "5": "Paul",
                    "6": "Jones",
                    "7": "paul@fgggg.com",
                    "8": "4444344443"
                }, {
                    "1": "Lost Leads",
                    "3": "Simon Middleton",
                    "4": "Stand up Ltd",
                    "5": "Bill",
                    "6": "Bailey ",
                    "7": "bill@ffff.com",
                    "8": "4434434"
                }, {
                    "1": "Unqualified Leads",
                    "3": "Simon Middleton",
                    "4": "Buttons ltd ",
                    "5": "Bob",
                    "6": "Robinson ",
                    "7": "bob@ffff.com",
                    "8": "443434443444"
                }],
                "pageNo": 1,
                "refName": "fullErrorTestCSV",
                "correctionCompleated": true
            }

            return chai
                .request(server)
                .post('/api/multipleUpload/updateErrorRecord')
                .set({
                    Authorization: token
                })
                .send(reqObj)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.have.property('updated');
                    res.body.updated.should.be.eql(true);
                })
        });



        it('It should not update Error record Json of CSV Error file which does not exist in server with authentication', function () {
            const reqObj = {
                "refName": 'testCSVrendfsom',
                "pageNo": 1,
                "updatedArray": []
            };
            return chai
                .request(server)
                .post('/api/multipleUpload/updateErrorRecord')
                .set({
                    Authorization: token
                })
                .send(reqObj)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.should.have.property('message');
                    res.body.message.should.be.eql('file does not exists on server');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should not update Error record Json of CSV Error file with blank req object with authentication', function () {
            const reqObj = {
                "refName": 'testCSV',
                "pageNo": 1,
                "updatedArray": []
            };
            return chai
                .request(server)
                .post('/api/multipleUpload/updateErrorRecord')
                .set({
                    Authorization: token
                })
                .send(reqObj)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.should.have.property('message');
                    res.body.message.should.be.eql('updated array is Blank');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });


    describe('check possible duplicate Record in server without authentication', () => {
        encodedObject = commonFunction.encodeToBase64({
            "refName": 'testCSV'
        });
        it('it should not check possible duplicate Record i server without authentication', function () {
            return chai
                .request(server)
                .get('/api/multipleUpload/checkPossibleDuplicates/'+encodedObject)
                .then((res) => {
                    res.should.have.status(401);
                })
        })
    });

    describe('check possible duplicate Record in server file when duplicate check array is blank', () => {

        encodedObject = commonFunction.encodeToBase64({
            "refName": 'testCSV',
            "duplicateCheck": []
        });
        it('it should not check possible duplicate Record when duplicate check array is blank in server with authentication', function () {
            return chai
                .request(server)
                .get('/api/multipleUpload/checkPossibleDuplicates/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.have.property('duplicateCount');
                    res.body.should.have.property('totalCount');
                    res.body.duplicateCount.should.be.eql(0);
                    res.body.totalCount.should.be.eql(0);
                })
        })
    });

    describe('check possible duplicate Record in server with wrong ref name', () => {

        it('it should not check possible duplicate Record with wrong ref name and blank duplicate check', function () {
            encodedObject = commonFunction.encodeToBase64({
                "refName": 'sdgsg',
                "duplicateCheck": []
            });
            return chai
                .request(server)
                .get('/api/multipleUpload/checkPossibleDuplicates/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(422);
                })
        })

        it('it should not check possible duplicate Record with wrong ref name', function () {
            encodedObject = commonFunction.encodeToBase64({
                "duplicateCheck": [5, 6, 7, 8, 4, 1]
            });
            return chai
                .request(server)
                .get('/api/multipleUpload/checkPossibleDuplicates/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(422);
                })
        })
    });

    describe('check possible duplicate Record in server file', () => {
        it('it should upload default non duplicate Record Record To DB server with authentication', function () {
            const reqObj = {
                "refName": 'testCSV',
                "duplicateCheck": [5, 6, 7],
                "headerArray": [5, 6, 7, 8, 1, 3, 4],
                "importType": ""
            };

            return chai
                .request(server)
                .post('/api/multipleUpload/uploadRecordToDB')
                .set({
                    Authorization: token
                })
                .send(reqObj)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                });
        });

        it('it should check possible duplicate Record in server with authentication', function () {

            encodedObject = commonFunction.encodeToBase64({
                "refName": 'testCSV',
                "duplicateCheck": [5, 6, 7, 8, 4, 1]
            });
            return chai
                .request(server)
                .get('/api/multipleUpload/checkPossibleDuplicates/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.have.property('duplicateCount');
                    res.body.should.have.property('totalCount');
                    // res.body.duplicateCount.should.not.eql(0);
                    res.body.totalCount.should.be.eql(5);
                })
        });
    });


    describe('Download DuplicateRecord CSV ', () => {
        before((done) => {
            uploadDummyFiles("ref3", done);
        });

        it('It should not Download dupliacate record File without authentication', function () {
            const reqObj = {
                "refName": 'ref3',
            };
            return chai
                .request(server)
                .post('/api/multipleUpload/downloadDuplicateRecordCSV')
                .send(reqObj)
                .then((res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should not Download CSV Error File  which does not exist in server with authentication', function () {
            const reqObj = {
                "refName": 'testCSVsss',
            };
            return chai
                .request(server)
                .post('/api/multipleUpload/downloadDuplicateRecordCSV')
                .set({
                    Authorization: token
                })
                .send(reqObj)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.should.have.property('message');
                    res.body.message.should.be.eql('file does not exists on server');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });


        it('It should  Download CSV download Duplicate Record CSV File  which exist in server with authentication', function () {
            const reqObj = {
                "refName": 'ref3',
            };
            return chai
                .request(server)
                .post('/api/multipleUpload/downloadDuplicateRecordCSV')
                .set({
                    Authorization: token
                })
                .send(reqObj)
                .then((res) => {
                    res.should.have.status(200);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });


    describe('upload only non duplicate Record To DB Record in server file', () => {

        before((done) => {
            uploadDummyFiles("ref", done);
        });

        it('it should upload only non duplicate Record Record To DB server with authentication', function () {
            const reqObj = {
                "refName": 'ref',
                "duplicateCheck": [5, 6, 7, 8, 4, 1],
                "headerArray": [5, 6, 7, 8, 1, 3, 4],
                "importType": "importOnlyNonDuplicateRecord"
            };

            return chai
                .request(server)
                .post('/api/multipleUpload/uploadRecordToDB')
                .set({
                    Authorization: token
                })
                .send(reqObj)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                })
        })
    });

    describe('upload record with blank header array', () => {
        const reqObj = {
            "refName": 'testCSV',
            "duplicateCheck": [5, 6, 7, 8, 4, 1],
            "headerArray": [],
            "importType": "importOnlyNonDuplicateRecord"
        };

        it('it should not upload blank header array with authentication', function () {
            return chai
                .request(server)
                .post('/api/multipleUpload/uploadRecordToDB')
                .set({
                    Authorization: token
                })
                .send(reqObj)
                .then((res) => {
                    res.should.have.status(422);
                    res.body.message.should.be.eql('Blank header array');
                    res.body.success.should.be.eql(false);
                })
        });
    });

    describe('import All Duplicate Record Record To DB in server file', () => {
        before((done) => {
            uploadDummyFiles("ref1", done);
        });

        it('it should import All Duplicate Record To DB in server with authentication', function () {
            const reqObj = {
                "refName": 'ref1',
                "duplicateCheck": [5, 6, 7, 8, 4, 1],
                "headerArray": [5, 6, 7, 8, 1, 3, 4],
                "importType": "importAllDuplicateRecord"
            };

            return chai
                .request(server)
                .post('/api/multipleUpload/uploadRecordToDB')
                .set({
                    Authorization: token
                })
                .send(reqObj)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                })
        })
    });

    describe('import Only New Field Data in DB', () => {

        before((done) => {
            uploadDummyFiles("ref2", done);
        });

        it('it should import Only New Field Data DB Record in server with authentication', function () {
            const reqObj = {
                "refName": 'ref2',
                "duplicateCheck": [5, 6, 7, 8, 4, 1],
                "headerArray": [5, 6, 7, 8, 1, 3, 4],
                "importType": "importOnlyNewFieldData"
            };
            return chai
                .request(server)
                .post('/api/multipleUpload/uploadRecordToDB')
                .set({
                    Authorization: token
                })
                .send(reqObj)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                })
        })
    });

    describe('replace All Duplicate Data in DB', () => {
        before((done) => {
            uploadDummyFiles("ref3", done);
        });

        it('it should replace All Duplicate Data DB Record in server with authentication', function () {
            const reqObj = {
                "refName": 'ref3',
                "duplicateCheck": [5, 6, 7],
                "headerArray": [5, 6, 7, 8, 1, 3, 4, 27, 12, 16],
                "importType": "replaceAllDuplicateData"
            };
            return chai
                .request(server)
                .post('/api/multipleUpload/uploadRecordToDB')
                .set({
                    Authorization: token
                })
                .send(reqObj)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                })
        });

        it('it should find update detail Duplicate Data DB Record in server with authentication', function () {
            const reqObj = {
                "refName": 'ref3',
                "duplicateCheck": [27, 12, 16],
                "headerArray": [5, 6, 7, 8, 1, 3, 4, 27, 12, 16],
                "importType": "replaceAllDuplicateData"
            };
            return chai
                .request(server)
                .post('/api/multipleUpload/uploadRecordToDB')
                .set({
                    Authorization: token
                })
                .send(reqObj)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                })
        });
    });

    describe('CSV file delete', () => {
        it('It should not delete a CSV file to the server without authentication', function () {
            return chai
                .request(server)
                .post('/api/multipleUpload/deleteUploadedCSV')
                .send({
                    refName: 'testCSV'
                })
                .then((res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should  delete a CSV file to the server with authentication', function () {
            return chai
                .request(server)
                .post('/api/multipleUpload/deleteUploadedCSV')
                .set({
                    Authorization: token
                })
                .send({
                    refName: 'fullErrorTestCSV'
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.have.property('message');
                    res.body.message.should.be.eql('file deleted successfully');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should not delete a CSV file to the server with authentication in which does not exists', function () {
            return chai
                .request(server)
                .post('/api/multipleUpload/deleteUploadedCSV')
                .set({
                    Authorization: token
                })
                .send({
                    refName: 'testCSVsfsd'
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.should.have.property('message');
                    res.body.message.should.be.eql('file does not exists on server');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should  delete a ref CSV file to the server with authentication', function () {
            return chai
                .request(server)
                .post('/api/multipleUpload/deleteUploadedCSV')
                .set({
                    Authorization: token
                })
                .send({
                    refName: 'ref3'
                })
                .then((res) => {}).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

});

const uploadDummyFiles = (refname, done) => {
    if (!fs.existsSync(`./uploads/${refname}`)) {
        fs.mkdirSync(`./uploads/${refname}`, '0777', true);
    }
    fs.copyFile('test/test-csv/dummyRecord.csv', `./uploads/${refname}/duplicate_record_file.csv`, (err) => {
        if (err) throw err;
        fs.copyFile('test/test-csv/dummyRecord.csv', `./uploads/${refname}/non_duplicate_record_file.csv`, (err) => {
            if (err) throw err;
            done();
        });
    });
};
