const commonFunction = require('../../../services/commonFunction');
const Files_Folders_Access = require('../../../models').files_folders_accesses;

/**
 * Get childs of folders and files
 * @param {object} req 
 * @param {object} res 
 */
const getFolderChilds = async (req, res) => {


  let [err, folderExist] = await to(Files_Folders_Access.findByPk(req.params.folder_id));

  if (err) {
    return res.json({
      success: false,
      message: 'Something went wrong!'
    })
  }

  if (!folderExist) {
    return res.json({ success: false, message: 'No such folder exists!' });
  }

  let folder_id = req.params.folder_id;
  const data = await commonFunction.mediaCommonFunction.getChildOfFolder(folder_id, req.params['childType'], req.user.is_guest) || [];
  return res.json({ success: true, message: 'it worked', data: data });
}

module.exports = getFolderChilds;
