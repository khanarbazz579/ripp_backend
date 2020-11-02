const app = require('express')();
const uploadToAws = require('../../services/multerS3EntityMedia');
const uploadToS3 = require('../../services/multerS3Service');
const commonFunction = require('../../services/commonFunction');
const path = require('path');
const ContactEntityFiles = require('./../../models').contact_entity_files;
const EntityFiles = require('./../../models').entity_files;

app.use(uploadToAws.uploadEntityFilesToAws);

/**
* Upload entity files by calling the service function
* @param req request object
* @param res response object
*/
const uploadFiles = function (req, res) {

  uploadToAws.uploadEntityFilesToAws(req, res, async function (err, response) {

    let requestBody = req.body;
    const userData = req.user.dataValues;
    const fileExtension = path.extname(req.body.fileWithExtention);

    if (!err) {

      if (S3_MEDIA.allowed_image_file_extensions.indexOf(req.files[0].mimetype) > -1) { 

        uploadToAws.getDimensionOfImage(req.files[0].key, async (dimesionOfFile) => {
          const name = req.files[0] && req.files[0].additionalName.trim();

          let aspect_ratio = (dimesionOfFile.width / dimesionOfFile.height).toFixed(2);

          const entityFileObject = {
            name: name,
            created_by: userData.id,
            entity_type: requestBody.entity_type,
            entity_id: requestBody.entity_id,
            file_category_id: requestBody.selectedCategory,
            size: req.files[0]['size'],
            path: req.files[0].key,
            icon_path: 'icons/' + req.files[0].key,
            mimetype: req.files[0].mimetype, 
            extension_type: fileExtension,
            width: dimesionOfFile.width ? dimesionOfFile.width : 0, 
            height: dimesionOfFile.height ? dimesionOfFile.height: 0, 
            aspect_ratio: aspect_ratio ? aspect_ratio : 0, 
            quality: 100,
            created_at: requestBody.created_at
          }
          
          let [err, fileInstance] = await commonFunction.mediaCommonFunction.saveEntityFile(entityFileObject);

          if (err) {
            return ReE(res, err, 422);
          }

          commonFunction.mediaCommonFunction.resizedLargeImage(dimesionOfFile, fileInstance, userData, uploadToS3.saveThumbnailOfImage, (error, largeImage) => {
            if (error) {
              return res.json({ success: false, message: error });
            }
            const iconPath = `${S3_MEDIA.thumbnailUrl}entity-media/category_id_${entityFileObject.file_category_id}/`;
            uploadToS3.saveThumbnailOfImage(fileInstance, iconPath, 25, 25, 100, "", async (error, response) => {
              if (!error) {
                let copy_error = await copyFile(fileInstance.dataValues, requestBody.selectedFolderId);
                if(copy_error){
                  return res.json({ success: false, message: copy_error });  
                }else{
                  if(requestBody.selectedContact){
                    let contacts = JSON.parse(requestBody.selectedContact);
                    await asyncForEach(contacts, async id => {
                      let body = {
                        contact_id: id,
                        entity_file_id: fileInstance.dataValues.id 
                      };
                      let [err, data] = await to(ContactEntityFiles.create(body));
                    });
                  }
                  fileInstance.dataValues['uniqueFileTimestamp'] = req.body.uniqueFileTimestamp;
                  return res.json({ success: true, message: "File uploaded and copied successfully!", data: fileInstance.dataValues });
                }
              } else {
                return res.json({ success: false, message: "Something went wrong" });
              }
            });
          })

        })
      } else {

        const name = req.files[0] && req.files[0].additionalName.trim();

        const entityFileObject = {
          name: name,
          created_by: userData.id,
          entity_type: requestBody.entity_type,
          entity_id: requestBody.entity_id,
          file_category_id: requestBody.selectedCategory,
          size: req.files[0]['size'],
          path: req.files[0].key,
          icon_path: 'icons/' + req.files[0].key,
          mimetype: req.files[0].mimetype, 
          extension_type: fileExtension,
          width: 0, 
          height: 0, 
          aspect_ratio: 0, 
          quality: 100,
          count: req.files[0].updatedCount,
          created_at: requestBody.created_at 
        }

        let [err, fileInstance] = await commonFunction.mediaCommonFunction.saveEntityFile(entityFileObject);
        if (!err) {
          let copy_error = await copyFile(fileInstance.dataValues, requestBody.selectedFolderId);
          if(copy_error){
            return res.json({ success: false, message: copy_error });  
          }else{
            if(requestBody.selectedContact){
              let contacts = JSON.parse(requestBody.selectedContact);
              await asyncForEach(contacts, async id => {
                let body = {
                  contact_id: id,
                  entity_file_id: fileInstance.dataValues.id 
                };
                let [err, data] = await to(ContactEntityFiles.create(body));
              });
            }
            return res.json({ success: true, message: "File uploaded and copied successfully!", data: fileInstance.dataValues });
          }
        } else {
          return res.json({ success: false, message: "Something went wrong" });
        }
        return res.json({ success: true, message: "File uploaded successfully!", data: fileInstance.dataValues });
      }
    } else {
      res.json({ success: false, message: 'something weird happen', error: err, data: null });
    }
  });
} 
module.exports = uploadFiles;

