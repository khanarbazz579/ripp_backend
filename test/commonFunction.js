const http = require('http');
const db = require('../models');
const multerS3Service = require('../services/multerS3Service');

modelsCollections = [
  'lead_additional_fields',
  'supplier_details',
  'call_lists',
  'call_outcomes',
  'call_outcomes_transitions',
  'contacts',
  'contact_details',
  'companies',
  'company_details',
  'countries',
  'currencies',
  'custom_fields',
  'custom_filters',
  'custom_filter_fields',
  'event_recipients',
  'events',
  'files',
  'folders',
  'histories',
  'leads_clients',
  'lead_client_details',
  'lost_lead_identifiers',
  'lost_lead_fields',
  'meeting_rooms',
  'password_resets',
  'repeatable_events',
  'sales_stages',
  'sales_stage_transitions',
  'sections',
  'suppliers',
  'states',
  'tasks',
  'notes',
  'users',
  'user_roles',
  'permission_sets',
  'campaigns',
  'subscriber_lists',
  'email_lists',
  'share_files_folders',
  'share_guest_users',
  'events',
  'event_recipients',
  'todo_contacts',
  'categories',
  'email_providers',
  'mailer_tokens',
  'email_users',
  'user_has_permissions',
  'user_has_permission_sets',
  'permission_sets_has_permissions',
  'permission',
  'notifications',
  'file_categories'
];

const clearTable = async (modelName) => {
  return db[modelName].destroy({ truncate: { cascade: true } });
}

// Add data to table
const addDataToTable = async (modelName, body) => {
  [err, dataCreated] = await to(db[modelName].create(body));
  if (err) {
    console.log('----addDataToTable----' + modelName, err);
  }

  return (!err && dataCreated) ? dataCreated.dataValues : {};
}

// Add data to table
const addBulkDataToTable = async (modelName, body) => {
  [err, dataCreated] = await to(db[modelName].bulkCreate(body).map(e => e.get({ plain: true })));
  if (err) {
    console.log('------addBulkDataToTable----', err);
  }

  return (!err && dataCreated) ? dataCreated : [];
}

const sequalizedDb = async (modelArray = []) => {
  const model = (modelArray.length > 0) ? modelArray : modelsCollections;
  for (let index = 0; index < model.length; index++) {
    await clearTable(model[index]);
  }
};

const removeFolderFromAws = async (path) => {
  return await multerS3Service.deleteFoldersFromAws(path);
}

const getObjectFromAws = async (path) => {
  // console.log('----getObjectFromAws---', path)
  return new Promise((resolve, reject) => {
    multerS3Service.getObjectFileByPath(path, (error, response) => {
      // console.log('----response----', response);
      if (error) {
        resolve(false);
      }
      resolve(true);
    });
  });
}

const encodeToBase64 = (object) =>{
  let data = JSON.stringify(object);
  let buf = Buffer.from(data);
  return buf.toString('base64');

}

// const httpRequest = {
//   get: url => {
//     return (new Promise(function(resolve, reject) {
//       http.get(url, res => {
//         resolve(res);
//       });
//     }));
//   },
//   post: (url, data) => {
//     return (new Promise(function(resolve, reject) {
//       http.post(url, data, res => {
//         resolve(res);
//       });
//     }));
//   }
// };

module.exports = {
  clearTable,
  addDataToTable,
  sequalizedDb,
  addBulkDataToTable,
  removeFolderFromAws,
  getObjectFromAws,
  encodeToBase64
  // httpRequest
};
