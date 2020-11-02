const path = require('path');
const async = require('async');

// const Files = require('../../models').files;
// const Folders = require('../../models').folders;

const Files_Folders = require('../../models').files_folders;
const Files_Folders_Access = require('../../models').files_folders_accesses;
const File_Properties = require('../../models').file_properties;
const Shared_Files_Folders = require('../../models').share_files_folders;

const uploadToAws = require('../../services/multerS3Service');
const mediaCommonFunction = require('../../services/commonFunction').mediaCommonFunction;
const commonFunction = require('../../services/commonFunction');

const updateFile = async (req, res) => {

    let fileBodyData = req.body;
    let userData = req.user;
    let [error, file] = await commonFunction.mediaCommonFunction.getFileFolderDataByQuery({
        id: req.params.fileId
    });
    // console.log('------file------', file[0]);
    if (error || file.length === 0) {
        return res.json({ success: false, message: 'file doesn\'t exist', data: [] });
    }
    let fileProp = file[0].dataValues.file_property.dataValues;
    if (S3_MEDIA.allowed_image_file_extensions.indexOf(fileProp.mimetype) > -1) { // should be image
        let editedPath;
        let updatedId;
        let propertyId;

        // console.log("----------Inside fileBodyData-------------",fileBodyData)
        if (fileBodyData.saveAs) {
            
            // new file 
            const extension = path.extname(file[0].dataValues.name);
            
            let editedName = fileBodyData.newName; //fileBodyData.newName;
            let editedDescription = fileBodyData.description;
            
            newFileInfo = await checkAndgetFileName(editedName, extension, file[0].dataValues.parent_id);
            editedPath = `${userData.email}/${Date.now()}-${newFileInfo.name}`;

            //insert new record in db
            let fileWidth = (fileBodyData.width) ? fileBodyData.width : file[0].dataValues.file_property.dataValues.width;
            let fileHeight = (fileBodyData.height) ? fileBodyData.height : file[0].dataValues.file_property.dataValues.height;
            let aspectRatio = (fileWidth / fileHeight).toFixed(2);

            const fileObject = commonFunction.mediaCommonFunction.createFileFolderObject(newFileInfo.name, userData.id, 'FILE');
            const filePropertyObject = commonFunction.mediaCommonFunction.createFilePropertyObject(0, fileProp.size, editedPath, 'icons/' + editedPath, fileProp.mimetype, fileProp.extension_type, fileProp.tag, editedDescription, fileWidth, fileHeight, aspectRatio, 100);
            const fileFolderAccess = commonFunction.mediaCommonFunction.createFile_Folder_Access_Object(0, userData.id, 'EDIT',newFileInfo.name, 'FILE', file[0].dataValues.parent_id, newFileInfo.master_name, 0,req.user.is_guest);

            // add data on files_folders table
            const fileInstance = await commonFunction.mediaCommonFunction.saveFileFolder(fileObject);
            
            // add file property into file_properties table
            if(fileInstance.dataValues){
                 filePropertyObject.file_id = fileInstance.dataValues.id;     
            }
            const filePropertyInstance = await commonFunction.mediaCommonFunction.saveFileProperties(filePropertyObject);
            
            // add data on files_folders_accesses table
            fileFolderAccess.file_folder_id = fileInstance.dataValues.id;
            fileFolderAccess.file_property_id = filePropertyInstance.dataValues.id;
            let saveFile = await commonFunction.mediaCommonFunction.saveFileFolderAccess(fileFolderAccess);
            if(saveFile.dataValues){
                updatedId = saveFile.dataValues.id;
                propertyId = saveFile.dataValues.file_property_id;     
            }
            
            await mediaCommonFunction.updateCountForFiles(newFileInfo.master_name, parseInt(file[0].dataValues.parent_id), newFileInfo.count);

            commonFunction.mediaCommonFunction.resizedLargeImage({ width: fileWidth, height: fileHeight }, fileProp, userData, uploadToAws.saveThumbnailOfImage, (error, largeImage) => {
                if (error) {
                    return res.json({ success: false, message: 'Something went wrong', data: [] });
                }
            });

            let newfileProp = saveFile.dataValues.file_property.dataValues;
            
            editFileInAWS(updatedId, propertyId, userData, fileProp, editedPath, fileBodyData, newfileProp, (error, response) => {
                if (error) {
                    return res.json({ success: false, message: 'Something went wrong', data: [] });
                } else {
                    return res.json({ success: true, message: 'File updated successfully', data: response });
                }
            });
        } else {
            
            let fileWidth = (fileBodyData.width) ? fileBodyData.width : fileProp.width;
            let fileHeight = (fileBodyData.height) ? fileBodyData.height : fileProp.height;
            let aspectRatio = (fileWidth / fileHeight).toFixed(2);
            let description = fileBodyData.description ? fileBodyData.description : file[0].dataValues['description'];
            let newFileInfo = {
                name : fileBodyData.newName ? fileBodyData.newName : file[0].dataValues['name'],
                master_name : file[0].dataValues['master_name']
            }
            let oldValue = path.parse(file[0].dataValues['name']).name;
            let extension = path.extname(file[0].dataValues['name']);
            let parentId = file[0].dataValues.parent_id; 

            if(oldValue != newFileInfo.name){

                newFileInfo = await checkAndgetFileName(newFileInfo.name, extension, parentId);  
                let [error, fileUpdate] = await to(
                    Files_Folders_Access.update({ name: newFileInfo.name, master_name: newFileInfo.master_name }, {
                     where: { 
                            id: file[0].dataValues.id,
                            user_id: req.user.id,
                            is_guest: req.user.is_guest
                        }
                    })

                );  
                if (error) {
                    return res.json({ success: false, message: error, data: [] });
                }else{
                    updateAllSharedChilds({ 
                        name: newFileInfo.name, 
                        master_name: newFileInfo.master_name 
                    },{
                        refrence_id: file[0].dataValues.id
                    })
                } 
            }
            
            // for largesize image copy
            if (fileProp.width > S3_MEDIA.widthLimit || fileProp.height > S3_MEDIA.heightLimit) {
                if (!(fileWidth > S3_MEDIA.widthLimit && fileHeight > S3_MEDIA.heightLimit)) {
                    // check large image and delete
                    const deleteLargeImage = await commonFunction.mediaCommonFunction.removeLargeImage(fileProp, uploadToAws.deleteFileFromAws);

                    if (!deleteLargeImage) {
                        return res.json({ success: false, message: 'Something went wrong' });
                    }
                }
            } else {
                commonFunction.mediaCommonFunction.resizedLargeImage({ width: fileWidth, height: fileHeight }, fileProp, userData, uploadToAws.saveThumbnailOfImage, (error, largeImage) => {
                    if (error) {
                        return res.json({ success: false, message: 'Something went wrong' });
                    }
                });
            }

            propertyId = file[0].dataValues.file_property_id;
            // update old file in db
            [error, fileUpdate] = await to(
                File_Properties.update(
                    {   
                        master_name: newFileInfo.master_name,
                        description: description,
                        width: fileWidth,
                        height: fileHeight,
                        quality: (fileBodyData.quality) ? fileBodyData.quality : 100,
                        aspect_ratio: aspectRatio
                    }, {
                        where: { id: propertyId }
                    })
            );

            [error, fileUpdate] = await to(
                Files_Folders_Access.update({}, {
                    where: { file_property_id: propertyId }
                })
            );  
            updatedId = file[0].dataValues.id;

            editFileInAWS(updatedId, propertyId, userData, fileProp, editedPath, fileBodyData, fileProp, (error, response) => {
                if (error) {
                    return res.json({ success: false, message: 'Something went wrong', data: [] });
                } else {
                    return res.json({ success: true, message: 'File updated successfully', data: response });
                }
            });
        }

    } else {
        return res.json({ success: false, message: "somthing went wrong." });
    }
}

