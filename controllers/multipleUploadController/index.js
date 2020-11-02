'use strict';
const {
    uploadCSV,
    uploadCorrectedCSV
} = require('./uploadCSV');
const {
    deleteCSV
} = require('./deleteCSV');
const {
    checkRecordswithError
} = require('./checkRecordswithError');
const {
    downloadErrorCSV,
    downloadDuplicateRecordCSV,
    downloadOriginalCSV
} = require('./downloadCSV');
const {
    getErrorListJson
} = require('./getErrorListJson');
const {
    updateErrorRecord
} = require('./updateErrorRecord');
const {
    checkPossibleDupplicates
} = require('./checkPossibleDupplicates');
const {
    uploadRecordToDB
} = require('./multipleUpload');
const {
    saveCurrentStage
} = require('./saveCurrentStage');

const { getSavedImports } = require('./getSavedImports');

const { deleteSavedImport } = require('./deleteSavedImport');

const { downloadZipFile } = require('./downloadZipFile');


module.exports = {
    uploadCSV,
    uploadCorrectedCSV,
    deleteCSV,
    checkRecordswithError,
    downloadErrorCSV,
    getErrorListJson,
    updateErrorRecord,
    checkPossibleDupplicates,
    downloadDuplicateRecordCSV,
    uploadRecordToDB,
    saveCurrentStage,
    getSavedImports,
    downloadOriginalCSV,
    deleteSavedImport,
    downloadZipFile
};