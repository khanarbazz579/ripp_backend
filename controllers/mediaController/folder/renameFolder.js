// const Folders = require('../../../models').folders;
const Files_Folders_Access = require('../../../models').files_folders_accesses;
// const uploadToAws = require('../../../services/multerS3Service');
const Users = require('../../../models').users;
const commonFunction = require('../../../services/commonFunction');

const renameFolder = async (req, res) => {
  let folderData = req.body.parentFolder;
  let newNameFolder = req.body.subFolderName;

  // console.log('-----rename---folder-----', req.body);
  // get existance folder
  [err, folderBody] = await to(Files_Folders_Access.findByPk(folderData.id));

  
  if (!err && folderBody) {
    // check duplicacy by parentID and name
    [err, checkDuplicate] = await to(
      Files_Folders_Access.findOne(
        {
          where: { name: newNameFolder, parent_id: folderData.parent_id }
        }
      ));
    if (!checkDuplicate) {
      [err, folder] = await to(
        Files_Folders_Access.update({ name: newNameFolder }, {
          where: { id: folderData.id }
        })
      );
      if (!err && folder) {
        let model = await commonFunction.mediaCommonFunction.getCurrentUserModel(req.user.is_guest);

        [err, updatedFolder] = await to(
          Files_Folders_Access.findOne(
            {
              where: { id: folderData.id },
              include: [
                model
              ]
            }  
          ));
        if(updatedFolder){
          return ReS(res,{success: true, message: 'Folder name updated', data: updatedFolder.dataValues});
        }
      }
    } else {
      // send error same name already exist
      return res.json({ success: false, message: 'Folder already exist.' });
    }
  } else {
    return res.json({ success: false, message: 'Folder invalid.' });
  }
}

module.exports = renameFolder;
