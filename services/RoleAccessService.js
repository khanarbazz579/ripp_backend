const models = require('../models'),
    UserRole = models.user_roles,
    Users = models.users,
    { PERMISSIONS: { ROLES } } = require('../constants')

module.exports = (function () {

    let _select = [
        'name',
        'id'
    ]

    /**
     * Finds a role ny params
     * 
     * @param {object} where
     * @param {boolean} single
     * 
     * @throws {Error} err
     * @returns {object}
     */
    this.findBy = function (where = {}, single = false) {
        if (!single) {
            return UserRole.findAll({
                where,
                attributes: _select,
                raw: true,
                order: [
                    ['name', 'ASC']
                ],
            });

        } else {
            return UserRole.findOne({
                where,
                attributes: _select,
                raw: true
            });
        }
    }

    /**
     * Get a role with parents
     * 
     * @param {number} parent_id
     * 
     * @throws {Error} err
     * @returns {object}
     */
    this.getWithChildrens = async function (parent_id = null, query = {}) {
        try {
            let docs = await this.findBy({
                parent_id
            });

            let cns = []

            for (let i = 0; i < docs.length; i++) {

                let count = await Users.count({
                    where: {
                        role_id: docs[i].id
                    },
                    raw: true
                });

                docs[i].isClose = false;
                docs[i].isChecked = false;
                docs[i].isManageable = count > 0 && docs[i].name !== ROLES.ADMIN;
                docs[i].childrens = await this.getWithChildrens(docs[i].id, query);

                if (query && Boolean(query.includeUsers)) {
                    let where = [` role_id = ${docs[i].id} `];

                    if (query.search) {
                        // where['$or'] = [{
                        //     first_name: {
                        //         $like: '%' + query.search + '%'
                        //     }
                        // }, {
                        //     last_name: {
                        //         $like: '%' + query.search + '%'
                        //     }
                        // }];

                        where.push(` concat_ws(' ',first_name,last_name) like '%${query.search}%'`);
                    }

                    // docs[i].users = await Users.findAll({
                    //     attributes: ['id', 'first_name', 'last_name', 'email', 'profile_image', 'job_title', 'role_id', 'permission_set_id'],
                    //     where,
                    // })
                    let users = await Users.sequelize.query(`SELECT ${['id', 'first_name', 'last_name', 'email', 'profile_image', 'job_title', 'role_id', 'permission_set_id'].join(', ')} from users WHERE ${where.join(' AND ')}`, {
                        type: Users.sequelize.QueryTypes.SELECT
                    })
                        .map(t => {
                            t.fullName = t.first_name + ' ' + t.last_name;
                            t.isChecked = false;
                            t.isClose = false;
                            return t;
                        });

                    if (query.search) {
                        if (users.length) {
                            docs[i].users = users;
                            cns.push(docs[i])
                        }
                    } else {
                        docs[i].users = users;
                        cns.push(docs[i])
                    }
                } else {
                    cns.push(docs[i])
                }

            }
            return cns;
        } catch (err) {
            TE(err)
        }
    }

    /**
     * Get a role with parents
     * 
     * @param {string} name
     * @param {number} parent_id
     * @param {number} created_by
     * 
     * @throws {Error} err
     * @returns {Promise}
     */
    this.create = function ({ name, parent_id, created_by }) {

        return this.findBy({
            name
        })
            .then(doc => {
                if (doc.length) {
                    throw new Error('A role with this name already exists');
                }

                return UserRole.create({
                    name,
                    parent_id,
                    created_by
                })
            })
            .then(doc => {
                return this.getWithChildrens();
            })
            .catch(TE)
    }

    /**
     * Get a role with parents
     * 
     * @param {string} name
     * @param {number} parent_id
     * @param {number} id
     * 
     * @throws {Error} err
     * @returns {Promise}
     */
    this.update = async function ({ name, parent_id, id, reassign }) {
        try {

            if (!name) {
                throw new Error('Please enter a name for role!')
            }

            let doc = await this.findBy({
                name
            }, true);

            if (doc && Number(doc.id) !== Number(id)) {
                throw new Error('A role with this name already exists!')
            }

            let update = { name };
            if (parent_id) {
                update.parent_id = parent_id;
            }

            let roleUpdate = await UserRole.update(update, {
                where: { id }
            });

            if (!roleUpdate) throw new Error('Cannot update this role at the moment!');

            if (reassign) {
                for (let i = 0; i < reassign.length; i++) {
                    await Users.update({
                        role_id: reassign[i].role_id
                    }, {
                        where: { id: reassign[i].id }
                    });
                }
            }

            return roleUpdate;

        } catch (err) {
            return TE(err);
        }
    }

    /**
     * Get a role with parents
     * 
     * @param {object} data
     * 
     * @throws {Error} err
     * @returns {object}
     */
    this.updateParent = async function (data) {
        if (Array.isArray(data)) {
            return await asyncForEach(data, async ({ id, parent_id }, i) => {
                UserRole.update({ parent_id }, { where: { id } });
            });
        } else {
            throw new Error('Invalid request!')
        }
    }

    /**
     * Get a role with parents
     * 
     * @param {number} id
     * 
     * @throws {Error} err
     * @returns {Promise}
     */
    this.destroy = function ({ id }) {

        return UserRole.destroy({
            where: {
                id
            }
        }).catch(TE)
    }

    this.getUserByRoleId = async function (role_id) {
        try {
            if (!role_id || isNaN(role_id)) throw new Error('Invalid role id!')

            return await Users.findAll({
                attributes: ['id', 'first_name', 'last_name', 'email', 'profile_image', 'job_title', 'role_id', 'permission_set_id'],
                where: {
                    role_id
                }
            })

        } catch (err) {
            TE(err)
        }
    }

    return this;
})();