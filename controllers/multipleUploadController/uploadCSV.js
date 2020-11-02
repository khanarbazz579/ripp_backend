
const { getFileLocation } = require('../../services/multipleLeadUpload.service');
const csv = require('fast-csv');
const fs = require("fs");

const uploadCSV = async function (req, res) {
    let totalRecord = 0;
  
    const pathName = getFileLocation(req.body.refName, req.body.refName);
  
    const stream = fs.createReadStream(pathName);
    let fieldArray = [];
  
    // if (!fs.existsSync(pathName)) {
    //   return ReE(res, {
    //     message: 'file does not exists on server'
    //   }, 422);
    // };
  
    const csvStream = csv()
      .on("data", function (data) {
        if (totalRecord == 0) {
          data.forEach(element => {
            const tempObj = {
              header: element,
              preview: [],
              mappedValue: null,
              checkDuplicate: false
            };
            fieldArray.push(tempObj);
          });
        };
  
        if (totalRecord < 4) {
          data.forEach((element, indx) => {
            fieldArray[indx].preview[totalRecord - 1] = element;
          });
        }
        totalRecord++
      })
      .on("end", function () {
        return ReS(res, {
          totalRecord: totalRecord - 1,
          fieldArray: fieldArray
        }, 200);
      });
    stream.pipe(csvStream);
  };
  
  module.exports.uploadCSV = uploadCSV;

  const uploadCorrectedCSV = async function (req, res) {
    return ReS(res, {
      fieldArray: req.file
    }, 200);
  };
  
  module.exports.uploadCorrectedCSV = uploadCorrectedCSV;