const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const faker = require('faker');
const fs = require('fs');

chai.use(chaiHttp);

let loggedInUser, rootData, token, user, userBody, leadBody, contactBody, fileCategoryBody, entityFileBody, entityFileBody2, zippedFileName;

afterEach(() => {
    let key;
    for (key in this) {
        delete this[key];
    };
});

describe('ENTITY FILE MEDIA', () => {

    before((done) => { 
        commonFunction.sequalizedDb(['file_categories', 'leads_clients', 'sales_stages', 'contacts','contact_entity_files', 'entity_files', 'users', 'permission_sets', 'user_roles']).then(() => {
            userRoles = generatedSampleData.createdSampleData("user_roles", 1);
            commonFunction.addDataToTable("user_roles", userRoles[0]).then((data) => {
                roleBody = data;
                permissionSet = generatedSampleData.createdSampleData("permission_sets", 1);
                commonFunction.addDataToTable("permission_sets", permissionSet[0]).then((data) => {
                    setBody = data;
                    user = generatedSampleData.createdSampleData("users", 1);
                    user[0].role_id = roleBody.id;
                    user[0].permission_set_id = setBody.id;
                    commonFunction.addDataToTable("users", user[0]).then((data) => {
                        userBody = data;
                        sales_stages = generatedSampleData.createdSampleData("sales_stages", 1);
                        commonFunction.addDataToTable("sales_stages", sales_stages[0]).then((data) => {
                            salesStageBody = data;
                            leads = generatedSampleData.createdSampleData("leads_clients", 1);
                            leads[0].sales_stage_id = salesStageBody.id;
                            leads[0].user_id = userBody.id;
                            commonFunction.addDataToTable("leads_clients", leads[0]).then((data) => {
                                leadBody = data;
                                contacts = generatedSampleData.createdSampleData("contacts", 1);
                                contacts[0].entity_id = leadBody.id;
                                contacts[0].entity_type = "LEAD_CLIENT";
                                commonFunction.addDataToTable("contacts", contacts[0]).then((data) => {
                                    contactBody = data;
                                    let fileCategory = {
                                        name:'General',
                                        user_id: userBody.id
                                    }
                                    commonFunction.addDataToTable("file_categories", fileCategory).then((data) => {
                                        fileCategoryBody = data;
                                        done();
                                    });
                                });
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
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    describe('/UPLOAD Entity File', () => {

        it('it should not UPLOAD a Entity File without Authorization', () => {
            return chai.request(server)
                .post('/api/entityMedia/upload')
                .send({ name : "Category1"})
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should UPLOAD a IMAGE Entity File', function () {
            return chai
                .request(server)
                .post('/api/entityMedia/upload')
                .set({ Authorization: token })
                .field('selectedCategory', fileCategoryBody.id)
                .field('uniqueuserstamp', new Date().getTime())
                .field('fileWithExtention', 'Googlelogo.png')
                .field('entity_id', leadBody.id)
                .field('entity_type', "LEAD_CLIENT")
                .field('selectedContact', [contactBody.id])
                .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
                .then((res) => {
                    uploadedFile = res.body;
                    uploadedFile.should.be.a('object');
                    uploadedFile.success.should.be.eql(true);
                    entityFileBody = uploadedFile.data; 
                    uploadedFile.message.should.be.eql('File uploaded and copied successfully!');
                    uploadedFile.data.id.should.not.be.null;
                    uploadedFile.data.created_by.should.not.be.null;
                    uploadedFile.data.name.should.be.eql('Googlelogo.png');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should UPLOAD a PDF Entity File', function () {
            return chai
                .request(server)
                .post('/api/entityMedia/upload')
                .set({ Authorization: token })
                .field('selectedCategory', fileCategoryBody.id)
                .field('uniqueuserstamp', new Date().getTime())
                .field('fileWithExtention', 'sample.pdf')
                .field('entity_id', leadBody.id)
                .field('entity_type', "LEAD_CLIENT")
                .field('selectedContact', [contactBody.id])
                .attach('file', 'test/test-image/sample.pdf', 'SamplePdf')
                .then((res) => {
                    console.log(">>>>>>>>>>>>>", res.body)
                    uploadedFile = res.body;
                    uploadedFile.should.be.a('object');
                    uploadedFile.success.should.be.eql(true);
                    uploadedFile.message.should.be.eql('File uploaded and copied successfully!');
                    uploadedFile.data.id.should.not.be.null;
                    uploadedFile.data.created_by.should.not.be.null;
                    uploadedFile.data.name.should.be.eql('SamplePdf.pdf');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/UPDATE Entity File', () => {

        let updateFileBody;
        before( (done) => {
            commonFunction.addDataToTable("file_categories", {
                name:'General',
                user_id: userBody.id
            }).then((response) => {
                updateFileBody = {
                    id: entityFileBody.id,
                    data: {
                        file_category_id: response.id
                    }
                }
                done();
            });
        })

        it('it should not UPDATE a Entity File without Authorization', () => {
            return chai.request(server)
                .post('/api/entityMedia/update')
                .send(updateFileBody)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should UPLOAD a Entity File', function () {
            return chai
                .request(server)
                .post('/api/entityMedia/update')
                .set({ Authorization: token })
                .send(updateFileBody)
                .then((res) => {
                    uploadedFile = res.body;
                    uploadedFile.should.be.a('object');
                    uploadedFile.success.should.be.eql(true);
                    uploadedFile.message.should.be.eql('File updated successfully.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });


    describe('Get File Preview of Entity File', () => {

        it('it should not preview a Entity File without Authorization', () => {
            encodedObject = commonFunction.encodeToBase64(entityFileBody);
            return chai.request(server)
                .get('/api/entityMedia/getFilePreview/'+encodedObject)
                // .send(entityFileBody)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should Get File Preview a Entity File', function () {
            encodedObject = commonFunction.encodeToBase64({ fileObject: entityFileBody});
            return chai
                .request(server)
                .get('/api/entityMedia/getFilePreview/'+encodedObject)
                .set({ Authorization: token })
                // .send({ fileObject: entityFileBody})
                .then((res) => {
                    uploadedFile = res.body;
                    uploadedFile.should.be.a('object');
                    uploadedFile.success.should.be.eql(true);
                    uploadedFile.message.should.be.eql('File Recieved Successfully');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });   

    describe('/UPDATE contacts association of entity files', () => {
        
        let updateAssociationBody = {};
        
        before( (done)=>{
            updateAssociationBody['deleted_contacts'] = [];
            updateAssociationBody['entity_file_id'] = entityFileBody.id;
            updateAssociationBody['selected_contacts'] = [];
            updateAssociationBody['selected_contacts'].push(contactBody.id)
            commonFunction.addDataToTable("contacts", contacts[0]).then((data) => {
                contactBody = data;
                updateAssociationBody['selected_contacts'].push(contactBody.id)
                done();    
            });
        });

        it('it should not UPDATE contacts association of entity files without access token', () => {
            return chai.request(server)
                .post('/api/entityMedia/updateAssociateContact')
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should UPDATE contacts association', () => {
            return chai.request(server)
                .post('/api/entityMedia/updateAssociateContact')
                .set({ Authorization: token })
                .send(updateAssociationBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Data updated');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('Get all entity files', () => {

        let getAllFilesBody = {};
        
        before( (done)=>{
            getAllFilesBody = {
                whereFilter: {
                    "entity_type": "LEAD_CLIENT",
                    "entity_id": entityFileBody.entity_id
                },
            };

            getAllFilesBody['orderFilter'] = [['name', this.sortReverse ? 'ASC' : 'DESC']];
            done();
        })
        
        it('it should not get all files without access token', () => {
            encodedObject = commonFunction.encodeToBase64(getAllFilesBody);
            return chai.request(server)
                .get('/api/entityMedia/allFiles/'+encodedObject)
                // .send(getAllFilesBody)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should GET all entity files', () => {
            encodedObject = commonFunction.encodeToBase64(getAllFilesBody);
            return chai.request(server)
                .get('/api/entityMedia/allFiles/'+encodedObject)
                .set({ Authorization: token })
                // .send(getAllFilesBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.files.should.be.a('array');
                    res.body.message.should.be.eql('Files received'); 
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should GET all entity files', () => {
            getAllFilesBody['orderFilter'] = {
                filterType: "ASC",
                type: "file_categories"
            };
            encodedObject = commonFunction.encodeToBase64(getAllFilesBody);
            return chai.request(server)
                .get('/api/entityMedia/allFiles/'+encodedObject)
                .set({ Authorization: token })
                // .send(getAllFilesBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.files.should.be.a('array');
                    res.body.message.should.be.eql('Files received'); 
                    res.body.files[0].name.should.be.eql('Googlelogo.png'); 
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should GET all entity files', () => {
            getAllFilesBody['orderFilter'] = {
                type: "contacts", 
                filterType: "DESC"
            };
            encodedObject = commonFunction.encodeToBase64(getAllFilesBody);
            return chai.request(server)
                .get('/api/entityMedia/allFiles/'+encodedObject)
                .set({ Authorization: token })
                // .send(getAllFilesBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.files.should.be.a('array');
                    res.body.message.should.be.eql('Files received'); 
                    res.body.files[0].name.should.be.eql('Googlelogo.png'); 
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    

    describe('/GET Get File Blob', () => {
        it('it should not get blob without access token', () => {
            return chai
                .request(server)
                .get(`/api/entityMedia/blob/${entityFileBody.id}?secret_token=`)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not get blob (Invalid File)', () => {
            return chai
                .request(server)
                .get(`/api/entityMedia/blob/${faker.random.number()}?secret_token=${token.replace("Bearer ", "")}`)
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.data.length.should.be.eql(0);
                    data.message.should.be.eql('File not exist');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should get file blob (Valid File)', () => {
            return chai
                .request(server)
                .get(`/api/entityMedia/blob/${entityFileBody.id}?secret_token=${token.replace("Bearer ", "")}`)
                .then((res) => {
                    res.res.should.not.be.null;
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/UPLOAD 2 file for creating zip of files', () => {
        it('it should UPLOAD a Entity File', function () {
            return chai
                .request(server)
                .post('/api/entityMedia/upload')
                .set({ Authorization: token })
                .field('selectedCategory', fileCategoryBody.id)
                .field('uniqueuserstamp', new Date().getTime())
                .field('fileWithExtention', 'Googlelogo.png')
                .field('entity_id', leadBody.id)
                .field('entity_type', "LEAD_CLIENT")
                .field('selectedContact', [contactBody.id])
                .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
                .then((res) => {
                    uploadedFile = res.body;
                    uploadedFile.should.be.a('object');
                    uploadedFile.success.should.be.eql(true);
                    entityFileBody2 = uploadedFile.data; 
                    uploadedFile.message.should.be.eql('File uploaded and copied successfully!');
                    uploadedFile.data.id.should.not.be.null;
                    uploadedFile.data.created_by.should.not.be.null;
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('Initiate zip file', () => {
        
        it('initiate zip file', function () {
            return chai
                .request(server)
                .post('/api/entityMedia/sharePreparingZip')
                .set({ Authorization: token })
                .send({ files: [entityFileBody.id, entityFileBody2.id] })
                .then((res) => {
                    let zippingResponse = res.body;
                    zippingResponse.should.be.a('object');
                    zippingResponse.success.should.be.eql(true);
                    zippingResponse.message.should.be.eql('zipped file in progress');

                    zippingResponse.data.noOfFiles.should.be.eql(2);
                    zippingResponse.data.filename.should.not.be.null;
                    zippedFileName = zippingResponse.data.filename;

                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not zip if files not send', function () {
            return chai
                .request(server)
                .post('/api/entityMedia/sharePreparingZip')
                .set({ Authorization: token })
                .send({ files: [] })
                .then((res) => {
                    let zippingResponse = res.body;
                    zippingResponse.should.be.a('object');
                    zippingResponse.success.should.be.eql(false);
                    zippingResponse.message.should.be.eql('select some files');

                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });


        it('zipped file created', function () {
            fs.stat('public/zipped/' + zippedFileName + '.zip', function (err, stat) {
                if (err == null) {
                    fileCreated = true;
                } else if (err.code === 'ENOENT') {
                    fileCreated = false;
                } else {
                    fileCreated = false;
                }
                fileCreated.should.be.eql(true);
            });
        });
        it('zipped file not created', function () {
            fs.stat('public/zipped/' + zippedFileName + '.1zip', function (err, stat) {
                if (err == null) {
                    fileCreated = true;
                } else if (err.code === 'ENOENT') {
                    fileCreated = false;
                } else {
                    fileCreated = false;
                }
                fileCreated.should.be.eql(false);
            });
        });

        it('Should throw exception on download with invalid filename', () => {
            return chai
                .request(server)
                .get('/api/entityMedia/download/zipped/')
                .set({ Authorization: token })
                .then((res) => {
                    let zippingResponse = res.body;

                }).catch(function (err) {
                    return Promise.reject(err);
                });
            
        })

        it('Should stream file with correct file name', () => {
            return chai
                .request(server)
                .get('/api/entityMedia/download/zipped/'+zippedFileName)
                .set({ Authorization: token })
                .then((res) => {
                    let zippingResponse = res.body;
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        })
    });

    describe('/DELETE Entity File', () => {

        it('it should not delete the file (Invalid File)', () => {
            return chai
                .request(server)
                .post(`/api/entityMedia/remove`)
                .set({ Authorization: token })
                .send({ id: 0 })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('File not exists');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should delete the file by file id', () => {
            return chai
                .request(server)
                .post(`/api/entityMedia/remove`)
                .set({ Authorization: token })
                .send({ id: entityFileBody.id })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    res.body.message.should.be.eql('Deleted succesfully');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    after((done) => {
        commonFunction.sequalizedDb(['file_categories', 'leads_clients', 'sales_stages', 'contacts','contact_entity_files', 'entity_files', 'permission_sets', 'users', 'user_roles', 'permission_sets']).then(() => {
            commonFunction.removeFolderFromAws(entityFileBody.path).then(() => {
                fs.unlink('public/zipped/' + zippedFileName + '.zip', () => {
                    done();
                });
            });
        });
    });

});