const CustomField = require('../../models').custom_fields;
const {
  leads_clients,
  contacts,
  companies,
  lead_client_details,
  contact_details,
  company_details
} = require('../../models');
const {
  smtpTransport,
  getFileLocation,
  NameExtentions,
  createIncludeModelStructure,
  createIncludeModelStructureForUpload,
  createModelStructureForUpdate
} = require('../../services/multipleLeadUpload.service');
const {
  deleteRefFolder
} = require("./deleteCSV");
const csv = require('fast-csv');
const fs = require("fs");

const uploadRecordToDB = async function (req, res) {
  const {
    refName,
    headerArray,
    importType,
    duplicateCheck
  } = req.body;
  user = req.user

  if (!headerArray.length) {
    return ReE(res, 'Blank header array', 422);
  };

  const [err, custom_fields] = await to(CustomField.findAll({
    where: {
      id: headerArray
    },
    raw: true
  }));

  switch (importType) {
    case "importOnlyNonDuplicateRecord":
      importOnlyNonDuplicateRecord({
        custom_fields,
        refName,
        user
      });
      break;
    case "importAllDuplicateRecord":
      importAllDuplicateRecord({
        custom_fields,
        refName,
        user
      });
      break;
    case "importOnlyNewFieldData":
      importOnlyNewFieldData({
        custom_fields,
        refName,
        user,
        duplicateCheck
      });
      break;
    case "replaceAllDuplicateData":
      replaceAllDuplicateData({
        custom_fields,
        refName,
        user,
        duplicateCheck
      });
      break;
    default:
      importOnlyNonDuplicateRecord({
        custom_fields,
        refName,
        user
      });
      break;
  };

  return ReS(res, {
    importType
  }, 200);
};

const importOnlyNonDuplicateRecord = ({
  custom_fields,
  refName,
  user
}) => {
  // location for storing correct data in the csv file
  const fileLocation = getFileLocation(refName, NameExtentions.non_duplicate_record_file);

  // creating stream for reading the file.
  const stream = fs.createReadStream(fileLocation);

  // handling the csv file read opration
  const csvStream = csv({
      headers: true,
      objectMode: true
    })
    .transform(function (data, next) {
      const {
        req_body,
        includedArr
      } = createIncludeModelStructureForUpload(data, custom_fields, user.id);

      leads_clients.create(req_body, {
        include: includedArr
      }).then(data => {
        next();
      });
    })
    .on("data", function (data) {

    })
    .on("end", function () {
      deleteRefFolder(refName);
      sendMailAfterUpload(user);
    })
    .on("error", function (data) {});

  // piping the csv read opration
  stream.pipe(csvStream);
};

const importAllDuplicateRecord = ({
  custom_fields,
  refName,
  user
}) => {

  // location for storing correct data in the csv file
  const fileLocation = getFileLocation(refName, NameExtentions.duplicate_record_file);

  // creating stream for reading the file.
  const stream = fs.createReadStream(fileLocation);

  // handling the csv file read opration
  const csvStream = csv({
      headers: true,
      objectMode: true
    })
    .transform(function (data, next) {

      const {
        req_body,
        includedArr
      } = createIncludeModelStructureForUpload(data, custom_fields, user.id);

      leads_clients.create(req_body, {
        include: includedArr
      }).then(data => {
        next();
      });
    })
    .on("data", function (data) {

    })
    .on("end", function () {
      importOnlyNonDuplicateRecord({
        custom_fields,
        refName,
        user
      });
    })
    .on("error", function (data) {});

  // piping the csv read opration
  stream.pipe(csvStream);
};


const importOnlyNewFieldData = ({
  custom_fields,
  refName,
  user,
  duplicateCheck
}) => {
  // location for storing correct data in the csv file
  const fileLocation = getFileLocation(refName, NameExtentions.duplicate_record_file);
  // creating stream for reading the file.
  const stream = fs.createReadStream(fileLocation);

  removeCustomFieldIdfromArray(duplicateCheck, custom_fields);

  // handling the csv file read opration
  const csvStream = csv({
      headers: true,
      objectMode: true
    })
    .transform(function (data, next) {

      duplicateCheck.forEach(element => {

        if (data[element]) {
          data[element] = '';
        };
      });

      const {
        req_body,
        includedArr
      } = createIncludeModelStructureForUpload(data, custom_fields, user.id);

      leads_clients.create(req_body, {
        include: includedArr
      }).then(data => {
        next();
      });
    })
    .on("data", function (data) {

    })
    .on("end", function () {
      importOnlyNonDuplicateRecord({
        custom_fields,
        refName,
        user
      });
    })
    .on("error", function (data) {});

  // piping the csv read opration
  stream.pipe(csvStream);
};


