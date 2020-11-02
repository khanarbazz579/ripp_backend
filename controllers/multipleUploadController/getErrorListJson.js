const {
  getFileLocation,
  NameExtentions
} = require('../../services/multipleLeadUpload.service');
const {
  getCustomFieldsOfType
} = require('../../services/createAttributeForCustomFields');
const csv = require('fast-csv');
const fs = require("fs");

const getErrorListJson = async function (req, res) {
  const pageNo = req.body.pageNo;
  const upperLimit = pageNo * 50;
  const lowerLimit = upperLimit - 50;
  let res_json = [];
  let counter = 0;
  // loction for storing csv files err
  const errorFileLoction = getFileLocation(req.body.refName, NameExtentions.error_file);
  if (!fs.existsSync(errorFileLoction)) {
    return ReE(res, {
      message: 'file does not exists on server'
    }, 422);
  }
  // creating stream for reading the file.
  const stream = fs.createReadStream(errorFileLoction);
  // handling the csv file read opration
  const onData = function (data) {
    if (lowerLimit <= counter && counter < upperLimit) {
      res_json.push(data);
    };
    if (res_json.length == upperLimit) {
      csvStream.emit('donereading');
    };
    counter++;
  };

  const onEnd = async function () {
    const sectionType = "lead";
    const [_, fields] = await getCustomFieldsOfType(sectionType);
    let headerArray = []
    if (fields && res_json[0]) {
      Object.keys(res_json[0]).forEach(key => {
        const field = fields.find(fieldElement => {
          return fieldElement.id == key;
        })
        headerArray.push(field);
      });
    };
    return ReS(res, {
      res_json: res_json,
      headerArray: headerArray
    }, 200);
  };

  const csvStream = csv({
      headers: true,
      objectMode: true
    })
    .on("data", onData)
    .on("end", onEnd)
    .on("error", function (data) {
      //return ReE(res, data, 422);
    })
    .on('donereading', function () {
      stream.close();
      csvStream.removeListener('data', onData);
      csvStream.emit("end");
    });
  // piping the csv read opration
  stream.pipe(csvStream);
};

module.exports.getErrorListJson = getErrorListJson;