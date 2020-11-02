const EntityFile = require("../../models").entity_files;

/**
  * Update files
  * @param object request body
  * @param object response body
  */
const update = async (req, res) => {
    
    let fileObject, fileId;

    fileId = req.body.id;
    fileObject = req.body.data;

    let [err, file] = await to(
        EntityFile.update(fileObject,{
            where: {
                id :{
                    $in : fileId
                }
            }
        })
    );  

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, { 
        message: 'File updated successfully.' 
    });
}

module.exports = update;