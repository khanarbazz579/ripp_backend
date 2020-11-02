const multer = require('multer');
const multerS3 = require('multer-s3');
// const AWS = require('aws-sdk');
const async = require('async');
const Files_Folders_Access = require('../models').files_folders_accesses;
const mediaCommonFunction = require('./commonFunction').mediaCommonFunction;
const fs = require('fs');
const request = require('request');
const path = require('path');

const {
  s3,
  gm
} = require('./AwsInstance');

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


const uploadFilesToAws = multer({
  storage: storageFile,
  fileFilter: async (req, file, callback) => {
    const {
      selectedFolderId,
      uniqueuserstamp,
      fileWithExtention
    } = req.body;
    if (!GLOBAL_USER_SESSION[uniqueuserstamp]) {
      GLOBAL_USER_SESSION[uniqueuserstamp] = {}
    }

    let extension = path.extname(fileWithExtention);
    let fileName = `${file.originalname.trim()}${extension}`;
    const isFileExistByMasterName = await mediaCommonFunction.checkFileNameExistByMasterName({
      name: fileName
    }, parseInt(selectedFolderId));
    let isFileExist = {};
    isFileExist.count = 0;
    const isFileNameAlreadyExistByName = await mediaCommonFunction.checkFileNameExistByName({
      name: fileName
    }, parseInt(selectedFolderId));

    const fileObject = {
      'fileCount': '',
      'fileExist': false
    }

    if (isFileExistByMasterName) {
      isFileExist = isFileExistByMasterName;
      const localCount = ++isFileExistByMasterName.count;
      fileObject.fileExist = true;
      fileObject.fileCount = localCount;
      fileName = `${file.originalname}(${localCount})${extension}`;
      isFileExist.name = fileName;

      file.addtionalName = fileName;
      file.updatedCount = fileObject.fileCount;
    } else if (isFileNameAlreadyExistByName) {
      // extension = isFileNameAlreadyExistByName.type.split('/')[1];
      isFileExist = isFileNameAlreadyExistByName;
      isFileExist.count = 0;
      fileObject.fileCount = ++isFileExist.count;
      fileName = `${file.originalname}(${fileObject.fileCount})${extension}`;
      isFileExist.name = fileName;
      isFileExist.master_name = `${file.originalname}${extension}`;
      fileObject.fileExist = true;

      file.addtionalName = fileName;
      file.updatedCount = fileObject.fileCount;
    } else { // when new master_name
      fileObject.fileExist = false;
      fileObject.fileCount = isFileExist.count;
      fileName = `${file.originalname.trim()}${extension}`;
      file.addtionalName = fileName;
      file.updatedCount = fileObject.fileCount;
    }

    fileC = '';
    if (fileObject.fileExist && fileObject.fileCount > 0) {
      fileC = `(${fileObject.fileCount})`
    }
    fileName = `${file.originalname.trim()}${fileC}${extension}`;

    GLOBAL_USER_SESSION[uniqueuserstamp]['fileName'] = `${req.user.email}/${Date.now()}-${fileName}`;

    // console.log('-----s3-------', s3);
    // if (req.body.selectedFolder) {
    //   GLOBAL_USER_SESSION[uniqueuserstamp]['fileName'] = `${req.body.selectedFolder}/${Date.now()}-${fileName}`;
    // }
    callback(null, true);
  }
}).array('file');

