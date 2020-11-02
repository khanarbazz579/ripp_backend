
const {
  getFileLocation,
  NameExtentions
} = require('../../services/multipleLeadUpload.service');

const fs = require("fs");

const downloadErrorCSV = async function (req, res) {
  const filePath = getFileLocation(req.body.refName, NameExtentions.error_file);
  if (!fs.existsSync(filePath)) {
    return ReE(res, {
      message: 'file does not exists on server'
    }, 422);
  }
  return res.download(filePath);
};

module.exports.downloadErrorCSV = downloadErrorCSV;


const downloadDuplicateRecordCSV = async function (req, res) {
  const filePath = getFileLocation(req.body.refName, NameExtentions.duplicate_record_file);
  if (!fs.existsSync(filePath)) {
    return ReE(res, {
      message: 'file does not exists on server'
    }, 422);
  }
  return res.download(filePath);
};

module.exports.downloadDuplicateRecordCSV = downloadDuplicateRecordCSV;



const downloadOriginalCSV = async function (req, res) {
  const filePath = getFileLocation(req.body.refName,req.body.refName);
  if (!fs.existsSync(filePath)) {
    return ReE(res, {
      message: 'file does not exists on server'
    }, 422);
  }
  return res.download(filePath);
};

module.exports.downloadOriginalCSV = downloadOriginalCSV;