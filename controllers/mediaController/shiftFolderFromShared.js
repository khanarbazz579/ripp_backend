// const Files = require('../../models').files;
// const Folders = require('../../models').folders;
const models = require('../../models');
const Users = require('../../models').users;
const uploadToAws = require('../../services/multerS3Service');
const commonFunction = require('../../services/commonFunction').mediaCommonFunction;
const Files_Folders_Accesses = models.files_folders_accesses;
const File_Folder = models.files_folders;
const Share_Files_Folders = models.share_files_folders;

const shiftFolderFromShared = async (req, res) => {
    // check shared file/folder exist 
    let [err, folderDataToMove] = await to(
        Files_Folders_Accesses.findOne({
            where: {
                id: req.body.folderToMove_id
            },
            include: [{
                model: File_Folder,
                attributes: ['id', 'original_name']
            }]
        }));

    if (err || !folderDataToMove) {
        return res.json({
            success: false,
            message: 'You\'re trying to move an invalid folder!'
        });
    }

    if (req.body.shiftedToFolder_id === folderDataToMove.dataValues.parent_id) {
        return res.json({ success: false, message: 'You\'ve already moved that folder!' });
    }

    let [err1, shiftedFolder] = await to(Files_Folders_Accesses.findByPk(req.body.shiftedToFolder_id));
    if (err1 || !shiftedFolder) {
        return res.json({
            success: false,
            message: 'You\'re trying to move to a non-existent folder!'
        });
    }

    moveChildFolderToNewFolder(folderDataToMove, shiftedFolder, req.user.dataValues, async (resMove) => {
        // update shared file status
        if (resMove) {

            let [err2, update] = await to(Share_Files_Folders.update({
                status: 'MOVED'
            }, {
                    where: {
                        file_folder_access_id: folderDataToMove.id,
                        user_id: req.user.dataValues.id
                    }
                }));

            if (err2) {
                return res.json({
                    success: false,
                    message: 'Cannot move at the moment!'
                })
            }

            return res.json({ success: true, message: 'Shared data moved to local folders!' });

        } else {
            return res.json({ success: false, message: 'Something went wrong!' });
        }
    });
}


const moveChildFolderToNewFolder = async (folderDataToMove, whereToMoveFolder, userData, callbackMove) => {

    let [err1, share] = await to(Share_Files_Folders.findAll({
        where:{
            file_folder_access_id:folderDataToMove.id,
            user_id:userData.id
        }
    }));

    if(err1 || !share.length){
        return callbackMove(err1 || 'Something went wrong!');
    }

    folderDataToMove.dataValues.permission = share[0].permission;

    // create first folder on whereTomoveFolder
    let countFolder = 0;
    folderName = folderDataToMove.dataValues.name
    const isFolderExistByMasterName = await commonFunction.checkFolderNameExistByMasterName(folderName, whereToMoveFolder.id);
    folderNameNew = folderName;
    folderMasterName = folderNameNew;
    if (isFolderExistByMasterName) {
        countFolder = ++isFolderExistByMasterName.count;
        folderNameNew = `${folderName}(${countFolder})`;
        folderMasterName = isFolderExistByMasterName.master_name;
    } else {
        const isFolderNameAlreadyExistByName = await commonFunction.checkFolderNameExistByName(folderName, whereToMoveFolder.id);
        if (isFolderNameAlreadyExistByName) {
            countFolder = ++isFolderNameAlreadyExistByName.count;
            folderNameNew = `${folderName}(${countFolder})`;
            folderMasterName = isFolderNameAlreadyExistByName.master_name;
        }
    }
    // update data
    if (countFolder > 0) {

        let [err, countUpdate] = await to(Files_Folders_Accesses.update({
            count: countFolder
        }, {
                where: { user_id: userData.id, parent_id: whereToMoveFolder.id, master_name: folderMasterName }
            }));
        if (err) return callbackMove(err);
    }

    // add folder and child
    let [err, newParentFolder] = await to(Files_Folders_Accesses.create({
        name: folderNameNew,
        parent_id: whereToMoveFolder.id,
        entity_type: folderDataToMove.dataValues.entity_type,
        created_by: userData.id,
        user_id: userData.id,
        permission: folderDataToMove.dataValues.permission,
        file_property_id: folderDataToMove.dataValues.file_property_id,
        file_folder_id: folderDataToMove.dataValues.file_folder_id,
        is_guest:userData.is_guest,
        // path,
        master_name: folderMasterName || folderNameNew,
        count: countFolder || 0
    }));
    if (err) return callbackMove(err);

    [err, newParentFolder] = await to(newParentFolder.save());
    if (err) return callbackMove(err);

    if (newParentFolder) {
        updateChildofFolder(folderDataToMove, newParentFolder, userData, async (res) => {
            callbackMove(res)
        });
    }

}

