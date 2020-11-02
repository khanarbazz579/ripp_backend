// const Files = require('../../models').files;
// const Folders = require('../../models').folders;
// const Users = require('../../models').users;
// const uploadToAws = require('../../services/multerS3Service');
const commonFunction = require('../../services/commonFunction').mediaCommonFunction;

const shiftFolderToFolder = async (req, res) => {
    // console.log('----shiftFolderToFolder----', req.body);
    let { folderToMove_id, shiftedToFolder_id } = req.body;
    if (folderToMove_id === shiftedToFolder_id) {
        return res.json({ success: false, message: 'Invalid Operation' });
    }
    // get folder info whom we need to shift
    [err, folderDataToMove] = await commonFunction.getFileFolderDataByQuery({ id: folderToMove_id, entity_type: 'FOLDER' });

    if (!err && folderDataToMove.length > 0) {
        if (shiftedToFolder_id === folderDataToMove[0].dataValues.parent_id) {
            return res.json({ success: true, message: 'already their' });
        }

        // get folder info where we need to shift
        [err, shiftedFolder] = await commonFunction.getFileFolderDataByQuery({ id: shiftedToFolder_id, entity_type: 'FOLDER' });
        if (!err && shiftedFolder.length > 0) {
            await moveChildFolderToNewFolder(folderDataToMove[0], shiftedFolder[0], req.user.dataValues)
            return res.json({ success: true, message: 'data updated' });
        } else {
            return res.json({ success: false, message: 'Folder where to move doesn\'t exists' });
        }
    } else {
        return res.json({ success: false, message: 'Folder to move doesn\'t exists' });
    }
}


const moveChildFolderToNewFolder = async (folderDataToMove, whereToMoveFolder, userData, n = 0) => {
    // console.log('-----userData----', userData);
    let countFolder = 0;
    folderName = folderDataToMove.dataValues.name
    const isFolderExistByMasterName = await commonFunction.checkFolderNameExistByMasterName(folderName, whereToMoveFolder.id);
    folderNameNew = folderName;
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
    if (countFolder > 0) {
        [err, countUpdate] = await commonFunction.updateFileFolderDataByQuery({
            count: countFolder
        }, {
                user_id: userData.id, parent_id: whereToMoveFolder.id, master_name: folderMasterName
            })
    }

    // update child
    [error, modelUpdated] = await commonFunction.updateFileFolderDataByQuery({
        parent_id: whereToMoveFolder.id,
        name: folderNameNew
    }, {
            id: folderDataToMove.id
        })
    if (modelUpdated) {
        return;
    }
}
module.exports = shiftFolderToFolder;
