
const getstatus = function (statusName = '') {
    let statusObject = {
        1: 'SCHEDULED',
        2: 'DRAFT',
        3: 'COMPLETED',
        4: 'DELETED',
        5: 'SENDING'
    };
    if ('' != statusName) {
        return getKeyByValue(statusObject, statusName);
    }
    return statusObject;
}

module.exports.getstatus = getstatus;

const getKeyByValue = function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}
module.exports.getKeyByValue = getKeyByValue;