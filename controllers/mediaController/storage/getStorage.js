const models = require('../../../models');
const Files_Folders_Access = require('../../../models').files_folders_accesses;
const commonFunction = require('../../../services/commonFunction');
const oneGBToBytes = 1024 * 1024 * 1024;
const oneMbToBytes = 1048576;
const oneKbToBytes = 1024;

// 1kb = 1024 bytes
// 1Mb = 1024 Kb = 1048576 Bytes
// 1Gb = 1024 Mb = 1073741824 Bytes

/**
 * Get size of folder from DB
 * @param {object} req  
 * @param {object} res  
 */
const getSizeOfFolder = async (req, res) => {
    let [err, folder] = await to(Files_Folders_Access.findByPk(req.params.id));
    if (err || !folder) {
        return res.json({ success: false, message: 'folder doesn\'t exist' });
    }
    models.sequelize
        .query(`SELECT SUM(file_properties.size) as total FROM file_properties RIGHT JOIN files_folders_accesses ON file_properties.id = files_folders_accesses.file_property_id WHERE files_folders_accesses.parent_id = ${folder.dataValues.id}`).then(
            async (results) => {
                return res.json({ success: true, data: results[0][0]['total'] || 0 });
            });
};

/**
 * Get storage status of media from aws
 * @param {object} req 
 * @param {object} res 
 */
const getStorageStatus = async (req, res) => {
    checkAvailableSpace(req.user, (responseSpace) => {
        res.json(responseSpace)
    })
};

/**
 * Check available space and format according to size
 * @param {object} userData 
 * @param {callback} callback 
 */
const checkAvailableSpace = async (userData, callback) => {
    
    [err, folder] = await commonFunction.mediaCommonFunction.getFileFolderDataByQuery({ 
            parent_id: null, 
            user_id: userData.id, 
            entity_type: 'FOLDER',
            is_guest: userData.is_guest
        }
    );
    if (err) {
        callback({ success: false, message: err });
    }
    if (folder) {
        let sizeResponseConverted = 0;
        let usedSpaceUnit = 'Bytes'; 
        
        models.sequelize
            .query(`SELECT SUM(file_properties.size) as total FROM file_properties RIGHT JOIN files_folders_accesses ON file_properties.id = files_folders_accesses.file_property_id WHERE files_folders_accesses.user_id = ${userData.id}`).then(
                async (results) => {
                    let sizeResponse = results[0][0]['total'];
                    
                    if (sizeResponse >= 0) {
                        // call to format bytes in common function
                        if (sizeResponse >= oneGBToBytes) {
                            sizeResponseConverted = await commonFunction.mediaCommonFunction.formatBytesInGB(sizeResponse);
                            usedSpaceUnit = 'GB';
                        } else if (sizeResponse >= oneMbToBytes) {
                            sizeResponseConverted = await commonFunction.mediaCommonFunction.formatBytesInMB(sizeResponse);
                            usedSpaceUnit = 'MB';
                        } else if (sizeResponse >= oneKbToBytes) {
                            sizeResponseConverted = await commonFunction.mediaCommonFunction.formatBytesInKB(sizeResponse);
                            usedSpaceUnit = 'KB';
                        }
                        const allowedSpace = (userData.allowed_space_aws || S3_MEDIA.totalAllowedSpaceToUser); // Bytes 
                        const allowedSpaceInGB = await commonFunction.mediaCommonFunction.formatBytesInGB(allowedSpace);

                        let percentageCoveredSpace = (sizeResponse / allowedSpace) * 100;
                        callback({
                            success: true,
                            message: 'Storage space data',
                            data: {
                                space_consumed: sizeResponse,
                                space_allowed: allowedSpace, //bytes
                                space_available: allowedSpace - sizeResponse, //bytes
                                percentageCoveredSpace: percentageCoveredSpace.toFixed(2),
                                storageToFrom: (sizeResponseConverted) + ' ' + usedSpaceUnit + ' of ' + allowedSpaceInGB + ' ' + S3_MEDIA.sizeAllowedParameter,
                            }
                        });
                    } else {
                        callback({ success: false, message: 'error' });
                    }
                }
            ).catch(error => {
                callback({ success: false, message: 'Something wrong.', error });
            })
    } else {
        callback({ success: false, message: 'Something wrong.' });
    }
}

module.exports = {
    getStorageStatus,
    getSizeOfFolder
};

