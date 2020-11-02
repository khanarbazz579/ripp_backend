const path = require('path');
// const Files = require('../../models').files;
// const Folders = require('../../models').folders;
const uploadToAws = require('../../services/multerS3Service');
const commonFunction = require('../../services/commonFunction').mediaCommonFunction;
const models = require('../../models');
const Files_Folders_Access = models.files_folders_accesses;
const Share_Files_Folders = models.share_files_folders;

const shiftFileFromShared = async (req, res) => {

    let [err, fileData] = await to(Files_Folders_Access.findByPk(req.body.file_id));
    if (err || !fileData) {
        return res.json({ success: false, message: 'File you\'re trying to move doesn\'t exist or is deleted!' });
    }
    
    let [err1, shiftedFolder] = await to(Files_Folders_Access.findByPk(req.body.folder_id));
    if (err1 || !shiftedFolder) {
        return res.json({ success: false, message: 'You\'re trying to move to a non-existent folder!' })
    }

    let [err2, share_details] = await to(Share_Files_Folders.findAll({
        where:{
            file_folder_access_id: req.body.file_id,
            user_id: req.user.id
        }
    }))
    if (err2 || !share_details.length) {
        return res.json({ success: false, message: 'File you\'re trying to move doesn\'t exist or is deleted!' })
    }

    if(share_details[0].status === 'MOVED') {
        return res.json({           
            success:false,
            message: 'This file was already moved to your local folders.'
        })
    }
 

    fileData.dataValues.share_details = share_details[0];

    moveSharedFileToFolder(fileData, shiftedFolder, req.user, async (error, movedData) => {
        if (error) {
            return res.json({ success: false, message: error })
        }

        let [error1, modelUpdated] = await removeUserFromShared(fileData, req.user.id);

        // req.user.id
        if (error1 || !modelUpdated) {
            return res.json({
                success: false,
                message: error1 || 'Something went wrong!'
            })
        }
        return res.json({ success: true, message: 'Moved Successfully', movedFile: movedData });
    });
}

const moveSharedFileToFolder = async (fileData, shiftedFolder, user, callback) => {

    let extension = path.extname(fileData.dataValues.name);
    let fileName = path.parse(fileData.dataValues.name).name;

    const isFileExistByMasterName = await commonFunction.checkFileNameExistByMasterName({ name: fileData.dataValues.name }, parseInt(shiftedFolder.dataValues.id));
    let isFileExist = {};
    isFileExist.count = 0;
    const isFileNameAlreadyExistByName = await commonFunction.checkFileNameExistByName({ name: fileData.dataValues.name }, parseInt(shiftedFolder.dataValues.id));

    if (isFileExistByMasterName) {
        isFileExist = isFileExistByMasterName;
        isFileExist.name = `${fileName}(${++isFileExistByMasterName.count})${extension}`;
    } else if (isFileNameAlreadyExistByName) {
        isFileExist = isFileNameAlreadyExistByName;
        isFileExist.count = 0;
        isFileExist.name = `${fileName}(${++isFileExist.count})${extension}`;
        isFileExist.master_name = `${fileName}${extension}`;
    } else { // when new master_name
        isFileExist = fileData;
    }

    const fileFolderAccess = commonFunction.createFile_Folder_Access_Object(isFileExist.file_folder_id, user.id, fileData.dataValues.share_details.permission , isFileExist.name, 'FILE', shiftedFolder.dataValues.id, isFileExist.name, 0, user.is_guest);

    fileFolderAccess.file_property_id = isFileExist.file_property_id;
    fileFolderAccess.share_refrence_id = fileData.dataValues.share_details.id;

    //console.log('----fileFolderAccess-87----', fileFolderAccess);
    // save file intoDb
    let [err, file] = await to(commonFunction.saveFileFolderAccess(fileFolderAccess));

    if (err || !file) return callback(err, file);   

    await commonFunction.updateIDAsRefrenceId(file.dataValues.id, fileData.dataValues.id);
    await commonFunction.updateCountForFiles(file.dataValues.master_name, parseInt(file.dataValues.folder_id), isFileExist.count);

    return callback(err, file);
}

const removeUserFromShared = async (fileData, userId) => {

    return [err, share] = await to(Share_Files_Folders.update({
        status: 'MOVED'
    }, {
            where: { file_folder_access_id: fileData.id, user_id: userId }
        }));

    // // remove userId 
    // let sharedList = []
    // sharedList = fileData.dataValues.shared_with.split(',');
    // var index = sharedList.indexOf(userId.toString())
    // if (index !== -1) sharedList.splice(index, 1);

    // // update on DB
    // return [error, modelUpdated] = await to(
    //     Files.update({
    //         shared_with: sharedList.join(", ")
    //     }, {
    //             where: {
    //                 id: fileData.id
    //             }
    //         })
    // );
}

module.exports = shiftFileFromShared