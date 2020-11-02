const AddFolder = require('./folder/addFolder');
const RenameFolder = require('./folder/renameFolder');
const DeleteFolder = require('./folder/deleteFolder');
const { getFolderData, getFolderById } = require('./folder/getFolderData');
const GetFolderTree = require('./folder/getFolderTree');
const GetChildOfFolder = require('./folder/getFolderChild');
const UploadFiles = require('./uploadFiles');
const DeleteFile = require('./deleteFile');
const {
    getFileInBlob,
    getFilePreviewInBlob,
    getfilepath
} = require('./getFiles');
const CopyFile = require('./copyFile');
const {
    shareDataUpdate,
    getSharedList,
    getSharedDataChilds
} = require('./shareData');
const {getSharedUsersList, getUsersList} = require('./getSharedUsersList');
const RemoveFromShared = require('./folder/removeFromShared');
const { updateFile, updateField, updateSharedFilePermission } = require('./updateFile');
const UploadFileFolder = require('./uploadFileFolder');
const {
    getStorageStatus,
    getSizeOfFolder
} = require('./storage/getStorage');
const searchFileByName = require('./searchMedia').searchFileByName;
const searchSharedFileByName = require('./searchMedia').searchSharedFileByName;

const shiftFileToFolder = require('./shiftFileToFolder');
const shiftFolderToFolder = require('./shiftFolderToFolder');
const shiftFileFromShared = require('./shiftFileFromShared');
const shiftFolderFromShared = require('./shiftFolderFromShared');
const { generateuniqueStamp,
    removeuniqueStamp } = require('./generateUniqueStamp');
const { preparingZip, downloadExistingZippedFile } = require('./preparingZip');

module.exports = {
    file: {
        upload: UploadFiles,
        edit: updateFile,
        editField: updateField,
        delete: DeleteFile,
        preview: getFilePreviewInBlob,
        file: getFileInBlob,
        copy: CopyFile,
        path: getfilepath,
        updateFilePermission:updateSharedFilePermission
    },
    folder: {
        upload: UploadFileFolder,
        add: AddFolder,
        edit: RenameFolder,
        delete: DeleteFolder,
        child: GetChildOfFolder,
        data: getFolderData,
        tree: GetFolderTree,
        size: getSizeOfFolder
    },
    share: {
        shareupdate: shareDataUpdate,
        sharedChilds: getSharedList,
        sharedList: getSharedDataChilds,
        sharedUsersList: getSharedUsersList,
        remove: RemoveFromShared,
        usersList: getUsersList,
        filterSharedFiles: searchSharedFileByName
    },
    move: {
        fileToFolder: shiftFileToFolder,
        folderToFolder: shiftFolderToFolder,
        fileFromShared: shiftFileFromShared,
        folderFromShared: shiftFolderFromShared
    },
    stamp: {
        generate: generateuniqueStamp,
        remove: removeuniqueStamp
    },
    storage: {
        status: getStorageStatus
    },
    filter: searchFileByName,
    zip: {
        create :preparingZip,
        downloadzip: downloadExistingZippedFile
    }
}
