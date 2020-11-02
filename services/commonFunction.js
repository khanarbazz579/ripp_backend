const path = require('path');
const crypto = require("crypto");
const Sequelize = require('sequelize');
const Files_Folders = require('../models').files_folders;
const Files_Folders_Access = require('../models').files_folders_accesses;
const File_Properties = require('../models').file_properties;
const EntityFiles = require('../models').entity_files;
const Share_Files_Folders = require('../models').share_files_folders;
const Users = require('../models').users;
const Notification = require('../models').notifications;
const ContactEntityFile = require('../models').contact_entity_files;
const FileCategory = require('../models').file_categories;
const Contact = require('../models').contacts;
const LeadClient = require('../models').leads_clients;
const GuestUser = require('../models').share_guest_users;

const Op = Sequelize.Op;
const { smtpTransport } = require('./awsSesSmtpTransport');

const STYLE = require('../constants').MAIL_STYLE;

const ENCRYPTION_KEY = "XwPp9xazJ0ku5CZnlmgAx2Dld8SHkAeT"; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16
const oneGBToBytes = 1024 * 1024 * 1024;
const oneMbToBytes = 1048576;
const oneKbToBytes = 1024;

/**
 * Get date in string format
 * @param date date object
 */
const todayDate = function(date) {
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    today = yyyy + '-' + mm + '-' + dd;
    return today;
};

/**
 * Save folder to database with several steps
 * Get the parent folder information then
 * Check the duplicacy of folder and if folder
 * is not present then create it. 
 * @param parentFolder - parent folder object
 * @param subFolderName - subfolder name
 * @param userData - user data 
 * @param mastername - master name of file
 * @param count - count  
 */
const saveFolderIntoDb = async(parentFolder, subFolderName, userData, mastername = null, count = null) => {
    // get ParentFolder information
    try {
        [err, parentFolder] = await to(
            Files_Folders_Access.findOne({
                where: { name: parentFolder.name, parent_id: parentFolder.parent_id, user_id: userData.id } //, path: `${parentFolder.path}`
            }));
        if (parentFolder) {
            // check duplicacy by parentID and subfolderName
            [err, checkDuplicate] = await to(
                Files_Folders_Access.findOne({
                    where: { name: subFolderName, parent_id: parentFolder.dataValues.id }
                }));
            if (!checkDuplicate) {
                const folderObject = createFileFolderObject(subFolderName, userData.id, 'FOLDER');
                const fileFolderAccess = createFile_Folder_Access_Object(0, userData.id, 'EDIT', subFolderName, 'FOLDER', parentFolder.dataValues.id, mastername || subFolderName, count || 0 , userData.is_guest);
                const folderInstance = await saveFileFolder(folderObject);
                fileFolderAccess.file_folder_id = folderInstance.dataValues.id;
                const saveFolder = await saveFileFolderAccess(fileFolderAccess);
                if (count > 0) {
                    [err, countUpdate] = await to(Files_Folders_Access.update({
                        count
                    }, {
                        where: { user_id: userData.id, parent_id: parentFolder.dataValues.id, master_name: mastername || subFolderName }
                    }));
                }
                return { success: true, data: saveFolder, message: 'Folder added successfully.' };

            } else {
                // send error same name already exist
                return { success: false, message: 'Sub folder already exist.' };
            }
        } else {
            return { success: false, message: 'Parent folder invalid.' };
        }
    } catch (error) {
        return { success: false, message: error };
    }
}


/**
 * Checks folder name is already exist or not
 * @param newFolderName - new folder name
 * @param folderId - folder id
 */
const checkFolderNameExistByMasterName = async(newFolderName, folderId) => {
    try {
        // check it exist 
        if (!newFolderName && !folderId) {
            throw new Error('Param not valid.')
        }
        let [error, object] = await to(
            Files_Folders_Access.findOne({
                where: {
                    parent_id: folderId,
                    master_name: newFolderName,
                    entity_type: 'FOLDER'
                }
            })
        );
        return (object) ? object.dataValues : null;
    } catch (error) {
        return { success: false, message: error };
    }
}

/**
 * Checks folder name is exists or not through name field
 * @param newFolderName - new folder name
 * @param folderId - folder id 
 */
const checkFolderNameExistByName = async(newFolderName, folderId) => {
    try {
        // check it exist 
        if (!newFolderName && !folderId) {
            throw new Error('Param not valid.')
        }
        let [error, object] = await to(
            Files_Folders_Access.findOne({
                where: {
                    parent_id: folderId,
                    name: newFolderName,
                    entity_type: 'FOLDER'
                }
            })
        );
        return (object) ? object.dataValues : null;
    } catch (error) {
        return { success: false, message: error };
    }
}

/**
 * Checks file name is already exist or not
 * @param newFile - new file name
 * @param folderId - folder id
 */
