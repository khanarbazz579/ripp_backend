const express = require('express'),
    router = express.Router(),
    { 	
    	share: { shareupdate, sharedChilds, sharedList, sharedUsersList, remove, usersList, filterSharedFiles },
    	zip: { create, downloadzip },
    	file: { file }, 
    	folder:{tree,child,data},
 		storage:{status},   
    } = require('./../../controllers/mediaController'),
    passport = require('passport');

const guestStrategy = require('../../middleware/guestUserPassport');
passport.use('guest-jwt', guestStrategy);
const convertBase64ToObject = require('../../middleware/ConvertBase64ToObject'); 

const downloadFileStrategy = require('../../middleware/downloadShareFileStrategyPassport');
passport.use('download-share-file-rule', downloadFileStrategy);
passport.authenticate('download-share-file-rule', { session: false })

router.get('/:childType', passport.authenticate('guest-jwt', { session: false }), sharedChilds);

router.put('/update', passport.authenticate('guest-jwt', { session: false }), shareupdate);

router.get('/childs/:folder_id/:childType', passport.authenticate('guest-jwt', { session: false }), sharedList);
router.get('/file/blob/:fileId/', passport.authenticate('download-share-file-rule', { session: false }), file);
router.put('/remove', passport.authenticate('guest-jwt', { session: false }), remove);
router.post('/sharePreparingZip', passport.authenticate('guest-jwt', { session: false }), create);
router.get('/file/download/zipped/:filename/', passport.authenticate('download-share-file-rule', { session: false }), downloadzip);
// router.post('/searchMedia', passport.authenticate('guest-jwt', { session: false }), filterSharedFiles);
router.get('/searchMedia:searchFileData',convertBase64ToObject.base64ToString,passport.authenticate('guest-jwt', { session: false }), filterSharedFiles);
router.get('/folders/data', passport.authenticate('guest-jwt', { session: false }),data);
router.get('/folders/tree', passport.authenticate('guest-jwt', { session: false }),tree); 
router.get('/storage', passport.authenticate('guest-jwt', { session: false }),status);
router.get('/folder/childs/:folder_id/:childType', passport.authenticate('guest-jwt', { session: false }),child);


module.exports = router;