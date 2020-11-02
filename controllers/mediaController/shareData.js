const models = require('../../models');
const commonFunction = require('../../services/commonFunction')
const validChildType = ['FILE', 'FOLDER']
const Share_FilesFolders = models.share_files_folders
const Files_Folders_Access = models.files_folders_accesses
const Contact = models.contacts
const bcrypt = require('bcrypt')
const Share_Guest_User = models.share_guest_users
const Op = models.Sequelize.Op
const { USER_TYPE } = require('../../constants').GUEST_USERS;
const Contacts = models.contacts;

const crypto = require('crypto');
const { smtpTransport } = require('../../services/awsSesSmtpTransport');

const STYLE  = require('../../constants').MAIL_STYLE;

const oneGBToBytes = 1024 * 1024 * 1024;
const oneMbToBytes = 1048576;
const oneKbToBytes = 1024;

let origin_url;

/**
 * Generate a hash token with salt and email 
 * @param email
 */
const _generateToken = async (email) => {
    let salt;

    [err, salt] = await to(bcrypt.genSalt(10));
    if (err) TE(err.message, true);

    [err, hash] = await to(bcrypt.hash(email, salt));
    if (err) TE(err.message, true);

    hash = hash.replace(/\//g, '');

    return hash;
}

/**
 * Send a sharing link to new guest email with 
 * file details and properties
 * @param createdSharedUser share user data 
 * @param accessData type of access data
 * @param shareData file data that has been shared
 */
const _sendSharingLink = async (createdSharedUser, accessData, shareData) => {
            
    let fileSize = await (commonFunction.mediaCommonFunction.calculateSizeFromBits(shareData));

    var mailOptions = {
        to: createdSharedUser.email,
        from: 'no-reply@ripplecrm.com',
        subject: "You've been sent File by Ripple "+ shareData.user.first_name + ' ' + shareData.user.last_name,
        html: 'Email Notification (using email signature)\n\n <br><br>' +
            shareData.user.first_name + ' ' + shareData.user.last_name + ' has granted you ' + accessData.permission + ' permission to view ' + 
            '<b>' + shareData.entity_type +": "+ shareData.name + '<br>' +
            'Size: '+  fileSize +'<br></b>' +
            '<br><br> Please click on the following link, or paste this into your browser to complete the process:<br><br>' +
            '<a style="'+ STYLE.MAIL_BUTTON_STYLE +'" href="'+ origin_url + '/shared-link/register/' + createdSharedUser.url_token + '">Register to access these files</a>' + '\n\n'
    };

    smtpTransport.sendMail(mailOptions, function (err, res) {
        if (err) {
            console.log(err)
        } else {
            console.log(res)
        }
    });
}

/**
 * Send a sharing link to existing guest email with 
 * file details and properties
 * @param createdSharedUser share user data 
 * @param accessData type of access data
 * @param shareData file data that has been shared
 */
const _alreadyRegisteredSharingLink = async (createdSharedUser, accessData, shareData) => {
   
    let fileSize = await (commonFunction.mediaCommonFunction.calculateSizeFromBits(shareData));
    var mailOptions = {
        to: createdSharedUser.email,
        from: 'no-reply@ripplecrm.com',
        subject: "You've been sent File by Ripple "+ shareData.user.first_name + ' ' + shareData.user.last_name,

        html: 'Email Notification (using email signature)\n\n <br><br>' +
            shareData.user.first_name + ' ' + shareData.user.last_name + ' has granted you ' + accessData.permission + ' permission to view ' + 
            '<b>' + shareData.entity_type +": "+ shareData.name + '<br>' +
            'Size: '+  fileSize +'<br></b>' +
            '<br><br> Please click on the following link, or paste this into your browser to complete the process:<br><br>' +
            '<a style="'+ STYLE.MAIL_BUTTON_STYLE +'" href="'+ origin_url + '/shared-link/login' + '">Login to view</a>'
    };
    
    smtpTransport.sendMail(mailOptions, function (err, res) {
        if (err) {
            console.log(err)
        } else {
            console.log(res)
        }
    });
}   

/**
 * This function checks whether a guest user is 
 * present of not and based on it returns user
 * @param accessData type of access data
 * @param shareData file data that has been shared
 */
const _handleGuestUser = async (accessData, shareData) => {
    
    let guest_user_email = accessData.id;
    let contact_reference_id = null;

    if(accessData.type == "CONTACT"){
        let [err_contact, contact] = await to(Contact.findByPk(accessData.id))
        guest_user_email = contact.email;
        contact_reference_id = contact.id;
    }
    
    let [err_token, token] = await to( _generateToken(guest_user_email) );

    if(token){
        //Create a new guest user with no data
        let new_guest_user = {
            email: guest_user_email,
            url_token: token,
            reference_id:contact_reference_id
        },
        where = {
            email: guest_user_email
        };
        
        let [err_chec, shared_user] = await to(Share_Guest_User.findAll({ where }))

        if(err_chec){
            return res.json({
                success: false,
                message: err_chec
            });
        }

        if (!shared_user.length) {

            [erSf, shared_user] = await to(Share_Guest_User.create(new_guest_user));

            if (shared_user) {
                accessData.id = shared_user.id;
                _sendSharingLink(shared_user, accessData, shareData);
            }

        } else { 
            shared_user = shared_user[0];
            if(shared_user.password){
                _alreadyRegisteredSharingLink(shared_user, accessData, shareData);    
            }else{
                _sendSharingLink(shared_user, accessData, shareData);   
            }
            
        }
        return shared_user;
    }else{
        if(err_chec){
            return res.json({
                success: false,
                message: err_token
            });
        }
    }

    
}

/**
 * This function share the data to guest user
 * If already guest user is present then it send the 
 * details to user
 * @param req request obj
 * @param res response obj
 */
const shareDataUpdate = async (req, res) => {
    const {
        entity_type,
        file_folder_id,
        file_folder_access_id,
        accessData,
        removedShares,
        sequenceIndex
    } = req.body;
    
    origin_url = req.headers.origin;

    let ret = { success: true };

    if (!validChildType.includes(req.body.entity_type)) {
        return res.json({
            success: false,
            message: "child type invalid",
            data: []
        });
    }

    if (!entity_type || !file_folder_id || !file_folder_access_id) {
        return res.json({ success: false, message: 'Invalid request!' });
    }

    let [err0, file_folder_access] = await to(Files_Folders_Access.findOne({
        where: { id: file_folder_access_id },
        include: [models['files_folders']]
    }));

    if (err0 || !file_folder_access) {
        return res.json({
            success: false,
            message: 'Folder doesn\'t exists'
        });
    }

    if (file_folder_access && !file_folder_access.parent_id) {
        return res.json({
            success: false,
            message: 'You cannot share root folder!'
        });
    }

    return commonFunction.mediaCommonFunction
        .getFileFolderDataByQuery({
            id: file_folder_access_id,
            entity_type,
            is_guest: req.user.is_guest
        })
        .then(async shareData => {
    
            shareData.user = shareData.user ? shareData.user : shareData.share_guest_user;
    
            // Removing old records
            let removeIds = [], er, doc;

            if (removedShares.length) {
                for (let i = 0; i < removedShares.length; i++) {
                    if (removedShares[i] !== null) {

                        removeIds.push(removedShares[i].share_id)
                        let query = `select id, user_id from (select * from share_files_folders order by id) share_files_folders, (select @pv := ${removedShares[i].share_id}) initialisation where find_in_set(share_parent_id, @pv) > 0 and  @pv := concat(@pv, ',', id)`;

                        let docs = await models.sequelize.query(query, { type: models.sequelize.QueryTypes.SELECT });

                        docs.map(u => removeIds.push(u.id))
                    }
                }

                [er, doc] = await to(Share_FilesFolders.destroy({
                    where: {
                        id: {
                            [Op.in]: removeIds
                        }
                    }
                }));

                [er, doc] = await to(Files_Folders_Access.destroy({
                    where: {
                        share_refrence_id: {
                            [Op.in]: removeIds
                        }
                    }
                }))
            }
            return shareData
        })
        .then(async (shareData) => {
            if (shareData) {
                for (let idx in sequenceIndex) {
                    let share = sequenceIndex[idx];
                    let docF, erSf;

                    switch (true) {
                        case Number.isInteger(accessData[share].id) && accessData[share].type === USER_TYPE.USER:
                            [erSf, docF] = await to(Share_FilesFolders.count({
                                where: {
                                    file_folder_id,
                                    file_folder_access_id,
                                    user_id: accessData[share].id
                                }
                            }))
                            break;

                        case accessData[share].type === USER_TYPE.SHARED:

                            if(!shareData[1][0]['dataValues']['user']){
                                shareData[1][0]['dataValues']['user'] = shareData[1][0]['dataValues']['share_guest_user']; 
                            }
                            
                            let [err_user, g_user] = await to(_handleGuestUser(accessData[share], shareData[1][0]['dataValues']));
                            if (g_user) accessData[share].id = g_user.id

                            break;

                        case accessData[share].type === USER_TYPE.CONTACT:

                            let [err_contact_user, c_user] = await to(_handleGuestUser(accessData[share], shareData[1][0]['dataValues']));
                            if (c_user) accessData[share].id = c_user.id

                            break;

                        default:
                            // accessData[share].id = g_user.id
                            break;
                    }

                    let isOwner = accessData[share].id === req.user.id && accessData[share].type === USER_TYPE.USER,
                        isCreator = accessData[share].id === file_folder_access.files_folder.dataValues.created_by && accessData[share].type === USER_TYPE.USER;

                    
                    let users = await Share_FilesFolders.findAll({
                        where: {
                            file_folder_id,
                            user_id: accessData[share].id,
                            user_type: accessData[share].type
                        }
                    });
                    console.log("accessData[share].id>>>>>>>>>>>>>>>>>>>....",accessData[share].id);
                    if (!users.length && !isCreator && !docF && !isOwner) {
                        let insert = {
                            file_folder_id,
                            file_folder_access_id,
                            user_id: accessData[share].id,
                            created_by: req.user.id,
                            user_type: accessData[share].type,
                            permission: accessData[share].permission,
                            share_parent_id: file_folder_access.share_refrence_id
                        }


                        let [errI, objectReturn] = await to(Share_FilesFolders.create(insert));
                    }
                }
            }
        })
        .then(stat => {
            if (!ret.success) {
                console.log
                return res.json(ret);
            } else {
                return res.json({
                    success: true,
                    message: "Data access updated"
                });
            }
        })
};

/**
 * Get guest user list with heirarachy
 * @param req request obj
 * @param res response obj
 */
const getSharedList = async (req, res) => {
    if (!validChildType.includes(req.params.childType.toUpperCase())) {
        return res.json({ success: false, message: 'child type invalid', data: [] });
    }

    let tree = [
        {
            data: { name: 'Shared Files to Add', id: 0, entity_type: 'FOLDER' },
            children: []
        }
    ];
    let query = { user_id: req.user.id, status: 'SHARED' };

if (req.params.childType === 'FOLDER') {
        query.entity_type = 'FOLDER';
    }
    let [error, data] = await commonFunction.mediaCommonFunction.getSharedFileFolder(query);
    let childData = [];
    if (!error && data.length > 0) {
        for (let index = 0; index < data.length; index++) {

            if (data[index].dataValues.entity_type === 'FILE') {
                data[index] = await commonFunction.mediaCommonFunction.getFileFormatedData(data[index], data[index].is_guest);
            }

            childData.push({
                children: [],
                data: data[index]
            });
        }

        tree[0].children = childData;
    }
    return res.json({ success: true, message: 'it worked', data: tree });
}

/**
 * Get shared data with child files and folders
 * @param req request obj
 * @param res response obj
 */
const getSharedDataChilds = async (req, res) => {
    if (!validChildType.includes(req.params.childType.toUpperCase())) {
        return res.json({ success: false, message: 'child type invalid', data: [] });
    }

    let query = { user_id: req.user.id, parent_id: null, entity_type: 'FOLDER' }, error, folderData, childData = [];

    if (req.params.folder_id > 0) {
        query.parent_id = req.params.folder_id;
        delete query.user_id;

        if (req.params.childType === 'file') {
            delete query.entity_type;
        }

        [error, folderData] = await commonFunction.mediaCommonFunction.getFileFolderDataByQuery(query);
    } else {
        [error, folderData] = await to(models.sequelize.query(`SELECT * FROM files_folders_accesses where id IN (SELECT file_folder_access_id FROM share_files_folders where user_id = "${req.user.id}" and status = "SHARED") AND entity_type = 'FOLDER'`, { type: models.sequelize.QueryTypes.SELECT }));
    }

    if (!folderData.length) {
        return res.json({ success: false, data: [], message: 'folder doesn\'t exist' });
    }

    if (req.params.folder_id > 0) {
        const data = await commonFunction.mediaCommonFunction.getChildOfFolder(req.params.folder_id, 'FILE') || [];
        return res.json({ success: true, message: 'it worked', data: data });

    } else {
        for (let index = 0; index < folderData.length; index++) {
            childData.push({
                children: (folderData[index].entity_type === 'FOLDER') ? await commonFunction.mediaCommonFunction.getChildOfFolder(folderData[index].id, 'FOLDER') : [],
                data: folderData[index]
            });
        }
        return res.json({ success: true, message: 'root folder', data: childData });
    }
}

// const  updateContactTable = async (req,res) =>{
//   let temp = [];
//   let fileId = req.body.mediaId; 
//   let sharedContactId = req.params.id.split(',');
//           for(let data of sharedContactId){
//             temp.push({id:parseInt(data)});
//       };    
//             let [errr, updatedData] = await to(
//                 Contacts.update( { shared_media_id: fileId },
//                  { where: { $or: temp } }
//             ));
//   if(errr){
//         return res.json({ success: false, data: [], message: 'contact doesn\'t exist' });
//   }
        
//         return res.json({ success: true, message: 'contact received', data: updatedData });   
// }

// const  updateContactTableSharedMediaColumn = async (req,res) => {
//   let temp = [];
//   let fileId = req.body.fileId; 
//   let sharedContactId = req.params.id.split(',');
//           for(let data of sharedContactId){
//             temp.push({id:parseInt(data)});
//       };    
//             let [errr, updatedColumn] = await to(
//                 Contacts.update( { shared_media_id: null },
//                  { where: { $or: temp } }
//             ));
//   if(errr){
//         return res.json({ success: false, data: [], message: 'contact doesn\'t exist' });
//   }
        
//         return res.json({ success: true, message: 'column updated', data: updatedColumn });   
// }

// const  getContactObject = async (req,res) =>{
//     let temp = [];
//     let mediaId = req.params.sharedMediaId;
//     let [errr, contactObj] = await to(Contacts.findAll({
//             where:{
//               shared_media_id :mediaId
//           }
//     }));
//   if(errr){
//         return res.json({ success: false, data: [], message: 'contact doesn\'t exist' });
//   }
        
//         return res.json({ success: true, message: 'contact received', data: contactObj });   
// }
module.exports = {
    shareDataUpdate,
    getSharedList,
    getSharedDataChilds,
    // getContactObject,
    // updateContactTable,
    // updateContactTableSharedMediaColumn
}