checkAndgetFileName = async (fileNameWithoutExt, extension, parentFolderId) => {
   
    fileName = `${fileNameWithoutExt}${extension}`;
    const isFileExistByMasterName = await mediaCommonFunction.checkFileNameExistByMasterName({ name: fileName }, parseInt(parentFolderId));
    
    let isFileExist = {};
    isFileExist.count = 0;
    const isFileNameAlreadyExistByName = await mediaCommonFunction.checkFileNameExistByName({ name: fileName }, parseInt(parentFolderId));

    if (isFileExistByMasterName) {
        isFileExist = isFileExistByMasterName;
        isFileExist.count = ++isFileExistByMasterName.count;
        isFileExist.name = `${fileNameWithoutExt}(${isFileExist.count})${extension}`;
    } else if (isFileNameAlreadyExistByName) {
        isFileExist = isFileNameAlreadyExistByName;
        isFileExist.count = 0;
        ++isFileExist.count;
        isFileExist.name = `${fileNameWithoutExt}(${isFileExist.count})${extension}`;
        isFileExist.master_name = `${fileNameWithoutExt}${extension}`;
    } else { // when new master_name
        isFileExist.name = `${fileNameWithoutExt}${extension}`;
        isFileExist.master_name = `${fileNameWithoutExt}${extension}`;
        isFileExist.count = 0;
    }
    return isFileExist;
}