let storageFolder = multerS3({
  s3: s3,
  bucket: S3_MEDIA.bucketName,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  acl: S3_MEDIA.acl,
  key: async (req, file, cb) => {
    const uniqueuserstamp = req.body.uniqueuserstamp;
    if (!GLOBAL_USER_SESSION[uniqueuserstamp]) {
      GLOBAL_USER_SESSION[uniqueuserstamp] = {}
    }
    let sourceData = req.body.sourceData || 'null';
    // console.log('----sourceData1----', req.body, sourceData != null, sourceData != 'null', sourceData !== null, sourceData !== 'null');
    let fileName = `${file.originalname.trim()}`;
    const folderPathArray = req.body.webkitRelativePath.split('/');

    const loggedInUser = req.user.dataValues;
    if (sourceData != 'null') {
      sourceData = JSON.parse(sourceData);
      // console.log('-----sourceData2----', sourceData);
      let [err, parentFolder] = await to(Files_Folders_Access.findByPk(sourceData.id));
      // remove first index of array
      finalParentFolder = await checkAndCreateFolder(uniqueuserstamp, folderPathArray, loggedInUser, parentFolder, 2);
      GLOBAL_USER_SESSION[uniqueuserstamp]['returnFolderInfo'] = sourceData;
    } else {

      // console.log('-----req.body.selectedFolderId----', req.body.selectedFolderId);
      let [err, parentFolder] = await to(Files_Folders_Access.findByPk(req.body.selectedFolderId));
      finalParentFolder = await checkAndCreateFolder(uniqueuserstamp, folderPathArray, loggedInUser, parentFolder);
    }

    // console.log('----finalParentFolder-----', finalParentFolder);
    // if (finalParentFolder) {
    //   GLOBAL_USER_SESSION[uniqueuserstamp]['fileName'] = `${finalParentFolder.dataValues.path}/${Date.now()}-${fileName}`;
    // } else if (req.body.selectedFolder) {
    //   GLOBAL_USER_SESSION[uniqueuserstamp]['fileName'] = `${req.body.selectedFolder}/${Date.now()}-${fileName}`;
    // }
    GLOBAL_USER_SESSION[uniqueuserstamp]['fileName'] = `${req.user.email}/${Date.now()}-${fileName}`;
    GLOBAL_USER_SESSION[uniqueuserstamp]['folderId'] = finalParentFolder.dataValues.id;
    // GLOBAL_USER_SESSION[uniqueuserstamp]['parentFolderPath'] = finalParentFolder.dataValues.path;

    cb(null, GLOBAL_USER_SESSION[uniqueuserstamp]['fileName']);
  }
});

const uploadFoldersFilesToAws = multer({
  storage: storageFolder
}).array('file');

const checkAndCreateFolder = async (uniqueuserstamp, pathArray, loggedInUser, parentFolder, length = 1) => {
  // console.log('-----parentFolder-----', parentFolder);
  if (pathArray.length > length) {
    let folderName = pathArray[length - 1];
    let countFolder = 0;
    let folderMasterName, folderNameNew = folderName;
    if (length === 1) {
      // needs to check upper source folder
      const isFolderExistByMasterName = await mediaCommonFunction.checkFolderNameExistByMasterName(folderName, parentFolder.id);
      if (isFolderExistByMasterName) {
        countFolder = ++isFolderExistByMasterName.count;
        folderNameNew = `${folderName}(${countFolder})`;
        folderMasterName = isFolderExistByMasterName.master_name;
      } else {
        const isFolderNameAlreadyExistByName = await mediaCommonFunction.checkFolderNameExistByName(folderName, parentFolder.id);
        if (isFolderNameAlreadyExistByName) {
          countFolder = ++isFolderNameAlreadyExistByName.count;
          folderNameNew = `${folderName}(${countFolder})`;
          folderMasterName = isFolderNameAlreadyExistByName.master_name;
        }
      }
    }

    let [err, returnFolder] = await to(
      Files_Folders_Access.findOne({
        where: {
          entity_type: 'FOLDER',
          user_id: loggedInUser.id,
          name: (length === 1) ? folderNameNew : folderName,
          parent_id: parentFolder.dataValues.id
        }
      }));

    if (returnFolder) {
      // console.log('-folder exist-', folderName);
    } else {
      // create folder under selectedFolderId
      returnFolder = await mediaCommonFunction.saveFolderIntoDb(parentFolder.dataValues, (length === 1) ? folderNameNew : folderName, loggedInUser, folderMasterName, countFolder);

      if (length === 1) {
        GLOBAL_USER_SESSION[uniqueuserstamp]['returnFolderInfo'] = returnFolder.data;
      }
    }
    // delete pathArray[0];
    if (!returnFolder.dataValues) {
      returnFolder['dataValues'] = returnFolder.data;
    }
    length = length + 1;
    return checkAndCreateFolder(uniqueuserstamp, pathArray, loggedInUser, returnFolder, length)
  } else {
    return parentFolder;
  }
}

// folder to AWS
uploadFolderToAws = (folderPath) => {
  return s3.upload({
    Bucket: S3_MEDIA.bucketName,
    Key: folderPath,
    ACL: S3_MEDIA.acl,
    Body: 'body does not matter'
  }, function (err, data) {
    if (err) {
      console.log("Error creating the folder: ", err);
    } else {
      console.log("Successfully created a folder on S3", folderPath);
      return true;
    }
  });
}