const checkFileNameExistByMasterName = async(newFile, folderId) => {
    try {
        if (!newFile && !folderId) {
            throw new Error('Param not valid.')
        }
        // check it exist 
        let [error, file] = await to(
            Files_Folders_Access.findOne({
                where: {
                    parent_id: folderId,
                    master_name: newFile.extensionName || newFile.name,
                    entity_type: 'FILE'
                }
            })
        );
        return (file) ? file.dataValues : null;
    } catch (error) {
        return { success: false, message: error };
    }
}

/**
 * Checks file name is exists or not through name field
 * @param newFile - new file name
 * @param folderId - folder id 
 */
const checkFileNameExistByName = async(newFile, folderId) => {
    try {
        if (!newFile && !folderId) {
            throw new Error('Param not valid.')
        }
        // check it exist 
        let [error, file] = await to(
            Files_Folders_Access.findOne({
                where: {
                    parent_id: folderId,
                    name: newFile.extensionName || newFile.name,
                    entity_type: 'FILE'
                }
            })
        );
        return (file) ? file.dataValues : null;
    } catch (error) {
        return { success: false, message: error };
    }
}

/**
 * Checks if entity file name is exists or not through name field
 * @param newFile - new file name
 * @param categoryId - category id 
 */
const isEntityFileAlreadyExist = async(newFile, categoryId) => {
    try {
        if (!newFile && !categoryId) {
            throw new Error('Param not valid.')
        }
        // check it exist 
        let [error, file] = await to(
            EntityFiles.findOne({
                where: {
                    category_id: categoryId,
                    name: newFile.name
                }
            })
        );
        return (file) ? file.dataValues : null;
    } catch (error) {
        return { success: false, message: error };
    }
}

/**
 * Get child of folder 
 * @param parentId - parent id of child
 * @param type - type 
 * @param needChild - require child or not
 */
const getChildOfFolder = async(parentId, type = 'FOLDER', isGuestUser, needChild = true) => {
    try {
        if (!parentId) {
            throw new Error('Param not valid.')
        }

        const fetchImageOnly = type === "image" || false;
        let FileData = [], data = [];
        
        if (!fetchImageOnly) {
            data = await getFolderAsPerParentID(parentId, isGuestUser, needChild) || []
        }

        if (type !== 'FOLDER') {
            FileData = await getFilesOfFolder(parentId, isGuestUser, fetchImageOnly) || [];
            data = data.concat(FileData);
        }

        for (let i = 0; i < data.length; i++) {
            data[i].data.shares = await _getFileShares(data[i].data.file_folder_id);
        }
    
     return data || [];
    } catch (error) {
        return { success: false, message: error };
    }
}

/**
 * Get file share count
 * @param file_folder_id - file/folder id 
 * @param type - count 
 */
const _getFileShares = async(file_folder_id, type = "count") => {
    try {
        let ret = [];
        if (!file_folder_id) {
            throw new Error('Invalid file or folder!');
        }
        let sharedInstances = await Share_Files_Folders.count({
            where: {
                file_folder_id
            }
        });
        return sharedInstances;

    } catch (err) {
        throw new Error(err);
    }

}

/**
 * Get folders through parent id
 * @param parentId - parent id
 * @param needChild - require child or not
 */
const getFolderAsPerParentID = async(parentId, isGuestUser, needChild = true) => {
    if (!parentId) {
        throw new Error('Param not valid.')
    }
    let data = [];
    let childFolders = await getFolderByParentIdWithUser(parentId,isGuestUser);

    if (childFolders.length > 0) {
        for (const items of childFolders) {
            items.dataValues['size'] = await calculateFolderSize(items.id,isGuestUser);
            items.dataValues['user'] = items.dataValues['guest_user'] ? items.dataValues['guest_user'] : items.dataValues['user']
            data.push({
                children: (needChild) ? await getFolderAsPerParentID(items.dataValues.id, isGuestUser, false) : [],
                data: items.dataValues
            });
        }
    }
    return data;
}

/**
 * Calculate folder size
 * @param parentId - parent id
 * @param isGuest - is guest 
 */
calculateFolderSize = async(parentId,isGuestUser) => {
    let [err, files] = await to(
        Files_Folders_Access.findAll({
            where: {
                parent_id: parentId,
                entity_type: 'FILE',
                is_guest: isGuestUser
            },
            include: [
                {
                    model: File_Properties
                }
            ]
        })
    );
    if (!err) {
        let total = 0;
        files.forEach( (file) => {
            total = total + parseInt(file.file_property.dataValues.size)
        })
        return await formatBytes(total);
    }else{
        return { success: false, message: err };
    }
}

/**
 * Get child of folder 
 * @param parentId - parent id of child
 */
