const Task = require('../../models').tasks;
const Contacts = require('../../models').contacts;
const Companies = require('../../models').companies;
const CustomFilterFields = require('../../models').custom_filter_fields;
const CustomFilter = require('../../models').custom_filters;
const {
    createContactIncludeModelForFilterFields
} = require('./../../services/customFilterService');
const LeadClient = require('../../models').leads_clients;

const allTasks = async function(req, res) {
    let callStatus = [],recordType = [];
    let {
        criterionDate,
        order,
        contactType,
        customFilterIds,
        call_list_id
    } = req.body;
    
    if(!criterionDate && !customFilterIds.length && !call_list_id){
        return ReS(res, {
            task: {count: 0,
            prioritized:[]}
        });
    }
 
    let task, err;
    var contactIds;

    let user_id = [req.user.id];

    if(req.roleAccess.isActive) {
        user_id = req.roleAccess.users;
    }
    
    try {
        
        if (customFilterIds.length) {
            const [err1, fields] = await to(CustomFilterFields.findAll({
                where: {
                    custom_filter_id: customFilterIds
                }
            }));

            if (fields.length) {
                var {
                    includedObj,
                    mainTableConditions
                } = await createContactIncludeModelForFilterFields(fields, 'contacts',user_id);

                const [err1, contacts] = await to(Contacts.findAll({
                    where: mainTableConditions,
                    as: 'contacts',
                    include: includedObj
                }));

                if (err1) {
                    return ReE(res, err, 422);
                };

                if (contacts.length) {
                    contactIds = contacts.map(el => {
                        return el.id;
                    });
                }else{
                    return ReS(res, {
                        task: {count: 0,
                        prioritized:[]}
                    });
                }
            }
        
            const [err2, customFilters] = await to(CustomFilter.findAll({
                where: {
                    id: customFilterIds
                },
                attributes: ['id', 'additional_attributes']
                
            }));
            if(err2){
                return ReE(res, err2, 422);
            }
            
            //  put hole attributes as unique array 
            for(let attribute of customFilters){
                for(let element of attribute.additional_attributes.call_status){
                if(callStatus.indexOf(element) === -1){
                    callStatus.push(element);
                } 
                }
                for(let element of attribute.additional_attributes.record_type){
                if(callStatus.indexOf(element) === -1){
                    recordType.push(element);
                } 
                }
            }
            
            
              if(callStatus.length ==1){
                if(callStatus[0] == 'all'){
                    criterionDate  = {$not: null}
                }else if (callStatus[0] == "today") {
                    let start = new Date();
                    start.setHours(0, 0, 0, 0);
        
                    let end = new Date();
                    end.setHours(23, 59, 59);
        
                    criterionDate = {
                        $between: [start, end]
                    };
        
                } else if (callStatus[0] == "future") {
                    let futureDate = new Date();
                    futureDate.setHours(23, 59, 59);
                    criterionDate = {
                        $gt: futureDate
                    };
                } else if (callStatus[0] == "overdue") {
                    let overdueDate = new Date();
                    overdueDate.setHours(0, 0, 0);
                    criterionDate = {
                        $lt: overdueDate
                    };
                };
            }
            if(callStatus.length >1){
                if(callStatus.includes('all') || callStatus.includes("overdue") && callStatus.includes("future")){
                    criterionDate  = {$not: null}
                }else if(callStatus.includes('today') && callStatus.includes('future')){
                    let start = new Date();
                    start.setHours(0, 0, 0)

                    criterionDate = {
                        $gt:start
                    }
                }else if(callStatus.includes('today') && callStatus.includes('overdue')){
                    let start = new Date();
                    start.setHours(23,59,59);
                    criterionDate = {
                        $lt:start
                    }
                }
            }
            // return task 0 if addtional attributes and fields in blank
            if(recordType.length === 0 && callStatus.length == 0 && fields.length == 0){
                return ReS(res, {
                    task: {count: 0,
                    prioritized:[]}
                });
            }
        }
       
        let taskWhereCond = {
            is_completed: 0,
            user_id: {
                $in: [req.user.id],
            },
            task_type: "CALL"
        };

        if (req.roleAccess.isActive) {
            taskWhereCond.user_id.$in = req.roleAccess.users;
        }

        if (call_list_id) {
            taskWhereCond['call_list_id'] = call_list_id;
        } else if (criterionDate) {
            taskWhereCond['start'] = criterionDate;
        }

        // when contact type is present than record type is used as contact type
        if (contactType === "LEAD" || contactType === "CLIENT") {
            recordType =[]; 
            recordType.push(contactType)
        };
        [err, task] = await to(
            Task.findAll({
                where: taskWhereCond,
                include: [{
                    model: Contacts,
                    where: contactIds && contactIds.length ? {
                        id: contactIds
                    } : null,
                    as: 'contact',
                    include: [{
                        model: LeadClient,
                        as: "lead_client",
                        where: {
                            owner: {
                                $in: user_id
                            },
                            type: {
                                $or: recordType
                            }
                        },
                        required: true,
                        include: [{
                            model: Companies,
                            as: 'companies'
                        }]
                    }],
                    required: true
                }],
                order: order
            })
        );


        if (err) {
            return ReE(res, err, 422);
        };

        let splittedTask = {
            prioritized: task,
            count: task.length
        };
        
        return ReS(res, {
            task: splittedTask
        });

    } catch (err) {
        return ReE(res, {
            success: false,
            message: 'Exception :' + err.message
        }, 422);
    }

}
module.exports.allTasks = allTasks;
