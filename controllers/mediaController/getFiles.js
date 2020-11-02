const db = require('../../models');
const uploadToAws = require('../../services/multerS3Service');
const commonFunction = require('../../services/commonFunction');

/**
 * Get file in blob
 * @param {object} req 
 * @param {object} res 
 */
const getFileInBlob = async (req, res) => {
  let file = await commonFunction.mediaCommonFunction.getFileByIdWithUser(req.params.fileId);
  if (!file) {
    return res.json({ success: false, message: 'file doesn\'t exist', data: [] });
  }
  // getImageFromAws
  uploadToAws.getObjectByPath(file.dataValues.file_property.dataValues.path, async (error, s3Stream) => {
    // Listen for errors returned by the service
    s3Stream.on('error', function (error) {
      // NoSuchKey: The specified key does not exist
      console.error('----something weird happen---', error);
      res.json({ success: false, message: 'something weird happen', error: error, data: null });
    });
    res.attachment(file.dataValues.name);
    s3Stream.pipe(res)
      .on('data', (data) => {
        // retrieve data
      })
      .on('end', () => {
        // stream has ended
      })
      .on('error', (error) => {
        // handle error from unzip
        res.json({ success: false, message: 'something weird happen', error: error, data: null });
      });
  })

}

/**
 * Get file preview in blob
 * @param {object} req 
 * @param {object} res 
 */
const getFilePreviewInBlob = async (req, res) => {
  let file = await commonFunction.mediaCommonFunction.getFileByIdWithUser(req.params.fileId);
  if (!file) {
    return res.json({ success: false, message: 'file doesn\'t exist', data: [], fileData: {} });
  }
  // getImageFromAws
  let fileProperty = file.dataValues.file_property.dataValues;
  let filePath = fileProperty.path;
  if (fileProperty.width > S3_MEDIA.widthLimit && fileProperty.height > S3_MEDIA.heightLimit) {
    filePath = filePath.replace('/', '/' + S3_MEDIA.largeFileName);
  }
  uploadToAws.getObjectFileByPath(filePath, async (error, response) => {
    if (!error) {
      bufferImage = response.Body.toString('base64');
      return res.json({ success: true, message: '', data: bufferImage }); 
    }
    return res.json({ success: false, message: 'File not found', data: null });
  })
}

/**
 * Get file path by id
 * @param {object} req 
 * @param {object} res 
 */
const getfilepath = async (req, res) => {

  let file = await commonFunction.mediaCommonFunction.getFileByIdWithUser(req.params.fileId);
  
  if (!file) {
    return res.json({ success: false, message: 'file doesn\'t exist', data: [], fileData: {} });
  }

  [err, restFolderPath] = await to(db.sequelize.query(`select GROUP_CONCAT(name ORDER BY id ASC SEPARATOR '/') as mainpath from ( SELECT @r AS _id, (SELECT @r := parent_id FROM files_folders_accesses WHERE id = _id) AS parent_id, @l := @l + 1 AS lvl FROM ( SELECT @r := ${file.dataValues.parent_id}, @l := 0) vars, files_folders_accesses m WHERE @r > 0) T1 JOIN files_folders_accesses T2 ON T1._id = T2.id and T2.parent_id is NOT null`));

  if (err) {
    return res.json({ success: false, message: 'folder path doesn\'t exist', data: [], fileData: {} });
  }

  const mainfilePath = 'My Files' + ((restFolderPath[0][0]['mainpath']) ? '/' + restFolderPath[0][0]['mainpath'] : '') + '/';

  return res.json({ success: true, message: 'file path', data: mainfilePath });
}

module.exports = {
  getFileInBlob,
  getFilePreviewInBlob,
  getfilepath
}