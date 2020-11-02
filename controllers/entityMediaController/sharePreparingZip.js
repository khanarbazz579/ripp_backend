const fs = require('fs');
const join = require('path').join;
const s3Zip = require('s3-zip');
const commonFunction = require('../../services/commonFunction');
const EntityFile  = require('../../models').entity_files;

const { s3: s3Client } = require('../../services/AwsInstance');

const preparingZip = async (req, res) => {
    const requestedFiles = req.body.files;
    const zippedFileName = new Date().getTime();
    if (requestedFiles.length > 0) {
        // set those files and get those from AWS
        const output = fs.createWriteStream('public/zipped/' + zippedFileName + '.zip');
        const filesAwsPath = await getFilesPathInArray(requestedFiles, req.user.id);
        // console.log('---filesAwsPath----', filesAwsPath);
        s3Zip.archive({ s3: s3Client, bucket: 'devsubdomainfiles' }, '', filesAwsPath).pipe(output);

        output.on('finish', function () {
            console.log('archiver has been finalized and the output file descriptor has closed.');
            if (process.env.NODE_ENV !== 'test') {
                io.emit('zippedEntityFileCreated', zippedFileName);
            }
        });
        return res.json({ success: true, message: 'zipped file in progress', data: { filename: zippedFileName, noOfFiles: requestedFiles.length } });
    } else {
        return res.json({ success: false, message: 'select some files' });
    }
}

async function getFilesPathInArray(requestedFiles, userid) {
    let filesAwsPath = []
    // get all files by array of IDS
    const query = {
        id: {
            $in: requestedFiles
        }
    }
    let [error, filesData] = await to(
        EntityFile.findAll({
            where: query
        }));
    if (error) {
        console.log('----------------error----------------', error);
        return filesAwsPath;
    }
    // console.log('------filesData-----', filesData);
    for (var i = 0; i < filesData.length; i++) {
        // console.log('------requestedFiles------', filesData[i].dataValues.file_property.dataValues);
        filesAwsPath.push(filesData[i].path);
    }
    return filesAwsPath;
}

const downloadExistingZippedFile = (req, res) => {

    var filename = req.params.filename + '.zip';
    
    // console.log('-------req------', req.params)
    var file = 'public/zipped/' + filename;
    res.attachment(filename);
    var filestream = fs.createReadStream(file);
    filestream.pipe(res)
        .on('data', (data) => {
            // retrieve data
            console.log('----something weird happen---data----');
        })
        .on('finish', () => {
            // stream has ended
            console.log('stream has been downloaded');
            fs.unlinkSync(file);
        })
        .on('error', (error) => {
            console.error('----something weird happen---', error);
        });
}

module.exports = { preparingZip, downloadExistingZippedFile };;