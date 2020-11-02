const db = require('../models');
const { users, events, tasks, leads_clients, todos, files_folders_accesses, files_folders, campaigns, histories, notifications, user_details, call_outcomes_transitions, custom_filters, multiple_uploads, password_resets } = db;

module.exports = (function () {

    let handleClient = async (_id, user_id, transaction) => {
        // console.log('handleClient:----2-->>>>');
        if (user_id === -1) {
            return await Promise.all([
                leads_clients.destroy({ where: { user_id: _id, type: 'LEAD' }, transaction }),
                leads_clients.destroy({ where: { owner: _id, type: 'LEAD' }, transaction }),
            ]).catch(TE)
        } else {
            return await Promise.all([
                leads_clients.update({ user_id }, { where: { user_id: _id, type: 'LEAD' }, transaction }),
                leads_clients.update({ user_id }, { where: { owner: _id, type: 'LEAD' }, transaction })
            ]).catch(TE)
        }
    };

    let handleLead = async (_id, user_id, transaction) => {
        // console.log('handleLead:---1--->>>');
        if (user_id === -1) {
            return await Promise.all([
                leads_clients.destroy({ where: { user_id: _id, type: 'CLIENT' }, transaction }),
                leads_clients.destroy({ where: { owner: _id, type: 'CLIENT' }, transaction })
            ]).catch(TE)
        } else {
            return await Promise.all([
                leads_clients.update({ user_id }, { where: { user_id: _id, type: 'CLIENT' }, transaction }),
                leads_clients.update({ user_id }, { where: { owner: _id, type: 'CLIENT' }, transaction })
            ]).catch(TE)
        }
    };

    let handleEvents = async (_id, user_id, transaction) => {
        // console.log('handleEvents:----3-->>>>');
        if (user_id === -1) {
            return await events.destroy({
                where: { user_id: _id }, transaction
            }).catch(TE);
        } else {
            return await events.update({ user_id: _id }, {
                where: { user_id }, transaction
            }).catch(TE);
        }
    };

    let handleMedia = async (_id, user_id, transaction) => {
        // console.log('handleMedia:-----4----->>>>');
        if (user_id === -1) {
            return await Promise.all([
                files_folders_accesses.destroy({ where: { user_id: _id }, transaction }),
                files_folders.destroy({ where: { created_by: _id }, transaction }),
                multiple_uploads.destroy({ where: { user_id: _id }, transaction })
            ]).catch(TE);
        } else {
            let _user = await files_folders_accesses.findOne({ where: { parent_id: null, user_id }, raw: true });
            let { master_name } = await files_folders_accesses.findOne({ where: { parent_id: null, user_id: _id }, attributes: ['master_name'], raw: true });
            return await Promise.all([
                files_folders_accesses.update({
                    parent_id: _user.id,
                    user_id: _user.id,
                    name: `${_user.name} of ${master_name}`
                }, { where: { user_id: _id, parent_id: null }, transaction }),
                files_folders_accesses.update({ user_id }, { where: { user_id: _id }, transaction }),
                files_folders.update({ created_by: user_id }, { where: { created_by: _id }, transaction }),
                multiple_uploads.update({ user_id: user_id }, { where: { user_id: _id }, transaction })
            ]).catch(TE);
        }
    };

    let handleCalls = async (_id, user_id, transaction) => {
        // console.log('handleCalls:----5-->>>>');
        if (user_id === -1) {
            return await Promise.all([
                custom_filters.destroy({ where: { user_id: _id, type: 'CALL' }, transaction }),
                call_outcomes_transitions.destroy({ where: { user_id: _id }, transaction }),
                tasks.destroy({ where: { user_id: _id }, transaction }),
                histories.destroy({ where: { user_id: _id }, transaction })
            ]).catch(TE);
        } else {
            return await Promise.all([
                custom_filters.update({ where: { user_id: _id, type: 'CALL' }, transaction }),
                call_outcomes_transitions.update({ where: { user_id: _id }, transaction }),
                tasks.update({ user_id }, { where: { user_id: _id }, transaction }),
                histories.update({ user_id }, { where: { user_id: _id }, transaction })
            ]).catch(TE);
        }
    };

    let handleTodos = async (_id, user_id, transaction) => {
        // console.log('handleTodos:----6---->>>');
        if (user_id === -1) {
            return await todos.destroy({ where: { user_id: _id }, transaction })
                .catch(TE);
        } else {
            return await todos.update({ user_id }, { where: { user_id: _id }, transaction })
                .catch(TE);
        }
    };

    let handleCampaigns = async (_id, user_id, transaction) => {
        // console.log('handleCampaigns:----7---->>>');
        if (user_id === -1) {
            return await campaigns.update({ deleted_at: new Date() }, { where: { user_id: _id }, transaction })
                .catch(TE);
        } else {
            return await campaigns.update({ user_id }, { where: { user_id: _id }, transaction })
                .catch(TE);
        }
    };

    let getAssignTo = (assignTo, _for, action) => {
        return (Array.isArray(assignTo)) ? assignTo.find(m => m.label === _for).toUser : (
            (action !== 'toNoOne') ? assignTo : -1
        );
    }

    let removeUser = async (_id, transaction) => {

        const user = await users.findOne({ where: { id: _id } });

        await Promise.all([
            password_resets.destroy({ where: { email: user.email } }),
            custom_filters.destroy({ where: { user_id: _id }, transaction }),
            notifications.destroy({ where: { user_id: _id }, transaction }),
            user_details.destroy({ where: { user_id: _id }, transaction }),
            users.destroy({ where: { id: _id }, transaction })
        ]).catch(TE);
    }

    this.deleteUser = async ({ params: { _id }, body: { assignTo, action }, user }) => {
        let transaction;

        if (Number(_id) === Number(user.id)) {
            return TE('Cannot delete this user, you\'re currently logged in with this user!', true)
        }

        try {
            if (isNaN(_id)) return TE('Invalid user id!');
            // get transaction
            transaction = await db.sequelize.transaction();

            let data = {
                handleLead: await handleLead(_id, getAssignTo(assignTo, 'Leads', action), transaction),
                handleClient: await handleClient(_id, getAssignTo(assignTo, 'Clients', action), transaction),
                Events: await handleEvents(_id, getAssignTo(assignTo, 'Events', action), transaction),
                Media: await handleMedia(_id, getAssignTo(assignTo, 'Media', action), transaction),
                Calls: await handleCalls(_id, getAssignTo(assignTo, 'Calls', action), transaction),
                Todos: await handleTodos(_id, getAssignTo(assignTo, 'Todos', action), transaction),
                Campaign: await handleCampaigns(_id, getAssignTo(assignTo, 'Campaigns', action), transaction),
                User: await removeUser(_id, transaction)
            };
            //commit changes and return
            return { success: await transaction.commit(), data, message: 'User deleted successfully!' };

        } catch (err) {
            console.log('err: ', err);
            return TE(err || 'Error while deleting user.', true)
        }
    }

    return this;
})();
