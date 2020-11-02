/**
 * Created by cis on 28/8/18.
 **/
const SaleStage = require('../../models').sales_stages;
const leads_clients = require('../../models').leads_clients;
const checkes  = require('../../models').stage_check_statuses;

// getting all sale stages
const getAll = async function (req, res) {
    let err, data, pipeline;
    const type = req.params.type || '1';
    const user_id = req.user.id;
    [err, data] = await to(
        SaleStage.findAll({
            attributes: {
                include: [
                    [leads_clients.sequelize.fn("COUNT", leads_clients.sequelize.literal(`DISTINCT(leads_clients.id),CASE WHEN leads_clients.type = 1 AND
                    (leads_clients.owner = ${req.user.id} OR leads_clients.id IN (SELECT lead_id FROM leads_shared_records WHERE user_id = ${req.user.id}))
                     THEN 1 END`)), "leadCount"],
                    // [leads_clients.sequelize.literal(`CASE WHEN stage_check_statuses.type = '${type}' && stage_check_statuses.user_id = ${user_id} THEN stage_check_statuses.is_checked END`), "is_checked"]
                ]
            },
            where: {
                is_pipeline: false
            },
            group: [ leads_clients.sequelize.col('sales_stages.id')],
            include: [{
                model: leads_clients,
                attributes: []
            },
            {
               model : checkes,
               attributes : []
            }
        ],
            order: [
                ['priority_order', 'ASC']
            ]
        })
    );

    if (err) {
        return ReE(res, err, 422);
    }

    // [err, pipeline] = await to(
    //     SaleStage.findAll({
    //         attributes: {
    //             include: [
    //                 // [ leads_clients.sequelize.literal(`(SELECT b.is_checked from stage_check_statuses b WHERE b.type = '${type}' && b.user_id = ${user_id} && b.stage_id = sales_stages.id)`), "is_checked"]
    //             ]
    //         },
    //         where: {
    //             is_pipeline: true
    //         },
    //         order: [
    //             ['priority_order', 'ASC']
    //         ]
    //     })
    // );

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        stages: data,
        pipeline: [],
        message: 'Sales Stage got successfully.'
    }, 200);
};
module.exports.getAll = getAll;
