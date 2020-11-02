const Task = require('../../models').tasks;
const CallLists = require('../../models').call_lists;
const CustomFilter = require('../../models').custom_filters;
const Companies = require('../../models').companies;
const CustomfilterFields = require('../../models').custom_filter_fields;
const Contact = require('../../models').contacts;
const LeadClient = require('../../models').leads_clients;
const {
    createContactIncludeModelForFilterFields
} = require('./../../services/customFilterService');

//Created a task object

/**
 * Create CallList with CallList information
 * @param CallListInfo CallList object information
 * @returns response - return as the observable result 
 */
const createCallList = async function (req, res) {


    const {
        callListBody,
        matchCriteria
    } = req.body;
    
    let tasks = [];
    if (matchCriteria && matchCriteria.contactIds && matchCriteria.contactIds.length) {
        matchCriteria.contactIds.forEach(id => {
            tasks.push({
                contact_id: id,
                task_type: "CALL",
                start: callListBody.sechdule_date,
                user_id: req.user.id,
                reason_for_call: callListBody.description
            })
        })
    }
    callListBody.user_id = req.user.id;
    delete callListBody.id;
    const FilterBody = {
        id: null,
        name: callListBody.name,
        type: 'CALL_LIST',
        user_id: req.user.id,
        fields: callListBody.fields,
        additional_attributes: {
            record_type: callListBody.record_type,
            call_status:[]
        },
        call_list: {
            ...callListBody,
            tasks: tasks
        }
    }

    const [err, callListFilter] = await to(CustomFilter.create(FilterBody, {
        include: [{
            model: CustomfilterFields,
            as: 'fields',
        },
        {
            model: CallLists,
            as: 'call_list',
            include: [{
                model: Task,
                as: 'tasks',
            }]
        }
        ]
    }));

    if (err) {
        return ReE(res, err, 422);
    }

    delete FilterBody['call_list']
    FilterBody['id'] = callListFilter.call_list.custom_filter_id;
    callListFilter.call_list.dataValues['custom_filters'] = FilterBody;


    return ReS(res, {
        callListFilter: callListFilter,
        message: 'Call List created successfully.'
    }, 200);
};


/**
 * Update CallList with modified CallList information
 * @param CallListInfo CallList object information
 * @returns response - return as the observable result 
 */

updateCallList = async (req, res) => {

    const {
        callListBody,
        matchCriteria
    } = req.body;

    let tasks = [];
    if (matchCriteria && matchCriteria.contactIds && matchCriteria.contactIds.length) {
        matchCriteria.contactIds.forEach(id => {
            tasks.push({
                call_list_id: callListBody.id,
                contact_id: id,
                task_type: "CALL",
                start: callListBody.sechdule_date,
                user_id: req.user.id,
                reason_for_call: callListBody.description
            })
        })
    }
    
    callListBody.user_id = req.user.id;

    const FilterBody = {
        name: callListBody.name,
        type: 'CALL_LIST',
        user_id: req.user.id,
        fields: callListBody.fields,
        additional_attributes: {
            record_type: callListBody.record_type,
            call_status:[]
        },
    }
    const [updateErr, callListData] = await to(CallLists.update(callListBody, {
        where: { id: callListBody.id }
    }))
    if (updateErr) {
        return ReE(res, updateErr, 422);
    }

    var [FindErr, customData] = await to(CallLists.findOne(
        { where: { id: callListBody.id } }
    ))
    if (FindErr) {
        return ReS(res, FindErr, 422);
    }
    
    const [uptErr, customFilter] = await to(CustomFilter.update(FilterBody ,{
        where: { id: customData.custom_filter_id }
    }))
    if(uptErr){
        return ReS(res, uptErr, 422)
    }
    const [deleteErr, onDelete] = await to(CustomfilterFields.destroy(
        {
            where: { custom_filter_id: customData.custom_filter_id }
        }))
    if (deleteErr) {
        return ReE(res, deleteErr, 422);
    }

    let fields = [];
    if (callListBody.fields.length) {
        callListBody.fields.forEach(data => {
            fields.push({
                option: data.option,
                value: data.value,
                type: data.type,
                custom_field_id: data.custom_field_id,
                custom_filter_id: customData.custom_filter_id
            })    
        })
    }

    const [createErr, customFilterFields] = await to(CustomfilterFields.bulkCreate(fields));

    if (createErr) {
        return ReS(res, createErr, 422);
    }

    const [taskDelErr , taskDelete] = await to(Task.destroy(
        {
            where:{	call_list_id : callListBody.id}
        }
    ))
    if(taskDelErr){
        return ReE(res, taskDelErr, 422);
    }

    const [taskCreteErr , createTask] = await to(Task.bulkCreate(tasks));
    if(taskCreteErr){
        return ReE(res, taskCreteErr, 422);
    }

    FilterBody['id'] = customData.custom_filter_id;
    callListBody['custom_filters'] = FilterBody;
    callListBody['custom_filters_id'] = customData.custom_filter_id;
    callListBody['tasks'] = tasks;

    return ReS(res, {
        call_list: callListBody,
        message: 'Call list Updated Successfully.'
    }, 200)
}

