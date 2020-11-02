// const path = require('path');
const Files = require('../../models').files;
const Folders = require('../../models').folders;
// const uploadToAws = require('../../services/multerS3Service');
const commonFunction = require('../../services/commonFunction').mediaCommonFunction;

const shiftFileToFolder = async (req, res) => {
    // get File
    let file = await commonFunction.getFileByIdWithUser(req.body.file_id);
    if (!file) {
        return res.json({ success: false, message: 'File to move doesn\'t exists', data: [] });
    }

    if (req.body.folder_id === file.dataValues.parent_id) {
        return res.json({ success: true, message: 'already their' });
    }
    // get folder info
    [err, shiftedFolder] = await commonFunction.getFileFolderDataByQuery({ id: req.body.folder_id, entity_type: 'FOLDER' });

    if (!err && shiftedFolder.length > 0) {
        // shift file 
        // console.log('-----movedFiledata----', shiftedFolder);
        [error, modelUpdated] = await moveFileToFolder(file, shiftedFolder[0]);
        // console.log('---[error, modelUpdated]----', error, modelUpdated);
        if (!error && modelUpdated) {
            return res.json({ success: true, message: 'data updated' });
        } else {
            return res.json({ success: false })
        }
    } else {
        return res.json({ success: false, message: 'Folder where to move doesn\'t exists' });
    }
}

const moveFileToFolder = async (fileData, shiftedFolder) => {
    return new Promise((resolve, reject) => {
        commonFunction.checkFileNameDuplicacy(fileData, shiftedFolder, async (error, response) => {
            await commonFunction.updateCountForFiles(response.master_name, parseInt(shiftedFolder.dataValues.id), response.count);
            // update file
            resolve(await commonFunction.updateFileFolderDataByQuery({
                parent_id: shiftedFolder.dataValues.id,
                name: response.name
            }, {
                    id: fileData.dataValues.id
                }));

        })
    });
}

module.exports = shiftFileToFolder;
