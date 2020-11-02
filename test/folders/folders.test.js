const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const faker = require('faker');

// const Folders = require('../../models').folders;
const commonFunction = require('../commonFunction');
const server = require('../../app');
const generatedSampleData = require('../sampleData');

const should = chai.should();
// const modelName = 'folders';
const testRootData = {
    name: 'root',
    parent_id: null,
    type: 'FOLDER',
    created_by: 0,
    path: 'root',
    shared_with: null,
    master_name: 'root'
}
const subFolderName = 'root-test' + Math.random();
let loggedInUser, newTestRootData, shareUserToken, addedFolderData, rootData, testData1, testData2, testData3, token, token2, user, files, sharedWithUser;

chai.use(chaiHttp);


describe('Folders', () => {
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
                    user[1].email = "devraj.v@cisinlabs.com";
                    commonFunction.addDataToTable("users", user[0]).then((data) => {
                        commonFunction.addDataToTable("users", user[1]).then((data) => {
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


    /*
 * Test the /getFolderData route
 */
    describe('/getFolderData Folder', () => {
        it('it should GET 0 Folder', () => {
            return chai.request(server)
                .get('/api/folders/data')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('folders recieved');

                    const data = res.body.data;
                    data.should.be.a('array');
                    data.length.should.be.eql(0);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/getFolderData Folder', () => {
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

        it('it should GET all Folder', () => {
            return chai.request(server)
                .get('/api/folders/data')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('folders recieved');

                    const data = res.body.data;
                    data.should.be.a('array');
                    data.length.should.be.eql(1);
                    data[0].entity_type.should.be.eql('FOLDER');
                    data[0].name.should.be.eql(user[0].email);
                    data[0].master_name.should.be.eql(user[0].email);
                    data[0].name.should.be.eql(rootData.name);
                    expect(data[0].file_folder_id === null).to.equal(false);
                    expect(data[0].user_id === null).to.equal(false);
                    expect(data[0].permission === 'EDIT').to.equal(true);
                    expect(data[0].parent_id === null).to.equal(true);
                    expect(data[0].file_property_id === null).to.equal(true);
                    expect(data[0].count === 0).to.equal(true);
                    expect(data[0].created_at === null).to.equal(false);
                    expect(data[0].updated_at === null).to.equal(false);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });


    /*
    * Test the /addFolder route
    */
    describe('/addFolder Folder', () => {
        it('it should add Folder', () => {
            return chai
                .request(server)
                .post('/api/folder')
                .set({ Authorization: token })
                .send({ parentFolder: rootData, subFolderName })
                .then((res) => {
                    // res.should.have.status(201);
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql('Folder added successfully.');

                    const data = res.body.data;
                    addedFolderData = data;

                    // console.log('-----addedFolderData----', addedFolderData);
                    addedFolderData.entity_type.should.be.eql('FOLDER');
                    addedFolderData.name.should.be.eql(subFolderName);
                    addedFolderData.master_name.should.be.eql(subFolderName);
                    expect(addedFolderData.file_folder_id === null).to.equal(false);
                    expect(addedFolderData.user_id === null).to.equal(false);
                    expect(addedFolderData.permission === 'EDIT').to.equal(true);
                    expect(addedFolderData.parent_id === rootData.id).to.equal(true);
                    expect(addedFolderData.file_property_id === null).to.equal(true);
                    expect(addedFolderData.count === 0).to.equal(true);
                    expect(addedFolderData.created_at === null).to.equal(false);
                    expect(addedFolderData.updated_at === null).to.equal(false);
                    expect(addedFolderData.file_property === null).to.equal(true);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/addFolder Folder', () => {
        it('it should not add if Folder is already exist in parent folder', () => {
            return chai
                .request(server)
                .post('/api/folder')
                .set({ Authorization: token })
                .send({ parentFolder: rootData, subFolderName })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql('Sub folder already exist.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/addFolder Folder', () => {
        it('it should not add if Parent folder invalid', () => {
            newTestRootData = JSON.parse(JSON.stringify(testRootData));
            newTestRootData.parent_id = 0;

            return chai
                .request(server)
                .post('/api/folder')
                .set({ Authorization: token })
                .send({ parentFolder: newTestRootData, subFolderName })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql('Parent folder invalid.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // rename folder
    describe('/renameFolder Folder', () => {
        it('it should not rename the folder if parent folder invalid', () => {
            return chai
                .request(server)
                .put('/api/folder') //addedFolderData
                .set({ Authorization: token })
                .send({ parentFolder: newTestRootData, subFolderName: 'root-test-rename' + Math.random() })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql('Folder invalid.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/renameFolder Folder', () => {
        it('it should not rename the folder', () => {
            return chai
                .request(server)
                .put('/api/folder')
                .set({ Authorization: token })
                .send({ parentFolder: addedFolderData, subFolderName })
                .then((res) => {
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql('Folder already exist.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // describe('/renameFolder Folder', () => {
    //     it('it should rename the folder', () => {
    //         let newSubFolderName = 'root-test-rename' + Math.random();
    //         return chai
    //             .request(server)
    //             .put('/api/folder')
    //             .set({ Authorization: token })
    //             .send({ parentFolder: addedFolderData, subFolderName: newSubFolderName })
    //             .then((res) => {

    //                 res.should.have.status(200);
    //                 res.body.success.should.be.eql(true);
    //                 res.body.message.should.be.eql('Folder name updated');

    //                 const data = res.body.data;
    //                 testData1 = data;
    //                 console.log('----res.body-testData1----', testData1);
    //                 testData1.entity_type.should.be.eql('FOLDER');
    //                 testData1.name.should.be.eql(newSubFolderName);
    //                 // testData1.master_name.should.be.eql(newSubFolderName);
    //                 expect(testData1.file_folder_id === null).to.equal(false);
    //                 expect(testData1.user_id === null).to.equal(false);
    //                 expect(testData1.permission === 'EDIT').to.equal(true);
    //                 expect(testData1.parent_id === rootData.id).to.equal(true);
    //                 expect(testData1.file_property_id === null).to.equal(true);
    //                 expect(testData1.count === 0).to.equal(true);
    //                 expect(testData1.created_at === null).to.equal(false);
    //                 expect(testData1.updated_at === null).to.equal(false);
    //                 // expect(testData1.file_property === null).to.equal(true);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    //getFolderTree
    describe('getFolderTree', () => {
        it('it should get FolderTree without child', () => {
            return chai
                .request(server)
                .get('/api/folders/tree')
                .set({ Authorization: token })
                .then((res) => {
                    expect(typeof res.body.data[0].expanded).to.equal('undefined');
                    const data = res.body.data[0].data;
                    data.name.should.be.eql('My Files');

                    data.entity_type.should.be.eql('FOLDER');
                    data.realName.should.be.eql(rootData.name)
                    expect(data.file_folder_id === null).to.equal(false);
                    expect(data.user_id === null).to.equal(false);
                    expect(data.permission === 'EDIT').to.equal(true);
                    expect(data.file_property_id === null).to.equal(true);
                    expect(data.count === 0).to.equal(true);
                    expect(data.created_at === null).to.equal(false);
                    expect(data.updated_at === null).to.equal(false);
                    expect(data.master_name !== null).to.equal(true);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });


    // describe('getFolderTree FolderTree', () => {
    //     before((done) => {
    //         commonFunction.addDataToTable('files_folders', {
    //             original_name: 'test-root-child',
    //             created_by: loggedInUser.id,
    //             entity_type: 'FOLDER'
    //         }).then((file_folder_data) => {
    //             // console.log('-----file_folder_data-----', file_folder_data)
    //             commonFunction.addDataToTable('files_folders_accesses', {
    //                 name: 'test-root-child',
    //                 file_folder_id: file_folder_data.id,
    //                 user_id: loggedInUser.id,
    //                 permission: 'EDIT',
    //                 entity_type: 'FOLDER',
    //                 parent_id: rootData.id,
    //                 file_property_id: null,
    //                 refrence_id: null,
    //                 master_name: 'test-root-child',
    //                 count: 0
    //             }).then((data_file_folder_access) => {
    //                 testData2 = data_file_folder_access;

    //                 commonFunction.addDataToTable('files_folders', {
    //                     original_name: 'test-root-child-2',
    //                     created_by: loggedInUser.id,
    //                     entity_type: 'FOLDER'
    //                 }).then((file_folder_data) => {
    //                     // console.log('-----file_folder_data-----', file_folder_data)
    //                     commonFunction.addDataToTable('files_folders_accesses', {
    //                         name: 'test-root-child-2',
    //                         file_folder_id: file_folder_data.id,
    //                         user_id: loggedInUser.id,
    //                         permission: 'EDIT',
    //                         entity_type: 'FOLDER',
    //                         parent_id: rootData.id,
    //                         file_property_id: null,
    //                         refrence_id: null,
    //                         master_name: 'test-root-child-2',
    //                         count: 0
    //                     }).then((data_file_folder_access) => {
    //                         testData3 = data_file_folder_access;
    //                         done();
    //                     });
    //                 });

    //             });
    //         });
    //     });
    //     it('it should get FolderTree with child', () => {
    //         return chai
    //             .request(server)
    //             .get('/api/folders/tree')
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 data = res.body.data;
    //                 // check root data
    //                 data.should.be.a('array');
    //                 data.length.should.be.eql(1);
    //                 // console.log('------data[0]-----', data[0]);
    //                 data[0].data.name.should.be.eql('My Files');
    //                 expect(typeof data[0].expanded).to.equal('undefined');
    //                 data[0].children.should.be.a('array');
    //                 data[0].children.length.should.be.eql(3);
    //                 data[0].data.name.should.be.eql('My Files');
    //                 data[0].data.entity_type.should.be.eql('FOLDER');
    //                 data[0].data.realName.should.be.eql(rootData.name)
    //                 expect(data[0].data.file_folder_id === null).to.equal(false);
    //                 expect(data[0].data.user_id === null).to.equal(false);
    //                 expect(data[0].data.parent_id === null).to.equal(true);
    //                 expect(data[0].data.permission === 'EDIT').to.equal(true);
    //                 expect(data[0].data.file_property_id === null).to.equal(true);
    //                 expect(data[0].data.count === 0).to.equal(true);
    //                 expect(data[0].data.created_at === null).to.equal(false);
    //                 expect(data[0].data.updated_at === null).to.equal(false);
    //                 expect(data[0].data.master_name !== null).to.equal(true);


    //                 // console.log('------431----', data[0].children);
    //                 expect(typeof data[0].children[0].expanded).to.equal('undefined');
    //                 const firstChild = data[0].children[0].data;
    //                 firstChild.id.should.not.be.null;
    //                 firstChild.name.should.be.eql(testData1.name);
    //                 firstChild.parent_id.should.be.eql(rootData.id);

    //                 // console.log('------data[0].children[1]----', data[0].children[1]);
    //                 expect(typeof data[0].children[1].expanded).to.equal('undefined');
    //                 const secondChild = data[0].children[1].data;
    //                 secondChild.id.should.not.be.null;
    //                 secondChild.name.should.be.eql(testData2.name);
    //                 secondChild.parent_id.should.be.eql(rootData.id);

    //                 // console.log('------data[0].children[2]----', data[0].children[2]);
    //                 expect(typeof data[0].children[2].expanded).to.equal('undefined');
    //                 const thirdChild = data[0].children[2].data;
    //                 thirdChild.id.should.not.be.null;
    //                 thirdChild.name.should.be.eql(testData3.name);
    //                 thirdChild.parent_id.should.be.eql(rootData.id);

    //                 // remove all child folders
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     // getFolderChilds/:folder_id/directory
    //     describe('getFolderChilds', () => {
    //         it('it should not get Folder child if folder does not exist', () => {
    //             return chai
    //                 .request(server)
    //                 .get('/api/folder/childs/' + faker.random.number() + '/' + 'directory')
    //                 .set({ Authorization: token })
    //                 .then((res) => {
    //                     data = res.body;
    //                     data.success.should.be.eql(false);
    //                     data.message.should.be.eql('No such folder exists!');
    //                 }).catch(function (err) {
    //                     return Promise.reject(err);
    //                 });
    //         });
    //     });


    //     describe('getFolderChilds', () => {
    //         it('it should get Folder without child', () => {
    //             return chai
    //                 .request(server)
    //                 .get('/api/folder/childs/' + testData1.id + '/' + 'directory')
    //                 .set({ Authorization: token })
    //                 .then((res) => {
    //                     data = res.body.data;
    //                     data.should.be.a('array');
    //                     data.length.should.be.eql(0);
    //                 }).catch(function (err) {
    //                     return Promise.reject(err);
    //                 });
    //         });
    //     });

    //     let copyFileData, sharedFolder;
    //     describe('getFolderChilds /directory', () => {
    //         it('it should get directory as FolderTree with child', () => {
    //             return chai
    //                 .request(server)
    //                 .get('/api/folder/childs/' + rootData.id + '/directory')
    //                 .set({ Authorization: token })
    //                 .then((res) => {
    //                     data = res.body.data;
    //                     data.should.be.a('array');
    //                     data.length.should.be.eql(3);

    //                     const firstChild = data[0].data;
    //                     firstChild.file_folder_id.should.not.be.null;
    //                     firstChild.user_id.should.not.be.null;
    //                     firstChild.permission.should.be.eql('EDIT');
    //                     firstChild.entity_type.should.be.eql('FOLDER');
    //                     firstChild.name.should.be.eql(testData1.name);
    //                     expect(firstChild.file_property_id === null).to.equal(true);
    //                     expect(firstChild.count === 0).to.equal(true);
    //                     firstChild.parent_id.should.be.eql(rootData.id);
    //                     firstChild.created_at.should.not.be.null;
    //                     firstChild.updated_at.should.not.be.null;
    //                     firstChild.user_id.should.be.eql(loggedInUser.id);

    //                     const secondChild = data[1].data;
    //                     secondChild.file_folder_id.should.not.be.null;
    //                     secondChild.user_id.should.not.be.null;
    //                     secondChild.permission.should.be.eql('EDIT');
    //                     secondChild.entity_type.should.be.eql('FOLDER');
    //                     secondChild.name.should.be.eql(testData2.name);
    //                     expect(secondChild.file_property_id === null).to.equal(true);
    //                     expect(secondChild.count === 0).to.equal(true);
    //                     secondChild.parent_id.should.be.eql(rootData.id);
    //                     secondChild.created_at.should.not.be.null;
    //                     secondChild.updated_at.should.not.be.null;
    //                     secondChild.user_id.should.be.eql(loggedInUser.id);

    //                     const thirdChild = data[2].data;
    //                     thirdChild.file_folder_id.should.not.be.null;
    //                     thirdChild.user_id.should.not.be.null;
    //                     thirdChild.permission.should.be.eql('EDIT');
    //                     thirdChild.entity_type.should.be.eql('FOLDER');
    //                     thirdChild.name.should.be.eql(testData3.name);
    //                     expect(thirdChild.file_property_id === null).to.equal(true);
    //                     expect(thirdChild.count === 0).to.equal(true);
    //                     thirdChild.parent_id.should.be.eql(rootData.id);
    //                     thirdChild.created_at.should.not.be.null;
    //                     thirdChild.updated_at.should.not.be.null;
    //                     thirdChild.user_id.should.be.eql(loggedInUser.id);


    //                 }).catch(function (err) {
    //                     return Promise.reject(err);
    //                 });
    //         });
    //     });
    // });

    // folder upload with file
    let sourceData, sourceData1, sourceData2;
    describe('Upload folders', () => {
        let webkitPath = [];

        before((done) => {
            webkitPath = ['folderA/Googlelogo.png', 'folderA/folderB/Googlelogo.png', 'folderC/Googlelogo.png']
            done();
        });
        it('Upload 1st path of file', function () {
            return chai
                .request(server)
                .post('/api/folders/upload')
                .set({ Authorization: token })
                .field('selectedFolder', rootData.name)
                .field('selectedFolderId', rootData.id)
                .field('webkitRelativePath', webkitPath[0])
                .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
                .then((res) => {
                    const uploadedFile = res.body;
                    sourceData = uploadedFile.sourceData;
                    uploadedFile.should.be.a('object');
                    uploadedFile.success.should.be.eql(true);
                    uploadedFile.message.should.be.eql('File uploaded successfully!');

                    sourceData.file_folder_id.should.not.be.null;
                    sourceData.user_id.should.not.be.null;
                    sourceData.permission.should.be.eql('EDIT');
                    sourceData.entity_type.should.be.eql('FOLDER');
                    sourceData.name.should.be.not.be.null;
                    sourceData.master_name.should.be.not.be.null;
                    expect(sourceData.file_property_id === null).to.equal(true);
                    expect(sourceData.count === 0).to.equal(true);
                    sourceData.parent_id.should.be.eql(rootData.id);
                    sourceData.created_at.should.not.be.null;
                    sourceData.updated_at.should.not.be.null;
                    sourceData.user_id.should.be.eql(loggedInUser.id);

                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('Upload 2nd path of file', function () {
            return chai
                .request(server)
                .post('/api/folders/upload')
                .set({ Authorization: token })
                .field('selectedFolder', rootData.name)
                .field('selectedFolderId', rootData.id)
                .field('webkitRelativePath', webkitPath[1])
                .field('sourceData', JSON.stringify(sourceData))
                .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
                .then((res) => {
                    // console.log('----res-----', res);
                    const uploadedFile = res.body;
                    sourceData1 = uploadedFile.sourceData;
                    uploadedFile.should.be.a('object');
                    uploadedFile.success.should.be.eql(true);
                    uploadedFile.message.should.be.eql('File uploaded successfully!');

                    sourceData1.file_folder_id.should.not.be.null;
                    sourceData1.user_id.should.not.be.null;
                    sourceData1.permission.should.be.eql('EDIT');
                    sourceData1.entity_type.should.be.eql('FOLDER');
                    sourceData1.name.should.be.not.be.null;
                    sourceData1.master_name.should.be.not.be.null;
                    expect(sourceData1.file_property_id === null).to.equal(true);
                    expect(sourceData1.count === 0).to.equal(true);
                    sourceData1.parent_id.should.be.eql(rootData.id);
                    sourceData1.created_at.should.not.be.null;
                    sourceData1.updated_at.should.not.be.null;
                    sourceData1.user_id.should.be.eql(loggedInUser.id);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('Upload 3rd path of file', function () {
            return chai
                .request(server)
                .post('/api/folders/upload')
                .set({ Authorization: token })
                .field('selectedFolder', rootData.name)
                .field('selectedFolderId', rootData.id)
                .field('webkitRelativePath', webkitPath[1])
                .field('sourceData', JSON.stringify(sourceData))
                .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
                .then((res) => {
                    const uploadedFile = res.body;
                    sourceData2 = uploadedFile.sourceData;
                    uploadedFile.should.be.a('object');
                    uploadedFile.success.should.be.eql(true);
                    uploadedFile.message.should.be.eql('File uploaded successfully!');

                    sourceData2.file_folder_id.should.not.be.null;
                    sourceData2.user_id.should.not.be.null;
                    sourceData2.permission.should.be.eql('EDIT');
                    sourceData2.entity_type.should.be.eql('FOLDER');
                    sourceData2.name.should.be.not.be.null;
                    sourceData2.master_name.should.be.not.be.null;
                    expect(sourceData2.file_property_id === null).to.equal(true);
                    expect(sourceData2.count === 0).to.equal(true);
                    sourceData2.parent_id.should.be.eql(rootData.id);
                    sourceData2.created_at.should.not.be.null;
                    sourceData2.updated_at.should.not.be.null;
                    sourceData2.user_id.should.be.eql(loggedInUser.id);

                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('Upload folders with existing name', () => {
        let webkitPath = [];
        let sourceData;
        before((done) => {
            webkitPath = ['folderA/Googlelogo.png', 'folderA/folderB/Googlelogo.png', 'folderC/Googlelogo.png']
            done();
        });
        it('Upload 1st path of file', function () {
            return chai

                .request(server)
                .post('/api/folders/upload')
                .set({ Authorization: token })
                .field('selectedFolder', rootData.name)
                .field('selectedFolderId', rootData.id)
                .field('webkitRelativePath', webkitPath[0])
                .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
                .then((res) => {
                    const uploadedFile = res.body;
                    sourceData = uploadedFile.sourceData;
                    uploadedFile.should.be.a('object');
                    uploadedFile.success.should.be.eql(true);
                    uploadedFile.message.should.be.eql('File uploaded successfully!');

                    sourceData.file_folder_id.should.not.be.null;
                    sourceData.user_id.should.not.be.null;
                    sourceData.permission.should.be.eql('EDIT');
                    sourceData.entity_type.should.be.eql('FOLDER');
                    sourceData.name.should.be.not.be.null;
                    sourceData.master_name.should.be.not.be.null;
                    expect(sourceData.file_property_id === null).to.equal(true);
                    expect(sourceData.count === 1).to.equal(true);
                    sourceData.parent_id.should.be.eql(rootData.id);
                    sourceData.created_at.should.not.be.null;
                    sourceData.updated_at.should.not.be.null;
                    sourceData.user_id.should.be.eql(loggedInUser.id);

                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('Upload 2nd path of file', function () {
            return chai
                .request(server)
                .post('/api/folders/upload')
                .set({ Authorization: token })
                .field('selectedFolder', rootData.name)
                .field('selectedFolderId', rootData.id)
                .field('webkitRelativePath', webkitPath[1])
                .field('sourceData', JSON.stringify(sourceData))
                .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
                .then((res) => {
                    const uploadedFile = res.body;
                    sourceData = uploadedFile.sourceData;

                    sourceData.file_folder_id.should.not.be.null;
                    sourceData.user_id.should.not.be.null;
                    sourceData.permission.should.be.eql('EDIT');
                    sourceData.entity_type.should.be.eql('FOLDER');
                    sourceData.name.should.be.not.be.null;
                    sourceData.master_name.should.be.not.be.null;
                    expect(sourceData.file_property_id === null).to.equal(true);
                    expect(sourceData.count === 1).to.equal(true);
                    sourceData.parent_id.should.be.eql(rootData.id);
                    sourceData.created_at.should.not.be.null;
                    sourceData.updated_at.should.not.be.null;
                    sourceData.user_id.should.be.eql(loggedInUser.id);


                    uploadedFile.should.be.a('object');
                    uploadedFile.success.should.be.eql(true);
                    uploadedFile.message.should.be.eql('File uploaded successfully!');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('Upload 3rd path of file', function () {
            return chai
                .request(server)
                .post('/api/folders/upload')
                .set({ Authorization: token })
                .field('selectedFolder', rootData.name)
                .field('selectedFolderId', rootData.id)
                .field('webkitRelativePath', webkitPath[1])
                .field('sourceData', JSON.stringify(sourceData))
                .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
                .then((res) => {
                    const uploadedFile = res.body;
                    sourceData = uploadedFile.sourceData;
                    uploadedFile.should.be.a('object');
                    uploadedFile.success.should.be.eql(true);
                    uploadedFile.message.should.be.eql('File uploaded successfully!');

                    sourceData.file_folder_id.should.not.be.null;
                    sourceData.user_id.should.not.be.null;
                    sourceData.permission.should.be.eql('EDIT');
                    sourceData.entity_type.should.be.eql('FOLDER');
                    sourceData.name.should.be.not.be.null;
                    sourceData.master_name.should.be.not.be.null;
                    expect(sourceData.file_property_id === null).to.equal(true);
                    expect(sourceData.count === 1).to.equal(true);
                    sourceData.parent_id.should.be.eql(rootData.id);
                    sourceData.created_at.should.not.be.null;
                    sourceData.updated_at.should.not.be.null;
                    sourceData.user_id.should.be.eql(loggedInUser.id);

                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('Upload 4th path of file as PDF', function () {
            return chai
                .request(server)
                .post('/api/folders/upload')
                .set({ Authorization: token })
                .field('selectedFolder', rootData.name)
                .field('selectedFolderId', rootData.id)
                .field('webkitRelativePath', webkitPath[1])
                .field('sourceData', JSON.stringify(sourceData))
                .attach('file', 'test/test-image/sample.pdf', 'SamplePdf')
                .then((res) => {
                    const uploadedFile = res.body;
                    sourceData = uploadedFile.sourceData;
                    uploadedFile.should.be.a('object');
                    uploadedFile.success.should.be.eql(true);
                    uploadedFile.message.should.be.eql('File uploaded successfully!');

                    sourceData.file_folder_id.should.not.be.null;
                    sourceData.user_id.should.not.be.null;
                    sourceData.permission.should.be.eql('EDIT');
                    sourceData.entity_type.should.be.eql('FOLDER');
                    sourceData.name.should.be.not.be.null;
                    sourceData.master_name.should.be.not.be.null;
                    expect(sourceData.file_property_id === null).to.equal(true);
                    expect(sourceData.count === 1).to.equal(true);
                    sourceData.parent_id.should.be.eql(rootData.id);
                    sourceData.created_at.should.not.be.null;
                    sourceData.updated_at.should.not.be.null;
                    sourceData.user_id.should.be.eql(loggedInUser.id);

                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // getSizeOfFolder
    describe('/getSizeOfFolder FolderId', () => {
        it('it should not give the size of INVALID folder in BYTES', () => {
            return chai
                .request(server)
                .get('/api/folder/size/' + faker.random.number())
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('folder doesn\'t exist');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should give the size of folder in BYTES', () => {
            return chai
                .request(server)
                .get('/api/folder/size/' + rootData.id)
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    data.data.should.not.be.null;
                    data.data.should.to.be.at.least(0);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // deleteFolder with invalid id
    describe('/deleteFolder FolderId', () => {
        it('it should delete the root folder', () => {
            return chai
                .request(server)
                .delete('/api/folder/' + faker.random.number())
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('folder doesn\'t exist');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // deleteFolder
    describe('/deleteFolder FolderId', () => {
        it('it should not delete the folder if user unauthorized ', () => {
            return chai
                .request(server)
                .delete('/api/folder/' + rootData.id)
                .set({ Authorization: token2 })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('You don\'t have the required permission');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/deleteFolder FolderId', () => {
        it('it should not delete the root folder', () => {
            return chai
                .request(server)
                .delete('/api/folder/0')
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('folder doesn\'t exist');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // // deleteFolder
    // describe('/deleteFolder FolderId', () => {
    //     it('it should delete the root folder', () => {
    //         return chai
    //             .request(server)
    //             .delete('/api/folder/' + testData1.id)
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(true);
    //                 data.message.should.be.eql('folder deleted');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });


    after((done) => {
        // remove main root folder
        commonFunction.removeFolderFromAws(rootData.path).then(() => {
            commonFunction.removeFolderFromAws(loggedInUser.email).then(() => {
                commonFunction.removeFolderFromAws('icons/' + loggedInUser.email).then(() => {
                    done();
                })
            })
        })
    });
});