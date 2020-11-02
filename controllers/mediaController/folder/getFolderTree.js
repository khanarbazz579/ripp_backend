const Models = require('../../../models');
const Files_Folders_Access = Models.files_folders_accesses;
const User = Models.users;
const GuestUser = Models.share_guest_users;
const commonFunction = require('../../../services/commonFunction');

/**
 * Get heirarchy of folders  
 * @param {object} request object 
 * @param {object} response object
 */
const getFolderTree = async(req, res) => {
    
    // Get all root folders 
    const user_ids = (req.roleAccess.isActive) ? req.roleAccess.users : [req.user.id];

    let model = await commonFunction.mediaCommonFunction.getCurrentUserModel(req.user.is_guest);

    let [err, rootData] = await to(
        Files_Folders_Access.findAll({
            where: {
                parent_id: null,
                user_id: {
                    $in: user_ids
                },
                is_guest: req.user.is_guest
            },
            include: [
                model
            ]
        })
    );

    if (err) {
        return ReE(res, err, 422);
    }
    
    // Get all children of each folder 
    let tree = [];
    if (!err && rootData && rootData.length > 0 && rootData[0].dataValues) {
        for (let i = 0; i < rootData.length; i++) {
            const el = rootData[i].dataValues;
            
            el['realName'] = el['name'];
            
            el['user'] = (el['user']) ? el['user'] : el['guest_user'];
            el['name'] = (req.user.id !== el.user.id) ? `${el.user.fullName}'s Files` : 'My Files';
        
            tree.push({
                data: el,
                children: await commonFunction.mediaCommonFunction.getChildOfFolder(el.id, 'FOLDER', req.user.is_guest, false) || []
            });
        }
    }
    
    return res.json({ success: true, message: 'it worked', data: tree });
}

module.exports = getFolderTree;