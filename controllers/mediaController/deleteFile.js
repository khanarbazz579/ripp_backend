const db = require('../../models');
const Files_Folders_Access = db.files_folders_accesses;
const File_Properties = db.file_properties;
const Files_Folders = db.files_folders;

const uploadToAws = require('../../services/multerS3Service');
const commonFunction = require('../../services/commonFunction');

const deleteFile = async (req, res) => {

  const { fileId } = req.params;
  const userData = req.user.dataValues;

  let file = await commonFunction.mediaCommonFunction.getFileByIdWithUser(fileId);
  if (file) {
    // check for file owner
    if (file.dataValues.user_id != userData.id) {
      return res.json({ success: false, message: 'You don\'t have the required permission' });
    }
    
    if (file.dataValues.id !== null) {
  

       deleteAllSharedChilds({refrence_id:file.dataValues.id});//Passing the main file id which is selected for deletion 

       [err,deletedFile] = await to(Files_Folders_Access.destroy({
        where: {
          id: fileId,
        }
      })
      );
         await to(db['share_files_folders'].destroy({
        where: { 
          file_folder_access_id: file.dataValues.refrence_id,
          user_id: userData.id  
        }
      }))
    } else {
     // delete from AWS
      let deleteFileFromAws = await uploadToAws.deleteFileFromAws(file.dataValues.file_property.dataValues.path);
      // if (!deleteFileFromAws) {
      //   return res.json({ success: false, message: 'Something went wrong' });
      // }

      // check large image and delete
      const deleteLargeImage = await commonFunction.mediaCommonFunction.removeLargeImage(file.dataValues.file_property.dataValues, uploadToAws.deleteFileFromAws);
      // if (!deleteLargeImage) {
      //    return res.json({ success: false, message: 'Something went wrong' });
      // }
      // icon

      if (S3_MEDIA.allowed_image_file_extensions.indexOf(file.dataValues.type) > -1) {
        let iconName = file.dataValues.file_property.dataValues.path.split('/') || [];
        iconName = iconName[iconName.length - 1];
        await uploadToAws.deleteFileFromAws(`${S3_MEDIA.thumbnailUrl}${userData.email}/${iconName}`);
      }
      
      [err] = await to( 
        Files_Folders.destroy({
          where: { id: file.dataValues.file_folder_id }
        })
      );
    }


    if (err) {
      console.log("Errrorrr ===>",err);
      return res.json({ success: false, message: 'Something went wrong' });
    }
    return res.json({ success: true, message: 'Deleted succesfully' });
  } else {
    return res.json({ success: false, message: 'File doesn\'t exists' });
  }
}



module.exports = deleteFile;

//These method is for deleting the chidlren and sub-children of files. 
deleteAllSharedChilds = async(query) => {
  
    let deletedFileId = [];
    let [error,filesFoldersAccess] = await to(
        Files_Folders_Access.findAll({
            where:query
        })
    );
    if(error){
//        return res.json({ success: false, message: "somthing went wrong." });
    }else{
     for (let i = 0; i < filesFoldersAccess.length; i++) {           
        let fileObj = filesFoldersAccess[i];
        
        deletedFileId.push(fileObj.dataValues.id);
      
       [error, fileSizeUpdate] = await to(
            Files_Folders_Access.destroy({
                where:query
            })     
        );    
    }

    if(deletedFileId.length){
        deleteAllSharedChilds({
            refrence_id:{ 
                $in: deletedFileId 
            }         
        })
    }
    }
}

