const AWS = require('aws-sdk');
const s3 = new AWS.S3(CONFIG.aws);

const gm = require('gm').subClass({
    imageMagick: true
});


module.exports = {
    s3, gm
};