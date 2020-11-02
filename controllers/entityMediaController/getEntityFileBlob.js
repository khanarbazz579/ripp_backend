const EntityFile = require('../../models').entity_files;
const uploadToAws = require('../../services/multerS3Service');
const commonFunction = require('../../services/commonFunction');


const getFileInBlob = async (req, res) => {
  const fileId = req.params.id;
  let [err, file] = await to(
    EntityFile.findByPk(fileId)
  );
  if (err) {
    return ReE(res, err, 422);
  }
  if (!file) {
    return res.json({ success: false, message: 'File not exist', data: [] });
  }

  uploadToAws.getObjectByPath(file.path, async (error, s3Stream) => {
    s3Stream.on('error', function (error) {
      res.json({ success: false, message: 'something weird happen', error: error, data: null });
    });
    res.attachment(file.name);
    s3Stream.pipe(res)
    .on('data', (data) => {
        // retrieve data
      })
    .on('end', () => {
        // stream has ended
      })
    .on('error', (error) => {
        res.json({ success: false, message: 'something weird happen', error: error, data: null });
      });
  })
}

module.exports = getFileInBlob;