const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
// const faker = require('faker');

const commonFunction = require('../commonFunction');
const server = require('../../app');

const generatedSampleData = require('../sampleData');
const mediaCommonFunction = require('../../services/commonFunction').mediaCommonFunction;
const todayDate = require('../../services/commonFunction').todayDate;
const { encrypt, decrypt } = require('../../services/commonFunction');

const should = chai.should();

chai.use(chaiHttp);

let createdUser, createdFile, createdSubfolder, rootData, fileFullData, fileObject, filePropertyObject, fileFolderAccess, encryptedString, dencryptedString;;

describe('CommmonFunction', () => {
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
            user = generatedSampleData.createdSampleData("users", 1)
            user[0].email = "commmonFunction_testCases@ripple.com";

            commonFunction.addDataToTable("user_roles", role[0]).then((role_data) => {
                user[0].role_id = role_data.id;
                commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_data) => {
                    user[0].permission_set_id = permission_data.id;
                    commonFunction.addDataToTable("users", user[0]).then((data) => {
                        createdUser = data;
                        done();
                    });
                })
            });
        });
    });

    describe('todayDate', () => {

        it('it should return date in format', () => {
            let res = todayDate(new Date('2018-01-02'));
            res.should.be.eql('2018-01-02');
            res.should.not.be.eql('2018-02-01');
        });
    });

    describe('saveFolderIntoDb', () => {
        before((done) => {
            commonFunction.addDataToTable('files_folders', {
                original_name: user[0].email,
                created_by: createdUser.id,
                entity_type: 'FOLDER'
            }).then((file_folder_data) => {
                commonFunction.addDataToTable('files_folders_accesses', {
                    name: user[0].email,
                    file_folder_id: file_folder_data.id,
                    user_id: createdUser.id,
                    permission: 'EDIT',
                    entity_type: 'FOLDER',
                    parent_id: null,
                    file_property_id: null,
                    refrence_id: null,
                    master_name: user[0].email,
                    count: 0
                }).then((data_file_folder_access) => {
                    rootData = data_file_folder_access;

                    parentFolder = rootData,
                        subFolderName = "newTestFolder",
                        userData = createdUser
                    done();
                });
            });
        });

        it('it should not save folder if data is in-valid', () => {
            return mediaCommonFunction.saveFolderIntoDb(0, "subFolderName", "userData")
                .then((res) => {
                    res.success.should.be.eql(false);
                    res.message.should.be.eql('Parent folder invalid.');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should save folder', () => {
            return mediaCommonFunction.saveFolderIntoDb(parentFolder, subFolderName, userData)
                .then((res) => {
                    res.success.should.be.eql(true);
                    res.message.should.be.eql('Folder added successfully.');
                    createdSubfolder = res.data.dataValues;
                    createdSubfolder.name.should.be.eql(subFolderName);
                    createdSubfolder.user_id.should.be.eql(createdUser.id);
                    createdSubfolder.parent_id.should.be.eql(rootData.id);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not save same folder', () => {
            return mediaCommonFunction.saveFolderIntoDb(parentFolder, subFolderName, userData)
                .then((res) => {
                    res.success.should.be.eql(false);
                    res.message.should.be.eql('Sub folder already exist.');
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

    });

    describe('checkFileNameExistByMasterName', () => {
        before((done) => {
            commonFunction.addDataToTable('files_folders', {
                original_name: 'test-file',
                created_by: createdUser.id,
                entity_type: 'FILE'
            }).then((file_folder_data) => {
                commonFunction.addDataToTable('file_properties', {
                    file_id: file_folder_data.id,
                    size: 200,
                    path: '',
                    iconpath: '',
                    mimetype: 'image/jpeg',
                    extension_type: '.jpeg',
                    tag: '',
                    description: '',
                    width: 100,
                    height: 100,
                    quality: 100,
                    aspect_ratio: 1,
                }).then((data_file_properties) => {
                    commonFunction.addDataToTable('files_folders_accesses', {
                        name: 'test-file',
                        file_folder_id: file_folder_data.id,
                        user_id: createdUser.id,
                        permission: 'EDIT',
                        entity_type: 'FILE',
                        parent_id: rootData.id,
                        file_property_id: data_file_properties.id,
                        refrence_id: null,
                        master_name: 'test-file',
                        count: 0
                    }).then((data_file_folder_access) => {
                        createdFile = data_file_folder_access;
                        done();
                    });
                });

            });
        });
        it('it should return error', () => {
            return mediaCommonFunction.checkFileNameExistByMasterName()
                .then((res) => {
                    should.equal(res.success, false);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('it should return NULL if file not found', () => {
            return mediaCommonFunction.checkFileNameExistByMasterName("INVALID", rootData.id)
                .then((res) => {
                    should.equal(res, null);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should return File', () => {
            return mediaCommonFunction.checkFileNameExistByMasterName(createdFile, rootData.id)
                .then((res) => {
                    console.log('----187----', res);
                    res.id.should.not.be.eql(0);
                    res.name.should.not.be.eql(null);
                    expect(res.master_name === createdFile.master_name).to.equal(true);
                    expect(res.name === createdFile.name).to.equal(true);
                    expect(res.folder_id === createdFile.folder_id).to.equal(true);
                    expect(res.created_by == createdFile.created_by).to.equal(true);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });


    });

    describe('checkFileNameExistByName', () => {
        it('it should return error', () => {
            return mediaCommonFunction.checkFileNameExistByName()
                .then((res) => {
                    should.equal(res.success, false);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should return null if file not found', () => {
            return mediaCommonFunction.checkFileNameExistByName("INVALID", rootData.id)
                .then((res) => {
                    should.equal(res, null);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should return File', () => {
            return mediaCommonFunction.checkFileNameExistByName(createdFile, rootData.id)
                .then((res) => {
                    res.id.should.not.be.eql(0);
                    res.name.should.not.be.eql(null);
                    expect(res.master_name === createdFile.master_name).to.equal(true);
                    expect(res.name === createdFile.name).to.equal(true);
                    expect(res.folder_id === createdFile.folder_id).to.equal(true);
                    expect(res.created_by == createdFile.created_by).to.equal(true);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('checkFolderNameExistByMasterName', () => {
        it('it should return error', () => {
            return mediaCommonFunction.checkFolderNameExistByMasterName()
                .then((res) => {
                    should.equal(res.success, false);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('it should return NULL if folder not found', () => {
            return mediaCommonFunction.checkFolderNameExistByMasterName("INVALID", rootData.id)
                .then((res) => {
                    should.equal(res, null);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('it should return Folder', () => {
            return mediaCommonFunction.checkFolderNameExistByMasterName(createdSubfolder.name, rootData.id)
                .then((res) => {
                    res.id.should.not.be.eql(0);
                    res.name.should.not.be.eql(null);
                    expect(res.name === createdSubfolder.name).to.equal(true);
                    expect(res.folder_id === createdSubfolder.folder_id).to.equal(true);
                    expect(res.created_by == createdSubfolder.created_by).to.equal(true);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('checkFolderNameExistByName', () => {
        it('it should return error', () => {
            return mediaCommonFunction.checkFolderNameExistByName()
                .then((res) => {
                    should.equal(res.success, false);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('it should return NULL if folder not found', () => {
            return mediaCommonFunction.checkFolderNameExistByName("INVALID", rootData.id)
                .then((res) => {
                    should.equal(res, null);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
        it('it should return Folder', () => {
            return mediaCommonFunction.checkFolderNameExistByName(createdSubfolder.name, rootData.id)
                .then((res) => {
                    res.id.should.not.be.eql(0);
                    res.name.should.not.be.eql(null);
                    expect(res.name === createdSubfolder.name).to.equal(true);
                    expect(res.folder_id === createdSubfolder.folder_id).to.equal(true);
                    expect(res.created_by == createdSubfolder.created_by).to.equal(true);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // describe('getChildOfFolder', () => {
    //     it('it should return error', () => {
    //         return mediaCommonFunction.getChildOfFolder()
    //             .then((res) => {
    //                 should.equal(res.success, false);
    //             })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    //     it('it should return data (file/folder) if type=FOLDER', () => {
    //         return mediaCommonFunction.getChildOfFolder(rootData.id, 'FOLDER', true)
    //             .then((res) => {
    //                 should.equal(res.length, 1);
    //                 should.equal(res[0].children.length, 0);
    //                 expect(res[0].data.id === createdSubfolder.id).to.equal(true);
    //                 expect(res[0].data.name === createdSubfolder.name).to.equal(true);
    //                 expect(res[0].data.user_id == userData.id).to.equal(true);
    //                 expect(res[0].data.user.dataValues.first_name == createdUser.first_name).to.equal(true);
    //                 expect(res[0].data.user.dataValues.last_name == createdUser.last_name).to.equal(true);
    //                 expect(res[0].data.user.dataValues.email).to.equal(undefined);
    //             })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should return data (file/folder) if type=FILE', () => {
    //         return mediaCommonFunction.getChildOfFolder(rootData.id, 'FILE', true)
    //             .then((res) => {
    //                 should.equal(res.length, 2);
    //                 should.equal(res[0].children.length, 0);
    //                 expect(res[0].data.id === createdSubfolder.id).to.equal(true);
    //                 expect(res[0].data.name === createdSubfolder.name).to.equal(true);
    //                 expect(res[0].data.user_id == userData.id).to.equal(true);
    //                 expect(res[0].data.user.dataValues.first_name == createdUser.first_name).to.equal(true);
    //                 expect(res[0].data.user.dataValues.last_name == createdUser.last_name).to.equal(true);
    //                 expect(res[0].data.user.dataValues.email).to.equal(undefined);

    //                 should.equal(res[1].children.length, 0);
    //                 expect(res[1].data.id === createdFile.id).to.equal(true);
    //                 expect(res[1].data.name === createdFile.name).to.equal(true);
    //                 expect(res[1].data.user_id == userData.id).to.equal(true);
    //                 expect(res[1].data.user.dataValues.first_name == createdUser.first_name).to.equal(true);
    //                 expect(res[1].data.user.dataValues.last_name == createdUser.last_name).to.equal(true);
    //                 expect(res[1].data.user.dataValues.email == createdUser.email).to.equal(true);
    //             })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // // getChildOfFolderReplica
    // describe('getChildOfFolderReplica', () => {
    //     it('it should return error', () => {
    //         return mediaCommonFunction.getChildOfFolderReplica()
    //             .then((res) => {
    //                 should.equal(res.success, false);
    //             })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    //     it('it should return data (file/folder) if type=FOLDER', () => {
    //         return mediaCommonFunction.getChildOfFolderReplica(rootData.id, 'FOLDER', true)
    //             .then((res) => {
    //                 should.equal(res.length, 2);
    //                 should.equal(res[0].children.length, 0);
    //                 expect(res[0].data.id === createdSubfolder.id).to.equal(true);
    //                 expect(res[0].data.name === createdSubfolder.name).to.equal(true);
    //                 expect(res[0].data.user_id == userData.id).to.equal(true);
    //                 expect(res[0].data.user.dataValues.first_name == createdUser.first_name).to.equal(true);
    //                 expect(res[0].data.user.dataValues.last_name == createdUser.last_name).to.equal(true);
    //                 expect(res[0].data.user.dataValues.email).to.equal(undefined);
    //             })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should return data (file/folder) if type=FILE', () => {
    //         return mediaCommonFunction.getChildOfFolderReplica(rootData.id, 'FILE', true)
    //             .then((res) => {
    //                 should.equal(res.length, 2);
    //                 should.equal(res[0].children.length, 0);
    //                 expect(res[0].data.id === createdSubfolder.id).to.equal(true);
    //                 expect(res[0].data.name === createdSubfolder.name).to.equal(true);
    //                 expect(res[0].data.user_id == userData.id).to.equal(true);
    //                 expect(res[0].data.user.dataValues.first_name == createdUser.first_name).to.equal(true);
    //                 expect(res[0].data.user.dataValues.last_name == createdUser.last_name).to.equal(true);

    //                 should.equal(res[1].children.length, 0);
    //                 expect(res[1].data.id === createdFile.id).to.equal(true);
    //                 expect(res[1].data.name === createdFile.name).to.equal(true);
    //                 expect(res[1].data.user_id == userData.id).to.equal(true);
    //                 expect(res[1].data.user.dataValues.first_name == createdUser.first_name).to.equal(true);
    //                 expect(res[1].data.user.dataValues.last_name == createdUser.last_name).to.equal(true);

    //             })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // createFileObject :: ALREADY METHOD COMMENTED
    // let sampleFile;
    // describe('createFileObject', () => {
    //     before((done) => {
    //         sampleFile = generatedSampleData.createdSampleData('files', 1)[0];
    //         sampleFile.created_by = userData.id;
    //         sampleFile.folder_id = createdSubfolder.id;
    //         done();
    //     });
    //     it('it should return fileObject', () => {
    //         res = mediaCommonFunction.createFileObject(sampleFile.name, sampleFile.size, sampleFile.path, sampleFile.type, sampleFile.type, sampleFile.folder_id, sampleFile.tag, sampleFile.description, sampleFile.created_by, sampleFile.master_name, sampleFile.count)
    //         should.equal(res.name, sampleFile.name);
    //         should.equal(res.size, sampleFile.size);
    //         should.equal(res.path, sampleFile.path);
    //         should.equal(res.type, sampleFile.type);
    //         should.equal(res.extension_type, sampleFile.type);
    //         should.equal(res.folder_id, sampleFile.folder_id);
    //         should.equal(res.tag, sampleFile.tag);
    //         should.equal(res.description, sampleFile.description);
    //         should.equal(res.created_by, sampleFile.created_by);
    //         should.equal(res.master_name, sampleFile.master_name);
    //         should.equal(res.count, sampleFile.count);
    //     });
    // });
    // saveFileIntoDb :: METHOD COMMENTED
    // describe('saveFileIntoDb', () => {
    //     it('it should not save file if folder path is not valid', () => {
    //         return mediaCommonFunction.saveFileIntoDb(sampleFile, 'INVALID')
    //             .then((res) => {
    //                 should.equal(res.success, false);
    //                 should.equal(res.message, 'invalid parent folder.');
    //             })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    //     it('it should save saveFileIntoDb', () => {
    //         return mediaCommonFunction.saveFileIntoDb(sampleFile, createdSubfolder.id)
    //             .then((res) => {
    //                 // console.log('----res-----', res)
    //                 res = res.dataValues;
    //                 res.id.should.not.be.eql(0);
    //                 should.equal(res.name, sampleFile.name);
    //                 res.folder_id.should.be.eql(sampleFile.folder_id);
    //                 res.type.should.be.eql(sampleFile.type);
    //                 res.created_by.should.be.eql(sampleFile.created_by);
    //                 sampleFile = res;
    //             })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // updateFilePath :: METHOD COMMENTED
    // describe('updateFilePath', () => {
    //     it('it should not update file path if file is not valid', () => {
    //         return mediaCommonFunction.updateFilePath('INVALID', 'newPath')
    //             .then((res) => {
    //                 should.equal(res.success, false);
    //                 should.equal(res.message, 'invalid file.');
    //             })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    //     it('it should update file path if file is valid', () => {
    //         return mediaCommonFunction.updateFilePath(sampleFile.path, 'newPath')
    //             .then((res) => {
    //                 should.equal(res[0], 1);
    //             })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    describe('promise resolved', () => {
        it('resolves', (done) => {
            const resolvingPromise = new Promise((resolve) => {
                resolve('promise resolved');
            });
            resolvingPromise.then((result) => {
                expect(result).to.equal('promise resolved');
                done();
            });
        });
    });

    // updateIDAsRefrenceId :: METHOD COMMENTED
    // describe('updateIDAsRefrenceId', () => {
    //     it('it should update file with refrenceID', () => {
    //         return mediaCommonFunction.updateIDAsRefrenceId(sampleFile.id, sampleFile.id)
    //             .then((res) => {
    //                 should.equal(res[0], null); //error
    //                 should.equal(res[1][0], 1); // updated
    //             })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // formatBytes,
    describe('formatBytes', () => {
        it('it should get data in formated', () => {
            res = mediaCommonFunction.formatBytes(0);
            should.equal(res, '0 Bytes');
        });
        it('it should get data in formated', () => {
            res = mediaCommonFunction.formatBytes(10050);
            should.equal(res, '9.81 KB');
        });
        it('it should get data in formated', () => {
            res = mediaCommonFunction.formatBytes(1234567890);
            should.equal(res, '1.15 GB');
        });
    });

    // formatBytesInGB
    describe('formatBytes', () => {
        it('it should get data in formated', () => {
            res = mediaCommonFunction.formatBytesInGB(0);
            should.equal(res, '0');
        });
        it('it should get data in formated', () => {
            res = mediaCommonFunction.formatBytesInGB(10050);
            should.equal(res, '0.00');
        });
        it('it should get data in formated', () => {
            res = mediaCommonFunction.formatBytesInGB(1234567890);
            should.equal(res, '1.15');
        });
    });

    // formatBytesInMB
    describe('formatBytes In MB', () => {
        it('it should get data in formated', () => {
            res = mediaCommonFunction.formatBytesInMB(0);
            should.equal(res, '0');
        });
        it('it should get data in formated', () => {
            res = mediaCommonFunction.formatBytesInMB(1);
            should.equal(res, '0.00');
        });
        it('it should get data in formated', () => {
            res = mediaCommonFunction.formatBytesInMB(1234567890);
            should.equal(res, '1177.38');
        });
    });

    // formatBytesInKB
    describe('formatBytes In KB', () => {
        it('it should get data in formated', () => {
            res = mediaCommonFunction.formatBytesInKB(0);
            should.equal(res, '0');
        });
        it('it should get data in formated', () => {
            res = mediaCommonFunction.formatBytesInKB(1);
            should.equal(res, '0.00');
        });
        it('it should get data in formated', () => {
            res = mediaCommonFunction.formatBytesInKB(123456);
            should.equal(res, '120.56');
        });
    });

    describe('checkFileNameDuplicacy', () => {
        it('it should return existing data if have', () => {
            return mediaCommonFunction.checkFileNameDuplicacy({ dataValues: createdFile }, { dataValues: createdSubfolder }
                , (error, res) => {
                    res.entity_type.should.be.eql('FILE');
                    res.name.should.not.be.null;
                    res.master_name.should.not.be.null;
                    expect(res.file_folder_id === null).to.equal(false);
                    expect(res.user_id === null).to.equal(false);
                    expect(res.permission === 'EDIT').to.equal(true);
                    expect(res.parent_id === rootData.id).to.equal(true);
                    expect(res.file_property_id === null).to.equal(false);
                    expect(res.count === 0).to.equal(true);
                    expect(res.created_at === null).to.equal(false);
                    expect(res.updated_at === null).to.equal(false);
                    expect(res.file_property === null).to.equal(false);
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // getFolderByParentIdWithUser
    // describe('getFolderByParentIdWithUser', () => {
    //     it('it should return folder with user', () => {
    //         return mediaCommonFunction.getFolderByParentIdWithUser(rootData.id).then((res) => {
    //             let data = res[0]

    //             should.equal(res.length, 1);
    //             data.entity_type.should.be.eql('FOLDER');
    //             data.name.should.be.eql(createdSubfolder.name);
    //             data.master_name.should.be.eql(createdSubfolder.master_name);
    //             expect(data.file_folder_id === null).to.equal(false);
    //             expect(data.user_id === null).to.equal(false);
    //             expect(data.permission === 'EDIT').to.equal(true);
    //             expect(data.parent_id === rootData.id).to.equal(true);
    //             expect(data.file_property_id === null).to.equal(true);
    //             expect(data.count === 0).to.equal(true);
    //             expect(data.created_at === null).to.equal(false);
    //             expect(data.updated_at === null).to.equal(false);
    //             expect(data.user === null).to.equal(false);
    //             expect(data.user.first_name === null).to.equal(false);
    //             expect(data.user.last_name === null).to.equal(false);
    //         })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    // updateCountForFiles

    // getFileWithUser
    // describe('getFileWithUser', () => {
    //     it('it should return file with user as per Parent folder Id', () => {
    //         return mediaCommonFunction.getFileWithUser(rootData.id).then((res) => {
    //             should.equal(res.length, 1);
    //             let data = res[0]
    //             data.entity_type.should.be.eql('FILE');
    //             data.name.should.not.be.null;
    //             data.master_name.should.not.be.null;
    //             expect(data.file_folder_id === null).to.equal(false);
    //             expect(data.user_id === null).to.equal(false);
    //             expect(data.permission === 'EDIT').to.equal(true);
    //             expect(data.parent_id === rootData.id).to.equal(true);
    //             expect(data.file_property_id === null).to.equal(false);
    //             expect(data.count === 0).to.equal(true);
    //             expect(data.created_at === null).to.equal(false);
    //             expect(data.updated_at === null).to.equal(false);
    //             expect(data.file_property === null).to.equal(false);
    //         })
    //             .catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });
    // getFileByIdWithUser
    describe('getFileByIdWithUser', () => {
        it('it should return file with user', () => {
            return mediaCommonFunction.getFileByIdWithUser(createdFile.id).then((res) => {
                fileFullData = res;
                res.entity_type.should.be.eql('FILE');
                res.name.should.not.be.null;
                res.master_name.should.not.be.null;
                expect(res.file_folder_id === null).to.equal(false);
                expect(res.user_id === null).to.equal(false);
                expect(res.permission === 'EDIT').to.equal(true);
                expect(res.parent_id === rootData.id).to.equal(true);
                expect(res.file_property_id === null).to.equal(false);
                expect(res.count === 0).to.equal(true);
                expect(res.created_at === null).to.equal(false);
                expect(res.updated_at === null).to.equal(false);
                expect(res.file_property === null).to.equal(false);
            })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // getFileFormatedData,
    describe('getFileFormatedData', () => {
        it('it should return file with user', () => {
            return mediaCommonFunction.getFileFormatedData(fileFullData).then((res) => {
                res.entity_type.should.be.eql('FILE');
                res.name.should.not.be.null;
                res.master_name.should.not.be.null;
                expect(res.file_folder_id === null).to.equal(false);
                expect(res.user_id === null).to.equal(false);
                expect(res.permission === 'EDIT').to.equal(true);
                expect(res.parent_id === rootData.id).to.equal(true);
                expect(res.file_property_id === null).to.equal(false);
                expect(res.count === 0).to.equal(true);
                expect(res.created_at === null).to.equal(false);
                expect(res.updated_at === null).to.equal(false);
                expect(res.file_property === null).to.equal(false);
                expect(res.sizeInBytes === null).to.equal(false);
                expect(res.size === null).to.equal(false);
                expect(res.nameWithOutExt === null).to.equal(false);
                expect(res.thumbIconUrl === null).to.equal(false);
                expect(res.OriginalImageUrl === null).to.equal(false);
            })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // const fileObject = commonFunction.createFileFolderObject(fileToCopy.name, fileToCopy.user_id, 'FILE');
    // resizedLargeImage,
    // removeLargeImage,

    // createFileFolderObject,
    describe('createFileFolderObject', () => {
        it('it should return object', () => {
            let res = mediaCommonFunction.createFileFolderObject('test-name.jpeg', createdUser.id, 'FILE')
            res.original_name.should.not.be.null;
            res.created_by.should.not.be.null;
            res.entity_type.should.not.be.null;
            fileObject = res;
        });
    });
    // createFilePropertyObject,
    describe('createFilePropertyObject', () => {
        it('it should return object', () => {
            let res = mediaCommonFunction.createFilePropertyObject(10, 120, 'fileToCopy.path', 'fileToCopy.path', 'image/jpeg', 'jpeg', 'fileToCopy.tag', 'fileToCopy.description', 100, 200, 50, 100);
            res.file_id.should.not.be.null;
            res.size.should.not.be.null;
            res.path.should.not.be.null;
            res.iconpath.should.not.be.null;
            res.mimetype.should.not.be.null;
            res.extension_type.should.not.be.null;
            res.tag.should.not.be.null;
            res.description.should.not.be.null;
            res.width.should.not.be.null;
            res.height.should.not.be.null;
            res.aspect_ratio.should.not.be.null;
            res.quality.should.not.be.null;

            filePropertyObject = res;
        });
    });
    // createFile_Folder_Access_Object,
    describe('createFile_Folder_Access_Object', () => {
        it('it should return object', () => {
            let res = mediaCommonFunction.createFile_Folder_Access_Object(10, createdUser.id, 'EDIT', 'test-name.jpeg', 'FILE', 5, 'test-name.jpeg', 1);
            // console.log('------res-------', res);
            res.file_folder_id.should.not.be.null;
            res.user_id.should.not.be.null;
            res.permission.should.not.be.null;
            res.name.should.not.be.null;
            res.entity_type.should.not.be.null;
            res.parent_id.should.not.be.null;
            res.master_name.should.not.be.null;
            res.count.should.not.be.null;

            fileFolderAccess = res;
        });
    });

    describe('Save File with object and properties and access', () => {
        // saveFileFolder
        it('it should add file_folder object', () => {
            return mediaCommonFunction.saveFileFolder(fileObject).then((res) => {
                // console.log('-----res-saveFileFolder----', res)
                res.dataValues.id.should.not.be.null;
                res.dataValues.created_by.should.not.be.null;
                res.dataValues.original_name.should.not.be.null;
                res.dataValues.updated_at.should.not.be.null;
                res.dataValues.created_at.should.not.be.null;
                res.dataValues.entity_type.should.not.be.null;
                filePropertyObject.file_id = res.dataValues.id;
                fileFolderAccess.file_folder_id = res.dataValues.id;
            }).catch(function (err) {
                return Promise.reject(err);
            });
        });

        // saveFileProperties
        it('it should add file_property', () => {
            return mediaCommonFunction.saveFileProperties(filePropertyObject).then((res) => {
                // console.log('-----res-filePropertyObject----', res)

                res.dataValues.id.should.not.be.null;
                res.dataValues.file_id.should.not.be.null;
                res.dataValues.size.should.not.be.null;
                res.dataValues.path.should.not.be.null;
                res.dataValues.iconpath.should.not.be.null;
                res.dataValues.mimetype.should.not.be.null;
                res.dataValues.extension_type.should.not.be.null;
                res.dataValues.tag.should.not.be.null;
                res.dataValues.description.should.not.be.null;
                res.dataValues.width.should.not.be.null;
                res.dataValues.height.should.not.be.null;
                res.dataValues.aspect_ratio.should.not.be.null;
                res.dataValues.quality.should.not.be.null;
                res.dataValues.updated_at.should.not.be.null;
                res.dataValues.created_at.should.not.be.null;
                fileFolderAccess.file_property_id = res.dataValues.id;

            }).catch(function (err) {
                return Promise.reject(err);
            });
        });

        // saveFileFolderAccess,
        it('it should add file_folder access', () => {
            return mediaCommonFunction.saveFileFolderAccess(fileFolderAccess).then((res) => {
                res.id.should.not.be.null;
                res.file_folder_id.should.not.be.null;
                res.user_id.should.not.be.null;
                res.permission.should.be.eql('EDIT');
                res.name.should.be.eql('test-name.jpeg');
                res.entity_type.should.be.eql('FILE');
                expect(res.parent_id === null).to.equal(false);
                expect(res.file_property_id === null).to.equal(false);
                expect(res.master_name === null).to.equal(false);
                expect(res.count === null).to.equal(false);
                expect(res.created_at === null).to.equal(false);
                expect(res.updated_at === null).to.equal(false);
                expect(res.user === null).to.equal(false);
                expect(res.file_property === null).to.equal(false);
                expect(res.sizeInBytes === null).to.equal(false);
                expect(res.size === null).to.equal(false);
                expect(res.nameWithOutExt === null).to.equal(false);
                expect(res.thumbIconUrl === null).to.equal(false);
                expect(res.OriginalImageUrl === null).to.equal(false);
            }).catch(function (err) {
                return Promise.reject(err);
            });
        });

        // getFileFolderDataByQuery,
        it('it should get file/folder by query', () => {
            return mediaCommonFunction.getFileFolderDataByQuery({ parent_id: null, user_id: createdUser.id, entity_type: 'FOLDER' }).then((res) => {
                expect(res[0] === null).to.equal(true);
                expect(res[1].length > 0).to.equal(true);

            }).catch(function (err) {
                return Promise.reject(err);
            });
        });

        // updateFileFolderDataByQuery,
        it('it should update file/folder by query', () => {
            return mediaCommonFunction.updateFileFolderDataByQuery({
                count: 2
            }, {
                    user_id: createdUser.id
                }).then((res) => {
                    expect(res[0] === null).to.equal(true);
                    expect(res[1].length > 0).to.equal(true);

                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

    });

    // Common functions encrypt, decrypt test cases
    describe('encrypt test case', () => {
        it('it should encrypt the text send to it', () => {
            encryptedString = encrypt('Test string');
        });

        it('it should decrypt the encrypt text send to it', () => {
            decryptedString = decrypt(encryptedString);
            should.equal(decryptedString, 'Test string');
        });
    });

    after((done) => {
        // remove main root folder
        commonFunction.removeFolderFromAws(createdUser.email).then(() => {
            done();
        })
    });

});