// copy Exsiting folder into another new location
// copyFolderToFolderAws = async (existingPath, newPath, empty = true) => {
//   var bucketName = S3_MEDIA.bucketName;
//   var oldPrefix = existingPath;
//   var newPrefix = newPath;
//   var done = function (err, data) {
//     if (err) {
//       console.log('---copyFolderToFolderAws--err-', err);
//     }
//     else {
//       console.log('--copyFolderToFolderAws--', data);
//     }
//   };

//   await s3.listObjects({ Bucket: S3_MEDIA.bucketName, Prefix: existingPath + '/' }, async function (err, data) {
//     if (data.Contents.length) {
//       async.each(data.Contents, function (file, cb) {
//         var params = {
//           Bucket: S3_MEDIA.bucketName,
//           CopySource: `${bucketName}/${file.Key}`,
//           Key: file.Key.replace(oldPrefix, newPrefix),
//           ACL: 'public-read'
//         };
//         s3.copyObject(params, async function (copyErr, copyData) {
//           if (copyErr) {
//             console.log('error', copyErr);
//             cb(copyErr)
//           }
//           else {
//             await mediaCommonFunction.updateFilePath(file.Key, params.Key)
//             cb();
//           }
//         });
//       }, done);
//       if (empty) await emptyS3Directory(oldPrefix);
//     }
//   });

// }

deleteFoldersFromAws = async (dir) => {
  await emptyS3Directory(dir);
}

emptyS3Directory = async (dir) => {
  const listParams = {
    Bucket: S3_MEDIA.bucketName,
    Prefix: dir + '/'
  };
  // console.log('-----listParams-----', listParams);
  const listedObjects = await s3.listObjectsV2(listParams).promise();
  // console.log('-----listedObjects----', listedObjects);
  if (listedObjects.Contents.length === 0) return;

  const deleteParams = {
    Bucket: S3_MEDIA.bucketName,
    Delete: {
      Objects: []
    }
  };

  listedObjects.Contents.forEach(({
    Key
  }) => {
    deleteParams.Delete.Objects.push({
      Key
    });
  });

  await s3.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) await emptyS3Directory(dir);
}

deleteFileFromAws = async (path, multi = false) => {
  // console.log('-------path-----', path);
  if (!multi) {
    const param = {
      Bucket: S3_MEDIA.bucketName,
      Key: path
    };
    try {
      const file = await s3.headObject(param).promise();
      if (file) {
        await s3.deleteObject(param).promise();
        return true;
      }
    } catch (e) {
      console.log('deleteFileFromAws single', e)
      return false;
    }
  } else {
    // delete multi object
    const param = {
      Bucket: S3_MEDIA.bucketName,
      Delete: { // required
        Objects: path,
      },
    };
    try {
      return s3.deleteObjects(param, function (err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          return false;
        } else {
          console.log(data); // successful response
          return true;
        }
      });
    } catch (e) {
      console.log('deleteFileFromAws multi', e)
      return false;
    }
  }
}

copyFileToAws = async (file) => {
  try {
    // console.log('------file--copyFileToAws-----', file);
    const {
      oldPath,
      path
    } = file;
    var params = {
      Bucket: S3_MEDIA.bucketName,
      CopySource: `${S3_MEDIA.bucketName}/${oldPath}`,
      Key: path,
      ACL: 'public-read'
    };
    await s3.copyObject(params).promise();
    return true;
  } catch (e) {
    console.log('copyFileToAws', e)
    return false;
  }
}

editFileIntoAws = async (filePath, edited, resizedW, resizedH, resizedQuality, callback) => {
  // console.log('-----filePath----', filePath);
  // console.log('-----edited----', edited);
  // console.log('-----resizedW----', resizedW, resizedH);
  const ext = filePath.mimetype.split('/')[1];
  editPath = (!edited) ? filePath.path : edited;
  async.waterfall([
    (next) => {
      s3.getObject({
        Bucket: S3_MEDIA.bucketName,
        Key: filePath.path
      }, (err, imageData) => {
        if (err) {
          next(false, null);
        } else {
          // console.log('----imageData----', imageData);
          next(null, imageData);
        }
      });
    },
    (imageData, next) => {
      gm(imageData.Body)
        .resizeExact(resizedW, resizedH)
        .quality(resizedQuality)
        .toBuffer(ext, (err, buffer) => {
          if (err) {
            next(err, null);
          } else {
            next(null, buffer);
          }
        });
    },
    (buffer, next) => {
      s3.putObject({
        ACL: 'public-read',
        Bucket: S3_MEDIA.bucketName,
        Key: editPath,
        Body: buffer
      }, (err, data) => {
        if (err) {
          next(err, null);
        } else {
          next(null);
        }
      });
    },
    (next) => {
      s3.getObject({
        Bucket: S3_MEDIA.bucketName,
        Key: editPath
      }, (err, updatedObject) => {
        if (err) {
          next(err, null);
        } else {
          next(null, updatedObject);
        }
      });
    }
  ], (error, updatedObject) => {
    if (error) {
      console.log('-----------------------error-editFileIntoAws----------------------------', error);
    }
    // return alert('Done!');
    callback(updatedObject);
  });
}