const getChildOfFolderReplica = async(parentId) => {
    try {
        if (!parentId) {
            throw new Error('Param not valid.')
        }
        let FileData = [],
            data = [];
        FolderData = await getFolderByParentIdWithUser(parentId);
        for (let index = 0; index < FolderData.length; index++) {
            data.push({
                children: [],
                data: FolderData[index].dataValues
            });
        }

        FileData = await getFilesOfFolder(parentId) || [];
        data = data.concat(FileData);
        return data;
    } catch (error) {
        return { success: false, message: error };
    }
}

/**
 * Get files of folder 
 * @param parentId - parent id of child
 * @param fetchImageOnly - fetch image or not
 */
const getFilesOfFolder = async(parentId, isGuestUser, fetchImageOnly = false) => {
    try {
        if (!parentId) {
            throw new Error('Param not valid.')
        }
        let data = [];
        let FileData = await getFileWithUser(parentId, isGuestUser, fetchImageOnly);
        if (FileData) {
            for (let index = 0; index < FileData.length; index++) {
                let formattedFileData = await getFileFormatedData(FileData[index]);
                data.push({
                    children: [],
                    data: formattedFileData.dataValues
                });
            }
        }
        return data;
    } catch (error) {
        return { success: false, message: error };
    }
}

/**
 * Convert files data into file formatted data
 * @param fileData - file data
 */
const getFileFormatedData = async(fileData) => {
    const fileProperty = fileData.dataValues.file_property.dataValues;
    let size = await formatBytes(fileProperty.size || 0);
    fileData.dataValues['sizeInBytes'] = fileProperty['size'];
    fileData.dataValues['size'] = size;
    fileData.dataValues['isImage'] = (S3_MEDIA.allowed_image_file_extensions.indexOf(fileProperty['mimetype']) > -1) ? 1 : 0;
    fileData.dataValues['nameWithOutExt'] = path.parse(fileData.dataValues['name']).name;
    fileData.dataValues['description'] = fileProperty.description;
    fileData.dataValues['thumbIconUrl'] = `${S3_MEDIA.awsPath}${S3_MEDIA.bucketName}/${fileProperty['iconpath']}?random=${Math.random()}`;
    fileData.dataValues['OriginalImageUrl'] = `${S3_MEDIA.awsPath}${S3_MEDIA.bucketName}/${fileData.dataValues['path']}`;
    fileData.dataValues['user'] = fileData.dataValues['guest_user'] ? fileData.dataValues['guest_user'] : fileData.dataValues['user']
    return fileData;
}

/**
 * Convert bytes data  
 * @param bytes - bytes
 */
const formatBytes = (bytes) => {
    if (bytes == 0) return '0 Bytes';
    let ratio = 1024,
        decimalUpto = 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        convertD = Math.floor(Math.log(bytes) / Math.log(ratio));
    return parseFloat((bytes / Math.pow(ratio, convertD)).toFixed(decimalUpto)) + ' ' + sizes[convertD];
}   

/**
 * Convert bytes data into giga bytes 
 * @param bytes - bytes
 */
const formatBytesInGB = (bytes) => {
    if (bytes == 0) return '0';
    let ratio = 1024 * 1024 * 1024; // only for B-> GB
    return (parseFloat(bytes / ratio).toFixed(2));
}

/**
 * Convert bytes data into mega bytes 
 * @param bytes - bytes
 */
const formatBytesInMB = (bytes) => {
    if (bytes == 0) return '0';
    let ratio = 1024 * 1024; // only for B-> MB
    return (parseFloat(bytes / ratio).toFixed(2));
}

/**
 * Convert bytes data into kilo bytes 
 * @param bytes - bytes
 */
const formatBytesInKB = (bytes) => {
    if (bytes == 0) return '0';
    let ratio = 1024; // only for B-> KB
    return (parseFloat(bytes / ratio).toFixed(2));
}

/**
 * Create file folder object 
 * @param original_name - original name of file 
 * @param created_by - created user id
 * @param entity_type - type i.e file/folder
 */
const createFileFolderObject = (original_name, created_by, entity_type, is_guest = 0) => {
    try {
        return {
            original_name,
            created_by,
            entity_type,
            is_guest
        };
    } catch (error) {
        return { success: false, message: error };
    }
}

/**
 * Create file property using data
 * @param file_id - file/folder id
 * @param size - size of file
 * @param path - file path
 * @param iconpath - icon path
 * @param mimetype - mimetype of file
 * @param extension_type - extension of file
 * @param tag - tag of image
 * @param description - description of file
 * @param width - width of image
 * @param height - height of image file
 * @param aspect_ratio - aspect ratio image of file
 * @param quality - quality of file
 */
const createFilePropertyObject = (file_id = null, size, path, iconpath = "", mimetype, extension_type, tag = "", description = "", width = 0, height = 0, aspect_ratio = 0, quality = 100) => {
    try {
        return {
            file_id,
            size,
            path,
            iconpath,
            mimetype,
            extension_type,
            tag,
            description,
            width,
            height,
            aspect_ratio,
            quality
        };
    } catch (error) {
        return { success: false, message: error };
    }
}

