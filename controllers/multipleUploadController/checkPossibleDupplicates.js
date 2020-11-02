const CustomField = require('../../models').custom_fields;
const {
  leads_clients
} = require('../../models');
const {
  getFileLocation,
  NameExtentions,
  createIncludeModelStructure
} = require('../../services/multipleLeadUpload.service');
const csv = require('fast-csv');
const fs = require("fs");

const checkPossibleDupplicates = async function (req, res) {
  const {
    refName,
    duplicateCheck
  } = req.body;
  let duplicateCount = 0,
    totalCount = 0;

 /** checking if error updated file exist or not if error is updated then check duplicate record from the updated file else check from correct record file */
 const correctFileLoction = fs.existsSync(getFileLocation(refName, NameExtentions.error_corrected_file)) ? getFileLocation(refName, NameExtentions.error_corrected_file) : fs.existsSync(getFileLocation(refName, NameExtentions.correct_file)) ? getFileLocation(refName, NameExtentions.correct_file) : "notExist";
 
  if (!duplicateCheck || !duplicateCheck.length) {
   return fs.copyFile(correctFileLoction, getFileLocation(refName, NameExtentions.non_duplicate_record_file), (err) => {
      if (err) {
        return ReE(res, err, 422);
      }else{
        return ReS(res, {
          duplicateCount,
          totalCount
        }, 200);
      };
    });
  };

  if(correctFileLoction === "notExist"){
    return ReE(res, 'file not exist in server', 422);
  };
  
  const [err, custom_fields] = await to(CustomField.findAll({
    where: {
      id: duplicateCheck
    }
  }));

  

  // creating stream for reading the file.
  const stream = fs.createReadStream(correctFileLoction);

  // loction for storing csv files duplicate
  const duplicateRecordFileLoction = getFileLocation(req.body.refName, NameExtentions.duplicate_record_file);
  // createing stream to handle the write opration.
  const duplicateWriteStream = csv.createWriteStream({
      headers: true
    }),
    duplicateWritableStream = fs.createWriteStream(duplicateRecordFileLoction);

  // location for storing non duplicate data in the csv file
  const nonDuplicateRecordFileLocation = getFileLocation(req.body.refName, NameExtentions.non_duplicate_record_file);
  // createing stream to handle the write opration.
  const nonDuplicateWriteStream = csv.createWriteStream({
      headers: true
    }),
    nonDuplicateWritableStream = fs.createWriteStream(nonDuplicateRecordFileLocation);

  // handling the csv file read opration
  const csvStream = csv({
      headers: true,
      objectMode: true
    })
    .transform(function (data, next) {
      totalCount++
      const IncludeModelStructure = createIncludeModelStructure(data, custom_fields);
      leads_clients.count(IncludeModelStructure).then(count => {
        if (count) {
          duplicateCount++
          duplicateWriteStream.write(data)
        } else {
          nonDuplicateWriteStream.write(data);
        };
        next();
      });
    })
    .on("data", function (data) {

    })
    .on("end", function () {
      return ReS(res, {
        duplicateCount,
        totalCount
      }, 200);
    })
    .on("error", function (err) {
     // return ReE(res, err, 422);
    });

  // piping the csv write opration
  duplicateWriteStream.pipe(duplicateWritableStream);

  // piping the csv write opration
  nonDuplicateWriteStream.pipe(nonDuplicateWritableStream);

  // piping the csv read opration
  stream.pipe(csvStream);

};

module.exports.checkPossibleDupplicates = checkPossibleDupplicates;