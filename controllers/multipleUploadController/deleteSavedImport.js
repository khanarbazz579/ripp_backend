const multipleUpload = require("../../models").multiple_uploads;
const { deleteRefFolder } = require('./deleteCSV');

/**
 * this function is used for deleting the current stage of user in multiple lead upload form
 * @function deleteSavedImport
 * @param {Object} req http request object
 * @param {*} res 
 * @returns http response
 */
const deleteSavedImport = async (req, res) => {
    const {
        deleteFolder,
        refName
    } = req.body
    const user_id = req.user.id;
    let err, data;

    [err, data] = await to(multipleUpload.destroy({
        where: {
            ref_name: refName,
            user_id: user_id
        }
    }));

    if (err) {
        return ReE(res, {
            message: err
        }, 422);
    }

    if(deleteFolder){
      try{
        if (Array.isArray(refName)) {
             await asyncForEach(refName, async name => {
                 [err, data] = await deleteRefFolder(name);
             });
         } else {
             [err, data] = await deleteRefFolder(refName);
            
         }
      } catch (err){
        return ReE(res, {
            message: err
        }, 422);
      }
    }
   

    return ReS(res, {
        message: 'deleted successfully',
        data
    }, 200);
};

module.exports.deleteSavedImport = deleteSavedImport;