/**
 * Create file folder id using data
 * @param file_folder_id - file folder id
 * @param user_id - user id 
 * @param permission - type of permission
 * @param name - original name of file
 * @param entity_type - type i.e file/folder
 * @param parent_id - parent folder id
 * @param master_name - original name of file 
 * @param count - count of file  
 */
const createFile_Folder_Access_Object = (file_folder_id = null, user_id, permission, name, entity_type, parent_id, master_name = "", count = 0, is_guest = 0) => {
    try {
        return {
            file_folder_id,
            user_id,
            permission,
            name,
            entity_type,
            parent_id,
            master_name,
            count,
            is_guest
        };
    } catch (error) {
        return { success: false, message: error };
    }
}

/**
 * Create file folder object
 * @param object - file folder object  
 */
const saveFileFolder = async(object) => {
    try {
        //save into files
        let [err, objectReturn] = await to(Files_Folders.create(object));
        if (err) new Error(err);

        [err, objectReturn] = await to(objectReturn.save());
        if (err) new Error(err);

        return objectReturn;
    } catch (error) {
        return { success: false, message: error };
    }
}

/**
 * Create file folder access object with details
 * @param object - file folder access object  
 */
const saveFileFolderAccess = async(object) => {
    try {
        let [err, objectReturn] = await to(Files_Folders_Access.create(object));
        if (err) new Error(err);

        [err, objectReturn] = await to(objectReturn.save());
        if (err) new Error(err);

        return await getFileByIdWithUser(objectReturn.dataValues.id);
    } catch (error) {
        return { success: false, message: error };
    }
}

/**
 * Create entity file object with details
 * @param object - entity file object  
 */
const saveEntityFile = async(object) => {
    
    let [err, objectReturn] = await to(EntityFiles.create(object));

    if(err){
        return [err, objectReturn];        
    }

    [err, objectReturn] = await to(EntityFiles.findOne({
            where:{
                id: objectReturn.id
            },
            include: [
                {
                    attributes: ['type'],
                    model: LeadClient,
                    as: 'lead_client'
                },
                {
                    attributes: ['first_name', 'last_name'],
                    model: Users
                },
                {
                    attributes: ['name'],
                    model: FileCategory
                },
                {
                    attributes: ['id'],
                    model: ContactEntityFile,
                    as: 'associate_contacts',
                    include:[{
                        attributes: ['first_name', 'last_name', 'id', 'email'],
                        model: Contact,
                        as: 'contact'
                    }]
                },
            ]
        })
    );



    if(objectReturn){   
        objectReturn.dataValues['size'] = formatBytes(objectReturn.size || 0);
        objectReturn.dataValues['isImage'] = (S3_MEDIA.allowed_image_file_extensions.indexOf(objectReturn['mimetype']) > -1) ? 1 : 0;
    }

    return [err, objectReturn];

}

/**
 * Create file property object with file property details
 * @param object - file properties object  
 */
const saveFileProperties = async(object) => {
    try {
        let [err, objectReturn] = await to(File_Properties.create(object));
        if (err)
            return ReE(res, err, 422);

        [err, objectReturn] = await to(objectReturn.save());
        if (err)
            return ReE(res, err, 422);

        return objectReturn;
    } catch (error) {
        return { success: false, message: error };
    }
}

// const updateFilePath = async (oldPath, newPath) => {
//     [err, filePath] = await to(Files.update({
//         path: newPath
//     }, {
//             where: { path: oldPath }
//         }));
//     if (filePath && filePath[0]) {
//         return filePath;
//     } else {
//         return { success: false, message: 'invalid file.' };
//     }
// }

/**
 * Update count of files
 * @param master_name - master name of file
 * @param parent_id - parent id of file
 * @param updatedCount - updated count number  
 */
const updateCountForFiles = async(master_name, parent_id, updatedCount) => {
    let [err, countUpdate] = await to(Files_Folders_Access.update({
        count: updatedCount
    }, {
        where: { parent_id, master_name }
    }));
    return countUpdate;
}

/**
 * 
 * @param parentId - parent id of file
 * @param fetchImageOnly - fetch image only or not 
 */
const getFileWithUser = async(parentId, isGuestUser, fetchImageOnly) => {
    const extensions = ['image/png', 'image/gif', 'image/tiff', 'image/jpeg'],
        query = { parent_id: parentId, entity_type: 'FILE', is_guest: isGuestUser };

    let model = getCurrentUserModel(isGuestUser);
    
    if (fetchImageOnly) {
        Object.assign(query, {
            type: {
                $in: extensions
            }
        })
    }
    let [err, FileData] = await to(
        Files_Folders_Access.findAll({
            where: query,
            include: [
                model,
                {
                    model: File_Properties,
                    attributes: ['size', 'path', 'iconpath', 'mimetype', 'extension_type', 'tag', 'description', 'width', 'height', 'quality', 'aspect_ratio']
                }
            ],
            order: [
                ['refrence_id', 'ASC']
            ]
        }));

    if (!err) {
        return FileData;
    }
}