/**
 * Update CallList with modified CallList information
 * @param CallListInfo CallList object information
 * @returns response - return as the observable result 
 */


deleteCallList = async (req, res) => {

    let callListId = req.params.id;
    console.log("Delete Api is called", req.params.id);

    const [findErr, customData] = await to(CallLists.findOne(
        { where: { id: callListId } }
    ))
    if (findErr) {
        return ReS(res, findErr, 422);
    } else {
        if(customData){
            const [customFilterFieldsErr, onDelete] = await to(CustomfilterFields.destroy({
                where: { custom_filter_id: customData.custom_filter_id }
            }))
            if (customFilterFieldsErr) {
                return ReE(res, customFilterFieldsErr, 422);
            }
        }
     
        const [callListErr, callListData] = await to(CallLists.destroy({
            where: { id: callListId }
        }))
        if (callListErr) {
            return ReE(res, callListErr, 422);
        }

        const [customFilteErr, callListFilter] = await to(CustomFilter.destroy({
            where: { id: customData.custom_filter_id },
        }));
        if (customFilteErr) {
            return ReE(res, customFilteErr, 422);
        }

        return ReS(res, {
            message: 'Call List get successfully.'
        }, 200);

    }
}

/**
 *  Get the contact count form filter
 * @param custom filter fields object information
 * @returns response - return as the observable result 
 */
getFilterContactCount = async (req, res) => {
    const {
        filterFields,
        addAttributes,
        include_existing_call_contact,
        type
    } = req.body;
    
    let user_id = [req.user.id];

    if(req.roleAccess.isActive) {
        user_id = req.roleAccess.users;
    }
    //  return with 0 count when add attributes in blank
    if(addAttributes.lead_status){

        if( filterFields.length == 0 && addAttributes.lead_status.length == 0){
            return ReS(res, {
                count:0,
                message: 'Call List get successfully.'
            }, 200);
        }
    }
    
    let contactIds = [],
        count = 0;
    if (filterFields.length) {
        var {
            includedObj = {},
            mainTableConditions = {}
        } = await createContactIncludeModelForFilterFields(filterFields, 'contacts',user_id);
        
         if(includedObj.length){
               if(addAttributes.record_type){
                includedObj[0].where = { ...includedObj[0].where,
                    type :{
                        $in: addAttributes.record_type
                    },
                    // sales_stage_id:{
                    //     $in: addAttributes.lead_status
                    // }
                }
               }else{
                includedObj[0].where = { ...includedObj[0].where,
                    sales_stage_id:{
                        $in: addAttributes.lead_status
                    },
                    type :{
                        $eq: type
                    },
                }
               }
           
         }   
        }else{
            var includedObj = [],
            mainTableConditions = {};
               if(addAttributes.record_type){
                includedObj.push({
                    model: LeadClient,
                    where:{
                        owner : {
                            $in:user_id 
                        },
                        type :{
                            $in: addAttributes.record_type
                        },
                        // sales_stage_id:{
                        //     $in: addAttributes.lead_status
                        // }
                    },
                    as: 'lead_client'
                });
               }else{
                includedObj.push({
                    model: LeadClient,
                    where:{
                        owner : {
                            $in:user_id 
                        },
                        sales_stage_id:{
                            $in: addAttributes.lead_status
                        },
                         type :{
                          $eq: type
                        }
                    },
                    as: 'lead_client'
                });
               }         
           
        }
         
         if (include_existing_call_contact) {
            const [err, contact_Ids] = await to(Task.aggregate('contact_id', 'DISTINCT', {
                where: {
                    user_id: req.user.id,
                    task_type: "CALL",
                    start: { $not: null }
                }, plain: false
            })
                .then(tasks => tasks.map(el => el.DISTINCT)));

            if (!err && contact_Ids.length) {
                mainTableConditions["id"] = { $notIn: contact_Ids }
            }
        }
        const [err1, contacts] = await to(Contact.findAll({
            where: mainTableConditions,
            as: 'contacts',
            include: includedObj
        })); 
        if (err1) {
            return ReE(res, err1, 422);
        };

        if (contacts.length) {
            contactIds = contacts.map(el => {
                count++;
                return el.id;
            });
        }
    
    return ReS(res, {
        count,
        contactIds,
        message: 'Call List get successfully.'
    }, 200);

};