const updateChildofFolder = async (oldParentFolder, newParentFolder, userData, callback) => {
    
    let model = commonFunction.getCurrentUserModel(userData.is_guest);

    // find child files of folders from parent ID
    let [err, filesData] = await to(
        Files_Folders_Accesses.findAll({
            where: {
                file_folder_id: oldParentFolder.dataValues.id
            },
            include: [{
                model: File_Folder,
                attributes: ['id', 'original_name']
            },
            model
            ]
        }));

    if (err) return callback(err);

    newParentFolder.dataValues.permission = oldParentFolder.permission;
    // move files to new folder 
    //updateFilesOfFolder(filesData, newParentFolder, userData, async (res) => {
        [err, foldersData] = await to(
            Files_Folders_Accesses.findAll({
                where: {
                    parent_id: oldParentFolder.dataValues.id
                },
                include: [{
                    model: File_Folder,
                    attributes: ['id', 'original_name']
                }]
            }));
        if (err) return callback(err);
        updateFoldersOfFolder(foldersData, newParentFolder, userData, (res) => {
            callback(res)
        });

    //})
}

const updateFilesOfFolder = (filesData, newParentFolder, userData, callbackFile) => {
    forEachPromise(filesData, (files) => {
        return new Promise((resolve, reject) => {
            process.nextTick(async () => {
                
                // insert with new folder id
                const fileFolderAccess = commonFunction.createFile_Folder_Access_Object(files.dataValues.id, userData.id, newParentFolder.dataValues.permission, files.dataValues.name, files.dataValues.entity_type, newParentFolder.dataValues.id, files.dataValues.name, 0);

                fileFolderAccess.file_property_id = files.dataValues.file_property_id;

                // save file intoDb
                let [err, file] = await to(commonFunction.saveFileFolderAccess(fileFolderAccess));

                if (err) return reject(err);

                await commonFunction.updateIDAsRefrenceId(file.dataValues.id, file.dataValues.id);
                resolve();

            })
        });
    }).then(() => {
        console.log('files done');
        callbackFile(true);
    });
}


const updateFoldersOfFolder = (foldersData, newParentFolder, userData, callbackFolder) => {
    forEachPromise(foldersData, (folder) => {
        return new Promise((resolve, reject) => {
            process.nextTick(async () => {
                let [err, newFolder] = await to(Files_Folders_Accesses.create({
                    name: folder.dataValues.name,
                    file_folder_id: folder.dataValues.file_folder_id,
                    created_by: userData.id,
                    parent_id: newParentFolder.dataValues.id,
                    entity_type: folder.dataValues.entity_type,
                    user_id: userData.id,
                    permission: newParentFolder.dataValues.permission,
                    file_property_id: folder.dataValues.file_property_id,
                    refrence_id: folder.dataValues.id,
                    // path,
                    master_name: folder.dataValues.name,
                    count: 0,
                    is_guest: userData.is_guest
                }));
                if (err) reject(err);

                [err, newFolder] = await to(newFolder.save());
                if (err) return reject(err);

                updateChildofFolder(folder, newFolder, userData, () => {
                    resolve(true);
                })
            })
        });
    }).then(() => {
        callbackFolder(true);
    });
}

// const removeUserFromShared = async (folderData, userId, callbackRemove) => {
//     // remove userId 
//     let sharedList = []
//     sharedList = folderData.dataValues.shared_with.split(',');
//     var index = sharedList.indexOf(userId.toString())
//     if (index !== -1) sharedList.splice(index, 1);

//     // update on DB
//     let [error, modelUpdated] = await to(
//         Folders.update({
//             shared_with: sharedList.join(", ")
//         }, {
//                 where: {
//                     id: folderData.id
//                 }
//             })
//     );
//     if (error) {
//         callbackRemove(error);
//     }
//     callbackRemove(1);
// }

/**
 * 
 * @param items An array of items.
 * @param fn A function that accepts an item from the array and returns a promise.
 * @returns {Promise}
 */
function forEachPromise(items, fn) {
    return items.reduce(function (promise, item) {
        return promise.then(function () {
            return fn(item);
        });
    }, Promise.resolve());
}
module.exports = shiftFolderFromShared;