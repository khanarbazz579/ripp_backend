
// module.exports = router;
const express = require('express');
const passport = require('passport');
const router = express.Router();
const strategy = require('./../../middleware/passport');
passport.use(strategy);
const mediaController = require('./../../controllers/mediaController')

const convertStringToObject = require("../../middleware/ConvertBase64ToObject");
const {can} = require('../../middleware/CheckAccessMiddleware');

// media routing
router.post('/files/upload', passport.authenticate('jwt', { session: false }), can(['media', 'upload files-folders','guest'	]), mediaController.file.upload);
router.delete('/file/:fileId', passport.authenticate('jwt', { session: false }), can(['media', 'delete files-folders','guest']), mediaController.file.delete);

router.put('/file/:fileId', passport.authenticate('jwt', { session: false }), can(['media', 'edit files-folders', 'copy files-folders','guest']), mediaController.file.edit);
router.put('/changeSharedFilePermission/:fileId', passport.authenticate('jwt', { session: false }), can(['media', 'edit files-folders', 'copy files-folders','guest']), mediaController.file.updateFilePermission);
router.put('/file/field/:fileId', passport.authenticate('jwt', { session: false }), can(['media', 'edit files-folders','guest']), mediaController.file.editField);
router.post('/file/copy', passport.authenticate('jwt', { session: false }), can(['media', 'copy files-folders','guest']), mediaController.file.copy);
router.get('/file/preview-blob/:fileId/', passport.authenticate('jwt', { session: false }), can(['media','guest']), mediaController.file.preview);
router.get('/file/blob/:fileId/', passport.authenticate('download-file-rule', { session: false }), can(['media']), mediaController.file.file);
router.get('/file/path/:fileId/', passport.authenticate('jwt', { session: false }), can(['media','guest']), mediaController.file.path);

router.get('/file/download/zipped/:filename/', passport.authenticate('download-file-rule', { session: false }), can(['media']), mediaController.zip.downloadzip);

router.post('/move/file/folder', passport.authenticate('jwt', { session: false }), can(['media', 'move files-folders', 'guest']), mediaController.move.fileToFolder);
router.post('/move/folder/folder', passport.authenticate('jwt', { session: false }), can(['media', 'move files-folders', 'guest']), mediaController.move.folderToFolder);


router.post('/folder', passport.authenticate('jwt', { session: false }), can(['media', 'upload files-folders','guest']), mediaController.folder.add);
router.put('/folder', passport.authenticate('jwt', { session: false }), can(['media', 'edit files-folders','guest']), mediaController.folder.edit);
router.delete('/folder/:folderId', passport.authenticate('jwt', { session: false }), can(['media', 'delete files-folders','guest']), mediaController.folder.delete);
router.post('/folders/upload', passport.authenticate('jwt', { session: false }), can(['media', 'upload files-folders','guest']), mediaController.folder.upload);

router.get('/folders/tree', passport.authenticate('jwt', { session: false }), can(['media','guest']), mediaController.folder.tree);
router.get('/folders/data', passport.authenticate('jwt', { session: false }), can(['media','guest']), mediaController.folder.data);
	
router.get('/folder/childs/:folder_id/:childType', passport.authenticate('jwt', { session: false }), can(['media','guest']), mediaController.folder.child);


router.get('/storage', passport.authenticate('jwt', { session: false }), can(['media','guest']), mediaController.storage.status);
router.get('/folder/size/:id', passport.authenticate('jwt', { session: false }), can(['media', 'guest']), mediaController.folder.size);

// router.post('/search/media', passport.authenticate('jwt', { session: false }), can(['media','guest']),mediaController.filter);

router.get('/search/media/:data', convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['media','guest']),
     mediaController.filter);
router.get('/generateuniquestamp', passport.authenticate('jwt', { session: false }), can(['media', 'guest']), mediaController.stamp.generate);
router.get('/removeuniqueStamp/:uniquestamp', passport.authenticate('jwt', { session: false }), can(['media','guest']), mediaController.stamp.remove);
router.post('/preparingZip', passport.authenticate('jwt', { session: false }), can(['media','guest']), mediaController.zip.create);

router.post('/move/share/file', passport.authenticate('jwt', { session: false }), can(['media', 'share files-folders','guest']), mediaController.move.fileFromShared);
router.post('/move/share/folder', passport.authenticate('jwt', { session: false }), can(['media', 'share files-folders','guest']), mediaController.move.folderFromShared);
router.get('/getShareData/:childType', passport.authenticate('jwt', { session: false }), can(['media', 'share files-folders','guest']), mediaController.share.sharedChilds);
router.get('/sharedata/users/:id/:type', passport.authenticate('jwt', { session: false }), can(['media', 'share files-folders','guest']), mediaController.share.sharedUsersList);
router.get('/sharedata/userList/:data',convertStringToObject.base64ToString, passport.authenticate('jwt', { session: false }), can(['media', 'share files-folders','guest_user']), mediaController.share.usersList);
router.put('/sharedata/update', passport.authenticate('jwt', { session: false }), can(['media', 'share files-folders','guest']), mediaController.share.shareupdate);
router.put('/media/sharedData/remove', passport.authenticate('jwt', { session: false }), mediaController.share.remove);


module.exports = router;