getObjectByPath = async (filePath, callback) => {
  callback(null, s3.getObject({
    Bucket: S3_MEDIA.bucketName,
    Key: filePath
  }).createReadStream());
};

getObjectFileByPath = async (filePath, callback) => {
  // console.log('---getObjectFileByPath--filePath----', filePath);
  s3.getObject({
    Bucket: S3_MEDIA.bucketName,
    Key: filePath
  }, (err, imageData) => {
    if (err) {
      console.log('-----------------------error-getObjectByPath----------------------------', err);
      callback(err);
    } else {
      callback(null, imageData);
    }
  });
};

const getDimensionOfImage = async (filePath, callback) => {
  const urlPath = `${S3_MEDIA.awsPath}/${S3_MEDIA.bucketName}/${filePath}`;
  gm(request(urlPath)).size((err, size) => {
    if (err) {
      throw err;
    }
    callback(size);
  });
}

saveThumbnailOfImage = async (filePath, iconPath, resizedW = 25, resizedH = 25, resizedQuality = 100, iconNamePrefix = "", callback) => {

  try {
    // console.log('---saveThumbnailOfImage--filePath-----', filePath, iconPath, resizedW, resizedH);
    const ext = filePath.mimetype.toString().split('/')[1];
    let iconName = filePath.path.split('/') || [];
    // iconName = iconName[iconName.length - 1];
    iconName = iconNamePrefix + iconName[iconName.length - 1];
    // console.log('-----iconName--449---', iconName);
    iconPath = ((!iconPath) ? S3_MEDIA.thumbnailUrl : iconPath) + iconName;
    // console.log('-----iconPath--451---', iconPath);
    async.waterfall([
      (next) => {
        s3.getObject({
          Bucket: S3_MEDIA.bucketName,
          Key: filePath.path
        }, (err, imageData) => {
          if (err) {
            // console.log('-----410-----', err);
            next(err, {});
          } else {
            // console.log('-----415-----', imageData);
            next(null, imageData);
          }
        });
      },
      (imageData, next) => {
        gm(imageData.Body)
          .resizeExact(resizedW, resizedH)
          // .resize(resizedW, resizedH)
          .quality(resizedQuality)
          .toBuffer(ext, (err, buffer) => {
            if (err) {
              // console.log('-----428-----', err);  
              next(err, {});
            } else {
              next(null, buffer);
            }
          });
      },
      (buffer, next) => {
        s3.upload({
          ACL: 'public-read',
          Bucket: S3_MEDIA.bucketName,
          Key: iconPath,
          Body: buffer
        }, (err, data) => {
          if (err) {
            // console.log('-----439-----', err);
            next(err, null);
          } else {
            // console.log('-----443-----', data);
            next(null);
          }
        });
      }
    ], (error, updatedObject) => {
      if (error) {
        console.log('-----------------------error-saveThumbnailOfImage----------------------------', error);
      }
      // return alert('Done!');
      // console.log('-----updatedObject-----', updatedObject);
      callback(error, true);
    });
  } catch (error) {
    console.error(error);
  }

}

