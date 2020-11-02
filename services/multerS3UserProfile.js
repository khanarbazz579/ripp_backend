const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const async = require('async');
const path = require('path');
// AWS.config.loadFromPath('./aws/config.json');
// const s3 = new AWS.S3();

const { s3, gm } = require('./AwsInstance');


// const gm = require('gm').subClass({
//   imageMagick: (process.env.NODE_ENV_HEADER === 'local') ? false : true
//   //imageMagick: false
// });

let uploadProfileImageToAws = multer().single('profile_image');
let uploadSignatureFileToAWS = multer().single('signature_file');

deleteProfileImageFromAws = async (imageName) => {
    const param = {
        Bucket: S3_MEDIA.bucketName,
        Key: imageName
    };
    try {
        const image = await s3.headObject(param).promise();
        if (image) {
            let finish = await s3.deleteObject(param).promise();
            return finish;
        }
    } catch (e) {
        return;
    }
}


const getFileFromAWS = async (file) => {
    const param = {
        Bucket: S3_MEDIA.bucketName,
        Key: file
    };
    try {
        const image = await s3.headObject(param).promise();
        if (image) {
            let data = await s3.getObject(param).promise();
            return data.Body.toString('ascii');
        }
    } catch (e) {
        return;
    }
}

const getFileFromAWSForEmail = async (file) => {
    const param = {
        Bucket: S3_MEDIA.bucketName,
        Key: file
    };
    try {
        const image = await s3.headObject(param).promise();
        if (image) {
            let data = await s3.getObject(param).promise();
            return data.Body.toString("base64");
        }
    } catch (e) {
        return;
    }
}

uploadSingleImage = async (file, param, callback) => {
    let incomingBuffer;

    if (!file) {
        callback(null);
    } else {
        if (file.fieldname == 'profile_image') {
            incomingBuffer = file.buffer;
            async.waterfall([
                (next) => {
                    gm(incomingBuffer)
                        .resize(160)
                        .gravity('center')
                        .toBuffer('jpg', function(err, buffer) {
                            if (err) {
                                next(err, null);
                            } else {
                                if (param.id) {
                                    S3_MEDIA.fileName = `user-profile-image/${param.id}_${Date.now()}.jpg`;
                                } else {
                                    S3_MEDIA.fileName = `lead-profile-image/${param.contact_id}_${Date.now()}.jpg`;
                                }
                                next(null, buffer);
                            }
                        });
                },
                (buffer, next) => {
                    s3.putObject({
                        ACL: 'public-read',
                        Bucket: S3_MEDIA.bucketName,
                        Body: buffer,
                        Key: S3_MEDIA.fileName,
                        ContentType: "image/jpg",
                        Metadata: {
                            "x-amz-meta-fieldname": 'image'
                        }
                    }, (err, data) => {
                        if (err) {
                            next(err, null);
                        } else {
                            next(null, S3_MEDIA.fileName);
                        }
                    });
                },
            ], (error, fullName) => {
                if (error) {
                    console.log('-----------------------error-----------------------------', error);
                }
                callback(fullName);
            });
        }
    }
}

uploadUserImage = async (files, param, callback) => {

    if (!files) {
        callback(null);
    } else {
        let incomingBuffer;
        if (files[0].fieldname == 'profile_image' || files[0].fieldname == 'secondary_image') {
            incomingBuffer = files[0].buffer;
            async.waterfall([
                (next) => {
                    gm(incomingBuffer)
                        .resize(160)
                        .gravity('center')
                        .toBuffer('jpg', function(err, buffer) {
                            if (err) {
                                next(err, null);
                            } else {
                                if (param.id) {
                                    S3_MEDIA.fileName = `user-profile-image/${param.id}_${Date.now()}.jpg`;
                                } else {
                                    S3_MEDIA.fileName = `lead-profile-image/${param.lead_id}_${Date.now()}.jpg`;
                                }
                                next(null, buffer);
                            }
                        });
                },
                (buffer, next) => {
                    s3.putObject({
                        ACL: 'public-read',
                        Bucket: S3_MEDIA.bucketName,
                        Body: buffer,
                        Key: S3_MEDIA.fileName,
                    }, (err, data) => {
                        if (err) {
                            next(err, null);
                        } else {
                            next(null, S3_MEDIA.fileName);
                        }
                    });
                },
            ], (error, fullName) => {
                if (error) {
                    console.log('-----------------------error-----------------------------', error);
                }
                callback(fullName);
            });
        }
    }
}


/**
 * @description To upload html signature file to AWS S3
 * @return Callback
 * 
 */
const uploadSignatureFile = async (file, param, callback) => {
    let incomingBuffer;
    if (!file) {
        callback(null);
    } else {
        if (file.fieldname == 'signature_file') {
            incomingBuffer = file.buffer;
            S3_MEDIA.fileName = `email-signatures/${param}_${Date.now()}.html`;
            s3.putObject({
                ACL: 'public-read',
                Bucket: S3_MEDIA.bucketName,
                Body: incomingBuffer,
                Key: S3_MEDIA.fileName,
                ContentType: "text/html",
            }, (err, data) => {
                if (err) {
                    next(err, null);
                } else {
                    callback(S3_MEDIA.fileName)
                }
            });
        }
    }
}

uploadToAws = {
    uploadProfileImageToAws: uploadProfileImageToAws,
    deleteProfileImageFromAws: deleteProfileImageFromAws,
    uploadUserImage: uploadUserImage,
    uploadSingleImage: uploadSingleImage,
    uploadSignatureFile: uploadSignatureFile,
    uploadSignatureFileToAWS: uploadSignatureFileToAWS,
    getFileFromAWS: getFileFromAWS,
    getFileFromAWSForEmail: getFileFromAWSForEmail
}

module.exports = uploadToAws;