const Models = require('../../models');
const Subscribers = Models.subscribers;
const Contact = Models.contacts;
const EmailList = Models.email_lists;
const Users = Models.users;

const getListByContact = async function (req, res) {
    
   let list = await getEmailListBySubscriber(req.params.id);
   
    return ReS(res, { listData: list, message: 'successfully get list ' }, 200);
}

const removeSubscribersFromList = async function (req , res){
    if(!req.body){
        return ReE(res, { message: 'No list id found to remove subscribers.' }, 422);
    }

    [err, list] = await to(Subscribers.destroy({
        where: {
                subscriber_id: req.body.subscriberId,
                list_id: req.body.listId
            }
       }));
    if(err) return ReE(res, { message: 'No list id found to remove subscribers.' }, 422);

    return ReS(res, {data:list, message: 'Successfully Removed'},200)
}

const getEmailList = async function(req, res){
     
    let listIds = req.body.list.length? req.body.list: 0;
    let list = await EmailList.findAll({
        attributes: ['id', 'list_name', 'list_description', 'priority_order','createdAt'],
        where:{
            $not:{
                id:listIds
            }
        },
        include: [
            {
                model: Users,
                as: 'By',
                attributes: ['id', 'first_name', 'last_name']
            },
            {
                model: Subscribers,
                as: 'subscribers',
                attributes: ['id'],
            }
           
        ]
    });
   return ReS(res, {listData:list, message: 'Successfully Get All list'},200)
}

const getEmailListBySubscriber = async(id) =>{

    let list = await EmailList.findAll({
        attributes: ['id', 'list_name', 'list_description', 'priority_order'],
        include: [
            {
                model: Subscribers,
                as: 'subscribers',
                where:{
                    subscriber_id: id
                }
            }
           
        ]
    });
    for(let i=0; i< list.length; i++){
        delete list[i]['dataValues']['subscribers'];
        list[i]['dataValues']['subscriber_id'] = id;
    }
    return list;
}
const addSubscription = async function(req, res){

    [err, listContact] = await to(Subscribers.bulkCreate(req.body));
    if (err) {
        return ReE(res, err, 422);
      }
      let list = await getEmailListBySubscriber(listContact[0].subscriber_id);
    return ReS(res, {listData:list, message: 'Successfully Added Subscription'},200)
} 
module.exports = {
    getListByContact,
    removeSubscribersFromList,
    getEmailList,
    addSubscription
}