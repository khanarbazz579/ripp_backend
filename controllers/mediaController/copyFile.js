const app = require('express')();
const path = require('path');

// const Files = require('../../models').files;
// const Folders = require('../../models').folders;
const uploadToAws = require('../../services/multerS3Service');
const commonFunction = require('../../services/commonFunction').mediaCommonFunction;

app.use(uploadToAws.copyFileToAws);

copyFile = async (req, res) => {
  const { dataValues: user } = req.user;

  const copyFileData = req.body;
  copyFileData.name = copyFileData.name.trim();
  // check original file exist
  let originalFile = await commonFunction.getFileByIdWithUser(copyFileData.copyFileId);
  if (originalFile) {
    originalFile = originalFile.dataValues;
    const extension = path.extname(originalFile.name);
    copyFileData.extensionName = `${copyFileData.name}${extension}`;
    const isFileExistByMasterName = await commonFunction.checkFileNameExistByMasterName(copyFileData, copyFileData.folderId);
    let isFileExist = {};
    isFileExist.count = 0;
    if (isFileExistByMasterName) { // find by master_name
      // change name
      isFileExist = isFileExistByMasterName;
      copyFileData.extensionName = `${copyFileData.name}(${++isFileExist.count})${extension}`;
    } else {
      const isFileNameAlreadyExistByName = await commonFunction.checkFileNameExistByName(copyFileData, copyFileData.folderId);
      if (isFileNameAlreadyExistByName) {
        isFileExist = isFileNameAlreadyExistByName;
        isFileExist.count = 0;
        copyFileData.extensionName = `${copyFileData.name}(${++isFileExist.count})${extension}`;
        // get count from
        isFileExist.master_name = `${copyFileData.name}${extension}`;
      }
    }

    [err, folder] = await commonFunction.getFileFolderDataByQuery({ parent_id: null, user_id: user.id, entity_type: 'FOLDER' });

    if (!err && folder.length > 0) {
      folder = folder[0];
      const { master_name: folderPath } = folder.dataValues;
      Object.assign(originalFile, {
        name: copyFileData.extensionName,
        description: copyFileData.description,
        tag: copyFileData.tag,
        user_id: user.id,
        path: `${folderPath}/${Date.now()}-${copyFileData.extensionName}`,
        oldPath: originalFile.file_property.dataValues.path,
        count: isFileExist.count,
        master_name: (isFileExist.master_name) ? isFileExist.master_name : copyFileData.extensionName,
        description: req.body.description,
        tag: req.body.tag
      })

      const fileToCopy = await copyFileToAws(originalFile);
      if (fileToCopy) {
        // width and height is greater then
        // console.log('----fileToCopy--72---', fileToCopy.dataValues);
        const dimesionOfFile = {
          width: fileToCopy.dataValues.file_property.dataValues.width,
          height: fileToCopy.dataValues.file_property.dataValues.height
        }
        // console.log('----originalFile.file_property.dataValues.type----', originalFile.file_property.dataValues.mimetype, S3_MEDIA.allowed_image_file_extensions);
        if (S3_MEDIA.allowed_image_file_extensions.indexOf(originalFile.file_property.dataValues.mimetype) > -1) {
          // console.log('----------copy-1---------');
          commonFunction.resizedLargeImage(dimesionOfFile, fileToCopy.dataValues.file_property.dataValues, user, uploadToAws.saveThumbnailOfImage, (error, largeImage) => {
            // console.log('----------copy-2---------', largeImage);
            if (error) {
              console.log('ERROR:------commonFunction.resizedLargeImage----')
            }

            // console.log('----------copy-3---------');
            const iconPath = `${S3_MEDIA.thumbnailUrl}${user.email}/`;
            uploadToAws.saveThumbnailOfImage(fileToCopy.dataValues.file_property.dataValues, iconPath, 25, 25, 100, "", async (error, response) => {
              // console.log('----------copy-4---------');
              if (!error) {
                return ReS(res, { data: fileToCopy, message: 'File copied successfully.' }, 201);
              }
            });

          });
        } else {
          return ReS(res, { data: fileToCopy, message: 'File copied successfully.' }, 201);
        }

      } else {
        return res.json({ success: false, message: 'Something went wrong' });
      }
    }
  } else {
    return res.json({ success: false, message: 'Invalid Source File.' });
  }
}

const copyFileToAws = async (fileToCopy) => {
  let copyFileToAws = await uploadToAws.copyFileToAws(fileToCopy);
  if (copyFileToAws) {
    const fileObject = commonFunction.createFileFolderObject(fileToCopy.name, fileToCopy.user_id, 'FILE');

    const filePropertyObject = commonFunction.createFilePropertyObject(0, fileToCopy.file_property.dataValues['size'], fileToCopy.path, fileToCopy.path, fileToCopy.file_property.dataValues.mimetype, fileToCopy.file_property.dataValues.extension_type, fileToCopy.tag, fileToCopy.description, fileToCopy.file_property.dataValues.width, fileToCopy.file_property.dataValues.height, fileToCopy.file_property.dataValues.aspect_ratio, fileToCopy.file_property.dataValues.quality);

    const fileFolderAccess = commonFunction.createFile_Folder_Access_Object(0, fileToCopy.user_id, 'EDIT', fileToCopy.name, 'FILE', fileToCopy.parent_id, fileToCopy.master_name, fileToCopy.count);

    // add data on files_folders table
    const fileInstance = await commonFunction.saveFileFolder(fileObject);
    // add file property into file_properties table
    filePropertyObject.file_id = fileInstance.dataValues.id;
    const filePropertyInstance = await commonFunction.saveFileProperties(filePropertyObject);
    // add data on files_folders_accesses table
    fileFolderAccess.file_folder_id = fileInstance.dataValues.id;
    fileFolderAccess.file_property_id = filePropertyInstance.dataValues.id;
    let saveFile = await commonFunction.saveFileFolderAccess(fileFolderAccess);
    await commonFunction.updateCountForFiles(fileToCopy.master_name, fileToCopy.folder_id, fileToCopy.count);
    return saveFile;
  } else {
    return false;
  }
}

module.exports = copyFile;
