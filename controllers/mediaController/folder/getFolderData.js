const Files_Folders_Access = require('../../../models').files_folders_accesses;

/**
 * Get folder data folder wise
 * @param {object} req 
 * @param {object} res 
 */
const getFolderData = async (req, res) => {
  [err, data] = await to(
    Files_Folders_Access.findAll({
      where: {
        user_id: req.user.id, 
        entity_type: 'FOLDER',
        is_guest: req.user.is_guest
      },
      order: [
        ['id', 'ASC']
      ]
    })
  );
  if (data) {
    return res.json({ success: true, message: 'folders recieved', data: data });
  }
}

/**
 * Get folder detail by id
 * @param {object} req 
 * @param {object} res 
 */
const getFolderById = async (req, res) => {
  [err, folder] = await to(Files_Folders_Access.findByPk(req.params.folder_id));
  if (data) { 
    return res.json({ success: true, message: 'folder recieved', data: folder });
  }
}

module.exports = { getFolderData, getFolderById };
