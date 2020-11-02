const {
    users,
    leads_shared_records,
    leads_clients,
    tasks,
    events,
    event_recipients,
    todo_contacts,
    todos,
    user_has_permission_sets,
    permission_sets,
    sequelize,
    user_roles
} = require('../models');
const { ROLES } = require("../constants/permissions");


module.exports = (function () {

    /**
     * Gets list of all users , along with a filter functionality.
     * @param {object} filter
     * @returns {object} user
    */
    let _processFilter = (filter) => {
        let user = {
            $and:[]
        };
        if (filter.search && filter.search.length > 1) {
            user.$and = [{
                $or: [{
                    first_name: {
                        $like: '%' + filter.search + '%'
                    }
                }, {
                    last_name: {
                        $like: '%' + filter.search + '%'
                    }
                }, {
                    email: {
                        $like: '%' + filter.search + '%'
                    }
                }]
            }]
        }

        if (filter.permissionSet && filter.permissionSet !== '' && filter.permissionSet > 0) {
            user.$and = [{
                id: {
                    $in: sequelize.literal(`(SELECT u.id from users as u JOIN user_has_permission_sets as ups on ups.user_id = u.id WHERE ups.permission_set_id = ${filter.permissionSet})`)
                }
            }];
        }

        return user;
    }
    /**
     * Gets list of all users sets, along with a filter functionality for searching by id, first_name,last_name, email.
     * @param {object} filter
     * @returns {Array} list
    */
    this.getUsers = async (filter, session) => {
        let where = _processFilter(filter), list = [];
        if (filter.exclude) {
            where.$and.push({
                id: {
                    $ne: filter.exclude
                }
            });
        }
        try {
            list = await users.findAll({
                where,
                attributes: ['id', 'first_name', 'last_name', 'email', 'profile_image', 'job_title'],
                include: [{
                    model: user_has_permission_sets,
                    as: 'permission_set',
                    attributes: ['id', 'permission_set_id'],
                    include: [{
                        model: permission_sets,
                        attributes: ['name']
                    }],
                }]
            });
        } catch (err) {
            return TE(err);
        }
        return list;
    }


    /**
         * Gets list of all admins sets, along with a filter functionality for searching by id, first_name,last_name, email.
         * @param {object} filter
         * @returns {Array} list
        */
    this.getAdmins = async (filter, session) => {
        let where = _processFilter(filter), list = [];

        const admin = await user_roles.findOne({ where: { name: ROLES.ADMIN }, raw: true });

        if(Array.isArray(where.$and)){
            where.$and.push({
                role_id: (admin && admin.id)?admin.id:-1
            });            
        }else{
            where.$and = [];
            where.$and.push({
                role_id: (admin && admin.id)?admin.id:-1
            });            
        }


        try {
            list = await users.findAll({
                where,
                attributes: ['id', 'first_name', 'last_name', 'email', 'profile_image', 'job_title'],
            });
        } catch (err) {
            return TE(err);
        }
        return list;
    }

    /**
     * Delete calls  of all record sharing modules where using user_id and lead_id.
     * @param {object} task
     * @throw err exceptions
    */
    let _deleteCalls = async (task) => {
        try {
            return await tasks.destroy({
                where: {
                    user_id: task.user_id,
                    contact_id: task.lead_id
                }
            })
        } catch (err) {
            return TE(err);
        }
    }

    /**
     * Delete Events of all record sharing modules where using lead_id includes user_id.
     * @param {object} task
     * @throw err exceptions
    */
    let _deleteEvents = async (task) => {
        try {
            return await event_recipients.destroy({
                where: {
                    contact_id: task.lead_id
                },
                include: [{
                    model: events,
                    as: 'event',
                    where: {
                        user_id: task.user_id
                    }
                }]
            })
        } catch (err) {
            return TE(err);
        }
    }

    /**
     * Delete Todos of all record sharing modules where using lead_id including todo model as todo.
     * @param {object} task
     * @throw err exceptions
    */
    let _deleteTodos = async (task) => {
        try {
            return await todo_contacts.destroy({
                where: {
                    contact_id: task.lead_id
                },
                include: [{
                    model: todos,
                    as: 'todo',
                    where: {
                        user_id: task.user_id
                    }
                }]
            })
        } catch (err) {
            TE(err);
        }
    }

    /**
     * Delete all record sharing modules where using lead_id including todo model as todo.
     * @param {object} task
     * @throw err exceptions
     * @returns {object} _calls
     * @returns {object} _events
     * @returns {object} _todos
    */
    let deleteAll = async (data) => {
        let _calls = [], _events = [], _todos = [];
        for (let j = 0; j < data.length; j++) {
            const task = data[j];
            try {
                _calls.push(await _deleteCalls(task));
                _events.push(await _deleteEvents(task));
                _todos.push(await _deleteTodos(task));
            } catch (err) {
                return TE(err);
            }
        }
        return {
            calls: _calls,
            events: _events,
            todos: _todos
        };
    }

    /**
     * Update all Calls in record sharing modules where using lead_id  and lead_id.
     * @param {object} task
     * @param {object} type
     * @throw err exceptions
    */
    let _updateCalls = async (task, type) => {
        if (type !== 1 && task.do.callUser === -1) {
            _deleteCalls(task);
        } else if ((type === 1) ? task.do.allToUser : task.do.callUser) {
            try {
                await tasks.update({
                    user_id: (type === 1) ? task.do.allToUser : task.do.callUser
                }, {
                    where: {
                        user_id: task.user_id,
                        contact_id: task.lead_id
                    }
                }
                );
            } catch (err) {
                TE(err);
            }
        }
    }

    /**
     * Update all Events in record sharing modules.
     * @param {object} task
     * @param {object} type
     * @throw err exceptions
    */
    let _updateEvents = async (task, type) => {
        if (type !== 1 && task.do.eventUser === -1) {
            _deleteEvents(task);
        } else {
            try {
                let evntIds = await event_recipients.findAll({
                    where: {
                        contact_id: task.lead_id
                    },
                    include: [{
                        model: events,
                        as: 'event',
                        where: {
                            user_id: task.user_id
                        }
                    }]
                }).map(d => {
                    return d.event.id
                });

                if ((type === 1) ? task.do.allToUser : task.do.eventUser) {
                    await events.update({
                        user_id: (type === 1) ? task.do.allToUser : task.do.eventUser
                    }, {
                        where: { id: evntIds }
                    }
                    )
                }
            } catch (err) {
                TE(err);
            }
        }

    }

    /**
     * Update Todo in record sharing modules.
     * @param {object} task
     * @param {object} type
     * @throw err exceptions
     * @return todo id
    */
    let _updateTodos = async (task, type) => {

        if (type !== 1 && task.do.todoUser === -1) {
            _deleteTodos(task);
        } else {
            try {
                let todoIds = await todo_contacts.findAll({
                    where: {
                        contact_id: task.lead_id
                    },
                    include: [{
                        model: todos,
                        as: 'todo',
                        where: {
                            user_id: task.user_id
                        }
                    }]
                }).map(d => {
                    return d.todo.id
                });

                if ((type === 1) ? task.do.allToUser : task.do.todoUser) {
                    await todos.update({
                        user_id: (type === 1) ? task.do.allToUser : task.do.todoUser
                    }, {
                        where: { id: todoIds }
                    }
                    )
                }
            } catch (err) {
                TE(err);
            }
        }

    }

    /**
    * 
    * @param {object} data
    * @param {object} type
    * @throw err exceptions
   */
    let _relocate = async (data, type) => {

        for (let j = 0; j < data.length; j++) {
            const task = data[j];
            try {
                return {
                    calls: await _updateCalls(task, type),
                    events: await _updateEvents(task, type),
                    todos: await _updateTodos(task, type)
                }
            } catch (err) {
                return TE(err);
            }
        }
    }

    /**
    * 
    * @param {object} action['delete-all','relocate-to-one','relocate-to-multiple']
    * @param {object} update
    * @throw err exceptions
   */
    this._do = async (action, update) => {
        switch (action) {
            case 'delete-all':
                destroyed = await deleteAll(update);
                break;
            case 'relocate-to-one':
                relocate = await _relocate(update, 1);
                break;
            case 'relocate-to-multiple':
                relocate = await _relocate(update, 2);
                break;
            default:
                break;
        }
    }


    /**
    * Update shared History 
    * @param {object} create
    * @param {object} update
    * @param {object} destroy
    * @throw err exceptions
    * @returns created object
    * @returns destroyed object
    * @returns relocate object
   */
    this.updateSharedHistory = async ({ create, update, destroy }) => {
        try {
            let relocate, destroyed, created;
            if (update && update.length > 0) {
                await leads_shared_records.destroy({
                    where: { id: update.map(u => u.id) }
                });
                for (let j = 0; j < update.length; j++) {
                    const el = update[j].do;
                    if (update[j].access_type === 'R') {
                        this._do(el.action, update);
                    }
                }
                create = [...create, ...update];
            }
            if (create && create.length > 0) {
                created = await leads_shared_records.bulkCreate(create);
            }

            if (destroy && destroy.length > 0) {
                await leads_shared_records.destroy({
                    where: { id: destroy }
                })
            }

            return { created, destroyed, relocate }
        } catch (err) {
            return TE(err);
        }
    }

    /**
     * Update Owner using userid and lead_id 
     * @param {object} selectedOpts
     * @param {object} update
     * @param {object} ownerId
     * @throw err exceptions
    */

    this.updateOwner = async ({ update, selectedOpts, ownerId }) => {
        try {
            const { user_id, lead_id } = update[0];

            await leads_shared_records.destroy({
                where: {
                    user_id: ownerId,
                    lead_id
                }
            });

            await leads_clients.update({
                owner: ownerId
            }, {
                where: {
                    id: lead_id
                }
            }
            );
            const access = [null, null, 'R', 'RW', 'RWX'];
            let created;

            if (access[selectedOpts]) {
                let owner = await leads_shared_records.findOne({
                    where: { user_id, lead_id }
                });
                if (owner) {
                    owner.update({
                        access_type: access[selectedOpts]
                    });
                } else {
                    owner = await leads_shared_records.create({
                        user_id,
                        lead_id,
                        access_type: access[selectedOpts]
                    });
                }
                this._do(update[0].do.action, update);
            }

            return created;
        } catch (err) {
            TE(err);
        }
    }

    /**
     * Update Owner using userid and lead_id 
     * @param {number} lead_id
     * @throw err exceptions
     * @returns response json
    */

    this.getSharedOwners = async (lead_id) => {
        let response = {};
        try {
            response = await leads_shared_records.findAll({
                where: { lead_id },
                include: [
                    {
                        model: leads_clients,
                        as: 'lead_details'
                    }, {
                        model: users,
                        as: 'user',
                        attributes: ['id', 'email', 'first_name', 'last_name', 'job_title']
                    }
                ]
            });
        } catch (err) {
            return TE(err);
        }
        return response;
    }

    /**
     * Get Shared Users Count using lead id
     * @param {number} lead_id
     * @throw err exceptions
    */

    this.getSharedUsersCount = async (lead_id) => {
        try {
            if (isNaN(Number(lead_id))) TE('Invalid lead Id.')
            return await leads_shared_records.findAll({
                where: { lead_id },
                include: [
                    {
                        model: leads_clients,
                        as: 'lead_details'
                    }, {
                        model: users,
                        as: 'user',
                        attributes: ['id', 'email', 'first_name', 'last_name', 'job_title']
                    }
                ]
            });
        } catch (err) {
            TE(err);
        }
    }

    return this;

})();