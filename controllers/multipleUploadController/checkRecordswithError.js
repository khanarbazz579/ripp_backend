const {
  convertCsvVauleDataIntokey,
  countErrInCsvData,
  getFileLocation,
  NameExtentions,
} = require('../../services/multipleLeadUpload.service');
const {
  fieldsWithAttribute
} = require('../../services/createAttributeForCustomFields');
const CustomField = require('../../models').custom_fields;
const csv = require('fast-csv');
const fs = require("fs");

const checkRecordswithError = async function (req, res) {
  const header = req.body.headerMapping;
  let errorCount = 0;
  let correctRecCount = 0;
  // location of csv file with ref name
  const pathName = getFileLocation(req.body.refName, req.body.refName);

  if (!fs.existsSync(pathName)) {
    return ReE(res, {
      message: 'file does not exists on server'
    }, 422);
  }

  let [err, customFields] = await to(CustomField.findAll({
    where: {
      id: header
    }
  }));
  [err, customFields] = await fieldsWithAttribute(customFields);

  // loction for storing csv files err
  const errorFileLoction = getFileLocation(req.body.refName, NameExtentions.error_file);
  // createing stream to handle the write opration.
  const csvErrWriteStream = csv.createWriteStream({
      headers: true
    }),
    writableStream = fs.createWriteStream(errorFileLoction);

  // location for storing correct data in the csv file
  const correctFileLoction = getFileLocation(req.body.refName, NameExtentions.correct_file);
  // createing stream to handle the write opration.
  const csvNoErrWriteStream = csv.createWriteStream({
      headers: true,
      includeEndRowDelimiter: true
    }),
    noErrWritableStream = fs.createWriteStream(correctFileLoction, {
      includeEndRowDelimiter: true
    });

  // creating stream for reading the file.
  const stream = fs.createReadStream(pathName);

  // handling the csv file read opration
  const csvStream = csv({
      headers: header,
      objectMode: true,
      discardUnmappedColumns: true,
      renameHeaders: true
    })
    .on("data", function (data) {
      delete data['null'];
      if (countErrInCsvData(data, customFields)) {
        csvErrWriteStream.write(data);
        errorCount++;
      } else {
        correctRecCount++;
        const transformData = convertCsvVauleDataIntokey(data, customFields);
        console.log("================================>",transformData);
        csvNoErrWriteStream.write(transformData);
      };
    })
    .on("end", function () {
      csvErrWriteStream.end();
      csvNoErrWriteStream.end();
      return ReS(res, {
        errorCount: errorCount
      }, 200);
    })
    .on("error", function (data) {
    //  return ReE(res, data, 422);
    });

  // piping the csv read opration
  stream.pipe(csvStream);

  // piping the csv write opration
  csvErrWriteStream.pipe(writableStream);

  // handle the finish opration
  writableStream.on("finish", function () {
  });

  // piping the csv write opration
  csvNoErrWriteStream.pipe(noErrWritableStream);

  // handle the finish opration
  noErrWritableStream.on("finish", function () {
    if (!correctRecCount) {
      fs.unlinkSync(correctFileLoction);
    };
  });

};

module.exports.checkRecordswithError = checkRecordswithError;