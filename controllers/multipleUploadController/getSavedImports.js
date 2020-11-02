const multipleUpload = require("../../models").multiple_uploads;

/**
 * this function is used for getting the current stage of user in multiple lead upload form
 * @function getSavedImports
 * @param {Object} req http request object
 * @param {*} res 
 * @returns http response
 */
const getSavedImports = async (req, res) => {
    
    const user_id = req.user.id;

    let [err, data] = await to(multipleUpload.findAll({
        where: {
            user_id : user_id
        }
    }));
 

    if (err) {
        return ReE(res, {
            message: err
        }, 422);
    }

    return ReS(res, {
        message: 'get current changes',
        data
    }, 200);
};

module.exports.getSavedImports = getSavedImports;