const {
  NameExtentions
} = require('../../services/multipleLeadUpload.service');

const fs = require("fs");

const deleteCSV = async function (req, res) {
 const [ err, success ] = deleteRefFolder(req.body.refName);
  if(err){
    return ReE(res, {
      err: err,
      message: "file does not exists on server"
    }, 422);
  };

  return ReS(res, {
    fileDelete: success,
    message: "file deleted successfully"
  }, 200);
};

const deleteRefFolder = (refName) => {
  const directory_location = NameExtentions.uploadDir + refName;
  if (!fs.existsSync(directory_location)) {
     return [ "file does not exits in server", false ];
  };
  fs.readdirSync(directory_location).forEach(function (file, index) {
    const curPath = directory_location + "/" + file;
    if(fs.existsSync(curPath)){
      fs.unlinkSync(curPath);
    }
  });
  fs.rmdirSync(directory_location);
  return [ false, true ];
} 

module.exports.deleteCSV = deleteCSV;
module.exports.deleteRefFolder = deleteRefFolder;