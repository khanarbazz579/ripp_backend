const uploadToAws = require('../../services/multerS3Service');

const getEntityImagePreview = async (req, res) => {
  let fileObject = req.body.fileObject;

  uploadToAws.getObjectFileByPath(fileObject.path , async (error, response) => {
    if (!error) {
      bufferImage = response.Body.toString('base64');
      return res.json({ success: true, message: 'File Recieved Successfully', data: bufferImage }); 
    }
    return res.json({ success: false, message: 'File not found', data: null });
  });
};

module.exports = getEntityImagePreview