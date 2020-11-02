const LeadClient = require('../../models').leads_clients;
const LeadClientDetail = require('../../models').lead_client_details;
const Contact = require('../../models').contacts;
const ContactDetails = require('../../models').contact_details;
const Company = require('../../models').companies;
const CompanyDetails = require('../../models').company_details;
const SalesStage = require('../../models').sales_stages;
const TodoList  = require('../../models').todos;
const TodoContact= require('../../models').todo_contacts;
const EventRecipients = require('../../models').event_recipients;
const Events       = require('../../models').events;
const Notifications= require('../../models').notifications; 
const Tasks        = require('../../models').tasks;
const ShareGuestUser = require('../../models').share_guest_users;
const ShareFileFolders = require('../../models').share_files_folders;

const update = async function (req, res) {

    let leadClientObj;
    let leadClientBody = Object.assign({ user_id: req.user.id, ...req.body.lead_detail_body });
    let leadDeletedContacts = req.body.deleted_contacts;
    let updatedContactsArray = [];
    let companyArr;

    let leadArr = await separateModelAndDetail(leadClientBody);

    try {
        [err, leadClientObj ] = await to(LeadClient.findByPk(leadArr['model']['id']));
        if (err) {
            return ReE(res, err, 422);
        }
        [err, leadClientObj ] = await to(leadClientObj.update(leadArr['model'], {
            where: {
                id: leadArr['model']['id']
            }
        }));
        for (let key of Object.keys(leadArr['detail'])) {
            let typeFilter = {
                lead_client_id:{
                    $eq: leadArr['model']['id']
                }
            }
            let insertedData = {
                custom_field_id: key,
                field_value: leadArr['detail'][key],
                lead_client_id: leadArr['model']['id'],
            }
            let savedDetail = await insertDetail(LeadClientDetail, key, typeFilter, insertedData)
        }

        if(leadClientBody.companies){
            
            let leadCompaniesArr = await separateModelAndDetail(leadClientBody.companies);
            
            [err, companyArr ] = await to(Company.findByPk(leadCompaniesArr['model']['id']));
            if (err) {
                return ReE(res, err, 422);
            }
            
            [err, companyArr] = await to(companyArr.update(leadCompaniesArr['model'], {
                where: {
                    id: leadCompaniesArr['model']['id']
                }
            }));

            for (let key of Object.keys(leadCompaniesArr['detail'])) {
                let typeFilter = {
                    company_id:{
                        $eq: leadCompaniesArr['model']['id']
                    }
                }
                let insertedData = {
                    custom_field_id: key,
                    field_value: leadCompaniesArr['detail'][key],
                    company_id: leadCompaniesArr['model']['id'],
                }
                let savedDetail = await insertDetail(CompanyDetails, key, typeFilter, insertedData)
            }
        }

        if(leadClientBody.contacts){
            
            for (var i = 0; i < leadClientBody.contacts.length; i++) {
                
                let leadContactsArr = await separateModelAndDetail(leadClientBody.contacts[i]);

                if(leadContactsArr['model']['id']){
                    [err, contactArr ] = await to(Contact.findByPk(leadContactsArr['model']['id']));
                    if (err) {
                        return ReE(res, err, 422);
                    }

                    delete leadContactsArr['model']['file_url'];
                    delete leadContactsArr['model']['profile_image'];  
                    
                    [err, contactArr] = await to(contactArr.update(leadContactsArr['model'], {
                        where: {
                            id: leadContactsArr['model']['id']
                        }
                    }));    
                }else{
                    leadContactsArr['model']['entity_id'] = leadClientObj.id;
                    leadContactsArr['model']['entity_type'] = "LEAD_CLIENT"; 
                    
                    [err, contactArr] = await to(Contact.create(leadContactsArr['model']));
                    if (err) {
                        return ReE(res, err, 422);
                    }
                }
                
                updatedContactsArray.push(contactArr);

                for (let key of Object.keys(leadContactsArr['detail'])) {
                    let typeFilter = {
                        contact_id:{
                            $eq: leadContactsArr['model']['id']
                        }
                    }
                    let insertedData = {
                        custom_field_id: key,
                        field_value: leadContactsArr['detail'][key],
                        contact_id: leadContactsArr['model']['id'],
                    }
                    console.log("+++++++++++++++++++++", insertedData)
                    let savedDetail = await insertDetail(ContactDetails, key, typeFilter, insertedData)
                }
            }
        }  
        if (err) {
            return ReE(res, err, 422);
        }

        
        if(leadDeletedContacts.length){
            await removeLeadContacts(leadDeletedContacts);    
        }

        let returnedLeadObj = await createReturnedObject(leadClientObj, companyArr, updatedContactsArray);

        return ReS(res, { lead: returnedLeadObj , message: 'Lead updated successfully.' });
    } catch (err) {
        return ReE(res, { success: false, message: 'Exception :' + err.message }, 401);
    }
}

const createReturnedObject = async (leadClientObj, companyObj, contactObj) => {

    let sales_stage;

    [err, sales_stage] = await to(
        SalesStage.findByPk(leadClientObj.sales_stage_id)
    );
    if (err) {
        return ReE(res, err, 422);
    }

    leadClientObj = leadClientObj.toJSON();
    leadClientObj['companies'] = companyObj;
    leadClientObj['contacts'] = contactObj; 
    leadClientObj['sales_stage'] = sales_stage.toJSON();

    return leadClientObj;
}

const separateModelAndDetail = async (obj) => {
    let mainArr = {};
    mainArr['detail'] = {}
    mainArr['model'] = {}

    for (let key of Object.keys(obj)) {
        if (isNaN(key)) {
            mainArr['model'][key] = obj[key]
        } else {
            mainArr['detail'][key] = obj[key]
        }
    }
    return mainArr;
}

