const multer = require('multer');
const multerS3 = require('multer-s3');
const async = require('async');
const Files_Folders_Access = require('../models').files_folders_accesses;
const mediaCommonFunction = require('./commonFunction').mediaCommonFunction;
const fs = require('fs');
const request = require('request');
const path = require('path');
const EntityFiles = require('./../models').entity_files;

const { s3, gm } = require('./AwsInstance');

/**
  * S3 media global object which carries the properties
  */
S3_MEDIA = {
  'bucketName': (process.env.NODE_ENV === 'test') ? 'devsubdomainfiles-test' : 'devsubdomainfiles',
  'media-folder': 'media',
  'fileName': '',
  'thumbnailUrl': 'icons/',
  'returnFolderInfo': [],
  'acl': 'public-read',
  'awsPath': 'https://s3.eu-west-2.amazonaws.com/',
  'totalAllowedSpaceToUser': 10737418240, //in 10 GB = 10737418240 bytes           
  'sizeAllowedParameter': 'GB',
  'widthLimit': 2500,
  'heightLimit': 1500,
  'largeFileName': '2500X1500_',
  "allowed_image_file_extensions": ['image/png', 'image/gif', 'image/tiff', 'image/jpeg', 'image/jpg']
};

GLOBAL_USER_SESSION = {};

let storageFile = multerS3({
  s3: s3,
  bucket: S3_MEDIA.bucketName,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  acl: S3_MEDIA.acl,
  key: function (req, file, cb) {
    cb(null, GLOBAL_USER_SESSION[req.body.uniqueuserstamp].fileName);
  }
});

/**
  * Upload entity files using multer S3 service in several steps
  * Also checks the file extension and duplicacy of files
  * @params req request object
  * @params file file to be uploaded
  * @params callback callback function
  */
const uploadEntityFilesToAws = multer({
  storage: storageFile,
  fileFilter: async (req, file, callback) => {
    let { selectedCategory, uniqueuserstamp, fileWithExtention } = req.body;

    if (!GLOBAL_USER_SESSION[uniqueuserstamp]) {
      GLOBAL_USER_SESSION[uniqueuserstamp] = {}
    }

    let extension = path.extname(fileWithExtention);

    let fileName = `${file.originalname.trim()}${extension}`;

    let entityFileObject = {
      entity_type: req.body.entity_type,
      entity_id: req.body.entity_id,
      name: fileName
    }

    let [error, isFileExist] = await checkFileNameExistByName(entityFileObject);

    if (isFileExist) {
      let newCount = isFileExist.count + 1;
      isFileExist.update({ count : newCount});
      fileName = file.originalname.trim()+"("+isFileExist.count+")"+extension;
    }

    file.additionalName = fileName;

    GLOBAL_USER_SESSION[uniqueuserstamp]['fileName'] = `entity-media/category_id_${selectedCategory}/${Date.now()}-${fileName}`;

    callback(null, true);
  }
}).array('file');

/**
 * Checks file name is exists or not through name field
 * @param entityFileObject - entity file object
 */
const checkFileNameExistByName = async(entityFileObject) => {
  let [error, file] = await to(
      EntityFiles.findOne({
        where: {
          entity_id: entityFileObject.entity_id,
          entity_type: entityFileObject.entity_type,
          name: entityFileObject.name,
        }
      })
  );

  return [error, file];
}


/**
  * Get the dimension of image
  * @params filePath - file path
  * @params callback callback function
  */
const getDimensionOfImage = async (filePath, callback) => {
  const urlPath = `${S3_MEDIA.awsPath}/${S3_MEDIA.bucketName}/${filePath}`;
  gm(request(urlPath)).size((err, size) => {
    if (err) { throw err; }
    callback(size);
  });
}

uploadToAws = {
  uploadEntityFilesToAws,
  getDimensionOfImage
}

module.exports = uploadToAws;
