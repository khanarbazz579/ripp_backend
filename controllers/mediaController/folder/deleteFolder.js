const db = require('../../../models');
const Files_Folders_Access = db.files_folders_accesses;
const File_Properties = db.file_properties;
const Files_Folders = db.files_folders;
const uploadToAws = require('../../../services/multerS3Service');

const deleteFolder = async (req, res) => {
  // console.log('-----------deleteFolder---1------------');
  let folderId = req.params.folderId;
  const userData = req.user.dataValues;
  let deletedFileFolderIds = [];
  [err, folderToDelete] = await to(Files_Folders_Access.findByPk(folderId));
  // check for folder owner

  if (!folderToDelete) {
    return res.json({ success: false, message: 'folder doesn\'t exist' });
  }

  if (folderToDelete.dataValues.user_id != userData.id) {
    return res.json({ success: false, message: 'You don\'t have the required permission' });
  } else if (folderToDelete && folderToDelete.dataValues.parent_id) {
    [err, parentFoldersId] = await to(db.sequelize.query(`select id, file_folder_id from (select * from files_folders_accesses order by id) files_folders_accesses, (select @pv := ${folderToDelete.dataValues.id}) initialisation where find_in_set(parent_id, @pv) > 0 and  @pv := concat(@pv, ',', id)`)); // , { type: db.sequelize.QueryTypes.SELECT }
    // console.log('-------23--------', folderToDelete.dataValues.id);
    // console.log('-------24--parentFoldersId[0]------', parentFoldersId[0]);

    parentFoldersId[0].push({ id: folderToDelete.dataValues.id });
    // console.log('-------25--------', parentFoldersId[0]);
    deletedFileFolderIds.push(folderToDelete.dataValues.file_folder_id);
    // console.log('-------29--------', deletedFileFolderIds);

    parentFoldersId = Array.prototype.map.call(parentFoldersId[0],
      (item) => {
        if (item.file_folder_id)
          deletedFileFolderIds.push(item.file_folder_id);
        return item.id;
      });
    // console.log('-----------deleteFolder---3------------', parentFoldersId);
    [err, FileDatas] = await to(
      Files_Folders_Access.findAll({
        where: {
          parent_id: { $in: parentFoldersId },
          entity_type: 'FILE'
        },
        include: [{
          model: File_Properties,
          attributes: ['path']
        }]
      }));

    // console.log('-------45--------', deletedFileFolderIds);

    // deletedFileFolderIds = parentFoldersId;
    let fileKeyObjects = [];

    for (let file in FileDatas) {
      // console.log('-----FileDatas[file].dataValues.file_property.dataValues.path-----', FileDatas[file].dataValues.file_property.dataValues.path);
      fileKeyObjects.push({ Key: FileDatas[file].dataValues.file_property.dataValues.path });
      deletedFileFolderIds.push(FileDatas[file].dataValues.file_folder_id)
    }
    // console.log('-------60--------', deletedFileFolderIds, fileKeyObjects);
    // return;

    if (fileKeyObjects.length > 0) {
      let deleteFilesFromAws = await uploadToAws.deleteFileFromAws(fileKeyObjects, true);
      if (!deleteFilesFromAws) {
        return res.json({ success: false, message: 'Something went wrong' });
      }
    }
    // delete from DB
    [err, folder] = await to(
      Files_Folders.destroy({
        where: {
          id: { $in: deletedFileFolderIds }
        }
      })
    );

    if (!err) {
      // delete 
      return res.json({ success: true, message: 'folder deleted' });
    }
  }
}

module.exports = deleteFolder;