// getFolderSize(parentFolder, callback);
const getRootFolderSizeOfUser = async (folder, marker, callback) => {
  // console.log('399--folder--', folder);
  var params = {
    Bucket: S3_MEDIA.bucketName,
    Prefix: folder + '/'
  };
  if (typeof marker === 'function') {
    callback = marker;
    marker = null;
  }
  if (marker !== null) {
    params.Marker = marker;
  }
  // console.log('412--marker--', params);

  // ().listObjects(params, function (err, data) {
  s3.listObjects(params, async function (err, data) {
    // console.log('-------err------', err);
    if (err) {
      return callback(err, null);
    }
    // console.log('-------data------', data);
    var size = 0;
    if (data.hasOwnProperty('Contents')) {
      size = calculateObjectsSize(data.Contents);
    }
    // console.log('-------size------', size);
    if (!data.IsTruncated) {
      // console.log('---data.IsTruncated---', size);
      return callback(null, size);
    }
    marker = data.Contents[data.Contents.length - 1].Key;
    getRootFolderSizeOfUser(folder, marker, function (err, nsize) {
      if (err) {
        return callback(err, null);
      }
      // console.log('---data.size + nsize---', size + nsize);
      return callback(null, size + nsize);
    });
  });
};

const calculateObjectsSize = function (objects) {
  var size = 0;
  for (var i = 0; i < objects.length; i++) {
    size += objects[i].Size;
  }
  return size;
};

const uploadSingleFile = (filePath, content, callback) => {
  // console.log("filePath", filePath)
  const params = {
    Bucket: S3_MEDIA.bucketName,
    Key: filePath,
    ACL: S3_MEDIA.acl,
    Body: content
  }

  s3.upload(params, (err, data) => {
    if (err) {
      return callback(err);
    }
    callback(null, data);
  })
}

uploadTemplateImageAws = async (req,res, callback) => {
  let incomingBuffer;
  let file = req.file;
  const {
    user: {
      dataValues: user
    },
    body
  } = req;
  let dimensions = body.dimensions.split(",");
  if (!user.id) {
    throw new Error();
  }
  file["key"] = `email-templates/${user.email}/trash/${+new Date()}-${file.originalname}`
  if (!file) {
    callback(null);
  } else {
    if (file.fieldname == 'image') {
      incomingBuffer = file.buffer;
      async.waterfall([
        (next) => {
          gm(incomingBuffer)
            .resizeExact(dimensions[0],dimensions[1])
            .gravity('center')
            .toBuffer('jpg', function (err, buffer) {
              if (err) {
                next(err, null);
              } else {
                next(null, buffer);
              }
            });
        },
        (buffer, next) => {
          s3.putObject({
            Bucket: S3_MEDIA.bucketName,
            ACL: S3_MEDIA.acl,
            Body : buffer,
            Key:file.key,
          }, (err, data) => {
            if (err) {
              next(err, null);
            } else {
              next(null,file["key"]);
            }
          });
        },
      ], (error, fullName) => {
        if (error) {
          console.log('-----------------------error-----------------------------', error);
          callback(error);
        }
        callback(null);
      });
    }
  }
}

let storageFile1 = multerS3({
  s3: s3,
  bucket: S3_MEDIA.bucketName,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  acl: S3_MEDIA.acl,
  metadata: function (req, file, cb) {
    cb(null, {
      fieldName: file.fieldname
    });
  },
  key: function (req, file, cb) {
    const {
      user: {
        dataValues: user
      },
      body
    } = req;
    // console.log("body", body)
    if (!user.id) {
      throw new Error();
    }
    cb(null, `email-templates/${user.email}/trash/${+new Date()}-${file.originalname}`)
  }
});

const uploadTemplateImage = multer({
  //storage: storageFile1
}).single('image');

const readFileContent = (filePath, callback) => {
  var params = {
    Bucket: S3_MEDIA.bucketName,
    Key: filePath
  };
  s3.getObject(params, function (err, data) {
    if (err) {
      return callback(err)
    }
    return callback(null, data)
  });
}

const deleteManyObjects = (params, callback) => {
  Object.assign(params, {
    Bucket: S3_MEDIA.bucketName
  });
  s3.deleteObjects(params, (err, data) => {
    if (err) {
      return callback(err);
    }
    return callback(null, data);
  })
}

uploadToAws = {
  uploadFilesToAws,
  uploadFolderToAws,
  // copyFolderToFolderAws,
  deleteFoldersFromAws,
  deleteFileFromAws,
  copyFileToAws,
  editFileIntoAws,
  uploadFoldersFilesToAws,
  getObjectByPath,
  getDimensionOfImage,
  getRootFolderSizeOfUser,
  saveThumbnailOfImage,
  getObjectFileByPath,
  uploadSingleFile,
  uploadTemplateImage,
  readFileContent,
  deleteManyObjects
}

module.exports = uploadToAws;