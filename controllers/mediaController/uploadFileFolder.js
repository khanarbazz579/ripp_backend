const app = require('express')();
const uploadToAws = require('../../services/multerS3Service');
const commonFunction = require('../../services/commonFunction');
const path = require('path');

app.use(uploadToAws.uploadFoldersFilesToAws);

const uploadFileFolder = async (req, res) => {
    try {
        uploadToAws.uploadFoldersFilesToAws(req, res, async function (err, response) {
            if (!err) {
                const uniqueuserstamp = req.body.uniqueuserstamp;
                const userData = req.user.dataValues;
                const name = req.files[0] && req.files[0].originalname.trim();
                let fileExtension = path.extname(name) || req.files[0].mimetype;
                if (S3_MEDIA.allowed_image_file_extensions.indexOf(req.files[0].mimetype) > -1) {
                    // get width and height
                    uploadToAws.getDimensionOfImage(req.files[0].key, async (dimesionOfFile) => {
                        let aspect_ratio = (dimesionOfFile.width / dimesionOfFile.height).toFixed(2);

                        const fileObject = commonFunction.mediaCommonFunction.createFileFolderObject(name, userData.id, 'FILE');

                        const filePropertyObject = commonFunction.mediaCommonFunction.createFilePropertyObject(0, req.files[0]['size'], req.files[0].key, 'icons/' + req.files[0].key, req.files[0].mimetype, fileExtension, req.body.tag, req.body.description, dimesionOfFile.width, dimesionOfFile.height, aspect_ratio, 100);

                        // console.log('-----GLOBAL_USER_SESSION[uniqueuserstamp]--------------', GLOBAL_USER_SESSION[uniqueuserstamp]['folderId']);
                        const fileFolderAccess = commonFunction.mediaCommonFunction.createFile_Folder_Access_Object(0, userData.id, 'EDIT', name, 'FILE', GLOBAL_USER_SESSION[uniqueuserstamp]['folderId'], `${req.files[0].originalname}${fileExtension}`, req.files[0].updatedCount);


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

                                    return res.json({ success: true, message: "File uploaded successfully!", data: saveFile.dataValues, sourceData: GLOBAL_USER_SESSION[uniqueuserstamp]['returnFolderInfo'] });
                                } else {
                                    return res.json({ success: false, message: "Something went wrong" });
                                }
                            });
                        })
                    })
                } else {
                    const fileObject = commonFunction.mediaCommonFunction.createFileFolderObject(name, userData.id, 'FILE');
                    const filePropertyObject = commonFunction.mediaCommonFunction.createFilePropertyObject(0, req.files[0]['size'], req.files[0].key, 'icons/' + req.files[0].key, req.files[0].mimetype, fileExtension, req.body.tag, req.body.description);
                    const fileFolderAccess = commonFunction.mediaCommonFunction.createFile_Folder_Access_Object(0, userData.id, 'EDIT', name, 'FILE', GLOBAL_USER_SESSION[uniqueuserstamp]['folderId'], `${req.files[0].originalname}${fileExtension}`, req.files[0].updatedCount);

                    const newLocal = await commonFunction.mediaCommonFunction.saveFileFolder(fileObject);
                    // add data on files_folders table
                    const fileInstance = newLocal;

                    // add file property into file_properties table
                    filePropertyObject.file_id = fileInstance.dataValues.id;
                    const filePropertyInstance = await commonFunction.mediaCommonFunction.saveFileProperties(filePropertyObject);

                    // add data on files_folders_accesses table
                    fileFolderAccess.file_folder_id = fileInstance.dataValues.id;
                    fileFolderAccess.file_property_id = filePropertyInstance.dataValues.id;
                    const saveFile = await commonFunction.mediaCommonFunction.saveFileFolderAccess(fileFolderAccess);

                    return res.json({ success: true, message: "File uploaded successfully!", data: saveFile, sourceData: GLOBAL_USER_SESSION[uniqueuserstamp]['returnFolderInfo'] });
                }
            } else {
                res.json({ success: false, message: 'something weird happen', error: err, data: null });
            }

        })
    } catch (e) {
        return res.json({ success: false, message: 'something went wrong' });
    }
}

module.exports = uploadFileFolder;