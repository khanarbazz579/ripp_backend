const CustomField = require('../../models').custom_fields;

const {
  convertCsvVauleDataIntokey,
  countErrInCsvData,
  getFileLocation,
  NameExtentions
} = require('../../services/multipleLeadUpload.service');
const {
  fieldsWithAttribute
} = require('../../services/createAttributeForCustomFields');
const csv = require('fast-csv');
const fs = require("fs");

const updateErrorRecord = async function (req, res) {
  const {
    refName,
    updatedArray,
    pageNo,
    correctionCompleated
  } = req.body;
  let correctedErrcsvWriteStream;
  const upperLimit = pageNo * 50;
  const lowerLimit = upperLimit - 50;
  let counter = 0;
  let index = 0;
  // loction for storing csv files err
  const errorFileLoction = getFileLocation(refName, NameExtentions.error_file);
  const tempFile = getFileLocation(refName, NameExtentions.temp_file);
  if (!fs.existsSync(errorFileLoction)) {
    return ReE(res, {
      message: 'file does not exists on server'
    }, 422);
  }

  if (!updatedArray.length) {
    return ReE(res, {
      message: 'updated array is Blank'
    }, 422);
  }

  if (correctionCompleated) {
    const correctedfileLocation = getFileLocation(refName, NameExtentions.correct_file);
    const correctedErrfileLocation = getFileLocation(refName, NameExtentions.error_corrected_file);
    const isCorrectFileExists = fs.existsSync(correctedfileLocation)
    let options = {};
    if (isCorrectFileExists) {
      fs.copyFileSync(correctedfileLocation, correctedErrfileLocation);
      // fs.appendFileSync(correctedErrfileLocation, '\n');
      options = {
        flags: 'a',
        includeEndRowDelimiter: true
      };
    };

    // createing stream to handle the write opration corrected csv filr.
    correctedErrcsvWriteStream = csv.createWriteStream({
      headers: !isCorrectFileExists
    });

    const correctedErrWritableStream = fs.createWriteStream(correctedErrfileLocation, options);
    // piping the csv write opration
    correctedErrcsvWriteStream.pipe(correctedErrWritableStream);

    const customFieldIds = Object.keys(updatedArray[0]);
    var [err, custom_fields] = await to(CustomField.findAll({
      where: {
        id: customFieldIds
      },
      raw: true,
    }));
    [err, custom_fields] = await fieldsWithAttribute(custom_fields);
  };


  // createing stream to handle the write opration.
  const csvWriteStream = csv.createWriteStream({
      headers: true
    }),
    writableStream = fs.createWriteStream(tempFile);

  // creating stream for reading the file.
  const stream = fs.createReadStream(errorFileLoction);

  // handling the csv file read opration
  const csvStream = csv({
      objectMode: true,
      headers: true
    })
    .on("data", function (data) {
      let updatedData;
      if (lowerLimit <= counter && counter < upperLimit && updatedArray[index]) {
        updatedData = updatedArray[index];
        index++;
      } else {
        updatedData = data;
      };
      csvWriteStream.write(updatedData);
      counter++;
      if (correctionCompleated) {
        if (!countErrInCsvData(updatedData, custom_fields)) {
          const transformData = convertCsvVauleDataIntokey(updatedData, custom_fields);
          correctedErrcsvWriteStream.write(transformData);
        }
      }
    })
    .on("end", function () {
      csvWriteStream.end();
      if (correctionCompleated) {
        correctedErrcsvWriteStream.end();
      }
      fs.rename(tempFile, errorFileLoction, function (err) {
        //if (err) console.log('ERROR: ' + err);
      });
      return ReS(res, {
        updated: true
      }, 200);
    })
    .on("error", function (data) {
    //  return ReE(res, data, 422);
    });

  // piping the csv read opration
  stream.pipe(csvStream);

  // piping the csv write oprationc
  csvWriteStream.pipe(writableStream);

};

module.exports.updateErrorRecord = updateErrorRecord;