/**
 *  Get the call count form filter
 * @param custom filter fields object information
 * @returns response - return as the observable result 
 */
getFilterCallCount = async (req, res) => {

      let {        
        filterFields,
        addAttributes,
    } = req.body, callStatus;
    
    callStatus = addAttributes.call_status;
    let task, err,criterionDate;
    var contactIds;

    let user_id = [req.user.id];

    if(req.roleAccess.isActive) {
        user_id = req.roleAccess.users;
    }
    // return with 0 count when filter fields in blank
    if(addAttributes){
        if(addAttributes.record_type.length ==0  && filterFields.length == 0 ){
            return ReS(res, {
                count:0,
                message: 'Call List get successfully.'
            }, 200);
        }
    }
   
    try {
            if (filterFields.length) {
                var {
                    includedObj,
                    mainTableConditions
                } = await createContactIncludeModelForFilterFields(filterFields, 'contacts',user_id);
                if(includedObj.length){
            
                    includedObj[0].where = { ...includedObj[0].where,
                        type :{
                            $or: addAttributes.record_type
                        }
                    }
                 }   
            }else{
                var includedObj = [],
                    mainTableConditions = {};
                includedObj.push({
                    model: LeadClient,
                    where: {
                        owner: {
                            $in: user_id
                        },
                        type: {
                            $or: addAttributes.record_type
                        }
                    },
                    as: 'lead_client'
                });  

            }
               
                const [err1, contacts] = await to(Contact.findAll({
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
                        count: 0
                    });
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

        if (criterionDate) {
            taskWhereCond['start'] = criterionDate;
        }
        
        [err, task] = await to(
            Task.findAll({
                where: taskWhereCond,
                include: [{
                    model: Contact,
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
            })
        );


        if (err) {
            return ReE(res, err, 422);
        };

        return ReS(res, {
            count: task.length
        });

    } catch (err) {
        return ReE(res, {
            success: false,
            message: 'Exception :' + err.message
        }, 422);
    }
};

getUserCallList = async (req, res) => {

    let user_id = [req.user.id];

    if(req.roleAccess.isActive) {
        user_id = req.roleAccess.users;
    }
 

    const [err, callList] = await to(CallLists.findAll({
        where: {
            user_id: {
                $in: user_id
            }
        },
        include: [{
            model: CustomFilter,
            as: "custom_filters",
            include: {
                model: CustomfilterFields,
                as: 'fields',
            }
        }]
    }));

    if (err) {
        return ReE(res, err, 422);
    };

    return ReS(res, {
        callList,
        message: 'Call List get successfully.'
    }, 200);
}


module.exports = {
    createCallList,
    getFilterContactCount,
    getUserCallList,
    updateCallList,
    deleteCallList,
    getFilterCallCount
};
