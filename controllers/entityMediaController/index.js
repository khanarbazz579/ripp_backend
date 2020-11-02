const uploadFiles = require('./uploadEntityFiles');
const getEntityFilesData = require('./getEntityMedia');
const updateAssociateContact = require('./updateAssociateContact');
const getImagePreview = require('./getImagePreview');
const removeFile = require('./removeFile');
const updateFile = require('./updateFile');
const getFileBlob = require('./getEntityFileBlob');
const sharePreparingZip = require('./sharePreparingZip').preparingZip;
const downloadZip = require('./sharePreparingZip').downloadExistingZippedFile;

module.exports = {
    upload: uploadFiles,
    update: updateFile,
    getAll: getEntityFilesData,
    updateAssociateContact: updateAssociateContact,
    getImagePreview: getImagePreview,
    remove: removeFile,
    getFileBlob: getFileBlob,
    sharePreparingZip: sharePreparingZip,
    downloadZip: downloadZip
}