/**
 * Get current user model whether it is guest or not 
 * @param query - criteria query   
 */
const getCurrentUserModel = (isShared) => {
    if(isShared){
        return { 
            model: GuestUser,
            attributes: [ 'id', 'first_name', 'last_name', 'email'],
            as: "guest_user"
        }
    }else{
        return { 
            model: Users,
            attributes: [ 'id', 'first_name', 'last_name', 'email'],
            as: "user"
        }       
    }
}

/**
 * Get file folder data 
 * @param query - criteria query   
 */
const getFileFolderDataByQuery = async(query) => {

    let model = getCurrentUserModel(query.is_guest);

    [err, FileData] = await to(
        Files_Folders_Access.findAll({
            where: query,
            include: [
                model,
                {
                    model: File_Properties,
                    attributes: ['size', 'path', 'iconpath', 'mimetype', 'extension_type', 'tag', 'description', 'width', 'height', 'quality', 'aspect_ratio']
                }
            ],
            order: [
                ['refrence_id', 'ASC']
            ]
        }));
    return [err, FileData];
}

/**
 * Get created by user from folder id 
 * @param query - criteria query   
 */
const getCreatedByUserFromFolderId = async(query) => {
    [err, FileData] = await to(
        Files_Folders.findAll({
            where: query,
            include: [{
                model: Users,
                attributes: ['first_name', 'last_name', 'email']
            }]
        }));
    return [err, FileData];
}

/**
 * Get shared file folder data
 * @param query - criteria query   
 */
const getSharedFileFolder = async(query) => {
    let [err, FileData] = await to(
        Share_Files_Folders.findAll({
            where: query,
            include: [
                {
                    model: Files_Folders_Access,
                    include: [
                        {
                            model: Users,
                            attribute: ['id', 'first_name', 'last_name', 'email'],
                            as: 'user',
                        },
                        {
                            model: GuestUser,
                            attribute: ['id', 'first_name', 'last_name', 'email'],
                            as: 'guest_user'
                        }, 
                        {
                            model: File_Properties,
                            attributes: ['size', 'path', 'iconpath', 'mimetype', 'extension_type', 'tag', 'description', 'width', 'height', 'quality', 'aspect_ratio']
                        },
                         {
                            model: Users,
                            attribute: ['id', 'first_name', 'last_name', 'email'],
                            as: 'owner'
                         }
                    ]
                },

            ]
        })
    );
    
    if (FileData) {
        for (let i = 0; i < FileData.length; i++) {
            let permission = FileData[i].dataValues.permission;
            FileData[i] = FileData[i].dataValues.files_folders_access;
            FileData[i].permission = permission;
        }
    }
    return [err, FileData];
}

/**
 * Update file and folder data using query
 * @param updateData - data to be updated
 * @param query - query to be executed 
 */
const updateFileFolderDataByQuery = async(updateData, query) => {
    return [err, data] = await to(Files_Folders_Access.update(updateData, { where: query }));
}

/**
 * Get file object with all details i.e user and properties
 * @param fileId - file id 
 */
const getFileByIdWithUser = async(fileId) => {
    let [err, file] = await to(Files_Folders_Access.findAll({
        where: {
            id: fileId
        },
        include: [{
                model: Users,
                attributes: ['first_name', 'last_name', 'email'],
                as: 'user'
            },
            {
                model: File_Properties,
                attributes: ['size', 'path', 'iconpath', 'mimetype', 'extension_type', 'tag', 'description', 'width', 'height', 'quality', 'aspect_ratio']
            }
        ],
        order: [
            ['refrence_id', 'ASC']
        ]
    }));
    if (!err) {
        return file[0];
    }
}

/**
 * Get folder of through child's parent folder id
 * @param parentId - parent id of file 
 */
const getFolderByParentIdWithUser = async(parentId, isGuestUser) => {
    let model = getCurrentUserModel(isGuestUser);

    [err, folders] = await to(
        Files_Folders_Access.findAll({
            where: {
                parent_id: parentId,
                entity_type: 'FOLDER',
                is_guest: isGuestUser
            },
            include: [
                model
            ]
        }));

    if (!err) {
        return folders;
    }
}

/**
 * Update id as reference id
 * @param fileId - file id
 * @param refrenceId - reference id of parent  
 */
const updateIDAsRefrenceId = async(fileId, refrenceId) => {
    return await to(Files_Folders_Access.update({
        refrence_id: refrenceId
    }, {
        where: { id: fileId }
    }));
}

