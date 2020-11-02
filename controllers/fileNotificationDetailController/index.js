const create = require('./create');
const update = require('./update');
const getAll = require('./getAll');
const bulkUpdate = require('./bulkUpdate');
const getFileNotificationReadStatus = require('./getFileNotificationReadStatus');
module.exports = {
    create: create,
    update: update,
    getAll: getAll,
    bulkUpdate: bulkUpdate,
    getFileNotificationReadStatus: getFileNotificationReadStatus
}
