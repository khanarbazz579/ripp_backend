const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const faker = require('faker');

const Folders = require('../../models').folders;
const commonFunction = require('../commonFunction');
const server = require('../../app');
const generatedSampleData = require('../sampleData');

const should = chai.should();

let rootData, user, token, token2, loggedInUser, files, copyFileData, sharedWithUser, sharedFolder, subFolderData, uploadedFile, uploadedFile1, uploadedFile2, rootFolderofUser2;

chai.use(chaiHttp);

describe('files', () => {
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });

    before((done) => { //Before each test we empty the database
        commonFunction.sequalizedDb(['users', 'folders', 'files', 'user_roles', 'permission_sets']).then(() => {
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


    // it('it should be login user with token and credential', () => {
    //     return chai.request(server)
    //         .post('/api/users/login')
    //         .send(user[0])
    //         .then((res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a('object');
    //             res.body.token.should.be.a('string');
    //             token = res.body.token;
    //             loggedInUser = res.body.user;
    //             res.body.user.should.be.a('object');
    //             res.body.user.first_name.should.be.eql(user[0].first_name);
    //             res.body.user.last_name.should.be.eql(user[0].last_name);
    //             res.body.user.email.should.be.eql(user[0].email);
    //         })
    //         .catch(function (err) {
    //             return Promise.reject(err);
    //         });
    // });

    // it('it should be login user2', () => {
    //     return chai.request(server)
    //         .post('/api/users/login')
    //         .send(user[1])
    //         .then((res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a('object');
    //             res.body.token.should.be.a('string');
    //             token2 = res.body.token;
    //             // loggedInUser = res.body.user;
    //             res.body.user.should.be.a('object');
    //             res.body.user.first_name.should.be.eql(user[1].first_name);
    //             res.body.user.last_name.should.be.eql(user[1].last_name);
    //             res.body.user.email.should.be.eql(user[1].email);
    //         })
    //         .catch(function (err) {
    //             return Promise.reject(err);
    //         });
    // });


    // copy file default case 1 
    // describe('copy file', () => {
    //     before((done) => {
    //         commonFunction.addDataToTable('folders', {
    //             name: user[0].email,
    //             parent_id: null,
    //             type: 'directory',
    //             created_by: loggedInUser.id,
    //             path: user[0].email,
    //             shared_with: null,
    //             master_name: user[0].email
    //         }).then((data) => {
    //             rootData = data;
    //             files = generatedSampleData.createdSampleData('files', 2);
    //             files[0]['folder_id'] = rootData.id;
    //             files[0]['created_by'] = loggedInUser.id;
    //             files[1]['folder_id'] = rootData.id;
    //             files[1]['created_by'] = loggedInUser.id;

    //             commonFunction.addDataToTable('files', files[0]).then(() => {
    //                 commonFunction.addDataToTable('files', files[1]).then(() => {
    //                     files[0]['folderId'] = rootData.id;
    //                     files[0]['copyFileId'] = 0;
    //                     files[0]['shared_with'] = null;
    //                     files[0]['oldPath'] = files[0]['path'];

    //                     tempFile = files[0];
    //                     tempFile.folderId = 0;
    //                     done();
    //                 });
    //             });
    //         });

    //         // without token test case
    //         it('it should not POST a CopyFile without access token', () => {
    //             return chai
    //                 .request(server)
    //                 .post('/api/file/copy')
    //                 .then((res) => {
    //                     res.should.have.status(401);
    //                 }).catch(function (err) {
    //                     return Promise.reject(err);
    //                 });
    //         });

    //         it('it should not copy File if folderId is invalid', () => {
    //             return chai
    //                 .request(server)
    //                 .post('/api/file/copy')
    //                 .set({ Authorization: token })
    //                 .send(tempFile)
    //                 .then((res) => {
    //                     data = res.body;
    //                     data.should.be.a('object');
    //                     data.success.should.be.eql(false);
    //                     data.message.should.be.eql('Invalid folder.');
    //                 }).catch(function (err) {
    //                     return Promise.reject(err);
    //                 });
    //         });

    //         it('it should not copy non-exist File', () => {
    //             return chai
    //                 .request(server)
    //                 .post('/api/file/copy')
    //                 .set({ Authorization: token })
    //                 .send(files[0])
    //                 .then((res) => {
    //                     data = res.body;
    //                     data.should.be.a('object');
    //                     data.success.should.be.eql(false);
    //                     data.message.should.be.eql('Invalid Source File.');
    //                 }).catch(function (err) {
    //                     return Promise.reject(err);
    //                 });
    //         });
    //     });
    // });
        // describe('getFolderChilds files/folders', () => {

        //     // without token test case
        //     it('it should not GET files/folders without access token', () => {
        //         return chai
        //             .request(server)
        //             .get('/api/folder/childs/' + rootData.id + '/files')
        //             .then((res) => {
        //                 res.should.have.status(401);
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });

        //     it('it should get files/folders as FolderTree with child', () => {
        //         return chai
        //             .request(server)
        //             .get('/api/folder/childs/' + rootData.id + '/files')
        //             .set({ Authorization: token })
        //             .then((res) => {
        //                 data = res.body.data;
        //                 data.should.be.a('array');
        //                 data.length.should.be.eql(2);

        //                 const firstChild = data[0].data;
        //                 console.log('----firstChild----', firstChild);
        //                 copyFileData = firstChild;
        //                 firstChild.name.should.be.eql(files[0].name);
        //                 firstChild.created_by.should.be.eql(loggedInUser.id);
        //                 firstChild.master_name.should.be.eql(files[0].name);
        //                 firstChild.count.should.be.eql(files[0].count);
        //                 firstChild.description.should.be.eql(files[0].description);

        //                 firstChild.folder_id.should.be.eql(rootData.id);
        //                 firstChild.type.should.not.be.null;
        //                 firstChild.path.should.not.be.null;
        //                 firstChild.size.should.not.be.null;
        //                 firstChild.created_at.should.not.be.null;
        //                 firstChild.updated_at.should.not.be.null;
        //                 expect(firstChild.refrence_id === null).to.equal(true);
        //                 expect(firstChild.width === null).to.equal(true);
        //                 expect(firstChild.height === null).to.equal(true);
        //                 expect(firstChild.quality === null).to.equal(true);

        //                 firstChild.user.first_name.should.be.eql(user[0].first_name);
        //                 firstChild.user.last_name.should.be.eql(user[0].last_name);
        //                 firstChild.user.email.should.be.eql(user[0].email);

        //                 firstChild.sizeInBytes.should.not.be.null;
        //                 firstChild.nameWithOutExt.should.not.be.null;
        //                 firstChild.thumbIconUrl.should.not.be.null;
        //                 firstChild.OriginalImageUrl.should.not.be.null;


        //                 const secondChild = data[1].data;

        //                 secondChild.name.should.be.eql(files[1].name);
        //                 secondChild.created_by.should.be.eql(loggedInUser.id);
        //                 secondChild.master_name.should.be.eql(files[1].name);
        //                 secondChild.count.should.be.eql(files[1].count);
        //                 secondChild.description.should.be.eql(files[1].description);
        //                 secondChild.folder_id.should.be.eql(rootData.id);
        //                 secondChild.type.should.not.be.null;
        //                 secondChild.path.should.not.be.null;
        //                 secondChild.size.should.not.be.null;
        //                 secondChild.created_at.should.not.be.null;
        //                 secondChild.updated_at.should.not.be.null;
        //                 expect(secondChild.refrence_id === null).to.equal(true);
        //                 expect(secondChild.width === null).to.equal(true);
        //                 expect(secondChild.height === null).to.equal(true);
        //                 expect(secondChild.quality === null).to.equal(true);

        //                 secondChild.user.first_name.should.be.eql(user[0].first_name);
        //                 secondChild.user.last_name.should.be.eql(user[0].last_name);
        //                 secondChild.user.email.should.be.eql(user[0].email);

        //                 secondChild.sizeInBytes.should.not.be.null;
        //                 secondChild.nameWithOutExt.should.not.be.null;
        //                 secondChild.thumbIconUrl.should.not.be.null;
        //                 secondChild.OriginalImageUrl.should.not.be.null;
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });

        // });

        // // upload file through Api
        // describe('Upload files', () => {
        //     // without token test case
        //     it('it should not Upload a file without access token', () => {
        //         return chai
        //             .request(server)
        //             .post('/api/files/upload')
        //             .then((res) => {
        //                 res.should.have.status(401);
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });

        //     it('a file', function () {
        //         return chai
        //             .request(server)
        //             .post('/api/files/upload')
        //             .set({ Authorization: token })
        //             .field('selectedFolder', rootData.name)
        //             .field('selectedFolderId', rootData.id)
        //             .field('fileWithExtention', 'Googlelogo.png')
        //             .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
        //             .then((res) => {
        //                 uploadedFile = res.body;
        //                 uploadedFile.should.be.a('object');
        //                 uploadedFile.success.should.be.eql(true);
        //                 uploadedFile.message.should.be.eql('File uploaded successfully!');
        //                 // console.log('----uploadedFile---', uploadedFile.data);
        //                 commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + uploadedFile.data.name).then((iconUpload) => {
        //                     // console.log('---iconUpload----', iconUpload);
        //                     expect(iconUpload).to.equal(true);
        //                 });
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });
        //     it('check uploaded file ICON uploaded', function () {
        //         let iconName = uploadedFile.data.path.split('/') || [];
        //         iconName = iconName[iconName.length - 1];
        //         return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
        //             expect(iconUpload).to.equal(true);
        //         });
        //     });
        // });

        // describe('Upload files 1', () => {
        //     it('a file', function () {
        //         return chai
        //             .request(server)
        //             .post('/api/files/upload')
        //             .set({ Authorization: token })
        //             .field('selectedFolder', rootData.name)
        //             .field('selectedFolderId', rootData.id)
        //             .field('fileWithExtention', 'Googlelogo.png')
        //             .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
        //             .then((res) => {
        //                 uploadedFile1 = res.body;
        //                 uploadedFile1.should.be.a('object');
        //                 uploadedFile1.success.should.be.eql(true);
        //                 uploadedFile1.message.should.be.eql('File uploaded successfully!');
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });
        //     it('check uploaded file ICON uploaded', function () {
        //         let iconName = uploadedFile1.data.path.split('/') || [];
        //         iconName = iconName[iconName.length - 1];
        //         return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
        //             expect(iconUpload).to.equal(true);
        //         });
        //     });
        // });

        // describe('Upload files 2', () => {
        //     it('a file', function () {
        //         return chai
        //             .request(server)
        //             .post('/api/files/upload')
        //             .set({ Authorization: token })
        //             .field('selectedFolder', rootData.name)
        //             .field('selectedFolderId', rootData.id)
        //             .field('fileWithExtention', 'Googlelogo.png')
        //             .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
        //             .then((res) => {
        //                 uploadedFile2 = res.body;
        //                 uploadedFile2.should.be.a('object');
        //                 uploadedFile2.success.should.be.eql(true);
        //                 uploadedFile2.message.should.be.eql('File uploaded successfully!');
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });
        //     it('check uploaded file ICON uploaded', function () {
        //         let iconName = uploadedFile2.data.path.split('/') || [];
        //         iconName = iconName[iconName.length - 1];
        //         return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
        //             expect(iconUpload).to.equal(true);
        //         });
        //     });
        // });

        // describe('Upload files 3', () => {
        //     it('a file', function () {
        //         return chai
        //             .request(server)
        //             .post('/api/files/upload')
        //             .set({ Authorization: token })
        //             .field('selectedFolder', rootData.name)
        //             .field('selectedFolderId', rootData.id)
        //             .field('fileWithExtention', 'Googlelogo.png')
        //             .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo(1)')
        //             .then((res) => {
        //                 uploadedFile2 = res.body;
        //                 uploadedFile2.should.be.a('object');
        //                 uploadedFile2.success.should.be.eql(true);
        //                 uploadedFile2.message.should.be.eql('File uploaded successfully!');
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });
        //     it('check uploaded file ICON uploaded', function () {
        //         let iconName = uploadedFile2.data.path.split('/') || [];
        //         iconName = iconName[iconName.length - 1];
        //         return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
        //             expect(iconUpload).to.equal(true);
        //         });
        //     });
        // });

        // let editFileData, editFileData2, editFileData3;
        // describe('Edit files', () => {
        //     before((done) => {
        //         editFileData = {
        //             fileId: uploadedFile.data.id,
        //             updatedData: {
        //                 width: '100',
        //                 height: '100',
        //                 quality: '100',
        //                 saveAs: '-resized',
        //                 description: 'test description',
        //                 newName: 'testNew'
        //             }
        //         };
        //         editFileData2 = {
        //             fileId: uploadedFile.data.id,
        //             updatedData: {
        //                 width: '100',
        //                 height: '100',
        //                 quality: '100',
        //                 saveAs: '',
        //                 description: 'test description',
        //                 newName: 'testNew'
        //             }
        //         }
        //         editFileData3 = {
        //             fileId: uploadedFile.data.id,
        //             updatedData: {
        //                 width: '100',
        //                 height: '100',
        //                 quality: '100',
        //                 description: 'test description',
        //                 newName: 'testwithSaveAs'
        //             }
        //         }
        //         done();
        //     });

        //     // without token test case
        //     it('it Should not edit file without access token', () => {
        //         return chai
        //             .request(server)
        //             .put('/api/file/0')
        //             .then((res) => {
        //                 res.should.have.status(401);
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });

        //     it('Should not edit file', function () {
        //         return chai
        //             .request(server)
        //             .put('/api/file/0')
        //             .set({ Authorization: token })
        //             .send(editFileData.updatedData)
        //             .then((res) => {
        //                 data = res.body;
        //                 data.should.be.a('object');
        //                 data.success.should.be.eql(false);
        //                 data.message.should.be.eql('file doesn\'t exist');
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });

        //     it('edit file as new', function () {
        //         return chai
        //             .request(server)
        //             .put(`/api/file/${uploadedFile.data.id}`)
        //             .set({ Authorization: token })
        //             .send(editFileData.updatedData)
        //             .then((res) => {
        //                 data = res.body;
        //                 data.should.be.a('object');
        //                 data.success.should.be.eql(true);
        //                 data.message.should.be.eql('File updated successfully');
        //                 data.data.id.should.not.be.eql(uploadedFile.data.id);
        //                 data.data.size.should.not.be.eql(0);
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });

        //     it('check edit file as new, ICON uploaded', function () {
        //         let iconName = data.data.path.split('/') || [];
        //         iconName = iconName[iconName.length - 1];
        //         return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
        //             expect(iconUpload).to.equal(true);
        //         });
        //     });

        //     it('edit file on same', function () {
        //         return chai
        //             .request(server)
        //             .put(`/api/file/${uploadedFile.data.id}`)
        //             .set({ Authorization: token })
        //             .send(editFileData2.updatedData)
        //             .then((res) => {
        //                 data = res.body;
        //                 data.should.be.a('object');
        //                 data.success.should.be.eql(true);
        //                 data.message.should.be.eql('File updated successfully');
        //                 data.data.id.should.be.eql(uploadedFile.data.id);
        //                 data.data.size.should.not.be.eql(0);
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });
        //     it('check edit file on same, ICON uploaded', function () {
        //         let iconName = data.data.path.split('/') || [];
        //         iconName = iconName[iconName.length - 1];
        //         return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
        //             expect(iconUpload).to.equal(true);
        //         });
        //     });

        //     it('edit file on same without saveAs', function () {
        //         return chai
        //             .request(server)
        //             .put(`/api/file/${uploadedFile.data.id}`)
        //             .set({ Authorization: token })
        //             .send(editFileData3.updatedData)
        //             .then((res) => {
        //                 data = res.body;
        //                 data.should.be.a('object');
        //                 data.success.should.be.eql(true);
        //                 data.message.should.be.eql('File updated successfully');
        //                 data.data.id.should.be.eql(uploadedFile.data.id);
        //                 data.data.size.should.not.be.eql(0);
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });
        //     it('check edit file as new, ICON uploaded', function () {
        //         let iconName = data.data.path.split('/') || [];
        //         iconName = iconName[iconName.length - 1];
        //         return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
        //             expect(iconUpload).to.equal(true);
        //         });
        //     });

        //     it('edit file on same', function () {
        //         return chai
        //             .request(server)
        //             .put(`/api/file/${uploadedFile.data.id}`)
        //             .set({ Authorization: token })
        //             .send(editFileData2.updatedData)
        //             .then((res) => {
        //                 data = res.body;
        //                 data.should.be.a('object');
        //                 data.success.should.be.eql(true);
        //                 data.message.should.be.eql('File updated successfully');
        //                 data.data.id.should.be.eql(uploadedFile.data.id);
        //                 data.data.size.should.not.be.eql(0);
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });
        //     it('check edit file as new, ICON uploaded', function () {
        //         let iconName = data.data.path.split('/') || [];
        //         iconName = iconName[iconName.length - 1];
        //         return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
        //             expect(iconUpload).to.equal(true);
        //         });
        //     });

        //     it('edit file on same with new name', function () {
        //         // editFileData2.updatedData.newName = "newTestFile";
        //         return chai
        //             .request(server)
        //             .put(`/api/file/${uploadedFile.data.id}`)
        //             .set({ Authorization: token })
        //             .send(editFileData2.updatedData)
        //             .then((res) => {
        //                 data = res.body;
        //                 data.should.be.a('object');
        //                 data.success.should.be.eql(true);
        //                 data.message.should.be.eql('File updated successfully');
        //                 data.data.id.should.be.eql(uploadedFile.data.id);
        //                 data.data.size.should.not.be.eql(0);
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });
        //     it('check edit file as new, ICON uploaded', function () {
        //         let iconName = data.data.path.split('/') || [];
        //         iconName = iconName[iconName.length - 1];
        //         return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
        //             expect(iconUpload).to.equal(true);
        //         });
        //     });

        //     // without token fail
        //     it('it should not update name and description of file without access token', function () {
        //         return chai
        //             .request(server)
        //             .put('/api/file/field/0')
        //             .then((res) => {
        //                 res.should.have.status(401);
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });
        //     // file doesn\'t exist
        //     it('it should not update name and description of INVALID file', () => {
        //         return chai
        //             .request(server)
        //             .put('/api/file/field/0')
        //             .set({ Authorization: token })
        //             .then((res) => {
        //                 console.log('----updateFileField---', res)
        //                 data = res.body;
        //                 data.should.be.a('object');
        //                 data.success.should.be.eql(false);
        //                 data.message.should.be.eql('file doesn\'t exist');
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });
        //     // field type should be name or description
        //     it('it should not update invalid type NAME and DESCRIPTION', () => {
        //         return chai
        //             .request(server)
        //             .put('/api/file/field/0')
        //             .set({ Authorization: token })
        //             .then((res) => {
        //                 data = res.body;
        //                 data.should.be.a('object');
        //                 data.success.should.be.eql(false);
        //                 data.message.should.be.eql('file doesn\'t exist');
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });
        //     // edit filename only //updated
        //     it('it should update type NAME field', () => {
        //         return chai
        //             .request(server)
        //             .put(`/api/file/field/${uploadedFile.data.id}`)
        //             .set({ Authorization: token })
        //             .send({
        //                 'fieldType': 'name',
        //                 'fieldValue': 'new-test-name'
        //             })
        //             .then((res) => {
        //                 data = res.body;
        //                 data.should.be.a('object');
        //                 data.success.should.be.eql(true);
        //                 data.message.should.be.eql('updated');
        //                 data.data.name.should.not.be.eql(uploadedFile.data.name);
        //                 data.data.name.should.be.eql('new-test-name' + data.data.extension_type);
        //                 expect(uploadedFile.data.nameWithOutExt === 'new-test-name').to.equal(false);
        //                 expect(data.data.nameWithOutExt === 'new-test-name').to.equal(true);
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });
        //     // edit file description only // updated
        //     it('it should update type DESCRIPTION field', () => {
        //         return chai
        //             .request(server)
        //             .put(`/api/file/field/${uploadedFile.data.id}`)
        //             .set({ Authorization: token })
        //             .send({
        //                 'fieldType': 'description',
        //                 'fieldValue': 'new-test-description'
        //             })
        //             .then((res) => {
        //                 data = res.body;
        //                 data.should.be.a('object');
        //                 data.success.should.be.eql(true);
        //                 data.message.should.be.eql('updated');
        //                 expect(data.data.description === uploadedFile.data.description).to.equal(false);
        //                 expect(data.data.description === 'new-test-description').to.equal(true);
        //             }).catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     });
        // });

        // check sequence of file
        // describe('check copied files / folders be positioned underneath the original file / folder', () => {
        //     it('it should give sequantial file list', () => {
        //         return chai
        //             .request(server)
        //             .get('/api/folder/childs/' + uploadedFile.data.folder_id + '/files')
        //             .set({ Authorization: token })
        //             .then((res) => {
        //                 data = res.body;
        //                 data.should.be.a('object');
        //                 data.success.should.be.eql(true);

        //                 const sequantialList = data.data;


        //                 sequantialList[0].children.length.should.be.eql(0);
        //                 sequantialList[0].data.id.should.not.be.eql(null);
        //                 sequantialList[0].data.count.should.be.eql(0);
        //                 sequantialList[0].data.folder_id.should.be.eql(uploadedFile.data.folder_id);
        //                 sequantialList[0].data.size.should.not.be.eql(0);
        //                 expect(sequantialList[0].data.refrence_id === null).to.equal(true);
        //                 expect(sequantialList[0].data.width === null).to.equal(true);
        //                 expect(sequantialList[0].data.height === null).to.equal(true);
        //                 expect(sequantialList[0].data.quality === null).to.equal(true);
        //                 sequantialList[0].data.user.first_name.should.not.be.null;
        //                 sequantialList[0].data.user.last_name.should.not.be.null;
        //                 sequantialList[0].data.user.email.should.not.be.null;

        //                 sequantialList[1].children.length.should.be.eql(0);
        //                 sequantialList[1].data.id.should.not.be.null;
        //                 sequantialList[1].data.count.should.be.eql(0);
        //                 sequantialList[1].data.folder_id.should.be.eql(uploadedFile.data.folder_id);
        //                 sequantialList[1].data.size.should.not.be.eql(0); expect(sequantialList[1].data.refrence_id === null).to.equal(true);
        //                 expect(sequantialList[1].data.width === null).to.equal(true);
        //                 expect(sequantialList[1].data.height === null).to.equal(true);
        //                 expect(sequantialList[1].data.quality == null).to.equal(true);

        //                 sequantialList[1].data.user.first_name.should.not.be.null;
        //                 sequantialList[1].data.user.last_name.should.not.be.null;
        //                 sequantialList[1].data.user.email.should.not.be.null;


        //                 sequantialList[2].children.length.should.be.eql(0);
        //                 sequantialList[2].data.id.should.not.be.null;
        //                 sequantialList[2].data.count.should.be.eql(0);
        //                 sequantialList[2].data.folder_id.should.be.eql(uploadedFile.data.folder_id);
        //                 sequantialList[2].data.size.should.not.be.eql(0);
        //                 sequantialList[2].data.refrence_id.should.be.eql(sequantialList[2].data.id);
        //                 expect(sequantialList[2].data.width === 100).to.equal(true);
        //                 expect(sequantialList[2].data.height === 100).to.equal(true);
        //                 expect(sequantialList[2].data.quality == 100).to.equal(true);
        //                 sequantialList[2].data.user.first_name.should.not.be.null;
        //                 sequantialList[2].data.user.last_name.should.not.be.null;
        //                 sequantialList[2].data.user.email.should.not.be.null;


        //                 sequantialList[3].children.length.should.be.eql(0);
        //                 sequantialList[3].data.id.should.not.be.null;
        //                 sequantialList[3].data.count.should.be.eql(2);
        //                 sequantialList[3].data.folder_id.should.be.eql(uploadedFile.data.folder_id);
        //                 sequantialList[3].data.size.should.not.be.eql(0);
        //                 sequantialList[3].data.refrence_id.should.not.be.eql(sequantialList[3].data.id);
        //                 sequantialList[3].data.refrence_id.should.be.eql(sequantialList[2].data.id);
        //                 expect(sequantialList[3].data.width === 100).to.equal(true);
        //                 expect(sequantialList[3].data.height === 100).to.equal(true);
        //                 expect(sequantialList[3].data.quality == 100).to.equal(true);
        //                 sequantialList[3].data.user.first_name.should.not.be.null;
        //                 sequantialList[3].data.user.last_name.should.not.be.null;
        //                 sequantialList[3].data.user.email.should.not.be.null;


        //                 sequantialList[4].children.length.should.be.eql(0);
        //                 sequantialList[4].data.id.should.not.be.null;
        //                 sequantialList[4].data.count.should.be.eql(2);
        //                 sequantialList[4].data.folder_id.should.be.eql(uploadedFile.data.folder_id);
        //                 sequantialList[4].data.size.should.not.be.eql(0);
        //                 sequantialList[4].data.refrence_id.should.be.eql(sequantialList[4].data.id);
        //                 expect(sequantialList[4].data.width !== null).to.equal(true);
        //                 expect(sequantialList[4].data.height !== null).to.equal(true);
        //                 expect(sequantialList[4].data.quality !== null).to.equal(true);
        //                 sequantialList[4].data.user.first_name.should.not.be.null;
        //                 sequantialList[4].data.user.last_name.should.not.be.null;
        //                 sequantialList[4].data.user.email.should.not.be.null;


        //                 data.message.should.be.eql('it worked');
        //             })
        //     })
        // })

    //     // copy file default case 1 
    //     describe('copy file', () => {

    //         // without token test case
    //         it('it should not copy File without access token', () => {
    //             return chai
    //                 .request(server)
    //                 .post('/api/file/copy')
    //                 .then((res) => {
    //                     res.should.have.status(401);
    //                 }).catch(function (err) {
    //                     return Promise.reject(err);
    //                 });
    //         });

    //         it('it should not copy non-exist File', () => {
    //             return chai
    //                 .request(server)
    //                 .post('/api/file/copy')
    //                 .set({ Authorization: token })
    //                 .send(files[0])
    //                 .then((res) => {
    //                     data = res.body;
    //                     data.should.be.a('object');
    //                     data.success.should.be.eql(false);
    //                     data.message.should.be.eql('Invalid Source File.');
    //                 }).catch(function (err) {
    //                     return Promise.reject(err);
    //                 });
    //         });
    //     });

    //     describe('copy file', () => {
    //         before((done) => {
    //             files[0]['folderId'] = uploadedFile.data.folder_id;
    //             files[0]['copyFileId'] = uploadedFile.data.id;
    //             files[0]['name'] = faker.lorem.word();
    //             files[0]['type'] = uploadedFile.data.type;
    //             files[0]['shared_with'] = null;
    //             files[0]['oldPath'] = uploadedFile.data.path;
    //             done();
    //         });
    //         it('it should copy File with default case', () => {
    //             return chai
    //                 .request(server)
    //                 .post('/api/file/copy')
    //                 .set({ Authorization: token })
    //                 .send(files[0])
    //                 .then((res) => {
    //                     data = res.body;
    //                     data.should.be.a('object');
    //                     data.success.should.be.eql(true);
    //                     data.message.should.be.eql('File copied successfully.');
    //                     data.data.count.should.be.eql(files[0]['count']);
    //                     data.data.type.should.be.eql(files[0]['type']);
    //                     data.data.folder_id.should.be.eql(files[0]['folder_id']);
    //                     data.data.name.should.be.eql(files[0]['name'] + '.png');
    //                     data.data.master_name.should.be.eql(files[0]['name'] + '.png');
    //                     data.data.created_by.should.be.eql(loggedInUser.id);
    //                     data.data.size.should.not.be.null;
    //                     data.data.path.should.not.be.null;
    //                     data.data.refrence_id.should.not.be.null;
    //                     data.data.tag.should.not.be.null;
    //                     data.data.description.should.not.be.null;
    //                     expect(data.data.shared_with === null).to.equal(true);
    //                     data.data.width.should.be.eql(100);
    //                     data.data.height.should.be.eql(100);
    //                     data.data.quality.should.be.eql(100);
    //                     data.data.created_at.should.not.be.null;
    //                 }).catch(function (err) {
    //                     return Promise.reject(err);
    //                 });
    //         });
    //         it('check copy file, ICON uploaded', function () {
    //             let iconName = data.data.path.split('/') || [];
    //             iconName = iconName[iconName.length - 1];
    //             return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
    //                 expect(iconUpload).to.equal(true);
    //             });
    //         });
    //     });

    //     // copy file case 2
    //     describe('copy file', () => {
    //         it('it should copy File such as copyfile followed by sequential number', () => {
    //             return chai
    //                 .request(server)
    //                 .post('/api/file/copy')
    //                 .set({ Authorization: token })
    //                 .send(files[0])
    //                 .then((res) => {
    //                     data = res.body;
    //                     data.should.be.a('object');
    //                     data.success.should.be.eql(true);
    //                     data.message.should.be.eql('File copied successfully.');
    //                     data.data.count.should.be.eql(1);
    //                     data.data.type.should.be.eql(files[0]['type']);
    //                     data.data.folder_id.should.be.eql(files[0]['folder_id']);
    //                     data.data.name.should.be.eql(files[0]['name'] + '(' + data.data.count + ')' + '.png');
    //                     data.data.master_name.should.be.eql(files[0]['name'] + '.png');

    //                     data.data.created_by.should.be.eql(loggedInUser.id);
    //                     data.data.size.should.not.be.null;
    //                     data.data.path.should.not.be.null;
    //                     data.data.refrence_id.should.not.be.null;
    //                     data.data.tag.should.not.be.null;
    //                     data.data.description.should.not.be.null;
    //                     expect(data.data.shared_with === null).to.equal(true);
    //                     data.data.width.should.be.eql(100);
    //                     data.data.height.should.be.eql(100);
    //                     data.data.quality.should.be.eql(100);
    //                     data.data.created_at.should.not.be.null;
    //                 }).catch(function (err) {
    //                     return Promise.reject(err);
    //                 });
    //         });
    //         it('check copy File such as copyfile followed by sequential number, ICON uploaded', function () {
    //             let iconName = data.data.path.split('/') || [];
    //             iconName = iconName[iconName.length - 1];
    //             return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
    //                 expect(iconUpload).to.equal(true);
    //             });
    //         });
    //     });

    //     // copy file case 3
    //     describe('copy file', () => {
    //         before((done) => {
    //             files[0]['name'] = files[0]['name'] + '(1)';
    //             done();
    //         });
    //         it('it should copy File while enter the already copied file with sequential number', () => {
    //             return chai
    //                 .request(server)
    //                 .post('/api/file/copy')
    //                 .set({ Authorization: token })
    //                 .send(files[0])
    //                 .then((res) => {
    //                     data = res.body;
    //                     data.should.be.a('object');
    //                     data.success.should.be.eql(true);
    //                     data.message.should.be.eql('File copied successfully.');
    //                     data.data.count.should.be.eql(1);
    //                     data.data.type.should.be.eql(files[0]['type']);
    //                     data.data.folder_id.should.be.eql(files[0]['folder_id']);
    //                     data.data.master_name.should.be.eql(files[0]['name'] + '.png');

    //                     data.data.created_by.should.be.eql(loggedInUser.id);
    //                     data.data.size.should.not.be.null;
    //                     data.data.path.should.not.be.null;
    //                     data.data.refrence_id.should.not.be.null;
    //                     data.data.tag.should.not.be.null;
    //                     data.data.description.should.not.be.null;
    //                     expect(data.data.shared_with === null).to.equal(true);
    //                     data.data.width.should.be.eql(100);
    //                     data.data.height.should.be.eql(100);
    //                     data.data.quality.should.be.eql(100);
    //                     data.data.created_at.should.not.be.null;
    //                 }).catch(function (err) {
    //                     return Promise.reject(err);
    //                 });
    //         });
    //         it('check copy File while enter the already copied file with sequential number, ICON uploaded', function () {
    //             let iconName = data.data.path.split('/') || [];
    //             iconName = iconName[iconName.length - 1];
    //             return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
    //                 expect(iconUpload).to.equal(true);
    //             });
    //         });
    //     });
    // });

    // describe('Upload files with PDF', () => {
    //     let uploadedPDFFile
    //     it('a PDF file', function () {
    //         return chai
    //             .request(server)
    //             .post('/api/files/upload')
    //             .set({ Authorization: token })
    //             .field('selectedFolder', rootData.name)
    //             .field('selectedFolderId', rootData.id)
    //             .field('fileWithExtention', 'Googlelogo.png')
    //             .attach('file', 'test/test-image/sample.pdf', 'Sample')
    //             .then((res) => {
    //                 uploadedPDFFile = res.body;
    //                 uploadedPDFFile.should.be.a('object');
    //                 uploadedPDFFile.success.should.be.eql(true);
    //                 uploadedPDFFile.message.should.be.eql('File uploaded successfully!');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    //     it('not created ICON except IMAGE', function () {
    //         let iconName = uploadedPDFFile.data.path.split('/') || [];
    //         iconName = iconName[iconName.length - 1];
    //         return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
    //             expect(iconUpload).to.equal(false);
    //         });
    //     });
    // });


    // share file
    describe('/share file/folder', () => {
        let postInfo;
        let inValidpostInfo;
        before((done) => {
            testDataFolder = {
                name: 'test-root-child-2',
                parent_id: rootData.id,
                type: 'directory',
                created_by: loggedInUser.id,
                path: `${rootData.path}/test-root-child-2`,
                master_name: 'test-root-child-2'
            }

            commonFunction.addDataToTable("folders", testDataFolder).then((folderData) => {
                sharedFolder = folderData;

                postInfo = {
                    accessIds: [sharedWithUser.id],
                    id: copyFileData.id,
                    type: 'file'
                };
                postInfoFolder = {
                    accessIds: [sharedWithUser.id], // share with them
                    id: sharedFolder.id, // share object
                    type: sharedFolder.type // direcory||file
                };

                inValidpostInfo = {
                    accessIds: [sharedWithUser.id],
                    id: copyFileData.id,
                    type: 'files'
                }
                done();

            });
        });

        // without token test case
        it('it should not share the file with the user without access token', () => {
            return chai
                .request(server)
                .put('/api/sharedata/update')
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not share the file with the user', () => {
            return chai.request(server)
                .put('/api/sharedata/update')
                .set({ Authorization: token })
                .send(inValidpostInfo)
                .then((res) => {
                    const data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('child type invalid');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should share the folder with user', () => {
            return chai.request(server)
                .put('/api/sharedata/update')
                .set({ Authorization: token })
                .send(postInfoFolder)
                .then((res) => {
                    const data = res.body;
                    data.should.be.a('object');
                    data.message.should.be.eql('data access updated');
                    data.success.should.be.eql(true);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should share the file with the user', () => {
            return chai.request(server)
                .put('/api/sharedata/update')
                .set({ Authorization: token })
                .send(postInfo)
                .then((res) => {
                    const data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('data access updated');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // share file
    // describe('/share file', () => {
    //     let postInfo;
    //     before((done) => {
    //         postInfo = {
    //             accessIds: [sharedWithUser.id],
    //             id: null,
    //             type: 'file'
    //         };
    //         done();
    //     });

    //     it('it should not share the non-exist file', () => {
    //         return chai.request(server)
    //             .put('/api/sharedata/update')
    //             .set({ Authorization: token })
    //             .send(postInfo)
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.should.be.a('object');
    //                 data.success.should.be.eql(false);
    //                 data.message.should.be.eql('something went wrong.!!');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    describe('getSharedUsersList', () => {
        // without token test case
        it('it should NOT get shared user without access token', () => {
            return chai
                .request(server)
                .get(`/api/sharedata/users/${copyFileData.id}/INVALID`)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should NOT get one shared user and one exist user for Particular file Id(except creator)', () => {
            return chai
                .request(server)
                .get(`/api/sharedata/users/${copyFileData.id}/INVALID`)
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('Type invalid');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // describe('getSharedUsersList', () => {
    //     it('it should get one shared user and one exist user for Particular file Id(except creator)', () => {
    //         return chai
    //             .request(server)
    //             .get(`/api/sharedata/users/${copyFileData.id}/file`)
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(true);
    //                 data.message.should.be.eql('user-list recieved successfully');
    //                 data.data.length.should.be.eql(1);

    //                 expect(data.data[0].id === sharedWithUser.id).to.equal(true);
    //                 expect(data.data[0].id !== loggedInUser.id).to.equal(true);

    //                 data.sharedWith.length.should.be.eql(1);
    //                 expect(data.sharedWith[0] === sharedWithUser.id).to.equal(true);
    //                 expect(data.sharedWith[0] !== loggedInUser.id).to.equal(true);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // remove file From Shared
    // describe('/remove file From Shared', () => {
    //     let removedDataObject;
    //     before((done) => {
    //         removedDataObject = {
    //             id: copyFileData.id,
    //             type: 'files'
    //         };
    //         done();
    //     });

    //     // without token test case
    //     it('it should not remove file From Shared without access token', () => {
    //         return chai
    //             .request(server)
    //             .put('/api/sharedata/remove')
    //             .then((res) => {
    //                 res.should.have.status(401);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should not removed the shared file if data is invalid', () => {
    //         return chai.request(server)
    //             .put('/api/sharedata/remove')
    //             .set({ Authorization: token })
    //             .send(removedDataObject)
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(false);
    //                 data.message.should.be.eql('Invalid data');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('/remove file From Shared', () => {
    //     let removedDataObject;
    //     before((done) => {
    //         removedDataObject = {
    //             id: copyFileData.id,
    //             type: 'file'
    //         };
    //         done();
    //     });
    //     it('it should not removed the un-shared file', () => {
    //         return chai.request(server)
    //             .put('/api/sharedata/remove')
    //             .set({ Authorization: token })
    //             .send(removedDataObject)
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(true);
    //                 data.message.should.be.eql('Not found on share.');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should removed the shared file', () => {
    //         return chai.request(server)
    //             .put('/api/sharedata/remove')
    //             .set({ Authorization: token2 })
    //             .send(removedDataObject)
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(true);
    //                 data.message.should.be.eql('Removed from your shared.');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     // share test cases required
    // });

    // shift share file to anyTree location
    // describe('/shiftFileFromShared', () => {
    //     before((done) => {
    //         commonFunction.addDataToTable('folders', {
    //             name: user[1].email,
    //             parent_id: null,
    //             type: 'directory',
    //             created_by: sharedWithUser.id,
    //             path: user[1].email,
    //             shared_with: null,
    //             master_name: user[1].email
    //         }).then((data) => {
    //             rootFolderofUser2 = data;
    //             done();
    //         })
    //     });

    //     it('it should share file with the user', () => {
    //         return chai.request(server)
    //             .put('/api/sharedata/update')
    //             .set({ Authorization: token })
    //             .send({
    //                 accessIds: [sharedWithUser.id],
    //                 id: uploadedFile.data.id,
    //                 type: 'file'
    //             })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.should.be.a('object');
    //                 data.success.should.be.eql(true);
    //                 data.message.should.be.eql('data access updated');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });


    //     // without token test case
    //     it('it should not move file from share tree by shiftFileFromShared without access token', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/move/share/file`)
    //             .then((res) => {
    //                 res.should.have.status(401);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should not move file from share tree by shiftFileFromShared(As file to move does not exist)', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/move/share/file`)
    //             .set({ Authorization: token2 })
    //             .send({ 'file_id': faker.random.number(), 'folder_id': files[0]['folderId'] })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(false);
    //                 data.message.should.be.eql('File to move doesn\'t exists');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should not move file from share tree by shiftFileFromShared(As folder where file needs to be moved not exist)', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/move/share/file`)
    //             .set({ Authorization: token2 })
    //             .send({ 'file_id': uploadedFile.data.id, 'folder_id': faker.random.number() })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(false);
    //                 data.message.should.be.eql('Folder where to move doesn\'t exists');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should move file from shared tree by shiftFileFromShared(shift file to a new folder)', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/move/share/file`)
    //             .set({ Authorization: token2 })
    //             .send({ 'file_id': uploadedFile.data.id, 'folder_id': rootFolderofUser2.id })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(true);
    //                 data.message.should.be.eql('Moved Successfully');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should move file from share tree by the same file with the user', () => {
    //         return chai.request(server)
    //             .put('/api/sharedata/update')
    //             .set({ Authorization: token })
    //             .send({
    //                 accessIds: [sharedWithUser.id],
    //                 id: uploadedFile.data.id,
    //                 type: 'file'
    //             })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.should.be.a('object');
    //                 data.success.should.be.eql(true);
    //                 data.message.should.be.eql('data access updated');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should move file from share tree by shiftFileFromShared(shift file to a new folder)', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/move/share/file`)
    //             .set({ Authorization: token2 })
    //             .send({ 'file_id': uploadedFile.data.id, 'folder_id': rootFolderofUser2.id })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(true);
    //                 data.message.should.be.eql('Moved Successfully');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // // getFilePreviewInBlob Test Case 
    // describe('/getFilePreviewInBlob/:fileId', () => {
    //     // without token test case
    //     it('it should not getFilePreviewInBlob without access token', () => {
    //         return chai
    //             .request(server)
    //             .get(`/api/file/preview-blob/${copyFileData.id}`)
    //             .then((res) => {
    //                 res.should.have.status(401);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should not getFilePreviewInBlob(Invalid File)', () => {
    //         return chai
    //             .request(server)
    //             .get(`/api/file/preview-blob/${faker.random.number()}`)
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(false);
    //                 data.data.length.should.be.eql(0);
    //                 data.message.should.be.eql('file doesn\'t exist');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should getFilePreviewInBlob(Valid File)', () => {
    //         return chai
    //             .request(server)
    //             .get(`/api/file/preview-blob/${files[0]['copyFileId']}`)
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 const data = res.body;
    //                 expect(data.data.length).to.not.equal(0);
    //                 data.success.should.be.eql(true);
    //                 data.message.should.be.eql('');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // // searchFileByName test cases
    // describe('/filterMediaData', () => {
    //     it('it should not get filter files without access token', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/search/media`)
    //             .then((res) => {
    //                 res.should.have.status(401);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    //     it('it should get 0 files listing if sending blank data for search', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/search/media`)
    //             .set({ Authorization: token })
    //             .send({ 'name': "" })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.data.length.should.be.eql(0);
    //                 data.success.should.be.eql(true);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('/filterMediaData', () => {
    //     it('it should get 0 files listing if sending not matched data for search', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/search/media`)
    //             .set({ Authorization: token })
    //             .send({ 'name': faker.random.number() })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.data.length.should.be.eql(0);
    //                 data.success.should.be.eql(true);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('/filterMediaData', () => {
    //     it('it should get files listing if sending matched data for search', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/search/media`)
    //             .set({ Authorization: token })
    //             .send({ 'name': copyFileData.name })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.data[0].data.name.should.be.eql(copyFileData.name);
    //                 data.data.length.should.be.eql(1);
    //                 data.success.should.be.eql(true);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // // shiftFileToFolder Test Case 
    // const subFolderName = 'root-test' + Math.random();
    // describe('/shiftFileToFolder', () => {
    //     it('it should add Folder', () => {
    //         return chai
    //             .request(server)
    //             .post('/api/folder')
    //             .set({ Authorization: token })
    //             .send({ parentFolder: rootData, subFolderName })
    //             .then((res) => {
    //                 res.body.success.should.be.eql(true);
    //                 res.body.message.should.be.eql('Folder added successfully.');
    //                 const data = res.body.data;
    //                 subFolderData = data;
    //                 data.id.should.not.be.null;
    //                 data.parent_id.should.be.eql(rootData.id);
    //                 data.name.should.be.eql(subFolderName);
    //                 data.updated_at.should.not.be.null;
    //                 data.created_at.should.not.be.null;
    //                 // data.path.should.be.eql(`${rootData.path}/${subFolderName}`);
    //                 data.type.should.be.eql('directory');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     // without token test case
    //     it('it should not shiftFileToFolder without access token', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/move/file/folder`)
    //             .then((res) => {
    //                 res.should.have.status(401);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should not shiftFileToFolder(As file to move does not exist)', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/move/file/folder`)
    //             .set({ Authorization: token })
    //             .send({ 'file_id': faker.random.number(), 'folder_id': files[0]['folderId'] })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(false);
    //                 data.message.should.be.eql('File to move doesn\'t exists');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should not shiftFileToFolder(As folder where file needs to be moved not exist)', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/move/file/folder`)
    //             .set({ Authorization: token })
    //             .send({ 'file_id': files[0]['copyFileId'], 'folder_id': faker.random.number() })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(false);
    //                 data.message.should.be.eql('Folder where to move doesn\'t exists');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should not shiftFileToFolder(As file is on that same folder)', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/move/file/folder`)
    //             .set({ Authorization: token })
    //             .send({ 'file_id': files[0]['copyFileId'], 'folder_id': files[0]['folderId'] })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(true);
    //                 data.message.should.be.eql('already their');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should shiftFileToFolder(shift file to a new folder)', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/move/file/folder`)
    //             .set({ Authorization: token })
    //             .send({ 'file_id': files[0]['copyFileId'], 'folder_id': subFolderData.id })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(true);
    //                 data.message.should.be.eql('data updated');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // // shiftFolderToFolder Test Case 
    // describe('/shiftFolderToFolder', () => {
    //     // without token test case
    //     it('it should not shiftFolderToFolder without access token', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/move/folder/folder`)
    //             .then((res) => {
    //                 res.should.have.status(401);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should not shiftFolderToFolder(As folder to move does not exist)', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/move/folder/folder`)
    //             .set({ Authorization: token })
    //             .send({ 'folderToMove_id': faker.random.number(), 'shiftedToFolder_id': subFolderData.parent_id })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(false);
    //                 data.message.should.be.eql('Folder to move doesn\'t exists');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should not shiftFolderToFolder(As folder where folder needs to be moved not exist)', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/move/folder/folder`)
    //             .set({ Authorization: token })
    //             .send({ 'folderToMove_id': subFolderData.id, 'shiftedToFolder_id': faker.random.number() })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(false);
    //                 data.message.should.be.eql('Folder where to move doesn\'t exists');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should not shiftFolderToFolder(As folder is on that same folder)', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/move/folder/folder`)
    //             .set({ Authorization: token })
    //             .send({ 'folderToMove_id': subFolderData.id, 'shiftedToFolder_id': subFolderData.parent_id })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(true);
    //                 data.message.should.be.eql('already their');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     // upload pdf file to shiftFolder
    //     it('upload pdf file to shiftFolder', function () {
    //         return chai
    //             .request(server)
    //             .post('/api/files/upload')
    //             .set({ Authorization: token })
    //             .field('selectedFolder', subFolderData.name)
    //             .field('selectedFolderId', subFolderData.id)
    //             .field('fileWithExtention', 'Googlelogo.png')
    //             .attach('file', 'test/test-image/sample.pdf', 'Sample')
    //             .then((res) => {
    //                 let uploadedPDFFile = res.body;
    //                 uploadedPDFFile.should.be.a('object');
    //                 uploadedPDFFile.success.should.be.eql(true);
    //                 uploadedPDFFile.message.should.be.eql('File uploaded successfully!');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    //     it('it should add Folder', () => {
    //         return chai
    //             .request(server)
    //             .post('/api/folder')
    //             .set({ Authorization: token })
    //             .send({ parentFolder: subFolderData, subFolderName: 'test-subFolderName' })
    //             .then((res) => {
    //                 res.body.success.should.be.eql(true);
    //                 res.body.message.should.be.eql('Folder added successfully.');
    //                 const data = res.body.data;
    //                 // subFolderData = data;
    //                 data.id.should.not.be.null;
    //                 data.parent_id.should.be.eql(subFolderData.id);
    //                 data.name.should.be.eql('test-subFolderName');
    //                 data.updated_at.should.not.be.null;
    //                 data.created_at.should.not.be.null;
    //                 data.type.should.be.eql('directory');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should add Folder', () => {
    //         return chai
    //             .request(server)
    //             .post('/api/folder')
    //             .set({ Authorization: token })
    //             .send({ parentFolder: sharedFolder, subFolderName: subFolderData.name })
    //             .then((res) => {
    //                 res.body.success.should.be.eql(true);
    //                 res.body.message.should.be.eql('Folder added successfully.');
    //                 const data = res.body.data;
    //                 data.id.should.not.be.null;
    //                 data.parent_id.should.be.eql(sharedFolder.id);
    //                 data.name.should.be.eql(subFolderData.name);
    //                 data.updated_at.should.not.be.null;
    //                 data.created_at.should.not.be.null;
    //                 data.type.should.be.eql('directory');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should shiftFolderToFolder', () => {
    //         return chai
    //             .request(server)
    //             .post(`/api/move/folder/folder`)
    //             .set({ Authorization: token })
    //             .send({ 'folderToMove_id': subFolderData.id, 'shiftedToFolder_id': sharedFolder.id })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(true);
    //                 data.message.should.be.eql('data updated');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    //subFolderData.id
    // shiftFolderFromShared
    describe('/shiftFolderFromShared', () => {
        it('it should share folder with the user', () => {
            return chai.request(server)
                .put('/api/sharedata/update')
                .set({ Authorization: token })
                .send({
                    accessIds: [sharedWithUser.id],
                    id: subFolderData.id,
                    type: 'directory'
                })
                .then((res) => {
                    const data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('data access updated');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        // without token test case
        it('it should not move folder from share tree by shiftFolderFromShared without access token', () => {
            return chai
                .request(server)
                .post(`/api/move/share/folder`)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not move folder from share tree by shiftFolderFromShared(As folder to move does not exist)', () => {
            return chai
                .request(server)
                .post(`/api/move/share/folder`)
                .set({ Authorization: token2 })
                .send({ 'folderToMove_id': faker.random.number(), 'shiftedToFolder_id': files[0]['folderId'] })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('Folder to move doesn\'t exists');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not move folder from share tree by shiftFolderFromShared(As folder where folder needs to be moved not exist)', () => {
            return chai
                .request(server)
                .post(`/api/move/share/folder`)
                .set({ Authorization: token2 })
                .send({ 'folderToMove_id': subFolderData.id, 'shiftedToFolder_id': faker.random.number() })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('Folder where to move doesn\'t exists');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should move folder from share tree by shiftFolderFromShared(shift folder to a new folder)', () => {
            return chai
                .request(server)
                .post(`/api/move/share/folder`)
                .set({ Authorization: token2 })
                .send({ 'folderToMove_id': subFolderData.id, 'shiftedToFolder_id': rootFolderofUser2.id })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('Moved Successfully');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it share folder by the same folder name with the user', () => {
            return chai.request(server)
                .put('/api/sharedata/update')
                .set({ Authorization: token })
                .send({
                    accessIds: [sharedWithUser.id],
                    id: subFolderData.id,
                    type: 'directory'
                })
                .then((res) => {
                    const data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('data access updated');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should move file from share tree by shiftFolderFromShared(shift file to a new folder)', () => {
            return chai
                .request(server)
                .post(`/api/move/share/folder`)
                .set({ Authorization: token2 })
                .send({ 'folderToMove_id': subFolderData.id, 'shiftedToFolder_id': rootFolderofUser2.id })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('Moved Successfully');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // storage test case
    // describe('/getStorageStatus', () => {
    //     // without token test case
    //     it('it should not get the storage status without access token', () => {
    //         return chai
    //             .request(server)
    //             .get(`/api/storage`)
    //             .then((res) => {
    //                 res.should.have.status(401);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should get the storage status', () => {
    //         return chai
    //             .request(server)
    //             .get(`/api/storage`)
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(true);
    //                 expect(data.data.percentageCoveredSpace).to.not.be.null;
    //                 // expect(data.data.percentageCoveredSpace).to.be.at.least(0);
    //                 expect(data.data.space_consumed).to.not.be.null;
    //                 expect(data.data.space_consumed).to.be.at.least(0);
    //                 expect(data.data.storageToFrom).to.not.be.null;
    //                 data.message.should.be.eql('Storage space data');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('/getFilePath FileId', () => {
    //     // without token test case
    //     it('it should not get path of file without access token', () => {
    //         return chai
    //             .request(server)
    //             .get(`/api/file/path/${faker.random.number()}`)
    //             .then((res) => {
    //                 res.should.have.status(401);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should not get path of INVALID file', () => {
    //         return chai
    //             .request(server)
    //             .get(`/api/file/path/${faker.random.number()}`)
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(false);
    //                 res.body.message.should.be.eql('File doesn\'t exist');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should get path of file', () => {
    //         return chai
    //             .request(server)
    //             .get(`/api/file/path/${copyFileData.id}`)
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(true);
    //                 res.body.message.should.be.eql('file path');
    //                 res.body.data.should.be.eql('My Files/');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });


    // // upload large image
    // let largeUploadedFile, largeCopyFile, movedSharedFile;
    // describe('Upload Large Image', () => {
    //     it('a file', function () {
    //         return chai
    //             .request(server)
    //             .post('/api/files/upload')
    //             .set({ Authorization: token })
    //             .field('selectedFolder', rootData.name)
    //             .field('selectedFolderId', rootData.id)
    //             .field('fileWithExtention', 'large_dimension.jpg')
    //             .attach('file', 'test/test-image/large_dimension.jpg', 'large_dimension')
    //             .then((res) => {
    //                 largeUploadedFile = res.body;
    //                 largeUploadedFile.should.be.a('object');
    //                 largeUploadedFile.success.should.be.eql(true);
    //                 largeUploadedFile.message.should.be.eql('File uploaded successfully!');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('check uploaded file ICON uploaded', function () {
    //         let iconName = largeUploadedFile.data.path.split('/') || [];
    //         iconName = iconName[iconName.length - 1];
    //         return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
    //             expect(iconUpload).to.equal(true);
    //         });
    //     });

    //     it('check uploaded file', function () {
    //         let pathImage = largeUploadedFile.data.path;
    //         // iconName = iconName[iconName.length - 1];
    //         return commonFunction.getObjectFromAws(`${pathImage}`).then((iconUpload) => {
    //             expect(iconUpload).to.equal(true);
    //         });
    //     });

    //     it('check uploaded file LARGE FILE uploaded', function () {
    //         let pathLargeImage = largeUploadedFile.data.path.replace('/', '/' + S3_MEDIA.largeFileName);
    //         // iconName = iconName[iconName.length - 1];
    //         return commonFunction.getObjectFromAws(`${pathLargeImage}`).then((iconUpload) => {
    //             expect(iconUpload).to.equal(true);
    //         });
    //     });
    // });


    // describe('copy LARGE file', () => {
    //     before((done) => {
    //         files[0]['folderId'] = largeUploadedFile.data.folder_id;
    //         files[0]['copyFileId'] = largeUploadedFile.data.id;
    //         files[0]['name'] = faker.lorem.word();
    //         files[0]['type'] = largeUploadedFile.data.type;
    //         files[0]['shared_with'] = null;
    //         files[0]['oldPath'] = largeUploadedFile.data.path;
    //         done();
    //     });
    //     it('it should copy File with default case', () => {
    //         return chai
    //             .request(server)
    //             .post('/api/file/copy')
    //             .set({ Authorization: token })
    //             .send(files[0])
    //             .then((res) => {
    //                 data = res.body;
    //                 data.should.be.a('object');
    //                 data.success.should.be.eql(true);
    //                 data.message.should.be.eql('File copied successfully.');
    //                 largeCopyFile = data.data;
    //                 largeCopyFile.count.should.be.eql(files[0]['count']);
    //                 largeCopyFile.type.should.be.eql(files[0]['type']);
    //                 largeCopyFile.folder_id.should.be.eql(files[0]['folder_id']);
    //                 largeCopyFile.name.should.be.eql(files[0]['name'] + '.jpg');
    //                 largeCopyFile.master_name.should.be.eql(files[0]['name'] + '.jpg');
    //                 largeCopyFile.created_by.should.be.eql(loggedInUser.id);
    //                 largeCopyFile.size.should.not.be.null;
    //                 largeCopyFile.path.should.not.be.null;
    //                 largeCopyFile.refrence_id.should.not.be.null;
    //                 largeCopyFile.tag.should.not.be.null;
    //                 largeCopyFile.description.should.not.be.null;
    //                 expect(largeCopyFile.shared_with === null).to.equal(true);
    //                 largeCopyFile.width.should.be.eql(largeUploadedFile.data.width);
    //                 largeCopyFile.height.should.be.eql(largeUploadedFile.data.height);
    //                 largeCopyFile.quality.should.be.eql(100);
    //                 largeCopyFile.aspect_ratio.should.not.be.null;
    //                 largeCopyFile.created_at.should.not.be.null;
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    //     it('check copy file, ICON uploaded', function () {
    //         let iconName = largeCopyFile.path.split('/') || [];
    //         iconName = iconName[iconName.length - 1];
    //         return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + iconName).then((iconUpload) => {
    //             expect(iconUpload).to.equal(true);
    //         });
    //     });

    //     it('check copy file', function () {
    //         let pathImage = largeCopyFile.path;
    //         // iconName = iconName[iconName.length - 1];
    //         return commonFunction.getObjectFromAws(`${pathImage}`).then((iconUpload) => {
    //             expect(iconUpload).to.equal(true);
    //         });
    //     });

    //     it('check copy file LARGE FILE uploaded', function () {
    //         let pathLargeImage = largeCopyFile.path.replace('/', '/' + S3_MEDIA.largeFileName);
    //         // iconName = iconName[iconName.length - 1];
    //         return commonFunction.getObjectFromAws(`${pathLargeImage}`).then((iconUpload) => {
    //             expect(iconUpload).to.equal(true);
    //         });
    //     });
    // });

    // describe('/deleteFile FileId COPY LARGE FILE', () => {
    //     it('it should delete the file by file id', () => {
    //         return chai
    //             .request(server)
    //             .delete(`/api/file/${largeCopyFile.id}`)
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(true);
    //                 res.body.message.should.be.eql('Deleted succesfully');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    //     it('should not found deleted ICON', function () {
    //         return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + largeCopyFile.name).then((iconUpload) => {
    //             expect(iconUpload).to.equal(false);
    //         });
    //     });

    //     it('should not found deleted LARGE FILE', function () {
    //         pathLargeImage = largeCopyFile.path.replace('/', '/' + S3_MEDIA.largeFileName);
    //         return commonFunction.getObjectFromAws(pathLargeImage).then((iconUpload) => {
    //             expect(iconUpload).to.equal(false);
    //         });
    //     });
    // });

    // SHARE LARGE FILE
    describe('/share and /move LARGE FILE', () => {
        it('it should share the file with the user', () => {

            console.log('-----largeUploadedFile.data----------', largeUploadedFile);
            return chai.request(server)
                .put('/api/sharedata/update')
                .set({ Authorization: token })
                .send({
                    accessIds: [sharedWithUser.id],
                    id: largeUploadedFile.data.id,
                    type: 'file'
                })
                .then((res) => {
                    console.log('-----/api/sharedata/update------', res.body);
                    const data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('data access updated');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        // MOVE SHARED IMAGE
        it('it should move file from shared tree by shiftFileFromShared(shift file to a new folder)', () => {
            return chai
                .request(server)
                .post(`/api/move/share/file`)
                .set({ Authorization: token2 })
                .send({ 'file_id': largeUploadedFile.data.id, 'folder_id': rootFolderofUser2.id })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('Moved Successfully');
                    movedSharedFile = data.movedFile;
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('check shared image is uploaded', function () {
            let pathImage = movedSharedFile.path;
            return commonFunction.getObjectFromAws(`${pathImage}`).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });

        it('check shared image with 2500X1500_ is uploaded', function () {
            let pathLargeImage = movedSharedFile.path.replace('/', '/' + S3_MEDIA.largeFileName);
            return commonFunction.getObjectFromAws(`${pathLargeImage}`).then((iconUpload) => {
                expect(iconUpload).to.equal(true);
            });
        });
    });

    describe('/deleteFile SHARED MOVED LARGE FILE', () => {
        it('it should delete the file by file id', () => {
            return chai
                .request(server)
                .delete(`/api/file/${movedSharedFile.id}`)
                .set({ Authorization: token2 })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    res.body.message.should.be.eql('Deleted succesfully');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('should not found deleted ICON', function () {
            return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + movedSharedFile.name).then((iconUpload) => {
                expect(iconUpload).to.equal(false);
            });
        });

        it('should not found deleted LARGE FILE', function () {
            pathLargeImage = movedSharedFile.path.replace('/', '/' + S3_MEDIA.largeFileName);
            return commonFunction.getObjectFromAws(pathLargeImage).then((iconUpload) => {
                expect(iconUpload).to.equal(false);
            });
        });
    });

    // describe('/deleteFile LARGE FILE', () => {
    //     it('it should delete the file by file id', () => {
    //         return chai
    //             .request(server)
    //             .delete(`/api/file/${largeUploadedFile.data.id}`)
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(true);
    //                 res.body.message.should.be.eql('Deleted succesfully');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    //     it('should not found deleted ICON', function () {
    //         return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + largeUploadedFile.data.name).then((iconUpload) => {
    //             expect(iconUpload).to.equal(false);
    //         });
    //     });

    //     it('should not found deleted LARGE FILE', function () {
    //         pathLargeImage = largeUploadedFile.data.path.replace('/', '/' + S3_MEDIA.largeFileName);
    //         return commonFunction.getObjectFromAws(pathLargeImage).then((iconUpload) => {
    //             expect(iconUpload).to.equal(false);
    //         });
    //     });
    // });

    // describe('/deleteFile FileId', () => {
    //     // without token test case
    //     it('it should not delete file without access token', () => {
    //         return chai
    //             .request(server)
    //             .delete(`/api/file/${faker.random.number()}`)
    //             .then((res) => {
    //                 res.should.have.status(401);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should not delete file if file does not exist', () => {
    //         return chai
    //             .request(server)
    //             .delete(`/api/file/${faker.random.number()}`)
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(false);
    //                 res.body.message.should.be.eql('File doesn\'t exists');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('/deleteFile FileId', () => {
    //     it('it should not delete the file', () => {
    //         return chai
    //             .request(server)
    //             .delete(`/api/file/${copyFileData.id}`)
    //             .set({ Authorization: token2 })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(false);
    //                 res.body.message.should.be.eql('You don\'t have the required permission');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('/deleteFile FileId', () => {
    //     it('it should delete the file by file id', () => {
    //         return chai
    //             .request(server)
    //             .delete(`/api/file/${files[0]['copyFileId']}`)
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 const data = res.body;
    //                 // data.success.should.be.eql(true);
    //                 res.body.message.should.be.eql('Deleted succesfully');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    //     it('should not found deleted ICON', function () {
    //         return commonFunction.getObjectFromAws('icons/' + loggedInUser.email + '/' + files[0]['name']).then((iconUpload) => {
    //             expect(iconUpload).to.equal(false);
    //         });
    //     });
    // });

    // describe('/deleteFile FileId', () => {
    //     it('check shared image with 2500X1500_ is uploaded', function () {
    //         let pathLargeImage = 'Verona_Hauck38@hotmail.com/2500x1500-1552905592205-large_dimension.jpg';
    //         return commonFunction.getObjectFromAws(`${pathLargeImage}`).then((iconUpload) => {
    //             expect(iconUpload).to.equal(true);
    //         });
    //     });
    // });

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

// getSharedUsersList
// updateFiles test cases has been remained as its not completed.