// const replaceString = (mainString, replaceFrom, replaceBy) => {
//     RegExp.quote = function (str) { return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"); };
//     new RegExp(RegExp.quote("root_2"), "g");
//     return mainString.replace(replaceFrom, replaceBy);
// }

/**
 * Checking the file name duplicacy of a file within folder
 * @param fileData - data of file
 * @param shiftedFolder - shifted folder
 * @param callback - callback function 
 */
const checkFileNameDuplicacy = async(fileData, shiftedFolder, callback) => {
    let extension = path.extname(fileData.dataValues.name);
    let fileName = path.parse(fileData.dataValues.name).name;

    const isFileExistByMasterName = await checkFileNameExistByMasterName({ name: fileData.dataValues.name }, parseInt(shiftedFolder.dataValues.id));
    let isFileExist = {};
    isFileExist.count = 0;
    const isFileNameAlreadyExistByName = await checkFileNameExistByName({ name: fileData.dataValues.name }, parseInt(shiftedFolder.dataValues.id));

    if (isFileExistByMasterName) {
        isFileExist = isFileExistByMasterName;
        isFileExist.name = `${fileName}(${++isFileExistByMasterName.count})${extension}`;
    } else if (isFileNameAlreadyExistByName) {
        isFileExist = isFileNameAlreadyExistByName;
        isFileExist.count = 0;
        isFileExist.name = `${fileName}(${++isFileExist.count})${extension}`;
        isFileExist.master_name = `${fileName}${extension}`;
    } else {
        isFileExist = fileData.dataValues;
    }
    callback(null, isFileExist);
}

/**
 * Resized the large image based on the parameters
 * @param dimesionOfFile - Dimension of file
 * @param filePropertyObject - file property object with details
 * @param user - user object who uploaded file
 * @param saveThumbnailOfImageInstance - save thumbnail of image instance 
 * @param callback - callback function
 */
const resizedLargeImage = async(dimesionOfFile, filePropertyObject, user, saveThumbnailOfImageInstance, callback) => {
    if (dimesionOfFile && (dimesionOfFile.width > S3_MEDIA.widthLimit || dimesionOfFile.height > S3_MEDIA.heightLimit)) {
        let w = dimesionOfFile.width;
        let h = dimesionOfFile.height;
        let aspectRatio = (w / h).toFixed(2);
        if (w > S3_MEDIA.widthLimit) {
            w = S3_MEDIA.widthLimit;
            h = w / aspectRatio;
        } else if (h > S3_MEDIA.heightLimit) {
            h = S3_MEDIA.heightLimit;
            w = h * aspectRatio;
        }
        saveThumbnailOfImageInstance(filePropertyObject, user.email + '/', w, h, 60, S3_MEDIA.largeFileName, (error, response) => {
            callback(error, response);
        });
    } else {
        callback(null, true);
    }
}

/**
 * Remove the large image from aws bucket
 * @param fileObject - file object to be deleted
 * @param deleteImageInstance - delete image instance 
 */
const removeLargeImage = async(fileObject, deleteImageInstance) => {
    if (fileObject && (fileObject.width > S3_MEDIA.widthLimit || fileObject.height > S3_MEDIA.heightLimit)) {
        const largePath = fileObject.path.replace('/', '/' + S3_MEDIA.largeFileName);
        let deleteFileFromAws = await deleteImageInstance(largePath);
        return deleteFileFromAws;
    }
    return;
}

/**
 * Get guest user's shared file folder details  
 * @param shareUser guest user object
 */
const getShareFileFolderDetail = async(user) => {
    query = {
        $or: [
            { user_type: 'CONTACT' },
            { user_type: 'SHARE_GUEST' }
        ],
        user_id: user.id
    };

    let [err, shareFileFolderData] = await to(
        Share_Files_Folders.findAll({
            where: query,
            include: [{
                    attributes: ['id', 'first_name', 'last_name'],
                    model: Users,
                    as: "owner"
                },
                {
                    model: Files_Folders_Access,
                    include: [{
                        model: File_Properties,
                        attributes: ['size', 'path', 'iconpath', 'mimetype', 'extension_type', 'tag', 'description', 'width', 'height', 'quality', 'aspect_ratio']
                    }]
                }
            ]
        }).map(el => el.get({
            plain: true
        }))
    );

    if (err) {
        return [err, null];
    }

    let totalSize = 0,
        usedSpaceUnit = 'KB',
        count = 1;

    if (shareFileFolderData) {
        await asyncForEach(shareFileFolderData, async shareFileFolder => {
            if (shareFileFolder.files_folders_access) {
                if (shareFileFolder.files_folders_access.entity_type == "FOLDER") {
                    const data = await getFilesOfFolder(shareFileFolder.file_folder_id);
                    if (data) {
                        count = 0;
                        data.forEach((fileProperty) => {
                            let fileSize = parseInt(fileProperty.data.sizeInBytes);
                            totalSize = totalSize + fileSize;
                            count++;
                        })
                    }
                } else {
                    let fileSize = parseInt(shareFileFolder.files_folders_access.file_property.size)
                    totalSize = totalSize + fileSize;
                }
            }
        });
    }

    if (totalSize >= 0) {
        if (totalSize >= oneGBToBytes) {
            totalSize = await formatBytesInGB(totalSize);
            usedSpaceUnit = 'GB';
        } else if (totalSize >= oneMbToBytes) {
            totalSize = await formatBytesInMB(totalSize);
            usedSpaceUnit = 'MB';
        } else if (totalSize >= oneKbToBytes) {
            totalSize = await formatBytesInKB(totalSize);
            usedSpaceUnit = 'KB';
        }
    }

    return {
        shareFileFolderData: shareFileFolderData,
        size: count + " file " + totalSize + " " + usedSpaceUnit + " in total"
    };
}