/**
* Prepare the function for copy and check the duplicacy of file
* Call copy file function with different parameters
* @param originalFile file to be copied
* @param folderId folder id
*/
copyFile = async (originalFile, folderId) => {

  if (originalFile) {
    let filename = originalFile.name;
    const isFileExistByMasterName = await commonFunction.mediaCommonFunction.checkFileNameExistByMasterName(originalFile, folderId);
    let isFileExist = {};
    isFileExist.count = 0;
    if (isFileExistByMasterName) { 
      isFileExist = isFileExistByMasterName;
      filename = `${originalFile.name}(${++isFileExist.count})${originalFile.extension_type}`;
    } else {
      const isFileNameAlreadyExistByName = await commonFunction.mediaCommonFunction.checkFileNameExistByName(originalFile, folderId);
      if (isFileNameAlreadyExistByName) {
        isFileExist = isFileNameAlreadyExistByName;
        isFileExist.count = 0;
        filename = `${originalFile.name}(${++isFileExist.count})${originalFile.extension_type}`;
      }
    }

    [err, folder] = await commonFunction.mediaCommonFunction.getCreatedByUserFromFolderId({ id: folderId, entity_type: 'FOLDER' });

    if(err){
      return err;
    }

    if (!err && folder.length > 0) {
      folder = folder[0];

      Object.assign(originalFile, {
        name: filename,
        master_name: originalFile.name,
        user_id: originalFile.created_by,
        path: `${folder.user.email}/${Date.now()}-${originalFile.name}`,
        oldPath: originalFile.path,
        count: isFileExist.count,
      })

      const fileToCopy = await copyFileToAws(originalFile, folderId);

      if (fileToCopy) {
        const dimesionOfFile = {
          width: originalFile.width,
          height: originalFile.height
        }
        if (S3_MEDIA.allowed_image_file_extensions.indexOf(originalFile.mimetype) > -1) {
          commonFunction.mediaCommonFunction.resizedLargeImage(dimesionOfFile, originalFile, folder.user, uploadToAws.saveThumbnailOfImage, (error, largeImage) => {
            if (error) {
              return error;
            }
            const iconPath = `icons/${folder.user.email}/`;
            uploadToS3.saveThumbnailOfImage(originalFile, iconPath, 25, 25, 100, "", async (error, response) => {
              if (!error) {
                return null;
              }
            });
          });
        } else {
          return null;
        }
      } else {
        return 'Something went wrong';
      }
    }
  } else {
    return 'Invalid Source File.';
  }
}

/**
* Copy file to aws by calling multers3 function
* Save the return data to different tables
* @param fileToCopy file to be copied
* @param folderId folder id
*/
const copyFileToAws = async (fileToCopy, folderId) => {
  let copyFileToAws = await uploadToS3.copyFileToAws(fileToCopy);
  if (copyFileToAws) {
    const fileObject = commonFunction.mediaCommonFunction.createFileFolderObject(fileToCopy.name, fileToCopy.created_by, 'FILE');
    const filePropertyObject = commonFunction.mediaCommonFunction.createFilePropertyObject(0, fileToCopy.size, fileToCopy.path, fileToCopy.path, fileToCopy.mimetype, fileToCopy.extension_type, null, null, fileToCopy.width, fileToCopy.height, fileToCopy.aspect_ratio, fileToCopy.quality);
    const fileFolderAccess = commonFunction.mediaCommonFunction.createFile_Folder_Access_Object(0, fileToCopy.created_by, 'EDIT', fileToCopy.name, 'FILE', folderId, fileToCopy.master_name, fileToCopy.count);
    // add data on files_folders table
    const fileInstance = await commonFunction.mediaCommonFunction.saveFileFolder(fileObject);
    // add file property into file_properties table
    filePropertyObject.file_id = fileInstance.dataValues.id;
    const filePropertyInstance = await commonFunction.mediaCommonFunction.saveFileProperties(filePropertyObject);
    // add data on files_folders_accesses table
    fileFolderAccess.file_folder_id = fileInstance.dataValues.id;
    fileFolderAccess.file_property_id = filePropertyInstance.dataValues.id;
    let saveFile = await commonFunction.mediaCommonFunction.saveFileFolderAccess(fileFolderAccess);
    await commonFunction.mediaCommonFunction.updateCountForFiles(fileToCopy.master_name, fileToCopy.folder_id, fileToCopy.count);
    return saveFile;
  } else {
    return false;
  }
}  

