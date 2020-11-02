const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const faker = require('faker');

const Folders = require('../../models').folders;
const commonFunction = require('../commonFunction');
const server = require('../../app');
const generatedSampleData = require('../sampleData');

const should = chai.should();
const modelName = 'folders';
const testRootData = {
    name: 'root',
    parent_id: null,
    type: 'directory',
    created_by: 0,
    path: 'root',
    shared_with: null,
    master_name: 'root'
}
const subFolderName = 'root-test' + Math.random();
let loggedInUser, newTestRootData, addedFolderData, rootData, testData1, testData2, testData3, token, user, files, sharedWithUser;

chai.use(chaiHttp);

describe('Folders', () => {
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
            user[0].email = "testUser1_testCases@ripple.com";
            user[1].email = "testUser2_testCases@ripple.com";

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

    // /*
    //  * Test the /getFolderData route
    //  */
    // describe('/getFolderData Folder', () => {
    //     it('it should GET 0 Folder', () => {
    //         return chai.request(server)
    //             .get('/api/folders/data')
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.body.success.should.be.eql(true);
    //                 res.body.message.should.be.eql('folders recieved');

    //                 const data = res.body.data;
    //                 data.should.be.a('array');
    //                 data.length.should.be.eql(0);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('/getFolderData Folder', () => {
    //     before((done) => {
    //         testRootData.created_by = loggedInUser.id;
    //         // testRootData.path = user[0].email
    //         testRootData.name = user[0].email
    //         commonFunction.addDataToTable(modelName, testRootData).then((data) => {
    //             rootData = data;
    //             done();
    //         });
    //     });

    //     it('it should GET all Folder', () => {
    //         return chai.request(server)
    //             .get('/api/folders/data')
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.body.success.should.be.eql(true);
    //                 res.body.message.should.be.eql('folders recieved');

    //                 const data = res.body.data;
    //                 data.should.be.a('array');
    //                 data[0].type.should.be.eql(rootData.type);
    //                 // data[0].path.should.be.eql(rootData.path);
    //                 // data[0].name.should.be.eql(rootData.name);
    //                 data[0].name.should.be.eql('My Files');
    //                 data.length.should.be.eql(1);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });


    // describe('/getFolderData Folder', () => {
    //     before((done) => {
    //         testRootData.created_by = loggedInUser.id;
    //         testRootData.path = user[0].email
    //         testRootData.name = user[0].email
    //         commonFunction.addDataToTable(modelName, testRootData).then((data) => {
    //             rootData = data;
    //             done();
    //         });
    //     });

    //     it('it should GET all Folder', () => {
    //         //   rootData = commonFunction.addDataToTable(modelName, testRootData);
    //         return chai.request(server)
    //             .get('/api/folders/data')
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.body.success.should.be.eql(true);
    //                 res.body.message.should.be.eql('folders recieved');

    //                 const data = res.body.data;
    //                 data.should.be.a('array');
    //                 data[0].type.should.be.eql(rootData.type);
    //                 data[0].path.should.be.eql(rootData.path);
    //                 data[0].name.should.be.eql(rootData.name);
    //                 data.length.should.be.eql(1);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });
    // /*
    // * Test the /addFolder route
    // */
    // describe('/addFolder Folder', () => {
    //     it('it should add Folder', () => {
    //         return chai
    //             .request(server)
    //             .post('/api/folder')
    //             .set({ Authorization: token })
    //             .send({ parentFolder: rootData, subFolderName })
    //             .then((res) => {
    //                 // res.should.have.status(201);
    //                 res.body.success.should.be.eql(true);
    //                 res.body.message.should.be.eql('Folder added successfully.');

    //                 const data = res.body.data;
    //                 addedFolderData = data;
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
    // });

    // describe('/addFolder Folder', () => {
    //     it('it should not add if Folder is already exist in parent folder', () => {
    //         return chai
    //             .request(server)
    //             .post('/api/folder')
    //             .set({ Authorization: token })
    //             .send({ parentFolder: rootData, subFolderName })
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.body.success.should.be.eql(false);
    //                 res.body.message.should.be.eql('Sub folder already exist.');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('/addFolder Folder', () => {
    //     it('it should not add if Parent folder invalid', () => {
    //         newTestRootData = JSON.parse(JSON.stringify(testRootData));
    //         newTestRootData.parent_id = 0;

    //         return chai
    //             .request(server)
    //             .post('/api/folder')
    //             .set({ Authorization: token })
    //             .send({ parentFolder: newTestRootData, subFolderName })
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.body.success.should.be.eql(false);
    //                 res.body.message.should.be.eql('Parent folder invalid.');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // // rename folder
    // describe('/renameFolder Folder', () => {
    //     it('it should not rename the folder if parent folder invalid', () => {
    //         return chai
    //             .request(server)
    //             .put('/api/folder') //addedFolderData
    //             .set({ Authorization: token })
    //             .send({ parentFolder: newTestRootData, subFolderName: 'root-test-rename' + Math.random() })
    //             .then((res) => {
    //                 res.should.have.status(200);
    //                 res.body.success.should.be.eql(false);
    //                 res.body.message.should.be.eql('Folder invalid.');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('/renameFolder Folder', () => {
    //     it('it should not rename the folder', () => {
    //         return chai
    //             .request(server)
    //             .put('/api/folder')
    //             .set({ Authorization: token })
    //             .send({ parentFolder: addedFolderData, subFolderName })
    //             .then((res) => {
    //                 res.body.success.should.be.eql(false);
    //                 res.body.message.should.be.eql('Folder already exist.');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

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
    //                 data.id.should.not.be.null;
    //                 data.name.should.be.eql(newSubFolderName);
    //                 data.created_at.should.not.be.null;
    //                 data.updated_at.should.not.be.null;
    //                 data.type.should.be.eql('directory');
    //                 // data.path.should.be.eql(`${rootData.path}/${data.name}`);
    //                 data.parent_id.should.not.be.null;
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // //getFolderTree
    // describe('getFolderTree', () => {
    //     it('it should get FolderTree without child', () => {
    //         return chai
    //             .request(server)
    //             .get('/api/folders/tree')
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 expect(typeof res.body.data[0].expanded).to.equal('undefined');
    //                 const data = res.body.data[0].data;
    //                 data.name.should.be.eql('My Files');
    //                 data.type.should.be.eql(rootData.type);
    //                 // data.path.should.be.eql(rootData.path);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('getFolderTree FolderTree', () => {
    //     before((done) => {
    //         testData2 = {
    //             name: 'test-root-child',
    //             parent_id: rootData.id,
    //             type: 'directory',
    //             created_by: loggedInUser.id,
    //             path: 'root/test-root-child',
    //             master_name: 'test-root-child'
    //         };
    //         testData3 = {
    //             name: 'test-root-child-2',
    //             parent_id: rootData.id,
    //             type: 'directory',
    //             created_by: loggedInUser.id,
    //             path: 'root/test-root-child-2',
    //             master_name: 'test-root-child-2'
    //         }

    //         commonFunction.addDataToTable(modelName, testData2).then((data) => {
    //             commonFunction.addDataToTable(modelName, testData3).then((data) => {
    //                 done();
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
    //                 data[0].data.name.should.be.eql('My Files');
    //                 expect(typeof data[0].expanded).to.equal('undefined');
    //                 data[0].children.should.be.a('array');
    //                 data[0].children.length.should.be.eql(3);

    //                 expect(typeof data[0].children[0].expanded).to.equal('undefined');
    //                 const firstChild = data[0].children[0].data;
    //                 firstChild.id.should.not.be.null;
    //                 firstChild.name.should.be.eql(testData1.name);
    //                 firstChild.parent_id.should.be.eql(rootData.id);

    //                 expect(typeof data[0].children[1].expanded).to.equal('undefined');
    //                 const secondChild = data[0].children[1].data;
    //                 secondChild.id.should.not.be.null;
    //                 secondChild.name.should.be.eql(testData2.name);
    //                 secondChild.parent_id.should.be.eql(rootData.id);

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
    // });

    // // getFolderChilds/:folder_id/directory
    // describe('getFolderChilds', () => {
    //     it('it should not get Folder child if folder does not exist', () => {
    //         return chai
    //             .request(server)
    //             .get('/api/folder/childs/' + faker.random.number() + '/' + 'directory')
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 data = res.body;
    //                 data.success.should.be.eql(false);
    //                 data.message.should.be.eql('folder doesn\'t exist');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });


    // describe('getFolderChilds', () => {
    //     it('it should get Folder without child', () => {
    //         return chai
    //             .request(server)
    //             .get('/api/folder/childs/' + testData1.id + '/' + 'directory')
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 data = res.body.data;
    //                 data.should.be.a('array');
    //                 data.length.should.be.eql(0);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // let copyFileData, sharedFolder;
    // describe('getFolderChilds /directory', () => {
    //     it('it should get directory as FolderTree with child', () => {
    //         return chai
    //             .request(server)
    //             .get('/api/folder/childs/' + rootData.id + '/directory')
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 data = res.body.data;
    //                 data.should.be.a('array');
    //                 data.length.should.be.eql(3);

    //                 const firstChild = data[0].data;
    //                 firstChild.id.should.not.be.null;
    //                 firstChild.name.should.be.eql(testData1.name);
    //                 firstChild.parent_id.should.be.eql(rootData.id);
    //                 firstChild.created_at.should.not.be.null;
    //                 firstChild.updated_at.should.not.be.null;
    //                 firstChild.created_by.should.not.be.eql(loggedInUser);


    //                 const secondChild = data[1].data;
    //                 secondChild.id.should.not.be.null;
    //                 secondChild.name.should.be.eql(testData2.name);
    //                 secondChild.parent_id.should.be.eql(rootData.id);
    //                 secondChild.created_at.should.not.be.null;
    //                 secondChild.updated_at.should.not.be.null;
    //                 secondChild.created_by.should.not.be.eql(loggedInUser);


    //                 const thirdChild = data[2].data;
    //                 sharedFolder = thirdChild;
    //                 thirdChild.id.should.not.be.null;
    //                 thirdChild.name.should.be.eql(testData3.name);
    //                 thirdChild.parent_id.should.be.eql(rootData.id);
    //                 thirdChild.created_at.should.not.be.null;
    //                 thirdChild.updated_at.should.not.be.null;
    //                 thirdChild.created_by.should.not.be.eql(loggedInUser);

    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // share folder
    describe('/share folder', () => {
        let postInfo;
        before((done) => {
            postInfo = {
                accessIds: [sharedWithUser.id],
                id: 0,
                type: testRootData.type
            };
            console.log('---testRootData---', testRootData);
            done();
        });

        it('it should not share non-exist folder', () => {
            return chai.request(server)
                .put('/api/sharedata/update')
                .set({ Authorization: token })
                .send(postInfo)
                .then((res) => {
                    const data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('something went wrong.!!');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/share folder 2', () => {
        let postInfo;
        before((done) => {
            postInfo = {
                accessIds: [sharedWithUser.id],
                id: 0,
                type: testRootData.type
            };
            done();
        });
        it('it should not share ROOT folder', () => {
            postInfo.id = rootData.id;
            return chai.request(server)
                .put('/api/sharedata/update')
                .set({ Authorization: token })
                .send(postInfo)
                .then((res) => {
                    const data = res.body;
                    console.log('----data----', data);
                    data.should.be.a('object');
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('can\'t share root folder');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/share folder 3', () => {
        let postInfo;
        before((done) => {
            postInfo = {
                accessIds: [sharedWithUser.id],
                id: 0,
                type: testRootData.type
            };
            done();
        });
        it('it should not share folder if un-authorized', () => {
            postInfo.id = sharedFolder.id
            return chai.request(server)
                .put('/api/sharedata/update')
                .set({ Authorization: token2 })
                .send(postInfo)
                .then((res) => {
                    const data = res.body;
                    data.should.be.a('object');
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('You don\'t have the required permission');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });


    describe('/share folder', () => {
        let postInfo;
        before((done) => {
            postInfo = {
                accessIds: [sharedWithUser.id], // share with them
                id: sharedFolder.id, // share object
                type: sharedFolder.type // direcory||file
            };
            done();
        });

        it('it should share the root folder with the logged in user', () => {
            return chai.request(server)
                .put('/api/sharedata/update')
                .set({ Authorization: token })
                .send(postInfo)
                .then((res) => {
                    const data = res.body;
                    data.should.be.a('object');
                    data.message.should.be.eql('data access updated');
                    data.success.should.be.eql(true);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // getSharedDataChilds    
    describe('getSharedDataChilds', () => {
        it('it should not get Childs if non Shared folder does not exist', () => {
            return chai
                .request(server)
                .get(`/api/sharedata/childs/${faker.random.number()}/file`)
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.message.should.be.eql('Folder doesn\'t exists')
                    data.success.should.be.eql(false);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('getSharedDataChilds', () => {
        it('it should get 0 Childs of non Shared Data', () => {
            return chai
                .request(server)
                .get(`/api/sharedata/childs/${sharedFolder.id}/directory`)
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('it worked')
                    data.data.should.be.a('array');
                    data.data.length.should.be.eql(0);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // getSharedDataTree

    describe('getSharedDataTree', () => {
        it('it should not get default Shared Data Tree', () => {
            return chai
                .request(server)
                .get('/api/sharedata/invalid')
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('child type invalid');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('it should get default Shared Data Tree type=directory', () => {
            return chai
                .request(server)
                .get('/api/sharedata/directory')
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('it worked');
                    data.data.should.be.a('array');
                    data.data.length.should.be.eql(1);
                    res.body.data[0].data.name.should.be.eql('shared');
                    res.body.data[0].data.id.should.be.eql(0);
                    res.body.data[0].data.type.should.be.eql('directory');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should get default Shared Data Tree type=file', () => {
            return chai
                .request(server)
                .get('/api/sharedata/file')
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('it worked');
                    data.data.should.be.a('array');
                    data.data.length.should.be.eql(1);
                    res.body.data[0].data.name.should.be.eql('shared');
                    res.body.data[0].data.id.should.be.eql(0);
                    res.body.data[0].data.type.should.be.eql('directory');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });


    // login with second user and check shared tree
    // getSharedDataChilds   
    describe('getSharedDataChilds', () => {
        it('it should not get root(0) shared Data for user', () => {
            return chai
                .request(server)
                .get(`/api/sharedata/childs/0/invalid`)
                .set({ Authorization: token2 })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('child type invalid')
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('it should get root(0) shared Data for user', () => {
            return chai
                .request(server)
                .get(`/api/sharedata/childs/0/file`)
                .set({ Authorization: token2 })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('it worked')
                    data.data.should.be.a('array');
                    data.data.length.should.be.eql(1);
                    let sharedData1 = data.data[0];
                    // let sharedData2 = data.data[1];

                    sharedData1.data.id.should.not.be.eql('');
                    sharedData1.data.first_name.should.be.eql(user[0].first_name);
                    sharedData1.data.last_name.should.be.eql(user[0].last_name);
                    sharedData1.data.type.should.be.eql('directory');

                    // sharedData2.data.id.should.not.be.eql('');
                    // sharedData2.data.first_name.should.be.eql(user[0].first_name);
                    // sharedData2.data.last_name.should.be.eql(user[0].last_name);
                    // sharedData2.data.type.should.be.eql('image/jpeg');

                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // get User List
    describe('getSharedUsersList', () => {
        it('it should not get zero shared user and one exist user for Particular folder Id(except creator)', () => {
            return chai
                .request(server)
                .get(`/api/sharedata/users/${rootData.id}/invalid`)
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

    describe('getUserList', () => {
        it('it should get zero shared user and one exist user for Particular folder Id(except creator)', () => {
            return chai
                .request(server)
                .get(`/api/sharedata/users/${rootData.id}/${rootData.type}`)
                .set({ Authorization: token })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('user-list recieved successfully');
                    data.data.length.should.be.eql(1);
                    expect(data.data[0].id === sharedWithUser.id).to.equal(true);
                    expect(data.data[0].id !== loggedInUser.id).to.equal(true);
                    data.sharedWith.length.should.be.eql(0);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // remove Folder from Shared
    describe('/remove Folder from Shared', () => {
        let removedDataObject;
        before((done) => {
            removedDataObject = {
                type: 'invalid'
            };
            done();
        });
        it('it should not removed the shared folder if data is invalid', () => {
            return chai.request(server)
                .put('/api/sharedata/remove')
                .set({ Authorization: token })
                .send(removedDataObject)
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('Invalid data');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/remove Folder from Shared', () => {
        let removedDataObject;
        before((done) => {
            removedDataObject = {
                type: 'directory',
                id: 0.1
            };
            done();
        });
        it('it should not removed the shared folder if data is invalid', () => {
            return chai.request(server)
                .put('/api/sharedata/remove')
                .set({ Authorization: token })
                .send(removedDataObject)
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(false);
                    data.message.should.be.eql('file/folder not valid.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/remove Folder from Shared', () => {
        let removedDataObject;
        before((done) => {
            removedDataObject = {
                id: sharedFolder.id,
                type: sharedFolder.type
            };
            done();
        });
        it('it should not removed the un-shared folder', () => {
            return chai.request(server)
                .put('/api/sharedata/remove')
                .set({ Authorization: token })
                .send(removedDataObject)
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('Not found on share.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('it should removed the shared folder', () => {
            return chai.request(server)
                .put('/api/sharedata/remove')
                .set({ Authorization: token2 })
                .send(removedDataObject)
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    data.message.should.be.eql('Removed from your shared.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // folder upload with file
    // describe('Upload folders', () => {
    //     let webkitPath = [];
    //     let sourceData, sourceData1, sourceData2;
    //     before((done) => {
    //         webkitPath = ['folderA/Googlelogo.png', 'folderA/folderB/Googlelogo.png', 'folderC/Googlelogo.png']
    //         done();
    //     });
    //     it('Upload 1st path of file', function () {
    //         return chai
    //             .request(server)
    //             .post('/api/folders/upload')
    //             .set({ Authorization: token })
    //             .field('selectedFolder', rootData.name)
    //             .field('selectedFolderId', rootData.id)
    //             .field('webkitRelativePath', webkitPath[0])
    //             .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
    //             .then((res) => {
    //                 const uploadedFile = res.body;
    //                 sourceData = uploadedFile.sourceData;
    //                 uploadedFile.should.be.a('object');
    //                 uploadedFile.success.should.be.eql(true);
    //                 uploadedFile.message.should.be.eql('File uploaded successfully!');

    //                 sourceData.id.should.not.be.null;
    //                 sourceData.parent_id.should.not.be.null;
    //                 sourceData.parent_id.should.be.eql(rootData.id);
    //                 sourceData.created_by.should.not.be.null;
    //                 sourceData.created_by.should.be.eql(loggedInUser.id);
    //                 // sourceData.path.should.not.be.null;
    //                 sourceData.master_name.should.not.be.null;
    //                 sourceData.count.should.not.be.null;
    //                 sourceData.created_at.should.not.be.null;
    //                 sourceData.type.should.be.eql('directory');
    //                 sourceData.count.should.be.eql(0);

    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    //     it('Upload 2nd path of file', function () {
    //         return chai
    //             .request(server)
    //             .post('/api/folders/upload')
    //             .set({ Authorization: token })
    //             .field('selectedFolder', rootData.name)
    //             .field('selectedFolderId', rootData.id)
    //             .field('webkitRelativePath', webkitPath[1])
    //             .field('sourceData', JSON.stringify(sourceData))
    //             .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
    //             .then((res) => {
    //                 // console.log('----res-----', res);
    //                 const uploadedFile = res.body;
    //                 sourceData1 = uploadedFile.sourceData;
    //                 uploadedFile.should.be.a('object');
    //                 uploadedFile.success.should.be.eql(true);
    //                 uploadedFile.message.should.be.eql('File uploaded successfully!');

    //                 sourceData1.id.should.not.be.null;
    //                 sourceData1.parent_id.should.not.be.null;
    //                 sourceData1.parent_id.should.be.eql(rootData.id);
    //                 sourceData1.created_by.should.not.be.null;
    //                 sourceData1.created_by.should.be.eql(loggedInUser.id);
    //                 // sourceData1.path.should.not.be.null;
    //                 sourceData1.master_name.should.not.be.null;
    //                 sourceData1.count.should.not.be.null;
    //                 sourceData1.created_at.should.not.be.null;
    //                 sourceData1.type.should.be.eql('directory');
    //                 sourceData1.count.should.be.eql(0);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    //     it('Upload 3rd path of file', function () {
    //         return chai
    //             .request(server)
    //             .post('/api/folders/upload')
    //             .set({ Authorization: token })
    //             .field('selectedFolder', rootData.name)
    //             .field('selectedFolderId', rootData.id)
    //             .field('webkitRelativePath', webkitPath[1])
    //             .field('sourceData', JSON.stringify(sourceData))
    //             .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
    //             .then((res) => {
    //                 const uploadedFile = res.body;
    //                 sourceData2 = uploadedFile.sourceData;
    //                 uploadedFile.should.be.a('object');
    //                 uploadedFile.success.should.be.eql(true);
    //                 uploadedFile.message.should.be.eql('File uploaded successfully!');

    //                 sourceData2.id.should.not.be.null;
    //                 sourceData2.parent_id.should.not.be.null;
    //                 sourceData2.parent_id.should.be.eql(rootData.id);
    //                 sourceData2.created_by.should.not.be.null;
    //                 sourceData2.created_by.should.be.eql(loggedInUser.id);
    //                 // sourceData2.path.should.not.be.null;
    //                 sourceData2.master_name.should.not.be.null;
    //                 sourceData2.count.should.not.be.null;
    //                 sourceData2.created_at.should.not.be.null;
    //                 sourceData2.type.should.be.eql('directory');
    //                 sourceData2.count.should.be.eql(0);

    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });                         

    // describe('Upload folders with existing name', () => {
    //     let webkitPath = [];
    //     let sourceData;
    //     before((done) => {
    //         webkitPath = ['folderA/Googlelogo.png', 'folderA/folderB/Googlelogo.png', 'folderC/Googlelogo.png']
    //         done();
    //     });
    //     it('Upload 1st path of file', function () {
    //         return chai

    //             .request(server)
    //             .post('/api/folders/upload')
    //             .set({ Authorization: token })
    //             .field('selectedFolder', rootData.name)
    //             .field('selectedFolderId', rootData.id)
    //             .field('webkitRelativePath', webkitPath[0])
    //             .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
    //             .then((res) => {
    //                 const uploadedFile = res.body;
    //                 sourceData = uploadedFile.sourceData;
    //                 uploadedFile.should.be.a('object');
    //                 uploadedFile.success.should.be.eql(true);
    //                 uploadedFile.message.should.be.eql('File uploaded successfully!');


    //                 sourceData.id.should.not.be.null;
    //                 sourceData.parent_id.should.not.be.null;
    //                 sourceData.parent_id.should.be.eql(rootData.id);
    //                 sourceData.created_by.should.not.be.null;
    //                 sourceData.created_by.should.be.eql(loggedInUser.id);
    //                 // sourceData.path.should.not.be.null;
    //                 sourceData.master_name.should.not.be.null;
    //                 sourceData.master_name.should.not.be.eql(sourceData.name);
    //                 sourceData.count.should.not.be.null;
    //                 sourceData.created_at.should.not.be.null;
    //                 sourceData.updated_at.should.not.be.null;
    //                 sourceData.type.should.be.eql('directory');
    //                 sourceData.count.should.be.eql(1);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    //     it('Upload 2nd path of file', function () {
    //         return chai
    //             .request(server)
    //             .post('/api/folders/upload')
    //             .set({ Authorization: token })
    //             .field('selectedFolder', rootData.name)
    //             .field('selectedFolderId', rootData.id)
    //             .field('webkitRelativePath', webkitPath[1])
    //             .field('sourceData', JSON.stringify(sourceData))
    //             .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
    //             .then((res) => {
    //                 const uploadedFile = res.body;
    //                 sourceData = uploadedFile.sourceData;

    //                 sourceData.id.should.not.be.null;
    //                 sourceData.parent_id.should.not.be.null;
    //                 sourceData.parent_id.should.be.eql(rootData.id);
    //                 sourceData.created_by.should.not.be.null;
    //                 sourceData.created_by.should.be.eql(loggedInUser.id);
    //                 // sourceData.path.should.not.be.null;
    //                 sourceData.master_name.should.not.be.null;
    //                 sourceData.master_name.should.not.be.eql(sourceData.name);
    //                 sourceData.count.should.not.be.null;
    //                 sourceData.count.should.be.eql(1);
    //                 sourceData.updated_at.should.not.be.null;
    //                 sourceData.created_at.should.not.be.null;
    //                 sourceData.type.should.be.eql('directory');


    //                 uploadedFile.should.be.a('object');
    //                 uploadedFile.success.should.be.eql(true);
    //                 uploadedFile.message.should.be.eql('File uploaded successfully!');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    //     it('Upload 3rd path of file', function () {
    //         return chai
    //             .request(server)
    //             .post('/api/folders/upload')
    //             .set({ Authorization: token })
    //             .field('selectedFolder', rootData.name)
    //             .field('selectedFolderId', rootData.id)
    //             .field('webkitRelativePath', webkitPath[1])
    //             .field('sourceData', JSON.stringify(sourceData))
    //             .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
    //             .then((res) => {
    //                 const uploadedFile = res.body;
    //                 sourceData = uploadedFile.sourceData;
    //                 uploadedFile.should.be.a('object');
    //                 uploadedFile.success.should.be.eql(true);
    //                 uploadedFile.message.should.be.eql('File uploaded successfully!');

    //                 sourceData.id.should.not.be.null;
    //                 sourceData.parent_id.should.not.be.null;
    //                 sourceData.parent_id.should.be.eql(rootData.id);
    //                 sourceData.created_by.should.not.be.null;
    //                 sourceData.created_by.should.be.eql(loggedInUser.id);
    //                 // sourceData.path.should.not.be.null;
    //                 sourceData.master_name.should.not.be.null;
    //                 sourceData.master_name.should.not.be.eql(sourceData.name);
    //                 sourceData.count.should.not.be.null;
    //                 sourceData.count.should.be.eql(1);
    //                 sourceData.updated_at.should.not.be.null;
    //                 sourceData.created_at.should.not.be.null;
    //                 sourceData.type.should.be.eql('directory');

    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    //     it('Upload 4th path of file as PDF', function () {
    //         return chai
    //             .request(server)
    //             .post('/api/folders/upload')
    //             .set({ Authorization: token })
    //             .field('selectedFolder', rootData.name)
    //             .field('selectedFolderId', rootData.id)
    //             .field('webkitRelativePath', webkitPath[1])
    //             .field('sourceData', JSON.stringify(sourceData))
    //             .attach('file', 'test/test-image/sample.pdf', 'SamplePdf')
    //             .then((res) => {
    //                 const uploadedFile = res.body;
    //                 sourceData = uploadedFile.sourceData;
    //                 uploadedFile.should.be.a('object');
    //                 uploadedFile.success.should.be.eql(true);
    //                 uploadedFile.message.should.be.eql('File uploaded successfully!');

    //                 sourceData.id.should.not.be.null;
    //                 sourceData.parent_id.should.not.be.null;
    //                 sourceData.parent_id.should.be.eql(rootData.id);
    //                 sourceData.created_by.should.not.be.null;
    //                 sourceData.created_by.should.be.eql(loggedInUser.id);
    //                 // sourceData.path.should.not.be.null;
    //                 sourceData.master_name.should.not.be.null;
    //                 sourceData.master_name.should.not.be.eql(sourceData.name);
    //                 sourceData.count.should.not.be.null;
    //                 sourceData.count.should.be.eql(1);
    //                 sourceData.updated_at.should.not.be.null;
    //                 sourceData.created_at.should.not.be.null;
    //                 sourceData.type.should.be.eql('directory');

    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // // getSizeOfFolder
    // describe('/getSizeOfFolder FolderId', () => {
    //     it('it should not give the size of INVALID folder in BYTES', () => {
    //         return chai
    //             .request(server)
    //             .get('/api/folder/size/' + faker.random.number())
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(false);
    //                 data.message.should.be.eql('folder doesn\'t exist');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should give the size of folder in BYTES', () => {
    //         return chai
    //             .request(server)
    //             .get('/api/folder/size/' + rootData.id)
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(true);
    //                 data.data.should.not.be.null;
    //                 data.data.should.to.be.at.least(0);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // // deleteFolder with invalid id
    // describe('/deleteFolder FolderId', () => {
    //     it('it should delete the root folder', () => {
    //         return chai
    //             .request(server)
    //             .delete('/api/folder/' + faker.random.number())
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(false);
    //                 data.message.should.be.eql('folder doesn\'t exist');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // // deleteFolder
    // describe('/deleteFolder FolderId', () => {
    //     it('it should not delete the folder if user unauthorized ', () => {
    //         return chai
    //             .request(server)
    //             .delete('/api/folder/' + sharedFolder.id)
    //             .set({ Authorization: token2 })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(false);
    //                 data.message.should.be.eql('You don\'t have the required permission');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // describe('/deleteFolder FolderId', () => {
    //     it('it should delete the root folder', () => {
    //         return chai
    //             .request(server)
    //             .delete('/api/folder/0')
    //             .set({ Authorization: token })
    //             .then((res) => {
    //                 const data = res.body;
    //                 data.success.should.be.eql(false);
    //                 data.message.should.be.eql('folder doesn\'t exist');
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // // deleteFolder
    // describe('/deleteFolder FolderId', () => {
    //     it('it should delete the root folder', () => {
    //         return chai
    //             .request(server)
    //             .delete('/api/folder/' + sharedFolder.id)
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
    })
});