/**
 * Calculates size of file from bits
 * @param shareFileFolderData file/folder object
 */
const calculateSizeFromBits = async(shareFileFolderData) => {

    let totalSize = 0,
        count = 1;
    if (shareFileFolderData) {
        if (shareFileFolderData.entity_type == "FOLDER") {
            const data = await getFilesOfFolder(shareFileFolderData.file_folder_id);
            if (data) {
                count = 0;
                data.forEach((fileProperty) => {
                    let fileSize = parseInt(fileProperty.data.sizeInBytes);
                    totalSize = totalSize + fileSize;
                    count++;
                })
            }
        } else {
            let fileSize = parseInt(shareFileFolderData.file_property.size)
            totalSize = totalSize + fileSize;
        }
    }

    let usedSpaceUnit = 'KB';
    if (totalSize >= 0) {
        if (totalSize >= oneGBToBytes) {
            totalSize = await formatBytesInGB(totalSize);
            usedSpaceUnit = 'GB';
        } else if (totalSize >= oneMbToBytes) {
            totalSize = await formatBytesInMB(totalSize);
            usedSpaceUnit = 'MB';
        } else if (totalSize >= oneKbToBytes) {
            totalSize = await formatBytesInKB(totalSize);
            usedSpaceUnit = 'KB';
        }
    }
    return count + " file " + totalSize + " " + usedSpaceUnit + " in total";
}

/**
 * Resend registration mail to guest user (with file and user detail)
 * @param shareUser guest user object
 * @param shareData shared data object
 * @param originUrl the url of origin 
 */
const resendRegistrationLink = async(shareUser, shareData, originUrl) => {

    let fileFolderData = shareData.shareFileFolderData[0];

    var mailOptions = {
        to: shareUser.email,
        from: 'no-reply@ripplecrm.com',
        subject: "Successfully Registered on Ripple",
        html: 'Email Notification (using email signature)\n\n <br><br>' +
            fileFolderData.owner.first_name + ' ' + fileFolderData.owner.last_name + ' has granted you ' + fileFolderData.files_folders_access.permission + ' permission to view ' +
            '<b>' + fileFolderData.files_folders_access.entity_type + ": " + fileFolderData.files_folders_access.name + '<br>' +
            'Size:' + shareData.size + '<br></b>' +
            '<br><br> Please click on the below link, and complete the process:<br><br>' +
            '<a style="' + STYLE.MAIL_BUTTON_STYLE + '" href="' + originUrl + '/shared-link/login/' + shareUser.email_verification_token + '">Confirm email and login to view files</a>' + '\n\n'
    };

    smtpTransport.sendMail(mailOptions, function(err, res) {
        if (err) {
            console.log(err)
        } else {
            console.log(res)
        }
    });
}

/**
 * Send success mail to guest user after first login (with file and user detail)
 * @param shareUser guest user object
 * @param shareData shared data object
 * @param originUrl the url of origin 
 */
const successRegistrationLink = async(shareUser, shareData, originUrl) => {

    let fileFolderData = shareData.shareFileFolderData[0];

    var mailOptions = {
        to: shareUser.email,
        from: 'no-reply@ripplecrm.com',
        subject: "Welcome on Ripple",
        html: 'Email Notification (using email signature)\n\n <br><br>' +
            fileFolderData.owner.first_name + ' ' + fileFolderData.owner.last_name + ' has granted you ' + fileFolderData.files_folders_access.permission + ' permission to view ' +
            '<b>' + fileFolderData.files_folders_access.entity_type + ": " + fileFolderData.files_folders_access.name + '<br>' +
            'Size:' + shareData.size + '<br></b>' +
            '<br><br> Please click on the below link, and complete the process:<br><br>' +
            '<a style="' + STYLE.MAIL_BUTTON_STYLE + '" href="' + originUrl + '/shared-link/login">Login to access files</a>'
    };

    smtpTransport.sendMail(mailOptions, function(err, res) {
        if (err) {
            console.log(err)
        } else {
            console.log(res)
        }
    });
}

