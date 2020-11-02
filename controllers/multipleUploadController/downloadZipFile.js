const {
    getFileLocation
} = require('../../services/multipleLeadUpload.service');

var fs = require('fs');
var archiver = require('archiver');

const downloadZipFile = async function (req, res) {
    const {
        refNames
    } = req.body;
    const zippedFileName = "" + new Date().getTime() + '.zip';
    const zippedFilePath = 'public/zipped/' + zippedFileName;
    var output = fs.createWriteStream(zippedFilePath);

    var archive = archiver('zip', {
        zlib: {
            level: 9
        } // Sets the compression level.
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function () {

        if (!fs.existsSync(zippedFilePath)) {
            return ReE(res, {
                message: 'file does not exists on server'
            }, 422);
        };
        
        res.attachment(zippedFileName);
        var filestream = fs.createReadStream(zippedFilePath);
        return filestream.pipe(res)
            .on('data', (data) => {
                // retrieve data
               // console.log('----something weird happen---data----');
            })
            .on('finish', () => {
                // stream has ended
              //  console.log('stream has been downloaded');
                fs.unlinkSync(zippedFilePath);
            })
            .on('error', (error) => {
                console.error('----something weird happen---', error);
            });
    });

    // // This event is fired when the data source is drained no matter what was the data source.
    // // It is not part of this library but rather from the NodeJS Stream API.
    // // @see: https://nodejs.org/api/stream.html#stream_event_end
    // output.on('end', function () {
    //     console.log('Data has been drained');
    // });

    // // good practice to catch warnings (ie stat failures and other non-blocking errors)
    // archive.on('warning', function (err) {
    //     if (err.code === 'ENOENT') {
    //         // log warning
    //     } else {
    //         // throw error
    //         throw err;
    //     }
    // });

    // // good practice to catch this error explicitly
    // archive.on('error', function (err) {
    //     throw err;
    // });

    // pipe archive data to the file
    archive.pipe(output);

    refNames.forEach(fileName => {
        const filePath = getFileLocation(fileName,fileName);
        archive.append(fs.createReadStream(filePath), {
            name: `${fileName}.csv`
        });
    });

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();
};

module.exports.downloadZipFile = downloadZipFile;