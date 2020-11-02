const Files_Folders_Access = require('../models').files_folders_accesses;
const uploadToAws = require('./multerS3Service');
const commonFunction = require('../services/commonFunction').mediaCommonFunction;

const createRootFolderForUser = async (rootFolderName, userId, is_guest = 0) => {
  if (!rootFolderName || !userId) {
    return { success: false, message: 'Invalid data' }
  }

  [err, checkDuplicate] = await to(
    Files_Folders_Access.findOne(
      {
        where: { name: rootFolderName, parent_id: null }
      }
    ));
  // console.log('-------checkDuplicate-------', checkDuplicate, !checkDuplicate);
  if (!checkDuplicate) {
    console.log("------rootFolderName--------------",rootFolderName,userId, is_guest);
    
        const folderObject = commonFunction.createFileFolderObject(rootFolderName, userId, 'FOLDER',is_guest);
    // console.log('-------folderObject-------', folderObject);
    const fileFolderAccess = commonFunction.createFile_Folder_Access_Object(0, userId, 'EDIT', rootFolderName, 'FOLDER', null, rootFolderName, 0,is_guest);
    // console.log('-------fileFolderAccess-------', fileFolderAccess);
    const folderInstance = await commonFunction.saveFileFolder(folderObject);
    // console.log('-------folderInstance11-------', folderInstance);
    fileFolderAccess.file_folder_id = folderInstance.dataValues.id;
    // console.log("------fileFolderAccess--------------",fileFolderAccess);
    // console.log("------folderInstance--------------",folderInstance);
    // console.log('-------fileFolderAccess-------', fileFolderAccess);
    const saveFolder = await commonFunction.saveFileFolderAccess(fileFolderAccess);
    // console.log('-------saveFolder-------', saveFolder);
    // return { success: true, data: saveFolder, message: 'Folder added successfully.' };
    return { success: true, message: 'folder created.' }

  } else {
    // send error same name already exist
    return { success: false, message: 'folder already exist.' }
  }
}

rootFolderAws = {
  createRootFolderForUser
}



module.exports = rootFolderAws;