/**
 * Remove and add associated contacts
 * @param object data to be updated and removed 
 */
const updateAssociateContacts = async (object) => {

    let deletedContactIds = object.deleted_contacts;
    let contactIds = object.selected_contacts;
    let fileId = object.entity_file_id;

    if(deletedContactIds.length){
        let [err, contactEntityObj] = await to(ContactEntityFile.destroy({
                where: {
                    contact_id: deletedContactIds,
                    entity_file_id: fileId
                }
            })
        );
    }
    
    await asyncForEach(object.selected_contacts, async contactId => {
        let insertedData = {
            contact_id: contactId,
            entity_file_id: fileId
        };
        let [err, contactEntityObj] = await to(ContactEntityFile.findOrCreate({
                where: insertedData,
                defaults: insertedData
            }).spread(async(detailedObj, created) => {

            })
        );
        if (err) {
            return [err, null];
        }
    });

    return;
}

const mediaCommonFunction = {
    saveFolderIntoDb,
    checkFileNameExistByMasterName,
    checkFileNameExistByName,
    checkFolderNameExistByMasterName,
    checkFolderNameExistByName,
    getChildOfFolder,
    getChildOfFolderReplica,
    getShareFileFolderDetail,
    resendRegistrationLink,
    updateAssociateContacts,
    // createFileObject,
    // saveFileIntoDb,
    // updateFilePath,
    updateCountForFiles,
    getFolderByParentIdWithUser,
    getFileWithUser,
    getFileByIdWithUser,
    updateIDAsRefrenceId,
    formatBytes,
    formatBytesInGB,
    formatBytesInMB,
    formatBytesInKB,
    // replaceString,
    checkFileNameDuplicacy,
    getFileFormatedData,
    resizedLargeImage,
    removeLargeImage,
    createFileFolderObject,
    createFilePropertyObject,
    createFile_Folder_Access_Object,
    saveFileFolder,
    saveFileProperties,
    saveFileFolderAccess,
    getFileFolderDataByQuery,
    updateFileFolderDataByQuery,
    getSharedFileFolder,
    calculateSizeFromBits,
    successRegistrationLink,
    isEntityFileAlreadyExist,
    saveEntityFile,
    getCreatedByUserFromFolderId,
    updateAssociateContacts,
    getCurrentUserModel,
    _getFileShares
}

/**
 * Encrypt the text using crypto
 * @param text - text to be encrypted  
 */
const encrypt = (text) => {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', new Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypt the encrypted text
 * @param text - text to be decrypted 
 */
const decrypt = (text) => {
    let textParts = text.split(':');
    let iv = new Buffer.from(textParts.shift(), 'hex');
    let encryptedText = new Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

/**
 * Create notification data
 * @param object - object to be notified
 * @param type - type of notification
 */
const insertNotification = async(object, notificationType) => {
    
    if (object && notificationType) {
        let startTime = object.start;
        let notificationDate = new Date(startTime);
        let targetTime = new Date(notificationDate.getTime() - object.reminder * 60000);
        notificationBody = {
            type: notificationType,
            target_time: targetTime,
            user_id: object.user_id,
            target_event_id: object.id
        };
        if (object.recipients_id) {
            notificationBody.recipients_id = object.recipients_id;
        }
        return [err, notification] = await to(Notification.create(notificationBody));
    } else {
        return ["Something went wrong", null];
    }
}

/**
 * Update the notification data
 * @param object - object to be notified
 * @param type - type of notification
 */
const updateNotification = async(object, notificationType) => {

    if (object && notificationType) {

        let [err, isNotificationAlreadyExist] = await to(
            Notification.findAll({
                where: {
                    user_id: object.user_id,
                    is_miss: 0,
                    target_event_id: object.id,
                    type: notificationType
                }
            })
        );

        if (err) {
            // return ReE(res, err, 422);
            return [err, null];
        }

        if (isNotificationAlreadyExist.length) {
            isNotificationAlreadyExist = isNotificationAlreadyExist[0]
            let startTime = object.start;
            let notificationDate = new Date(startTime);
            let targetTime = new Date(notificationDate.getTime() - object.reminder * 60000);
            object.target_time = targetTime;
            return [err, notification] = await to(isNotificationAlreadyExist.update(object));
        } else {
            return [err, notification] = await insertNotification(object, "CALL");
        }
    } else {
        return ["Something went wrong", null];
    }
}

module.exports = {
    mediaCommonFunction,
    encrypt,
    decrypt,
    todayDate,
    insertNotification,
    updateNotification
}