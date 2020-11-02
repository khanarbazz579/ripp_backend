const Subscribers = require('./../../models').subscribers;


module.exports.unsubscribeUser = async function(req,res,next) {
let err, data,listId;
if(req.body.data.listId){
	listId = req.body.data.listId;		
}

			[err,data] = await to(Subscribers.destroy({
					where:{
						list_id:listId,
						subscriber_id:req.body.data.subscriberId
					}	
			}))
 if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        message:"User unsubscribed successfully",
        data:data
    }, 201);

}