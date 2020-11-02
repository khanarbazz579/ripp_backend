const commonFunction = require('../../../services/commonFunction');

addFolder = async (req, res) => {
  // console.log('-----add-----folder-----', req.body);
  if (req.body.parentFolder['name'] === 'My Files') {
    req.body.parentFolder['name'] = req.body.parentFolder['realName'];
  }
  return res.json(await commonFunction.mediaCommonFunction.saveFolderIntoDb(req.body.parentFolder, req.body.subFolderName, req.user));
}

module.exports = addFolder;