const app = require('express')();
const uploadToAws = require('../../services/multerS3Service');
const commonFunction = require('../../services/commonFunction');
const path = require('path');


app.use(uploadToAws.uploadFilesToAws);
const uploadFiles = function (req, res) {

  try {
    uploadToAws.uploadFilesToAws(req, res, async function (err, response) {
      // console.log('--uploadFilesToAws-err----', err);
      const userData = req.user.dataValues;
      let fileExtension = null;
      if(req.body){
        fileExtension = path.extname(req.body.fileWithExtention);   
      }
      if (!err) {
        if (S3_MEDIA.allowed_image_file_extensions.indexOf(req.files[0].mimetype) > -1) { // handles image type data
          // console.log('-----------------file-----image---------------------');
          // getDimensionOfImage
          uploadToAws.getDimensionOfImage(req.files[0].key, async (dimesionOfFile) => {
            const name = req.files[0] && req.files[0].addtionalName.trim();
            let aspect_ratio = (dimesionOfFile.width / dimesionOfFile.height).toFixed(2);

            const fileObject = commonFunction.mediaCommonFunction.createFileFolderObject(name, userData.id, 'FILE', req.user.is_guest);

            const filePropertyObject = commonFunction.mediaCommonFunction.createFilePropertyObject(0, req.files[0]['size'], req.files[0].key, 'icons/' + req.files[0].key, req.files[0].mimetype,fileExtension, req.body.tag, req.body.description, dimesionOfFile.width, dimesionOfFile.height, aspect_ratio, 100);

            const fileFolderAccess = commonFunction.mediaCommonFunction.createFile_Folder_Access_Object(0, userData.id, 'EDIT', name, 'FILE', req.body.selectedFolderId, `${req.files[0].originalname}${fileExtension}`, req.files[0].updatedCount, req.user.is_guest);


            // add data on files_folders table
            const fileInstance = await commonFunction.mediaCommonFunction.saveFileFolder(fileObject);
            // console.log('--------------fileInstance---------', fileInstance);
            // add file property into file_properties table
            filePropertyObject.file_id = fileInstance.dataValues.id;
            const filePropertyInstance = await commonFunction.mediaCommonFunction.saveFileProperties(filePropertyObject);
            // console.log('--------------fileInstance---------', filePropertyInstance);
            // add data on files_folders_accesses table
            fileFolderAccess.file_folder_id = fileInstance.dataValues.id;
            fileFolderAccess.file_property_id = filePropertyInstance.dataValues.id;
            let saveFile = await commonFunction.mediaCommonFunction.saveFileFolderAccess(fileFolderAccess);
            // saveFile = saveFile[0];
            // console.log('-----saveFile-----', saveFile);
            // width height check and create replica image
            const fileProperty = saveFile.dataValues.file_property.dataValues;
            commonFunction.mediaCommonFunction.resizedLargeImage(dimesionOfFile, fileProperty, userData, uploadToAws.saveThumbnailOfImage, (error, largeImage) => {
              if (error) {
                console.log('ERROR:------commonFunction.mediaCommonFunction.resizedLargeImage----', error)
              }
              const iconPath = `${S3_MEDIA.thumbnailUrl}${userData.email}/`;
              uploadToAws.saveThumbnailOfImage(fileProperty, iconPath, 25, 25, 100, "", async (error, response) => {
                if (!error) {
                  // await commonFunction.mediaCommonFunction.updateIDAsRefrenceId(saveFile.dataValues.id, saveFile.dataValues.id);

                  await commonFunction.mediaCommonFunction.updateCountForFiles(`${req.files[0].originalname}${fileExtension}`,
                    parseInt(req.body.selectedFolderId), req.files[0].updatedCount);

                  return res.json({ success: true, message: "File uploaded successfully!", data: saveFile.dataValues });
                } else {
                  return res.json({ success: false, message: "Something went wrong" });
                }
              });
            })
          })
        } else {
          const name = req.files[0] && req.files[0].addtionalName.trim();
          const fileObject = commonFunction.mediaCommonFunction.createFileFolderObject(name, userData.id, 'FILE', userData.is_guest);
          const filePropertyObject = commonFunction.mediaCommonFunction.createFilePropertyObject(0, req.files[0]['size'], req.files[0].key, 'icons/' + req.files[0].key, req.files[0].mimetype, fileExtension, req.body.tag, req.body.description);
          const fileFolderAccess = commonFunction.mediaCommonFunction.createFile_Folder_Access_Object(0, userData.id, 'EDIT', name, 'FILE', req.body.selectedFolderId, `${req.files[0].originalname}${fileExtension}`, req.files[0].updatedCount, userData.is_guest);

          // add data on files_folders table
          const fileInstance = await commonFunction.mediaCommonFunction.saveFileFolder(fileObject);

          // add file property into file_properties table
          filePropertyObject.file_id = fileInstance.dataValues.id;
          const filePropertyInstance = await commonFunction.mediaCommonFunction.saveFileProperties(filePropertyObject);

          // add data on files_folders_accesses table
          fileFolderAccess.file_folder_id = fileInstance.dataValues.id;
          fileFolderAccess.file_property_id = filePropertyInstance.dataValues.id;
          const saveFile = await commonFunction.mediaCommonFunction.saveFileFolderAccess(fileFolderAccess);

          return res.json({ success: true, message: "File uploaded successfully!", data: saveFile });
        }
      } else {
        res.json({ success: false, message: 'something weird happen', error: err, data: null });
      }
    });
  } catch (e) {
    console.log("Error: ", e);
  }
}

module.exports = uploadFiles;
