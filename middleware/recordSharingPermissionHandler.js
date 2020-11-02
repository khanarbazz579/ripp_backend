const { leads_clients, leads_shared_records } = require('../models');


module.exports = async ({ user, params: { lead_id } }, res, next) => {

    try {
        const user = await leads_shared_records.findOne({ where: { lead_id } });
        const hassAccess = (
            (user && user.access_type && user.access_type === 'RWX')
        ) ? true : false;

        if (hassAccess) {
            next();
        } else {
            return ReE(res, 'You do not have such permission.', 403);
        }
    } catch (err) {
        TE(err);
    }
};