const updateField = async (req, res) => {
    let userId = req.user.id;
    let fileId = req.params.fileId;
    let fieldType = req.body.fieldType;
    let newFieldValue = req.body.fieldValue;

    // get file by id
    let [error1, file] = await to(
        Files_Folders_Access.findByPk(fileId)
    );
    if (error1 || !file) {
        return res.json({ success: false, message: 'file doesn\'t exist', data: [] });
    }
    if (fieldType !== "name" && fieldType !== "description") {
        return res.json({ success: false, message: "field type should be name or description" });
    }

    // check field Type
    let oldValue = file.dataValues[fieldType];
    if (fieldType === "name" || fieldType === "both") {
        oldValue = path.parse(file.dataValues[fieldType]).name;
        
        if (newFieldValue !== oldValue) {
            newFileInfo = await checkAndgetFileName(newFieldValue, path.extname(file.dataValues[fieldType]), file.dataValues.parent_id);
            // update name fo file
            let [error, fileUpdate] = await to(
                Files_Folders_Access.update({ name: newFileInfo.name, master_name: newFileInfo.master_name }, {
                 where: { 
                        id: file.dataValues.id,
                    }
                })
            );
            if (error || !fileUpdate) {
                return res.json({ success: false, message: 'somthing went wrong', error });
            }
            await mediaCommonFunction.updateCountForFiles(newFileInfo.master_name, parseInt(file.dataValues.folder_id), newFileInfo.count);
        }
    } 

    if (fieldType === "description" || fieldType === "both") {
        // update file
        let [error, fileUpdate] = await to(
            File_Properties.update({ description: newFieldValue }, {
                where: { file_id: file.dataValues.file_folder_id }
            })
        );
        if (error || !fileUpdate) {
            return res.json({ success: false, message: 'somthing went wrong', error });
        }
    }

    // get file info
    let fileInfo = await commonFunction.mediaCommonFunction.getFileByIdWithUser(file.dataValues.id);
    let filedata = await commonFunction.mediaCommonFunction.getFileFormatedData(fileInfo) || {};

    return res.json({ success: true, message: 'updated', data: filedata.dataValues });
}


editFileInAWS = (updatedId, propertyId, userData, fileProp, editedPath, fileBodyData, newfileProp, callback) => {
    uploadToAws.editFileIntoAws(fileProp, editedPath, fileBodyData.width, fileBodyData.height, fileBodyData.quality, async (response) => {
        // updated size of edited file
        if (response) {
            [error, fileSizeUpdate] = await to(
                File_Properties.update(
                    {
                        size: response.ContentLength
                    }, {
                        where: { id: propertyId }
                    })
            );
            
            let file = await mediaCommonFunction.getFileByIdWithUser(updatedId);
            const iconPath = `${S3_MEDIA.thumbnailUrl}${userData.email}/`;
            // let newIconWidth = fileBodyData.width; 
            let iconwidth = fileBodyData.width * 5 / 100;
           
            const iconHeight = iconwidth * (fileBodyData.height / fileBodyData.width);

            uploadToAws.saveThumbnailOfImage(newfileProp, iconPath, iconwidth, iconHeight, 100, "", async (error, response) => {
                if (!error) {
                    callback(error, file);
                }
            });
        }
    });
}

updateAllSharedChilds = async(dataToBeUpdated,query) => {
    let updatedFileId = [];
    let [error, filesFoldersAccess] = await to(
        Files_Folders_Access.findAll({
            where: query
        })
    );
    if(error){
//        return res.json({ success: false, message: "somthing went wrong." });
    }

    for (let i = 0; i < filesFoldersAccess.length; i++) {           
        let fileObj = filesFoldersAccess[i];
        
        updatedFileId.push(fileObj.dataValues.id);

        [error, fileSizeUpdate] = await to(
            Files_Folders_Access.update({
                name:dataToBeUpdated.name,
                master_name:dataToBeUpdated.master_name
            },
            {
                where:query
            })     
        );    
    }

    if(updatedFileId.length){
        updateAllSharedChilds(dataToBeUpdated, {
            refrence_id:{ 
                $in: updatedFileId 
            }         
        })
    }
}

//The shared file permission is get updated in this method.
const updateSharedFilePermission = async(req,res)=>{
    let userId;
    let fileId;
    let userType;
    let isGuest;
    let shareId;
    // let [err, filesFoldersAccess] = await to(
    //     Files_Folders_Access.findAll({
    //          where: { refrence_id:req.params.fileId , user_id:req.body.fileData.data.id}
    //     })
    // );
    // if(err){
    //    // return res.json({ success: false, message: "somthing went wrong." });
    // }
    
    // if(filesFoldersAccess[0]){
    //     userId = filesFoldersAccess[0].user_id;
    //     fileFolderId = filesFoldersAccess[0].file_folder_id;
    // }
    
    userId = req.body.fileData.data.id;
    shareId = req.body.fileData.data.share_id
    fileId = req.params.fileId;
    userType = req.body.fileData.type;

    if(userType =='SHARE_GUEST'){
        isGuest = 1;
    }else{
        isGuest =0;
    }

         let  [error,updateSharedFileCount] = await to(
              Shared_Files_Folders.update({ permission: req.body.changedPermission }, {
                where: { file_folder_access_id:fileId, id:shareId , user_type:userType }
            }),
                Files_Folders_Access.update({ permission: req.body.changedPermission }, {
                where: { refrence_id:fileId,user_id:userId, is_guest:isGuest }
            })
           );   
    if(error){
       return res.json({ success: false, message: error });
    }
     return res.json({ success: true, message: 'updated', data:updateSharedFileCount }); 
}

module.exports = { updateFile,updateField,updateSharedFilePermission};
