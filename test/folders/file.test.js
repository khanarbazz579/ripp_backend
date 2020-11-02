const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const faker = require('faker');

// const Folders = require('../../models').folders;
const commonFunction = require('../commonFunction');
const server = require('../../app');
const generatedSampleData = require('../sampleData');

const should = chai.should();

let rootData, user, shareUserToken, shareUser, token, token2, loggedInUser, files, copyFileData, sharedWithUser, sharedFolder, subFolderData, subFolderData_2, subFolderData_3, uploadedFile, uploadedFile1, uploadedFile2, rootFolderofUser2, role, permission;

chai.use(chaiHttp);

describe('files', () => {
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });

    before((done) => { //Before each test we empty the database
        commonFunction.sequalizedDb(['user_details','users', 'files_folders', 'files_folders_accesses', 'file_properties', 'share_files_folders', 'share_guest_users', 'user_roles', 'permission_sets']).then(() => {
            role = generatedSampleData.createdSampleData("user_roles", 1);
            permission = generatedSampleData.createdSampleData("permission_sets", 1);
            user = generatedSampleData.createdSampleData("users", 2)

            commonFunction.addDataToTable("user_roles", role[0]).then((role_data) => {
                user[0].role_id = role_data.id;
                user[1].role_id = role_data.id;
                commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_data) => {
                    user[0].permission_set_id = permission_data.id;
                    user[1].permission_set_id = permission_data.id;
                    user[1].email = "devraj.v@cisinlabs.com";
                    commonFunction.addDataToTable("users", user[0]).then((data) => {
                        commonFunction.addDataToTable("users", user[1]).then((data) => {
                            sharedWithUser = data;
                            commonFunction.addDataToTable("share_guest_users", { 
                              email : "gourav.pwd@cisinlabs.com", 
                              url_token: "asdfasfsa123n3n42", 
                              first_name: "Gourav",
                              last_name: "S",
                              is_confirm: 1,
                              status: 1,
                              password: "$2b$10$vX3uNCKX3vm8pOHE3E8Kj.0jfjE3h5NPR94fYZMl1bDwIsbFR4nMa"
                            }).then((shared_guest) => {
                              shareUser = shared_guest;
                              done();
                            });
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

    it('it should be login user2', () => {
        return chai.request(server)
            .post('/api/users/login')
            .send(user[1])
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.token.should.be.a('string');
                token2 = res.body.token;
                // loggedInUser = res.body.user;
                res.body.user.should.be.a('object');
                res.body.user.first_name.should.be.eql(user[1].first_name);
                res.body.user.last_name.should.be.eql(user[1].last_name);
                res.body.user.email.should.be.eql(user[1].email);
            })
            .catch(function (err) {
                return Promise.reject(err);
            });
    });

    // it('it should be shared guest login', () => {
    //     return chai.request(server)
    //         .post('/api/sharedLink/login')
    //         .send({
    //             "email":"gourav.pwd@cisinlabs.com",
    //             "password": "123456"
    //         })
    //         .then((res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a('object');
    //             res.body.token.should.be.a('string');
    //             shareUserToken = res.body.token;
    //             res.body.user.should.be.a('object');
    //         })
    //         .catch(function (err) {
    //             return Promise.reject(err);
    //         });
    // });


    // upload file : Invalid token
    // upload file : single
    // upload file : multi

    // upload file through Api
    describe('Upload files', () => {
        before((done) => {
            commonFunction.addDataToTable('files_folders', {
                original_name: user[0].email,
                created_by: loggedInUser.id,
                entity_type: 'FOLDER'
            }).then((file_folder_data) => {
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

        describe('Upload files with PDF', () => {
            let uploadedPDFFile
            it('a PDF file', function () {
                return chai
                    .request(server)
                    .post('/api/files/upload')
                    .set({ Authorization: token })
                    .field('selectedFolder', rootData.name)
                    .field('selectedFolderId', rootData.id)
                    .field('fileWithExtention', 'sample.pdf')
                    .attach('file', 'test/test-image/sample.pdf', 'Sample')
                    .then((res) => {
                        uploadedPDFFile = res.body;
                        uploadedPDFFile.should.be.a('object');
                        uploadedPDFFile.success.should.be.eql(true);
                        uploadedPDFFile.message.should.be.eql('File uploaded successfully!');
                    }).catch(function (err) {
                        return Promise.reject(err);
                    });
            });
            it('not created ICON except IMAGE', function () {
                let iconName = uploadedPDFFile.data.file_property.path.split('/') || [];
                iconName = iconName[iconName.length - 1];
                return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
                    expect(iconUpload).to.equal(false);
                });
            });
        });
    });

    describe('getFolderChilds files/folders', () => {

        // without token test case
        it('it should not GET files/folders without access token', () => {
            return chai
                .request(server)
                .get('/api/folder/childs/' + rootData.id + '/files')
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should get files/folders as FolderTree with child', () => {
            return chai
                .request(server)
                .get('/api/folder/childs/' + rootData.id + '/files') //need to check
                .set({ Authorization: token })
                .then((res) => {
                    data = res.body.data;
                    data.should.be.a('array');
                    data.length.should.be.eql(5);
                    // console.log('------data-327-----', data[4]);

                    const firstChild = data[0].data;
                    firstChild.id.should.not.be.null;
                    firstChild.file_folder_id.should.not.be.null;
                    firstChild.user_id.should.not.be.null;
                    firstChild.permission.should.be.eql('EDIT');
                    firstChild.name.should.be.eql('Googlelogo.png');
                    firstChild.entity_type.should.be.eql('FILE');
                    expect(firstChild.parent_id === null).to.equal(false);
                    expect(firstChild.file_property_id === null).to.equal(false);
                    expect(firstChild.master_name === null).to.equal(false);
                    expect(firstChild.count === null).to.equal(false);
                    expect(firstChild.created_at === null).to.equal(false);
                    expect(firstChild.updated_at === null).to.equal(false);
                    expect(firstChild.user === null).to.equal(false);
                    expect(firstChild.file_property === null).to.equal(false);
                    expect(firstChild.sizeInBytes === null).to.equal(false);
                    expect(firstChild.size === null).to.equal(false);
                    expect(firstChild.nameWithOutExt === null).to.equal(false);
                    expect(firstChild.thumbIconUrl === null).to.equal(false);
                    expect(firstChild.OriginalImageUrl === null).to.equal(false);

                    const secondChild = data[1].data;
                    secondChild.id.should.not.be.null;
                    secondChild.file_folder_id.should.not.be.null;
                    secondChild.user_id.should.not.be.null;
                    secondChild.permission.should.be.eql('EDIT');
                    secondChild.name.should.be.eql('Googlelogo(1).png');
                    secondChild.entity_type.should.be.eql('FILE');
                    expect(secondChild.parent_id === null).to.equal(false);
                    expect(secondChild.file_property_id === null).to.equal(false);
                    expect(secondChild.master_name === null).to.equal(false);
                    expect(secondChild.count === null).to.equal(false);
                    expect(secondChild.created_at === null).to.equal(false);
                    expect(secondChild.updated_at === null).to.equal(false);
                    expect(secondChild.user === null).to.equal(false);
                    expect(secondChild.file_property === null).to.equal(false);
                    expect(secondChild.sizeInBytes === null).to.equal(false);
                    expect(secondChild.size === null).to.equal(false);
                    expect(secondChild.nameWithOutExt === null).to.equal(false);
                    expect(secondChild.thumbIconUrl === null).to.equal(false);
                    expect(secondChild.OriginalImageUrl === null).to.equal(false);

                    const thirdChild = data[2].data;
                    thirdChild.id.should.not.be.null;
                    thirdChild.file_folder_id.should.not.be.null;
                    thirdChild.user_id.should.not.be.null;
                    thirdChild.permission.should.be.eql('EDIT');
                    thirdChild.name.should.be.eql('Googlelogo(2).png');
                    thirdChild.entity_type.should.be.eql('FILE');
                    expect(thirdChild.parent_id === null).to.equal(false);
                    expect(thirdChild.file_property_id === null).to.equal(false);
                    expect(thirdChild.master_name === null).to.equal(false);
                    expect(thirdChild.count === null).to.equal(false);
                    expect(thirdChild.created_at === null).to.equal(false);
                    expect(thirdChild.updated_at === null).to.equal(false);
                    expect(thirdChild.user === null).to.equal(false);
                    expect(thirdChild.file_property === null).to.equal(false);
                    expect(thirdChild.sizeInBytes === null).to.equal(false);
                    expect(thirdChild.size === null).to.equal(false);
                    expect(thirdChild.nameWithOutExt === null).to.equal(false);
                    expect(thirdChild.thumbIconUrl === null).to.equal(false);
                    expect(thirdChild.OriginalImageUrl === null).to.equal(false);


                    const forthChild = data[3].data;
                    forthChild.id.should.not.be.null;
                    forthChild.file_folder_id.should.not.be.null;
                    forthChild.user_id.should.not.be.null;
                    forthChild.permission.should.be.eql('EDIT');
                    forthChild.name.should.be.eql('Googlelogo(1)(1).png');
                    forthChild.entity_type.should.be.eql('FILE');
                    expect(forthChild.parent_id === null).to.equal(false);
                    expect(forthChild.file_property_id === null).to.equal(false);
                    expect(forthChild.master_name === null).to.equal(false);
                    expect(forthChild.count === null).to.equal(false);
                    expect(forthChild.created_at === null).to.equal(false);
                    expect(forthChild.updated_at === null).to.equal(false);
                    expect(forthChild.user === null).to.equal(false);
                    expect(forthChild.file_property === null).to.equal(false);
                    expect(forthChild.sizeInBytes === null).to.equal(false);
                    expect(forthChild.size === null).to.equal(false);
                    expect(forthChild.nameWithOutExt === null).to.equal(false);
                    expect(forthChild.thumbIconUrl === null).to.equal(false);
                    expect(forthChild.OriginalImageUrl === null).to.equal(false);

                    const fifthChild = data[4].data;
                    fifthChild.id.should.not.be.null;
                    fifthChild.file_folder_id.should.not.be.null;
                    fifthChild.user_id.should.not.be.null;
                    fifthChild.permission.should.be.eql('EDIT');
                    fifthChild.name.should.be.eql('Sample.pdf');
                    fifthChild.entity_type.should.be.eql('FILE');
                    expect(fifthChild.parent_id === null).to.equal(false);
                    expect(fifthChild.file_property_id === null).to.equal(false);
                    expect(fifthChild.master_name === null).to.equal(false);
                    expect(fifthChild.count === null).to.equal(false);
                    expect(fifthChild.created_at === null).to.equal(false);
                    expect(fifthChild.updated_at === null).to.equal(false);
                    expect(fifthChild.user === null).to.equal(false);
                    expect(fifthChild.file_property === null).to.equal(false);
                    expect(fifthChild.sizeInBytes === null).to.equal(false);
                    expect(fifthChild.size === null).to.equal(false);
                    expect(fifthChild.nameWithOutExt === null).to.equal(false);
                    expect(fifthChild.thumbIconUrl === null).to.equal(false);
                    expect(fifthChild.OriginalImageUrl === null).to.equal(false);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

    });


    let editFileData, editFileData2, editFileData3;
    describe('Edit files', () => {
        before((done) => {
            editFileData = {
                fileId: uploadedFile.data.id,
                updatedData: {
                    width: '100',
                    height: '100',
                    quality: '100',
                    saveAs: '-resized',
                    description: 'test description',
                    newName: 'testNew'
                }
            };
            editFileData2 = {
                fileId: uploadedFile.data.id,
                updatedData: {
                    width: '100',
                    height: '100',
                    quality: '100',
                    saveAs: '',
                    description: 'test description',
                    newName: 'testNew'
                }
            }
            editFileData3 = {
                fileId: uploadedFile.data.id,
                updatedData: {
                    width: '100',
                    height: '100',
                    quality: '100',
                    description: 'test description',
                    newName: 'testwithSaveAs'
                }
            }
            done();
        });

        // without token test case
        it('it Should not edit file without access token', () => {
            return chai
                .request(server)
                .put('/api/file/0')
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not edit file', function () {
            return chai
                .request(server)
                .put('/api/file/0')
                .set({ Authorization: token })
                .send(editFileData.updatedData)
                .then((res) => {
                    data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('file doesn\'t exist');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('edit file as new', function () {
            return chai
                .request(server)
                .put(`/api/file/${uploadedFile.data.id}`)
                .set({ Authorization: token })
                .send(editFileData.updatedData)
                .then((res) => {
                    data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('File updated successfully');
                    data.data.id.should.not.be.eql(uploadedFile.data.id);
                    data.data.file_property.size.should.not.be.eql(0);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('check edit file as new, ICON uploaded', function () {
            let iconName = data.data.file_property.path.split('/') || [];
            iconName = iconName[iconName.length - 1];
            return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });

        it('edit file on same', function () {
            return chai
                .request(server)
                .put(`/api/file/${uploadedFile.data.id}`)
                .set({ Authorization: token })
                .send(editFileData2.updatedData)
                .then((res) => {
                    data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('File updated successfully');
                    data.data.id.should.be.eql(uploadedFile.data.id);
                    data.data.file_property.size.should.not.be.eql(0);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('check edit file on same, ICON uploaded', function () {
            let iconName = data.data.file_property.path.split('/') || [];
            iconName = iconName[iconName.length - 1];
            return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });

        it('edit file on same without saveAs', function () {
            return chai
                .request(server)
                .put(`/api/file/${uploadedFile.data.id}`)
                .set({ Authorization: token })
                .send(editFileData3.updatedData)
                .then((res) => {
                    data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('File updated successfully');
                    data.data.id.should.be.eql(uploadedFile.data.id);
                    data.data.file_property.size.should.not.be.eql(0);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('check edit file as new, ICON uploaded', function () {
            let iconName = data.data.file_property.path.split('/') || [];
            iconName = iconName[iconName.length - 1];
            return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });

        it('edit file on same', function () {
            return chai
                .request(server)
                .put(`/api/file/${uploadedFile.data.id}`)
                .set({ Authorization: token })
                .send(editFileData2.updatedData)
                .then((res) => {
                    data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('File updated successfully');
                    data.data.id.should.be.eql(uploadedFile.data.id);
                    data.data.file_property.size.should.not.be.eql(0);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('check edit file as new, ICON uploaded', function () {
            let iconName = data.data.file_property.path.split('/') || [];
            iconName = iconName[iconName.length - 1];
            return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });

        it('edit file on same with new name', function () {
            // editFileData2.updatedData.newName = "newTestFile";
            return chai
                .request(server)
                .put(`/api/file/${uploadedFile.data.id}`)
                .set({ Authorization: token })
                .send(editFileData2.updatedData)
                .then((res) => {
                    data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('File updated successfully');
                    data.data.id.should.be.eql(uploadedFile.data.id);
                    data.data.file_property.size.should.not.be.eql(0);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('check edit file as new, ICON uploaded', function () {
            let iconName = data.data.file_property.path.split('/') || [];
            iconName = iconName[iconName.length - 1];
            return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });

        // without token fail
        it('it should not update name and description of file without access token', function () {
            return chai
                .request(server)
                .put('/api/file/field/0')
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        // file doesn\'t exist
        it('it should not update name and description of INVALID file', () => {
            return chai
                .request(server)
                .put('/api/file/field/0')
                .set({ Authorization: token })
                .then((res) => {
                    // console.log('----updateFileField---', res)
                    data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('file doesn\'t exist');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        // field type should be name or description
        it('it should not update invalid type NAME and DESCRIPTION', () => {
            return chai
                .request(server)
                .put('/api/file/field/0')
                .set({ Authorization: token })
                .then((res) => {
                    data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('file doesn\'t exist');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        // edit filename only //updated
        it('it should update type NAME field', () => {
            return chai
                .request(server)
                .put(`/api/file/field/${uploadedFile.data.id}`)
                .set({ Authorization: token })
                .send({
                    'fieldType': 'name',
                    'fieldValue': 'new-test-name'
                })
                .then((res) => {
                    data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('updated');
                    data.data.name.should.not.be.eql(uploadedFile.data.name);
                    data.data.name.should.be.eql('new-test-name' + data.data.file_property.extension_type);
                    expect(uploadedFile.data.nameWithOutExt === 'new-test-name').to.equal(false);
                    expect(data.data.nameWithOutExt === 'new-test-name').to.equal(true);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        // edit file description only // updated
        it('it should update type DESCRIPTION field', () => {
            return chai
                .request(server)
                .put(`/api/file/field/${uploadedFile.data.id}`)
                .set({ Authorization: token })
                .send({
                    'fieldType': 'description',
                    'fieldValue': 'new-test-description'
                })
                .then((res) => {
                    data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('updated');
                    expect(data.data.file_property.description === uploadedFile.data.description).to.equal(false);
                    expect(data.data.file_property.description === 'new-test-description').to.equal(true);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

    });


    // searchFileByName test cases
    describe('/filterMediaData', () => {
        it('it should not get filter files without access token', () => {
            encodedObject = commonFunction.encodeToBase64({});
            return chai
                .request(server)
                .get(`/api/search/media/`+encodedObject)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('it should get 0 files listing if sending blank data for search', () => {
            encodedObject = commonFunction.encodeToBase64({ 'name': "" });
            return chai
                .request(server)
                .get(`/api/search/media/`+encodedObject)
                .set({ Authorization: token })
                // .send({ 'name': "" })
                .then((res) => {
                    const data = res.body;
                    data.data.length.should.be.eql(0);
                    data.success.should.be.eql(true);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/filterMediaData', () => {
        it('it should get 0 files listing if sending not matched data for search', () => {
            encodedObject = commonFunction.encodeToBase64({ 'name': faker.random.number() });
            return chai
                .request(server)
                .get(`/api/search/media/`+encodedObject)
                .set({ Authorization: token })
                // .send({ 'name': faker.random.number() })
                .then((res) => {
                    const data = res.body;
                    data.data.length.should.be.eql(0);
                    data.success.should.be.eql(true);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // describe('/filterMediaData', () => {
    //     it('it should get files listing if sending matched data for search', () => {
    //         encodedObject = commonFunction.encodeToBase64({ 'name': uploadedFile2.data.name });
    //         return chai
    //             .request(server)
    //             .get(`/api/search/media/`+encodedObject)
    //             .set({ Authorization: token })
    //             // .send({ 'name': uploadedFile2.data.name })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.data[0].data.name.should.be.eql(uploadedFile2.data.name);
    //                 data.data.length.should.be.eql(1);
    //                 data.success.should.be.eql(true);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // // shiftFileToFolder Test Case 
    const subFolderName = 'root-test' + Math.random();
    describe('/shiftFileToFolder', () => {
        it('it should add Folder', () => {
            return chai
                .request(server)
                .post('/api/folder')
                .set({ Authorization: token })
                .send({ parentFolder: rootData, subFolderName })
                .then((res) => {
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Folder added successfully.');
                    const data = res.body.data;
                    subFolderData = data;
                    data.id.should.not.be.null;
                    data.parent_id.should.be.eql(rootData.id);
                    data.name.should.be.eql(subFolderName);
                    data.updated_at.should.not.be.null;
                    data.created_at.should.not.be.null;
                    data.entity_type.should.be.eql('FOLDER');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        // without token test case
        it('it should not shiftFileToFolder without access token', () => {
            return chai
                .request(server)
                .post(`/api/move/file/folder`)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not shiftFileToFolder(As file to move does not exist)', () => {
            return chai
                .request(server)
                .post(`/api/move/file/folder`)
                .set({ Authorization: token })
                .send({ 'file_id': faker.random.number(), 'folder_id': subFolderData.id })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('File to move doesn\'t exists');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not shiftFileToFolder(As folder where file needs to be moved not exist)', () => {
            return chai
                .request(server)
                .post(`/api/move/file/folder`)
                .set({ Authorization: token })
                .send({ 'file_id': uploadedFile2.data.id, 'folder_id': faker.random.number() })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('Folder where to move doesn\'t exists');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not shiftFileToFolder(As file is on that same folder)', () => {
            return chai
                .request(server)
                .post(`/api/move/file/folder`)
                .set({ Authorization: token })
                .send({ 'file_id': uploadedFile2.data.id, 'folder_id': rootData.id })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('already their');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should shiftFileToFolder(shift file to a new folder)', () => {
            return chai
                .request(server)
                .post(`/api/move/file/folder`)
                .set({ Authorization: token })
                .send({ 'file_id': uploadedFile2.data.id, 'folder_id': subFolderData.id })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('data updated');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // shiftFolderToFolder Test Case 
    describe('/shiftFolderToFolder', () => {
        // without token test case
        it('it should not shiftFolderToFolder without access token', () => {
            return chai
                .request(server)
                .post(`/api/move/folder/folder`)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not shiftFolderToFolder(As folder to move does not exist)', () => {
            return chai
                .request(server)
                .post(`/api/move/folder/folder`)
                .set({ Authorization: token })
                .send({ 'folderToMove_id': faker.random.number(), 'shiftedToFolder_id': subFolderData.parent_id })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('Folder to move doesn\'t exists');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not shiftFolderToFolder(As folder where folder needs to be moved not exist)', () => {
            return chai
                .request(server)
                .post(`/api/move/folder/folder`)
                .set({ Authorization: token })
                .send({ 'folderToMove_id': subFolderData.id, 'shiftedToFolder_id': faker.random.number() })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('Folder where to move doesn\'t exists');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not shiftFolderToFolder(As folder is on that same folder)', () => {
            return chai
                .request(server)
                .post(`/api/move/folder/folder`)
                .set({ Authorization: token })
                .send({ 'folderToMove_id': subFolderData.id, 'shiftedToFolder_id': subFolderData.parent_id })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('already their');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        // upload pdf file to shiftFolder
        it('upload pdf file to shiftFolder', function () {
            return chai
                .request(server)
                .post('/api/files/upload')
                .set({ Authorization: token })
                .field('selectedFolder', subFolderData.name)
                .field('selectedFolderId', subFolderData.id)
                .field('fileWithExtention', 'sample.pdf')
                .attach('file', 'test/test-image/sample.pdf', 'Sample')
                .then((res) => {
                    let uploadedPDFFile = res.body;
                    uploadedPDFFile.should.be.a('object');
                    uploadedPDFFile.success.should.be.eql(true);
                    uploadedPDFFile.message.should.be.eql('File uploaded successfully!');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('it should add Folder', () => {
            return chai
                .request(server)
                .post('/api/folder')
                .set({ Authorization: token })
                .send({ parentFolder: subFolderData, subFolderName: 'test-subFolderName' })
                .then((res) => {
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Folder added successfully.');
                    const data = res.body.data;
                    subFolderData_2 = data;
                    data.id.should.not.be.null;
                    data.parent_id.should.be.eql(subFolderData.id);
                    data.name.should.be.eql('test-subFolderName');
                    data.updated_at.should.not.be.null;
                    data.created_at.should.not.be.null;
                    data.entity_type.should.be.eql('FOLDER');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should add Folder', () => {
            return chai
                .request(server)
                .post('/api/folder')
                .set({ Authorization: token })
                .send({ parentFolder: subFolderData_2, subFolderName: subFolderData.name })
                .then((res) => {
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Folder added successfully.');
                    const data = res.body.data;
                    subFolderData_3 = data;
                    data.id.should.not.be.null;
                    data.parent_id.should.be.eql(subFolderData_2.id);
                    data.name.should.be.eql(subFolderData.name);
                    data.updated_at.should.not.be.null;
                    data.created_at.should.not.be.null;
                    data.entity_type.should.be.eql('FOLDER');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should shiftFolderToFolder', () => {
            return chai
                .request(server)
                .post(`/api/move/folder/folder`)
                .set({ Authorization: token })
                .send({ 'folderToMove_id': subFolderData.id, 'shiftedToFolder_id': subFolderData_2.id })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('data updated');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/getStorageStatus', () => {
        // without token test case
        it('it should not get the storage status without access token', () => {
            return chai
                .request(server)
                .get(`/api/storage`)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should get the storage status', () => {
            return chai
                .request(server)
                .get(`/api/storage`)
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    expect(data.data.percentageCoveredSpace).to.not.be.null;
                    // expect(data.data.percentageCoveredSpace).to.be.at.least(0);
                    expect(data.data.space_consumed).to.not.be.null;
                    expect(data.data.space_consumed).to.be.at.least(0);
                    expect(data.data.storageToFrom).to.not.be.null;
                    data.message.should.be.eql('Storage space data');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/getFilePath FileId', () => {
        // without token test case
        it('it should not get path of file without access token', () => {
            return chai
                .request(server)
                .get(`/api/file/path/${faker.random.number()}`)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not get path of INVALID file', () => {
            return chai
                .request(server)
                .get(`/api/file/path/${faker.random.number()}`)
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    res.body.message.should.be.eql('file doesn\'t exist');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should get path of file', () => {
            return chai
                .request(server)
                .get(`/api/file/path/${uploadedFile.data.id}`)
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    res.body.message.should.be.eql('file path');
                    res.body.data.should.be.eql('My Files/');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // upload large image
    let largeUploadedFile, largeCopyFile, movedSharedFile;
    describe('Upload Large Image', () => {
        it('a file', function () {
            return chai
                .request(server)
                .post('/api/files/upload')
                .set({ Authorization: token })
                .field('selectedFolder', rootData.name)
                .field('selectedFolderId', rootData.id)
                .field('fileWithExtention', 'large_dimension.jpg')
                .attach('file', 'test/test-image/large_dimension.jpg', 'large_dimension')
                .then((res) => {
                    largeUploadedFile = res.body;
                    largeUploadedFile.should.be.a('object');
                    largeUploadedFile.success.should.be.eql(true);
                    largeUploadedFile.message.should.be.eql('File uploaded successfully!');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('check uploaded file ICON uploaded', function () {
            let iconName = largeUploadedFile.data.file_property.path.split('/') || [];
            iconName = iconName[iconName.length - 1];
            return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });

        it('check uploaded file', function () {
            let pathImage = largeUploadedFile.data.file_property.path;
            return commonFunction.getObjectFromAws(`${pathImage}`).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });

        it('check uploaded file LARGE FILE uploaded', function () {
            let pathLargeImage = largeUploadedFile.data.file_property.path.replace('/', '/' + S3_MEDIA.largeFileName);
            return commonFunction.getObjectFromAws(`${pathLargeImage}`).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });
    });

    let largeCopyData, copyData
    describe('copy LARGE file', () => {
        before((done) => {
            largeCopyData = {
                "name": faker.lorem.word(),
                "description": "",
                "tag": "",
                "copyFileId": largeUploadedFile.data.id
            }
            done();
        });
        it('it should copy File with default case', () => {
            return chai
                .request(server)
                .post('/api/file/copy')
                .set({ Authorization: token })
                .send(largeCopyData)
                .then((res) => {
                    data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('File copied successfully.');
                    largeCopyFile = data.data;
                    largeCopyFile.id.should.not.be.null;
                    largeCopyFile.file_folder_id.should.not.be.null;
                    largeCopyFile.user_id.should.not.be.null;
                    largeCopyFile.permission.should.be.eql('EDIT');
                    largeCopyFile.name.should.be.eql(largeCopyData.name + largeCopyFile.file_property.extension_type);
                    largeCopyFile.entity_type.should.be.eql('FILE');
                    expect(largeCopyFile.parent_id === null).to.equal(false);
                    expect(largeCopyFile.file_property_id === null).to.equal(false);
                    expect(largeCopyFile.master_name === null).to.equal(false);
                    expect(largeCopyFile.count === null).to.equal(false);
                    expect(largeCopyFile.created_at === null).to.equal(false);
                    expect(largeCopyFile.updated_at === null).to.equal(false);
                    expect(largeCopyFile.user === null).to.equal(false);
                    expect(largeCopyFile.file_property === null).to.equal(false);
                    expect(largeCopyFile.sizeInBytes === null).to.equal(false);
                    expect(largeCopyFile.size === null).to.equal(false);
                    expect(largeCopyFile.nameWithOutExt === null).to.equal(false);
                    expect(largeCopyFile.thumbIconUrl === null).to.equal(false);
                    expect(largeCopyFile.OriginalImageUrl === null).to.equal(false);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('check copy file, ICON uploaded', function () {
            let iconName = largeCopyFile.file_property.path.split('/') || [];
            iconName = iconName[iconName.length - 1];
            return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });

        it('check copy file', function () {
            let pathImage = largeCopyFile.file_property.path;
            // iconName = iconName[iconName.length - 1];
            return commonFunction.getObjectFromAws(`${pathImage}`).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });

        it('check copy file LARGE FILE uploaded', function () {
            let pathLargeImage = largeCopyFile.file_property.path.replace('/', '/' + S3_MEDIA.largeFileName);
            // iconName = iconName[iconName.length - 1];
            return commonFunction.getObjectFromAws(`${pathLargeImage}`).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });
    });

    describe('/deleteFile FileId COPY LARGE FILE', () => {
        it('it should delete the file by file id', () => {
            return chai
                .request(server)
                .delete(`/api/file/${largeCopyFile.id}`)
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    res.body.message.should.be.eql('Deleted succesfully');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('should not found deleted ICON', function () {
            return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + largeCopyFile.name).then((iconUpload) => {
                expect(iconUpload).to.equal(false);
            });
        });

        // it('should not found deleted LARGE FILE', function () {
        //     pathLargeImage = largeCopyFile.file_property.path.replace('/', '/' + S3_MEDIA.largeFileName);
        //     return commonFunction.getObjectFromAws(pathLargeImage).then((iconUpload) => {
        //         expect(iconUpload).to.equal(false);
        //     });
        // });
    });

    describe('/deleteFile LARGE FILE', () => {
        it('it should delete the file by file id', () => {
            return chai
                .request(server)
                .delete(`/api/file/${largeUploadedFile.data.id}`)
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    res.body.message.should.be.eql('Deleted succesfully');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('should not found deleted ICON', function () {
            return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + largeUploadedFile.data.name).then((iconUpload) => {
                expect(iconUpload).to.equal(false);
            });
        });

        // it('should not found deleted LARGE FILE', function () {
        //     pathLargeImage = largeUploadedFile.data.file_property.path.replace('/', '/' + S3_MEDIA.largeFileName);
        //     return commonFunction.getObjectFromAws(pathLargeImage).then((iconUpload) => {
        //         expect(iconUpload).to.equal(false);
        //     });
        // });
    });

    // getFilePreviewInBlob Test Case 
    describe('/getFilePreviewInBlob/:fileId', () => {
        // without token test case
        it('it should not getFilePreviewInBlob without access token', () => {
            return chai
                .request(server)
                .get(`/api/file/preview-blob/${uploadedFile.data.id}`)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not getFilePreviewInBlob(Invalid File)', () => {
            return chai
                .request(server)
                .get(`/api/file/preview-blob/${faker.random.number()}`)
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.data.length.should.be.eql(0);
                    data.message.should.be.eql('file doesn\'t exist');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should getFilePreviewInBlob(Valid File)', () => {
            return chai
                .request(server)
                .get(`/api/file/preview-blob/${uploadedFile.data.id}`)
                .set({ Authorization: token })
                .then((res) => {
                    console.log('-----uploadedFile.data----', uploadedFile.data);
                    const data = res.body;
                    expect(data.data.length).to.not.equal(0);
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        // it('it should getFilePreviewInBlob(Valid File)', () => {
        //     return chai
        //         .request(server)
        //         .get(`/api/file/preview-blob/${uploadedFile.data.id}`)
        //         .set({ Authorization: token })
        //         .then((res) => {
        //             const data = res.body;
        //             expect(data.data.length).to.not.equal(0);
        //             data.success.should.be.eql(true);
        //             data.message.should.be.eql('');
        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });
    });

    //getFileInBlob // ?secret_token=
    // describe('/getFileInBlob/:fileId', () => {
    //     it('it should not getFileInBlob without access token', () => {
    //         return chai
    //             .request(server)
    //             .get(`/api/file/blob/${uploadedFile.data.id}?secret_token=`)
    //             .then((res) => {
    //                 res.should.have.status(401);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should not getFileInBlob(Invalid File)', () => {
    //         return chai
    //             .request(server)
    //             .get(`/api/file/blob/${faker.random.number()}?secret_token=${token.replace("Bearer ", "")}`)
    //             // .set({ Authorization: token })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(false);
    //                 data.data.length.should.be.eql(0);
    //                 data.message.should.be.eql('file doesn\'t exist');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should getFileInBlob(Valid File)', () => {
    //         return chai
    //             .request(server)
    //             .get(`/api/file/blob/${uploadedFile.data.id}?secret_token=${token.replace("Bearer ", "")}`)
    //             .then((res) => {
    //                 // console.log('-----it should getFileInBlob(Valid File)-----', res.res);
    //                 res.res.should.not.be.null;
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // })

    // copy file default case 1 
    describe('copy file', () => {
        before((done) => {
            copyData = {
                "name": faker.lorem.word(),
                "description": "",
                "tag": "",
                "copyFileId": uploadedFile.data.id
            }
            done();
        });
        describe('copy file access token failed', () => {

            // without token test case
            it('it should not copy File without access token', () => {
                return chai
                    .request(server)
                    .post('/api/file/copy')
                    .then((res) => {
                        res.should.have.status(401);
                    }).catch(function (err) {
                        return Promise.reject(err);
                    });
            });

            it('it should not copy non-exist File', () => {
                return chai
                    .request(server)
                    .post('/api/file/copy')
                    .set({ Authorization: token })
                    .send({
                        "name": faker.lorem.word(),
                        "description": "",
                        "tag": "",
                        "copyFileId": 0
                    })
                    .then((res) => {
                        data = res.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(false);
                        data.message.should.be.eql('Invalid Source File.');
                    }).catch(function (err) {
                        return Promise.reject(err);
                    });
            });
        });

        describe('copy file default', () => {
            // before((done) => {
            //     done();
            // });
            it('it should copy File with default case', () => {
                return chai
                    .request(server)
                    .post('/api/file/copy')
                    .set({ Authorization: token })
                    .send(copyData)
                    .then((res) => {
                        data = res.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(true);
                        data.message.should.be.eql('File copied successfully.');

                        data.data.id.should.not.be.null;
                        data.data.file_folder_id.should.not.be.null;
                        data.data.user_id.should.not.be.null;
                        data.data.permission.should.be.eql('EDIT');
                        data.data.name.should.be.eql(copyData.name + uploadedFile.data.file_property.extension_type);
                        data.data.entity_type.should.be.eql('FILE');
                        expect(data.data.parent_id === null).to.equal(false);
                        expect(data.data.file_property_id === null).to.equal(false);
                        expect(data.data.master_name === null).to.equal(false);
                        expect(data.data.count === null).to.equal(false);
                        expect(data.data.created_at === null).to.equal(false);
                        expect(data.data.updated_at === null).to.equal(false);
                        expect(data.data.user === null).to.equal(false);
                        expect(data.data.file_property === null).to.equal(false);
                        expect(data.data.sizeInBytes === null).to.equal(false);
                        expect(data.data.size === null).to.equal(false);
                        expect(data.data.nameWithOutExt === null).to.equal(false);
                        expect(data.data.thumbIconUrl === null).to.equal(false);
                        expect(data.data.OriginalImageUrl === null).to.equal(false);
                    }).catch(function (err) {
                        return Promise.reject(err);
                    });
            });
            it('check copy file, ICON uploaded', function () {
                let iconName = data.data.file_property.path.split('/') || [];
                iconName = iconName[iconName.length - 1];
                return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
                    expect(iconUpload).to.equal(true);
                });
            });
        });

        // copy file case 2
        describe('copy file case 2', () => {
            it('it should copy File such as copyfile followed by sequential number', () => {
                return chai
                    .request(server)
                    .post('/api/file/copy')
                    .set({ Authorization: token })
                    .send(copyData)
                    .then((res) => {
                        data = res.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(true);
                        data.message.should.be.eql('File copied successfully.');
                        data.data.id.should.not.be.null;
                        data.data.file_folder_id.should.not.be.null;
                        data.data.user_id.should.not.be.null;
                        data.data.permission.should.be.eql('EDIT');
                        // console.log('------1432------', data.data, copyData )
                        data.data.name.should.be.eql(copyData.name + data.data.file_property.extension_type);
                        data.data.entity_type.should.be.eql('FILE');
                        expect(data.data.parent_id === null).to.equal(false);
                        expect(data.data.file_property_id === null).to.equal(false);
                        expect(data.data.master_name === null).to.equal(false);
                        expect(data.data.count === null).to.equal(false);
                        expect(data.data.created_at === null).to.equal(false);
                        expect(data.data.updated_at === null).to.equal(false);
                        expect(data.data.user === null).to.equal(false);
                        expect(data.data.file_property === null).to.equal(false);
                        expect(data.data.sizeInBytes === null).to.equal(false);
                        expect(data.data.size === null).to.equal(false);
                        expect(data.data.nameWithOutExt === null).to.equal(false);
                        expect(data.data.thumbIconUrl === null).to.equal(false);
                        expect(data.data.OriginalImageUrl === null).to.equal(false);
                    }).catch(function (err) {
                        return Promise.reject(err);
                    });
            });
            it('check copy File such as copyfile followed by sequential number, ICON uploaded', function () {
                let iconName = data.data.file_property.path.split('/') || [];
                iconName = iconName[iconName.length - 1];
                return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
                    expect(iconUpload).to.equal(true);
                });
            });
        });

        // // copy file case 3
        describe('copy file case 3', () => {
            before((done) => {
                copyData.name = copyData.name + '(1)';
                done();
            });
            it('it should copy File while enter the already copied file with sequential number', () => {
                return chai
                    .request(server)
                    .post('/api/file/copy')
                    .set({ Authorization: token })
                    .send(copyData)
                    .then((res) => {
                        data = res.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(true);
                        data.message.should.be.eql('File copied successfully.');
                        data.data.id.should.not.be.null;
                        data.data.file_folder_id.should.not.be.null;
                        data.data.user_id.should.not.be.null;
                        data.data.permission.should.be.eql('EDIT');
                        data.data.name.should.be.eql(copyData.name + data.data.file_property.extension_type);
                        data.data.entity_type.should.be.eql('FILE');
                        expect(data.data.parent_id === null).to.equal(false);
                        expect(data.data.file_property_id === null).to.equal(false);
                        expect(data.data.master_name === null).to.equal(false);
                        expect(data.data.count === null).to.equal(false);
                        expect(data.data.created_at === null).to.equal(false);
                        expect(data.data.updated_at === null).to.equal(false);
                        expect(data.data.user === null).to.equal(false);
                        expect(data.data.file_property === null).to.equal(false);
                        expect(data.data.sizeInBytes === null).to.equal(false);
                        expect(data.data.size === null).to.equal(false);
                        expect(data.data.nameWithOutExt === null).to.equal(false);
                        expect(data.data.thumbIconUrl === null).to.equal(false);
                        expect(data.data.OriginalImageUrl === null).to.equal(false);
                    }).catch(function (err) {
                        return Promise.reject(err);
                    });
            });
            it('check copy File while enter the already copied file with sequential number, ICON uploaded', function () {
                let iconName = data.data.file_property.path.split('/') || [];
                iconName = iconName[iconName.length - 1];
                return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
                    expect(iconUpload).to.equal(true);
                });
            });
        });
    });


    // Share functions
    describe('Share module', () => {
        let postInfo, folder, folder_access, base_folder_access;
        const USER_TYPE = {
            USER: 'USER',
            SHARED: 'SHARE_GUEST',
            CONTACT: 'CONTACT'
        }

        before(done => {

            commonFunction.addDataToTable('files_folders', {
                original_name: sharedWithUser.email,
                created_by: sharedWithUser.id,
                entity_type: 'FOLDER'
            }).then(data => {
                return commonFunction.addDataToTable('files_folders_accesses', {
                    name: sharedWithUser.email,
                    file_folder_id: data.id,
                    user_id: sharedWithUser.id,
                    permission: "EDIT",
                    entity_type: 'FOLDER',
                    master_name: sharedWithUser.email,
                    count: 0,
                    parent_id: null
                })
            })
                .then(access_data => {
                    base_folder_access = access_data;
                    return commonFunction.addDataToTable('files_folders', {
                        original_name: 'sub folder test',
                        created_by: sharedWithUser.id,
                        entity_type: 'FOLDER'
                    })
                })
                .then(data => {
                    folder = data;
                    return commonFunction.addDataToTable('files_folders_accesses', {
                        name: 'sub folder test',
                        file_folder_id: data.id,
                        user_id: sharedWithUser.id,
                        permission: "EDIT",
                        entity_type: 'FOLDER',
                        master_name: 'sub folder test',
                        count: 0,
                        parent_id: rootData.id
                    })
                })
                .then(access_data => {
                    folder_access = access_data;
                    done();
                })
        });


        describe('Share file', () => {

            beforeEach((done) => {
                postInfo = {
                    entity_type: 'FILE',
                    file_folder_id: uploadedFile.data.file_folder_id,
                    file_folder_access_id: uploadedFile.data.id,
                    accessData: {
                        share1: {
                            id: sharedWithUser.id,
                            permission: 'VIEW',
                            type: USER_TYPE.USER
                        }
                    },
                    removedShares: []
                };
                done();
            });

            it('Should not share without auth token', () => {
                return chai.request(server)
                    .put('/api/sharedata/update')
                    .send(postInfo)
                    .then((res) => {
                        res.should.have.status(401);
                    }).catch(function (err) {
                        return Promise.reject(err);
                    });
            })

            it('Should not run with invalid type', () => {
                postInfo.entity_type = 'file/folder';

                return chai.request(server)
                    .put('/api/sharedata/update')
                    .set({ Authorization: token })
                    .send(postInfo)
                    .then(resp => {
                        let data = resp.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(false);
                    })
            });

            it('Should not share with invalid data', () => {
                postInfo.file_folder_access_id = 0;
                return chai.request(server)
                    .put('/api/sharedata/update')
                    .set({ Authorization: token })
                    .send(postInfo)
                    .then(resp => {
                        let data = resp.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(false);
                        data.message.should.be.eql('Invalid request!');
                    })
            })

            it('Should share a file', () => {
                return chai.request(server)
                    .put('/api/sharedata/update')
                    .set({ Authorization: token })
                    .send(postInfo)
                    .then(resp => {
                        let data = resp.body;
                        data.should.be.a('object');
                        data.message.should.be.eql('Data access updated');
                        data.success.should.be.eql(true);
                    })
            });

            it('should share a file with a contact', () => {

                commonFunction.addDataToTable('contacts', {
                    first_name: 'John',
                    last_name: ' Doe',
                    email: 'john.doe@example.com',
                    phone_number: 123457890,
                    entity_id: 1
                })
                    .then(data => {
                        postInfo.accessData.share1.id = data.id;
                        postInfo.accessData.share1.type = USER_TYPE.CONTACT;

                        return chai.request(server)
                            .put('/api/sharedata/update')
                            .set({ Authorization: token })
                            .send(postInfo)
                    })
                    .then(resp => {
                        let data = resp.body;
                        data.should.be.a('object');
                        data.message.should.be.eql('Data access updated');
                        data.success.should.be.eql(true);
                    })
            })

            it('should share a file with a guest user', () => {
                postInfo.accessData.share1.id = 'test@test.com';
                postInfo.accessData.share1.type = USER_TYPE.SHARED;

                return chai.request(server)
                    .put('/api/sharedata/update')
                    .set({ Authorization: token })
                    .send(postInfo)
                    .then(resp => {
                        let data = resp.body;
                        data.should.be.a('object');
                        data.message.should.be.eql('Data access updated');
                        data.success.should.be.eql(true);
                    })
            })

            it('Should remove existing shares', () => {
                return chai.request(server)
                    .put('/api/sharedata/update')
                    .set({ Authorization: token })
                    .send(postInfo)
                    .then(resp => {
                        let data = resp.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(true);
                    })
            })

        })

        describe('Shared files/folder list', () => {

            it('Should not share without auth token', () => {
                return chai.request(server)
                    .get('/api/sharedata/FOLDER')
                    .then((res) => {
                        res.should.have.status(401);
                    }).catch(function (err) {
                        return Promise.reject(err);
                    });
            });

            // it('Should throw exception with invalid type', () => {
            //     return chai.request(server)
            //         .get('/api/sharedata/test')
            //         .set({ Authorization: shareUserToken })
            //         .then((res) => {
            //             res.body.success.should.be.eql(false)
            //             res.body.message.should.be.eql('child type invalid');
            //         })
            // });

            it('Should return shared files', () => {

                commonFunction.addDataToTable('share_files_folders', {
                    file_folder_id: uploadedFile.data.file_folder_id,
                    file_folder_access_id: uploadedFile.data.id,
                    user_id: sharedWithUser.id,
                    created_by: loggedInUser.id,
                    permission: 'EDIT',
                    status: 'SHARED',
                    user_type: 'USER'
                })
                    .then(resp => {
                        return chai.request(server)
                            .get('/api/sharedata/FOLDER')
                            .set({ Authorization: token2 })
                    })
                    .then((res) => {
                        let body = res.body;
                        body.success.should.be.eql(true);
                        body.data[0].data.name.should.be.eql('shared');
                        body.data[0].data.entity_type.should.be.eql('FOLDER');

                        expect(body.data[0].children.length > 0).to.be.eql(true)
                    })
            })

            // it('Should return no shared folders', () => {
            //     return chai.request(server)
            //         .get('/api/sharedata/childs/null/FOLDER')
            //         .set({ Authorization: shareUserToken })
            //         .then((res) => {
            //             let body = res.body;
            //             body.success.should.be.eql(false);
            //             expect(!body.data.length).to.be.eql(true);
            //             body.message.should.be.eql('folder doesn\'t exist');
            //         })
            // })

            // it('Should throw exception with invalid type, when getting childs', () => {
            //     return chai.request(server)
            //         .get('/api/sharedata/childs/null/0')
            //         .set({ Authorization: shareUserToken })
            //         .then((res) => {
            //             let body = res.body;
            //             body.success.should.be.eql(false);
            //             body.message.should.be.eql('child type invalid');
            //         })
            // })

            it('Should return shared folders', () => {

                commonFunction.addDataToTable('share_files_folders', {
                    file_folder_id: folder.id,
                    file_folder_access_id: folder_access.id,
                    user_id: sharedWithUser.id,
                    created_by: loggedInUser.id,
                    permission: 'EDIT',
                    status: 'SHARED',
                    user_type: 'USER'
                })
                    .then((doc) => {
                        return chai.request(server)
                            .get('/api/sharedata/childs/0/FOLDER')
                            .set({ Authorization: token2 })
                            .then((res) => {
                                let body = res.body;
                                body.success.should.be.eql(true);
                                body.data[0].data.entity_type.should.be.eql('FOLDER');
                            })
                    })

            })
        })

        describe('Move shared file', () => {

            let moveRequest;
            beforeEach((done) => {
                moveRequest = {
                    file_id: uploadedFile.data.id,
                    folder_id: base_folder_access.id
                };
                done();
            });

            it('Should not share without auth token', () => {
                return chai.request(server)
                    .post('/api/move/share/file')
                    .send(moveRequest)
                    .then((res) => {
                        res.should.have.status(401);
                    }).catch(function (err) {
                        return Promise.reject(err);
                    });
            })

            // it('should move shared file to local', () => {

            //     return chai.request(server)
            //         .post('/api/move/share/file')
            //         .set({ Authorization: token2 })
            //         .send(moveRequest)
            //         .then(resp => {
            //             let data = resp.body;
            //             console.log("--------------------resp.body==============================================",resp.body);
            //             data.should.be.a('object');
            //             data.success.should.be.eql(true);
            //         })
            // });

            it('Should give exception on invalid source', () => {
                moveRequest.file_id = 0;
                return chai.request(server)
                    .post('/api/move/share/file')
                    .set({ Authorization: token })
                    .send(moveRequest)
                    .then(resp => {
                        let data = resp.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(false);
                        data.message.should.be.eql('File you\'re trying to move doesn\'t exist or is deleted!');
                    })
            })

            it('Should give exception on invalid target', () => {
                moveRequest.folder_id = 0;
                return chai.request(server)
                    .post('/api/move/share/file')
                    .set({ Authorization: token })
                    .send(moveRequest)
                    .then(resp => {
                        let data = resp.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(false);
                        data.message.should.be.eql('You\'re trying to move to a non-existent folder!');
                    })
            })

            it('Should give exception if the file is already moved', async () => {

                await chai.request(server)
                    .post('/api/move/share/file')
                    .set({ Authorization: token2 })
                    .send(moveRequest)
                let resp = await chai.request(server)
                    .post('/api/move/share/file')
                    .set({ Authorization: token })
                    .send(moveRequest)

                let data = resp.body;
                data.should.be.a('object');
                data.success.should.be.eql(false);

            })
        })

        describe('Share folder', () => {

            beforeEach((done) => {
                postInfo = {
                    entity_type: 'FOLDER',
                    file_folder_id: folder.id,
                    file_folder_access_id: folder_access.id,
                    accessData: {
                        share1: {
                            id: sharedWithUser.id,
                            permission: 'VIEW',
                            type: USER_TYPE.USER
                        }
                    },
                    removedShares: []
                };
                done();
            });

            it('Should not share without auth token', () => {
                return chai.request(server)
                    .put('/api/sharedata/update')
                    .send(postInfo)
                    .then((res) => {
                        res.should.have.status(401);
                    }).catch(function (err) {
                        return Promise.reject(err);
                    });
            })

            it('Should not run with invalid type', () => {
                postInfo.entity_type = 'file/folder';

                return chai.request(server)
                    .put('/api/sharedata/update')
                    .set({ Authorization: token })
                    .send(postInfo)
                    .then(resp => {
                        let data = resp.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(false);
                    })
            });

            it('Should not share with invalid data', () => {
                postInfo.file_folder_access_id = 0;
                return chai.request(server)
                    .put('/api/sharedata/update')
                    .set({ Authorization: token })
                    .send(postInfo)
                    .then(resp => {
                        let data = resp.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(false);
                        data.message.should.be.eql('Invalid request!');
                    })
            })

            it('Should not share with non existing file/folder', () => {
                postInfo.file_folder_access_id = 99999;
                return chai.request(server)
                    .put('/api/sharedata/update')
                    .set({ Authorization: token })
                    .send(postInfo)
                    .then(resp => {
                        let data = resp.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(false);
                        data.message.should.be.eql('Folder doesn\'t exists');
                    })
            })

            it('Should share folder', () => {
                
                return chai.request(server)
                    .put('/api/sharedata/update')
                    .set({ Authorization: token })
                    .send(postInfo)
                    .then(resp => {
                        let data = resp.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(true);
                        data.message.should.be.eql('Data access updated')
                    })
            });


            it("Should not share root folder", () => {
                postInfo.file_folder_id = rootData.file_folder_id;
                postInfo.file_folder_access_id = rootData.id
                return chai.request(server)
                    .put('/api/sharedata/update')
                    .set({ Authorization: token })
                    .send(postInfo)
                    .then(resp => {
                        let data = resp.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(false);
                        data.message.should.be.eql('You cannot share root folder!')
                    })
            })


            it('Should remove existing shares', () => {
                return chai.request(server)
                    .put('/api/sharedata/update')
                    .set({ Authorization: token })
                    .send(postInfo)
                    .then(resp => {
                        let data = resp.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(true);
                    })
            })

        })

        describe('Move shared folder', () => {
            let moveRequest;
            beforeEach((done) => {
                moveRequest = {
                    folderToMove_id: folder_access.id,
                    shiftedToFolder_id: base_folder_access.id
                };
                done();
            });

            it('Should not share without auth token', () => {
                return chai.request(server)
                    .post('/api/move/share/folder')
                    .send(moveRequest)
                    .then((res) => {
                        res.should.have.status(401);
                    }).catch(function (err) {
                        return Promise.reject(err);
                    });
            })

            it('should move shared folder to local', () => {
                return chai.request(server)
                    .post('/api/move/share/folder')
                    .set({ Authorization: token2 })
                    .send(moveRequest)
                    .then(resp => {
                        let data = resp.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(true);
                    })
            });

            it('Should give exception on invalid target and source', () => {
                return chai.request(server)
                    .post('/api/move/share/folder')
                    .set({ Authorization: token2 })
                    .send({
                        folderToMove_id: 0,
                        shiftedToFolder_id: 0
                    })
                    .then(resp => {
                        let data = resp.body;
                        data.should.be.a('object');
                        data.success.should.be.eql(false);
                        data.message.should.be.eql('You\'re trying to move an invalid folder!');
                    })
            })
        })

        describe('Shared users list', () => {

            it('Should not share without auth token', () => {
                return chai.request(server)
                    .get(`/api/sharedata/users/${uploadedFile.data.file_folder_id}/file`)
                    .then((res) => {
                        res.should.have.status(401);
                    }).catch(function (err) {
                        return Promise.reject(err);
                    });
            })

            it('Should throw exception with invalid file type', () => {
                return chai.request(server)
                    .get(`/api/sharedata/users/${uploadedFile.data.file_folder_id}/test`)
                    .set({ Authorization: token })
                    .then((res) => {
                        let data = res.body;

                        data.success.should.be.eql(false);
                        data.message.should.be.eql('Type invalid');
                    })
            })

            it('Should return empty shared data with invalid file folder access id', () => {
                return chai.request(server)
                    .get(`/api/sharedata/users/0/file`)
                    .set({ Authorization: token })
                    .then((res) => {
                        let body = res.body;
                        body.success.should.be.eql(true);
                        body.sharedWith.should.have.length(0);
                        body.message.should.be.eql("Invalid file or folder");
                    })
            })

            // it('Should return userslist at all times', () => {
            //     return chai.request(server)
            //         .get(`/api/sharedata/users/${uploadedFile.data.file_folder_id}/file`)
            //         .set({ Authorization: token })
            //         .then((res) => {
            //             let data = res.body;
            //             data.data.should.be.a('array');
            //         })
            //         .then(() => {
            //             return chai.request(server)
            //                 .get(`/api/sharedata/users/00/test`)
            //                 .set({ Authorization: token });
            //         })
            //         .then((res) => {
            //             let data = res.body;
            //             data.data.should.be.a('array');
            //         })
            // })

            it('Should give shared users list for a file/folder', () => {

                return chai.request(server)
                    .get(`/api/sharedata/users/${folder_access.id}/file`)
                    .set({ Authorization: token })
                    .then((res) => {
                        let body = res.body;
                        body.success.should.be.eql(true);
                        body.message.should.be.eql('user-list recieved successfully');
                        body.sharedWith.should.be.a('object');
                    })
            });

            // it('Should give empty shared users list for a file/folder', () => {
            //     return chai.request(server)
            //         .get(`/api/sharedata/users/${largeUploadedFile.data.file_folder_id}/file`)
            //         .set({ Authorization: token })
            //         .then((res) => {
            //             let body = res.body;
            //             body.success.should.be.eql(true);
            //             body.message.should.be.eql('No shared users found');
            //             body.sharedWith.should.be.a('array');
            //             body.sharedWith.should.have.length('0');
            //         })
            // });
        });

        describe('Users list for sharing', () => {
            let request = {}

            beforeEach(() => {
                request = { 
                    "selectedData": { 
                        "sharable1557395785865": { 
                            "id": user[0].id, 
                            "permission": "VIEW", 
                            "disabled": false, 
                            "type": "USER", 
                            "isOpen": false 
                        } 
                    }, 
                    "currentIndex": "sharable1557395785865",
                    "query": "a",
                    "file_folder_id": largeUploadedFile.data.file_folder_id
                }
            })

            it('Should not share without auth token', () => {
                encodedObject = commonFunction.encodeToBase64(request);
                return chai.request(server)
                    .get(`/api/sharedata/userList/`+encodedObject)
                    // .send(request)
                    .then((res) => {
                        res.should.have.status(401);
                    }).catch(function (err) {
                        return Promise.reject(err);
                    });
            })

            it('Should return empty list with no query string', () => {
                request.query = '';
                encodedObject = commonFunction.encodeToBase64(request);
                return chai.request(server)
                    .get(`/api/sharedata/userList/`+encodedObject)
                    .set({ Authorization: token })
                    // .send(request)
                    .then((res) => {
                        let body = res.body;
                        body.success.should.be.eql(false);
                        body.payload.should.have.length(0);
                        body.message.should.be.eql("Empty search params.");
                    })
            })

            it('Should return more than one user with search string', () => {
                request.query = 'a';
                encodedObject = commonFunction.encodeToBase64(request);
                return chai.request(server)
                    .get(`/api/sharedata/userList/`+encodedObject)
                    .set({ Authorization: token })
                    // .send(request)
                    .then((res) => {
                        let body = res.body;
                        body.success.should.be.eql(true);
                        expect(body.payload.length > 1).eql(true);
                        body.message.should.be.eql("Users found!");
                    })
            })
        })

    });

    describe('/deleteFile FileId', () => {
        // without token test case
        it('it should not delete file without access token', () => {
            return chai
                .request(server)
                .delete(`/api/file/${faker.random.number()}`)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('should not delete file without permission', () => {
            return chai
                .request(server)
                .delete(`/api/file/${uploadedFile.data.id}`)
                .set({ Authorization: token2 })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    res.body.message.should.be.eql('You don\'t have the required permission');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        })

        it('it should not delete file if file does not exist', () => {
            return chai
                .request(server)
                .delete(`/api/file/${faker.random.number()}`)
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    res.body.message.should.be.eql('File doesn\'t exists');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/deleteFile FileId', () => {
        it('it should not delete the file', () => {
            return chai
                .request(server)
                .delete(`/api/file/${uploadedFile.data.id}`)
                .set({ Authorization: token2 })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    res.body.message.should.be.eql('You don\'t have the required permission');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    after((done) => {
        // remove main root folder
        commonFunction.removeFolderFromAws(rootData.path).then(() => {
            commonFunction.removeFolderFromAws(loggedInUser.email).then(() => {
                commonFunction.removeFolderFromAws('icons/' + loggedInUser.email).then(() => {
                    commonFunction.removeFolderFromAws(user[1].email).then(() => {
                        commonFunction.removeFolderFromAws('icons/' + user[1].email).then(() => {
                            commonFunction.removeFolderFromAws(subFolderName).then(() => {
                                done();
                            })
                        })
                    })
                })
            })
        })
    })
});