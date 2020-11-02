const Op = require('sequelize').Op;
const models = require('../../models');
const validChildType = ['file', 'folder'];
const sharedFilesFolders = models.share_files_folders;
const sharedGuestUser    = models.share_guest_users;
const { USER_TYPE } = require('../../constants').GUEST_USERS;

module.exports = (function () {
    /**
     * Mapper for getting users list
     */
    let map = {
        [USER_TYPE.SHARED]: 'share_guest_users',
        [USER_TYPE.USER]: 'users',
        [USER_TYPE.CONTACT]: 'contacts'
    }

    /**
     * Adapter for transforming response
     * 
     * @param {object} sharedWith  
     */
    let _sharedDataAdapter = async (sharedWith) => {
        let selectedUserIds = {}, sharables = [], identifier;

        if (sharedWith.length) {
            let date = Date.now();
            for (let i = 0; i < sharedWith.length; i++) {
                identifier = date + i;
                selectedUserIds[identifier] = {
                    id: sharedWith[i].user_id,
                    permission: sharedWith[i].permission,
                    disabled: true,
                    data: {
                        ...sharedWith[i].user,
                        share_id: sharedWith[i].id
                    },
                    type: sharedWith[i].user_type
                };

                sharables.push(identifier);
            }
        }

        return {
            sharedWith: selectedUserIds,
            sharables: sharables
        }
    }

    /**
     * Gets list of shared users.
     */
    this.getSharedUsersList = async (req, res, next) => {
        if (!validChildType.includes(req.params.type)) {
            return res.json({ success: false, message: 'Type invalid', data: [] });
        }

        let temp = [];
        let file_folder_access_ids = req.params.id.split(',');
            ret = [];
            data = [];
          for(let data of file_folder_access_ids){
            temp.push({file_folder_access_id:parseInt(data)});
          }
            if (file_folder_access_ids <= 0) {
            return ReS(res, { success: false, data, sharedWith: ret, message: "Invalid file or folder" }, 400);
        }

        // get share folder id
        let [err1, sharedInstances] = await to(sharedFilesFolders.findAll({
            attributes: ['id', 'file_folder_id', 'file_folder_access_id', 'permission', 'user_id', 'user_type'],
            where: {
                $or :temp
                },
                status: {
                    $in: ['SHARED', 'MOVED']
                },
            order: [
                ['id', 'ASC']
            ]
        }));

        if (sharedInstances.length) {
            let err5,sharedData;
            for (let j = 0; j < sharedInstances.length; j++) {
                query = `select id, file_folder_id, file_folder_access_id, permission, user_id, user_type from (select * from share_files_folders order by id) share_files_folders, (select @pv := ${sharedInstances[j].dataValues.id}) initialisation where find_in_set(share_parent_id, @pv) > 0 and  @pv := concat(@pv, ',', id)`;
                let err2, users = [];
                [err2, users] = await to(models.sequelize.query(query, {
                    type: models.sequelize.QueryTypes.SELECT
                }));
                users.push(sharedInstances[j].dataValues)
                if (!err2 && users.length) {
                    for (let i = 0; i < users.length; i++) {    
                     if(users[i].user_type == 'CONTACT'){
                          [err5,sharedData] =await to (sharedGuestUser.findAll({
                               attributes: ['reference_id'],
                             where:{
                                   id:users[i].user_id
                               }
                          }));
                               if(sharedData && sharedData[0]) {
                                   users[i].user_id = sharedData[0]['dataValues']['reference_id'];
                               }
                            }
                            let user = await models[map[users[i].user_type]].findAll({
                            attributes: ['id', 'first_name', 'last_name', 'email'],
                            where: {
                                id: {
                                    [Op.eq]: users[i].user_id
                                }
                            }
                        });
                        users[i].user = user.length > 0 ? user[0] : [];
                        users[i] = JSON.parse(JSON.stringify(users[i]));
                        ret.push(users[i]);
                    }
                }
            }
            ret = await _sharedDataAdapter(ret);
            return ReS(res, { success: true, data, ...ret, message: "user-list recieved successfully",sharedInstances:sharedInstances }, 200);
        } else {
            return ReS(res, { success: true, data, sharedWith: ret, message: "No shared users found" }, 200);
        }
    }

    /**
     * Gets list of all users from contacts and users table.
     */
    this.getUsersList = async (req, res, next) => {
        let { body: { selectedData, query = null, file_folder_id }, user } = req, where = {
            [USER_TYPE.USER]: {},
            [USER_TYPE.CONTACT]: {}
        }

        let selected = Object.keys(selectedData), ids = {
            [USER_TYPE.USER]: [],
            [USER_TYPE.CONTACT]: [],
            [USER_TYPE.SHARED]: []
        };

        if (!query) {
            return res.json({
                success: false,
                payload: [],
                message: 'Empty search params.'
            });
        }

        for (let i = 0; i < selected.length; i++) {
            let sel = selectedData[selected[i]];
            if (sel.id && ids[sel.type])
                ids[sel.type].push(sel.id);
        }

        ids[USER_TYPE.USER].push(user.id);

        // getting users who created the file.
        let [err1, file] = await to(models['files_folders'].findByPk(file_folder_id))

        if (!err1 && file) {
            if(file.is_guest){
                ids[USER_TYPE.SHARED].push(file.created_by);    
            }else{
                ids[USER_TYPE.USER].push(file.created_by);
            }
        }

        // get all users having this file.
        let [err0, shares] = await to(models['share_files_folders'].findAll({
            where: {
                file_folder_id
            }
            , attributes: ['user_id', 'id', 'user_type']
        }));

        if (!err0 && shares) {
            for (let share in shares) {
                ids[shares[share].user_type].push(shares[share].user_id);
            }
        }

        where[USER_TYPE.USER] = {
            id: {
                [Op.notIn]: ids[USER_TYPE.USER]
            },
            is_deleted: {
                [Op.eq]: 0
            },
            $or: [
                {
                    first_name: {
                        [Op.like]: `%${query.toLowerCase()}`
                    }
                },
                {
                    last_name: {
                        [Op.like]: `%${query.toLowerCase()}`
                    }
                }, {
                    email: {
                        [Op.like]: `%${query.toLowerCase()}%`
                    }
                }
            ]
        }

        where[USER_TYPE.CONTACT] = {
            id: {
                [Op.notIn]: ids[USER_TYPE.CONTACT]
            },
            $or: [
                {
                    first_name: {
                        [Op.like]: `%${query.toLowerCase()}`
                    }
                },
                {
                    last_name: {
                        [Op.like]: `%${query.toLowerCase()}`
                    }
                }, {
                    email: {
                        [Op.like]: `%${query.toLowerCase()}%`
                    }
                }
            ],
            $and :[
            {
                email:{
                    $ne: null
                }
            }]
        }

        where[USER_TYPE.SHARED] = {
            id: {
                [Op.notIn]: ids[USER_TYPE.SHARED]
            },
            is_confirm:1,
            $or: [
                {
                    first_name: {
                        [Op.like]: `%${query.toLowerCase()}`
                    }
                },
                {
                    last_name: {
                        [Op.like]: `%${query.toLowerCase()}`
                    }
                }, {
                    email: {
                        [Op.like]: `%${query.toLowerCase()}%`
                    }
                }
            ]
        }

        let [err, data] = await to(models['users'].findAll({
            attributes: ['id', 'first_name', 'last_name', 'email', [models.sequelize.literal("'" + USER_TYPE.USER + "'"), 'type']],
            where: where[USER_TYPE.USER]
        }));

        const [err2, contacts] = await to(models['contacts'].findAll({
            attributes: ['id', 'first_name', 'last_name', 'email', [models.sequelize.literal("'" + USER_TYPE.CONTACT + "'"), 'type']],
            where: where[USER_TYPE.CONTACT]
        }));

        const [err3, shared] = await to(models['share_guest_users'].findAll({
            attributes: ['id', 'first_name', 'last_name', 'email', [models.sequelize.literal("'" + USER_TYPE.SHARED + "'"), 'type']],
            where: where[USER_TYPE.SHARED]
        }));

        data = data.concat(contacts, shared);

        return res.json({
            success: true,
            payload: data,
            message: 'Users found!'
        })
    }

    return this;
})();