const DB = require('../../models'); 
const FileNotificationDetail = DB.file_notification_details;
const LeadClient = DB.leads_clients;
const Company = DB.companies;
const path = require('path');

/**
 * Get all file notifications detail object from request data
 * @param req request object
 * @param res response object
 */
const getAll = async function(req, res){
    
    let err, notificationDetailObjects = [];
    
    let whereCriteria = req.body.whereCriteria;

    [err, notificationDetailObjects] = await to(
        FileNotificationDetail.findAll({
            where: whereCriteria,
            include:[
                {
                    attributes: ['id','type'],
                    model: LeadClient,
                    as: "lead_client",
                    where: {
                        '$file_notification_details.entity_type$': "LEAD_CLIENT"
                    },
                    include: [
                        {
                            attributes: [ 'id', 'name'],
                            model: Company,
                            as: 'companies'
                        }
                    ]
                }
            ],
            order: [
                ['created_at', 'DESC']
            ],
            limit: 10
        })
    );
    
    if(err) 
        return ReE(res, err, 422);

    if(notificationDetailObjects.length){
        notificationDetailObjects.forEach( (notificationObject) => {
            notificationObject.dataValues['extension'] = path.extname(notificationObject.file_name);    
        })
    }

    return ReS( res, {
        notificationDetailObjects : notificationDetailObjects,
        message : 'File notification detail get successfully.'
    }, 200);   
} 

module.exports = getAll;