const replaceAllDuplicateData = ({
  custom_fields,
  refName,
  user,
  duplicateCheck
}) => {
  // location for storing correct data in the csv file
  const fileLocation = getFileLocation(refName, NameExtentions.duplicate_record_file);

  // creating stream for reading the file.
  const stream = fs.createReadStream(fileLocation);

  let duplicate_check_custom_fields = [];

  custom_fields.forEach(field => {
    if (duplicateCheck.includes(field.id)) {
      duplicate_check_custom_fields.push(field);
    };
  });
  // handling the csv file read opration
  const csvStream = csv({
      headers: true,
      objectMode: true
    })
    .transform(function (data, next) {
      const IncludeModelStructure = createIncludeModelStructure(data, duplicate_check_custom_fields);
      leads_clients.findAll(IncludeModelStructure).then(leads_client_data => {
        const lead_client_ids = leads_client_data.map(value => value.id);
        const {
          req_body
        } = createModelStructureForUpdate(data, custom_fields, duplicate_check_custom_fields);

        leads_clients.update(req_body['leads_clients']['reqBody'], {
          where: {
            ...req_body['leads_clients']['where'],
            id: lead_client_ids
          }
        }).then(updated => {
          lead_client_ids.forEach(lead_client_id => {
            if (req_body.leads_clients.childObj.length) {
              req_body.leads_clients.childObj.forEach(child => {
                lead_client_details.findOrCreate({
                  where: {
                    ...child.where,
                    lead_client_id: lead_client_id,
                  },
                  defaults: {
                    ...child.reqBody,
                    lead_client_id: lead_client_id,
                  }
                }).spread(function (lead_client_detail, created) {
                  if (!created) {
                    lead_client_detail.update(child.reqBody)
                  };
                });
              });
            };

            req_body['companies']['reqBody'].name = req_body['companies']['reqBody'].name || '';
            companies.findOrCreate({
              where: {
                ...req_body['companies']['where'],
                entity_id: lead_client_id
              },
              defaults: {
                ...req_body['companies']['reqBody'],
                entity_id: lead_client_id
              }
            }).spread((company, created) => {
              if (!created && company) {
                company.update(req_body['companies']['reqBody']);
                req_body['companies']['childObj'].forEach(child => {
                  company_details.findOrCreate({
                    where: {
                      company_id: company.id,
                      ...child.where
                    },
                    defaults: {
                      company_id: company.id,
                      ...child.reqBody
                    }
                  }).spread(function (company_detail, created) {
                    if (!created) {
                      company_detail.update(child.reqBody);
                    };
                  });
                });
              };
            });

            contacts.findAll({
              where: {
                ...req_body['contacts']['where'],
                entity_id: lead_client_id
              },
              defaults: {
                ...req_body['contacts']['reqBody'],
                entity_id: lead_client_id
              }
            }).spread((contact, created) => {
              if (!created && contact) {
                contact.update(req_body['contacts']['reqBody']);
                req_body['contacts']['childObj'].forEach(child => {
                  contact_details.findOrCreate({
                    where: {
                      contact_id: contact.id,
                      ...child.where
                    },
                    defaults: {
                      contact_id: contact.id,
                      ...child.reqBody
                    }
                  }).spread(function (contact_detail, created) {
                    if (!created) {
                      contact_detail.update(child.reqBody);
                    };
                  });
                });
              };
            });

          });

          next();

        });

      });
    })
    .on("data", function (data) {

    })
    .on("end", function () {
      importOnlyNonDuplicateRecord({
        custom_fields,
        refName,
        user
      });
    })
    .on("error", function (data) {});

  // piping the csv read opration
  stream.pipe(csvStream);
};

const sendMailAfterUpload = async function (user) {
  const mailOptions = {
    to: user.email,
    from: 'no-reply@ripplecrm.com',
    subject: 'Ripple Admin - Your CSV Import Has Been Completed',
    text: `Hi ${user.first_name} ${user.last_name},\n
          Your CSV upload is now complete.
          If you require any further help with uploads please visit our help section or contact our support team.\n
          Kind Regards 
          Ripple Team`
  };

  //verify connection configuration
 await smtpTransport.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  await smtpTransport.sendMail(mailOptions, async (err, resp) => {
    if (err) throw err;
    return resp;
  });
};

const removeCustomFieldIdfromArray = (array, custom_fields) => {
  const saleStageCustomField = custom_fields.find(field => field.control_type == 'sales_stage');
  if (saleStageCustomField && saleStageCustomField.id) {
    const index = array.indexOf(saleStageCustomField.id);
    array.splice(index);
  }
}



module.exports.uploadRecordToDB = uploadRecordToDB;