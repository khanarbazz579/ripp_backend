const models = require('../../../models');
const validChildType = ['FILE', 'FOLDER'],
Share_Files_Folders = models.share_files_folders;

const removeFromShared = async (req, res) => {

  if (!validChildType.includes(req.body.type) || !req.body.id) {
    return res.json({ success: false, message: 'Invalid data' });
  }
  const {id} = req.body;
  const loggedInUser = req.user.id;

  const [err, accessToUpdate] = await to(
    models.files_folders_accesses.findOne({
      where: {
        id
      }
    })
  );

  console.log('---------remove ----------', err, accessToUpdate);

  if (!err && accessToUpdate) {
    
    const [error, accessDataUpdated] = await to(Share_Files_Folders.destroy({
      where:{
        file_folder_access_id: id,
        user_id: loggedInUser
      }
    }));
  
    if (error) {
      return res.json({ success: false, message: error });
    }

    return ReS(res, { success: true, message: "Removed from your shared." }, 200);

  } else {
    return res.json({ success: false, message: 'file/folder not valid.' });
  }
}
module.exports = removeFromShared;
