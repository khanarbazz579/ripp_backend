  const Users = require('../../models').users;
const Share_Files_Folders = require('../../models').share_files_folders;
const Files_Folders_Access = require('../../models').files_folders_accesses;
const File_Properties = require('../../models').file_properties;
const commonFunction = require('../../services/commonFunction');

/**
 * Search files by name
 * @param {object} req 
 * @param {object} res 
 */
const searchFileByName = async (req, res) => {

  const queryName = req.body.name;
  let data = [];
  if (queryName) {
    [err, FileData] = await commonFunction.mediaCommonFunction.getFileFolderDataByQuery({
      name: { 
        $like: '%'+ queryName  + '%' 
      },
      user_id: req.user.id,
      is_guest: req.user.is_guest
    });
    if(err){
      console.log("errrrr=-------------------",err);
    }
    if (!err) {
      if (FileData.length > 0) {
        for (const items of FileData) {
          if(items) {
          let fileProp = items.dataValues.file_property.dataValues;   
          let iconName = fileProp['path'].split('/') || [];
          iconName = iconName[iconName.length - 1];
          let size = await commonFunction.mediaCommonFunction.formatBytes(fileProp['size'] || 0);
          let sharedCount = await commonFunction.mediaCommonFunction._getFileShares(items.dataValues.file_folder_id);
          items.dataValues['sizeInBytes'] = fileProp['size'];
          items.dataValues['size'] = size;
          items.dataValues['isImage'] = (S3_MEDIA.allowed_image_file_extensions.indexOf(items.file_property['mimetype']) > -1) ? 1 : 0;
          items.dataValues['user'] = req.user.is_guest ? items.dataValues['share_guest_user'] : items.dataValues['user']; 
          items.dataValues['thumbIconUrl'] = `${S3_MEDIA.awsPath}${S3_MEDIA.bucketName}/${S3_MEDIA.thumbnailUrl}${items.dataValues['user']['email']}/${iconName}?random=${Math.random()}`;
          items.dataValues['shares']       = sharedCount;
          data.push({
            children: [],
            data: items.dataValues
          });
        }
        }  
      }
      
      return res.json({ success: true, data: data });
    }
  }
  return res.json({ success: true, data: data });
}

/**
 * Search shared file by their name
 * @param {object} req 
 * @param {object} res 
 */
const searchSharedFileByName = async (req, res) => {
  const queryName = req.body.name;
  let data = [];
  let tree = [
      {
        data: { 
          name: 'Shared Files to Add', 
          id: 0, 
          entity_type: 'FOLDER' 
        },
        children: []
      }
  ];

  if (queryName) {
    let [err, data] = await to(
        Share_Files_Folders.findAll({
            where: {
              user_id: req.user.id
            },
            include: [{
                model:Files_Folders_Access,
                where: {
                  name: { 
                    $like: "%" + queryName + "%" 
                  }
                },
                include:[{
                    model:Users,
                    attributes:['id', 'first_name', 'last_name']
                }, {
                    model: File_Properties,
                    attributes: ['size', 'path', 'iconpath', 'mimetype', 'extension_type', 'tag', 'description', 'width', 'height', 'quality', 'aspect_ratio']
                }]
            }]
        })
    );

    if (!err) {
      if (data.length > 0) {
        for(let i = 0; i < data.length ; i++){
            let permission = data[i].dataValues.permission;
            data[i] = data[i].dataValues.files_folders_access;
            data[i].permission = permission;
        }
        let childData = []; 
        for (let index = 0; index < data.length; index++) {
            if (data[index].dataValues.entity_type === 'FILE') {
                data[index] = await commonFunction.mediaCommonFunction.getFileFormatedData(data[index]);
            }
            childData.push({
                children: [],
                data: data[index]
            });
        }
        tree[0].children = childData;
      }
      return res.json({ success: true, message: 'it worked', data: tree });
    }else{
      return res.json({ success: false, message: err });
    }
  }
  return res.json({ success: true, data: data });
}

module.exports.searchFileByName = searchFileByName;
module.exports.searchSharedFileByName = searchSharedFileByName;
