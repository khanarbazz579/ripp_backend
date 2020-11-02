const express = require('express');
const router = express.Router();
const passport = require('passport');
const strategy = require('../../middleware/passport');
const convertStringToObject = require("../../middleware/ConvertBase64ToObject");

const {
    multerLeadCSVUpload
} = require('../../services/multipleLeadUpload.service');

const {
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
} = require('../../controllers/multipleUploadController');

passport.use(strategy);
const { can } = require('../../middleware/CheckAccessMiddleware');

router.post('/multipleUploadCsvFile', passport.authenticate('jwt', {
    session: false
}), can(['leads', 'add new leads', 'multiple lead add']), multerLeadCSVUpload, uploadCSV);

router.post('/uploadCorrectedCSV', passport.authenticate('jwt', {
    session: false
}), can(['leads', 'add new leads', 'multiple lead add']), multerLeadCSVUpload, uploadCorrectedCSV);

router.post('/deleteUploadedCSV', passport.authenticate('jwt', {
    session: false
}), can(['leads', 'add new leads', 'multiple lead add']), deleteCSV);


router.post('/checkRecordswithError/', passport.authenticate('jwt', {
    session: false
}), can(['leads', 'add new leads', 'multiple lead add']), checkRecordswithError);

router.get('/downloadErrorCSV/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', {
    session: false
}), can(['leads', 'add new leads', 'multiple lead add']), downloadErrorCSV);

router.get('/downloadOriginalCSV/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', {
    session: false
}), can(['leads', 'add new leads', 'multiple lead add']), downloadOriginalCSV);

router.get('/getErrorListJson/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', {
    session: false
}), can(['leads', 'add new leads', 'multiple lead add']), getErrorListJson);

router.post('/updateErrorRecord', passport.authenticate('jwt', {
    session: false
}), can(['leads', 'add new leads', 'multiple lead add']), updateErrorRecord);

router.get('/checkPossibleDuplicates/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', {
    session: false
}), can(['leads', 'add new leads', 'multiple lead add']), checkPossibleDupplicates);

router.post('/downloadDuplicateRecordCSV', passport.authenticate('jwt', {
    session: false
}), can(['leads', 'add new leads', 'multiple lead add']), downloadDuplicateRecordCSV);

router.post('/uploadRecordToDB', passport.authenticate('jwt', {
    session: false
}), can(['leads', 'add new leads', 'multiple lead add']), uploadRecordToDB);

router.post('/saveCurrentStage', passport.authenticate('jwt', {
    session: false
}), can(['leads', 'add new leads', 'multiple lead add']), saveCurrentStage);

router.get('/getSavedImports', passport.authenticate('jwt', {
    session: false
}), can(['leads', 'add new leads', 'multiple lead add']), getSavedImports);


router.post('/deleteSavedImport', passport.authenticate('jwt', {
    session: false
}), deleteSavedImport);

router.get('/downloadZipFile/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', {
    session: false
}), downloadZipFile);

module.exports = router;