const removeLeadContacts = async (deletedContacts) => {
    
    console.log(">>>>>>> REMOVED CONTACTS ARRAY", deletedContacts);
    if(deletedContacts){
        removeEventsWithNotification(deletedContacts);
        removeTaskWithNotification(deletedContacts);
        removeTodoWithNotification(deletedContacts);
        removeShareGuestUserWithContact(deletedContacts);
        
        //Delete contact from contact tables.
        const removeContact = await to(Contact.destroy({
            where:{
                id:deletedContacts
            }
        })) 
       Promise.all([removeContact])
            .then(result =>{
                console.log("***************COMPLETE RESULT OF removeLeadContacts&*********************",result);
            })
            .catch(error =>{
                console.log("***************ERRORS RESULT OF removeLeadContacts",error)
            })     
     }
    // return;        
}

const insertDetail = async (model, key, typeFilter, insertedData) => {

    let err, detailObj;
    [err, detailObj] = await to(model.findOrCreate({
            where: {
                $and: [{
                    custom_field_id: {
                        $eq: key
                    }
                },
                typeFilter
                ]
            },
            defaults: insertedData
        }).spread(async(detailedObj, created) => {
            if (!created) {
                [err, detailObj] = await to(detailedObj.update(insertedData))
            }
        })
    );
    
    return detailObj;
} 

const removeEventsWithNotification = async(deletedContactsArray,req,res) => {
      let [errr, EventRecipientsData] = await to(EventRecipients.findAll({
        where: {
            contact_id:deletedContactsArray
        }
    }));
    if(errr){
        return ReE(res, { success: false, message: errr.message });
    }
   if(EventRecipientsData){
    let eventType = ['EVENT','EVENT_ACCEPT','EVENT_REJECT','EVENT_MAY_BE'];

     for(let i=0;i<EventRecipientsData.length;i++){
    const Event = await to(Events.destroy({
                where:{
                    id:EventRecipientsData[i].event_id
                }
            })
      )
    
     const Notification =await to(Notifications.destroy({
                where:{
                    target_event_id:EventRecipientsData[i].event_id,type:eventType
                }
            })
     )
     const EventRecipient =await to(EventRecipients.destroy({
            where:{
                contact_id:deletedContactsArray,
            }
           }),
        );
     Promise.all([Event,Notification,EventRecipient])
            .then(result =>{
                console.log("**********Complete Results Events*************",result);
            })
             .catch(err => {
             console.log('**********ERROR RESULT EventRecipientsData****************',err);
             
    });
   }    
}
}

const removeTaskWithNotification = async(deletedContactsArray) => {
      let [errr, TaskList] = await to(Tasks.findAll({
        where: {
            contact_id:deletedContactsArray
        }
    }));
    if(errr){
        return ReE(res, { success: false, message: errr.message });
    }

   if(TaskList){
    let eventType = ['CALL','MEETING','EVENT'];

     for(let i=0;i<TaskList.length;i++){
       const NotificationData  = await to(Notifications.destroy({
                where:{
                    target_event_id:TaskList[i].id,type:eventType
                }
            })
       )
      const Task = await to(Tasks.destroy({
            where:{
                contact_id:deletedContactsArray,
            }
           }),
        )
   
   Promise.all([NotificationData,Task])
         .then(result =>{
            console.log("**********Complete Results Tasks*************",result);
         })   
         .catch(err =>{
            console.log('**********ERROR RESULT removeTaskWithNotification****************',err);
         })
       }
    }
}

const removeTodoWithNotification = async(deletedContactsArray) => {
      let [errr, TodoContactList] = await to(TodoContact.findAll({
        where: {
            contact_id:deletedContactsArray
        }
    }));
    if(errr){
        return ReE(res, { success: false, message: errr.message });
    }

   if(TodoContactList){
    let eventType = ['TODO'];

     for(let i=0;i<TodoContactList.length;i++){
        const TodoNotifications = await to(Notifications.destroy({
                where:{
                    target_event_id:TodoContactList[i].todo_id , type:eventType
                }
            })
        )
        const TodoListData = await to(TodoList.destroy({
            where:{
                id:TodoContactList[i].todo_id,
            }
           }),
        )
        const DeleteTodoContactList = await to(TodoContact.destroy({
            where:{
                contact_id:deletedContactsArray
            }
           })  
       )
      Promise.all([TodoNotifications,TodoListData,DeleteTodoContactList])
      .then(result =>{
        console.log('**********COMPLETE RESULT TODOS****************',result);
      })  
      .catch(err =>{
        console.log('**********ERROR RESULT TODOS****************',err);
      })
   }   
}
}
const removeShareGuestUserWithContact = async(deletedContactsArray) => {
      let [errr, GuestUserList] = await to(ShareGuestUser.findAll({
        where: {
            reference_id:deletedContactsArray
        }
    }));
    if(errr){
        return ReE(res, { success: false, message: errr.message });
    }

   if(GuestUserList){

     for(let i=0;i<GuestUserList.length;i++){
        const DeleteShareFileFolderEntry = await to(ShareFileFolders.destroy({
            where:{
                user_id:GuestUserList[i]['id']
            }
           }), 
       )
        const DeleteShareGuestAssociateWithContact = await to(ShareGuestUser.destroy({
            where:{
                reference_id:deletedContactsArray
            }
           })  
       )
      Promise.all([DeleteShareGuestAssociateWithContact,DeleteShareFileFolderEntry])
      .then(result =>{
        console.log('**********COMPLETE RESULT ShareGuest****************',result);
      })  
      .catch(err =>{
        console.log('**********ERROR RESULT ShareGuest****************',err);
      })
   }   
}
}
module.exports.update = update;