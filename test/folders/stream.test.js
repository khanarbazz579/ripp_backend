const fs = require('fs');
const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const faker = require('faker');

const Folders = require('../../models').folders;
const commonFunction = require('../commonFunction');
const server = require('../../app');
const generatedSampleData = require('../sampleData');

const should = chai.should();

let user, loggedInUser, rootData, zippedFileName;

chai.use(chaiHttp);

describe('stream-files', () => {
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


    // upload file through Api
    // upload file through Api
    describe('Upload files', () => {
        before((done) => {
            commonFunction.addDataToTable('files_folders', {
                original_name: user[0].email,
                created_by: loggedInUser.id,
                entity_type: 'FOLDER'
            }).then((file_folder_data) => {
                // console.log('-----file_folder_data-----', file_folder_data)
                commonFunction.addDataToTable('files_folders_accesses', {
                    name: user[0].email,
                    file_folder_id: file_folder_data.id,
                    user_id: loggedInUser.id,
                    permission: 'EDIT',
                    entity_type: 'FOLDER',
                    parent_id: null,
                    file_property_id: null,
                    refrence_id: null,
                    master_name: user[0].email,
                    count: 0
                }).then((data_file_folder_access) => {
                    rootData = data_file_folder_access;
                    done();
                });
            });
        });

        // without token test case
        it('it should not Upload a file without access token', () => {
            return chai
                .request(server)
                .post('/api/files/upload')
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('a file', function () {
            return chai
                .request(server)
                .post('/api/files/upload')
                .set({ Authorization: token })
                .field('selectedFolder', rootData.name)
                .field('selectedFolderId', rootData.id)
                .field('fileWithExtention', 'Googlelogo.png')
                .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
                .then((res) => {
                    uploadedFile = res.body;
                    uploadedFile.should.be.a('object');
                    uploadedFile.success.should.be.eql(true);
                    uploadedFile.message.should.be.eql('File uploaded successfully!');
                    uploadedFile.data.id.should.not.be.null;
                    uploadedFile.data.file_folder_id.should.not.be.null;
                    uploadedFile.data.user_id.should.not.be.null;
                    uploadedFile.data.permission.should.be.eql('EDIT');
                    uploadedFile.data.name.should.be.eql('Googlelogo.png');
                    uploadedFile.data.entity_type.should.be.eql('FILE');
                    expect(uploadedFile.data.parent_id === null).to.equal(false);
                    expect(uploadedFile.data.file_property_id === null).to.equal(false);
                    expect(uploadedFile.data.master_name === null).to.equal(false);
                    expect(uploadedFile.data.count === null).to.equal(false);
                    expect(uploadedFile.data.created_at === null).to.equal(false);
                    expect(uploadedFile.data.updated_at === null).to.equal(false);
                    expect(uploadedFile.data.user === null).to.equal(false);
                    expect(uploadedFile.data.file_property === null).to.equal(false);
                    expect(uploadedFile.data.sizeInBytes === null).to.equal(false);
                    expect(uploadedFile.data.size === null).to.equal(false);
                    expect(uploadedFile.data.nameWithOutExt === null).to.equal(false);
                    expect(uploadedFile.data.thumbIconUrl === null).to.equal(false);
                    expect(uploadedFile.data.OriginalImageUrl === null).to.equal(false);
                 }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('check uploaded file ICON uploaded', function () {
            let iconName = uploadedFile.data.file_property.path.split('/') || [];
            iconName = iconName[iconName.length - 1];
            return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });
    });

    describe('Upload files 1', () => {
        it('a file', function () {
            return chai
                .request(server)
                .post('/api/files/upload')
                .set({ Authorization: token })
                .field('selectedFolder', rootData.name)
                .field('selectedFolderId', rootData.id)
                .field('fileWithExtention', 'Googlelogo.png')
                .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
                .then((res) => {
                    uploadedFile1 = res.body;
                    uploadedFile1.should.be.a('object');
                    uploadedFile1.success.should.be.eql(true);
                    uploadedFile1.message.should.be.eql('File uploaded successfully!');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('check uploaded file ICON uploaded', function () {
            let iconName = uploadedFile1.data.file_property.path.split('/') || [];
            iconName = iconName[iconName.length - 1];
            return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });
    });

    describe('Upload files 2', () => {
        it('a file', function () {
            return chai
                .request(server)
                .post('/api/files/upload')
                .set({ Authorization: token })
                .field('selectedFolder', rootData.name)
                .field('selectedFolderId', rootData.id)
                .field('fileWithExtention', 'Googlelogo.png')
                .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
                .then((res) => {
                    uploadedFile2 = res.body;
                    uploadedFile2.should.be.a('object');
                    uploadedFile2.success.should.be.eql(true);
                    uploadedFile2.message.should.be.eql('File uploaded successfully!');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('check uploaded file ICON uploaded', function () {
            let iconName = uploadedFile2.data.file_property.path.split('/') || [];
            iconName = iconName[iconName.length - 1];
            return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });
    });

    describe('Upload files 3', () => {
        it('a file', function () {
            return chai
                .request(server)
                .post('/api/files/upload')
                .set({ Authorization: token })
                .field('selectedFolder', rootData.name)
                .field('selectedFolderId', rootData.id)
                .field('fileWithExtention', 'Googlelogo.png')
                .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo(1)')
                .then((res) => {
                    uploadedFile2 = res.body;
                    uploadedFile2.should.be.a('object');
                    uploadedFile2.success.should.be.eql(true);
                    uploadedFile2.message.should.be.eql('File uploaded successfully!');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('check uploaded file ICON uploaded', function () {
            let iconName = uploadedFile2.data.file_property.path.split('/') || [];
            iconName = iconName[iconName.length - 1];
            return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });
    });


    //describe('initiate zip file', () => {
        // it('initiate zip file', function () {
        //     return chai
        //         .request(server)
        //         .post('/api/preparingZip')
        //         .set({ Authorization: token })
        //         .send({ files: [uploadedFile1.data.id, uploadedFile2.data.id] })
        //         .then((res) => {
        //             let zippingResponse = res.body;
        //             zippingResponse.should.be.a('object');
        //             zippingResponse.success.should.be.eql(true);
        //             zippingResponse.message.should.be.eql('zipped file in progress');

        //             zippingResponse.data.noOfFiles.should.be.eql(2);
        //             zippingResponse.data.filename.should.not.be.null;

        //             zippedFileName = zippingResponse.data.filename;


        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });

        // it('Should not zip if files not send', function () {
        //     return chai
        //         .request(server)
        //         .post('/api/preparingZip')
        //         .set({ Authorization: token })
        //         .send({ files: [] })
        //         .then((res) => {
        //             let zippingResponse = res.body;
        //             zippingResponse.should.be.a('object');
        //             zippingResponse.success.should.be.eql(false);
        //             zippingResponse.message.should.be.eql('select some files');

        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });


        // it('zipped file created', function () {
        //     fs.stat('public/zipped/' + zippedFileName + '.zip', function (err, stat) {
        //         if (err == null) {
        //             fileCreated = true;
        //         } else if (err.code === 'ENOENT') {
        //             // file does not exist
        //             // fs.writeFile('log.txt', 'Some log\n');
        //             // console.log('Some other sssserror: ', err.code);
        //             fileCreated = false;
        //         } else {
        //             // console.log('Some other error: ', err.code);
        //             fileCreated = false;
        //         }
        //         fileCreated.should.be.eql(true);
        //     });
        // });
        // it('zipped file not created', function () {
        //     fs.stat('public/zipped/' + zippedFileName + '.1zip', function (err, stat) {
        //         if (err == null) {
        //             fileCreated = true;
        //         } else if (err.code === 'ENOENT') {
        //             // file does not exist
        //             // fs.writeFile('log.txt', 'Some log\n');
        //             // console.log('Some other sssserror: ', err.code);
        //             fileCreated = false;
        //         } else {
        //             // console.log('Some other error: ', err.code);
        //             fileCreated = false;
        //         }
        //         fileCreated.should.be.eql(false);
        //     });
        // });

        // it('Should throw exception on download with invalid filename', () => {
        //     return chai
        //         .request(server)
        //         .get('/api/file/download/zipped/')
        //         .set({ Authorization: token })
        //         .then((res) => {
        //             console.log(res.res)
        //             let zippingResponse = res.body;

        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
            
        // })

        // it('Should stream file with correct file name', () => {
        //     return chai
        //         .request(server)
        //         .get('/api/file/download/zipped/'+zippedFileName)
        //         .set({ Authorization: token })
        //         .then((res) => {
        //             let zippingResponse = res.body;
        //             console.log(res.res)
        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // })
    //});

    after((done) => {
        // remove main root folder
        commonFunction.removeFolderFromAws(rootData.path).then(() => {
            fs.unlink('public/zipped/' + zippedFileName + '.zip', () => {
                done();
            });
        })
    })
});
