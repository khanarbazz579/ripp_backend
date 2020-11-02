const Contact = require('../../models').contacts;
const path = require('path');
const multerS3UserProfile = require('../../services/multerS3UserProfile');

//Updates the lead object and also create additional fields
const uploadLeadImage = async function(req, res){

    let err, contact;
    let requestBody = req.body;
    let image_name;

    if(req.file){
        
        if(requestBody.old_image_name){
            let path = `lead-profile-image/${requestBody.old_image_name}`;
            let promise = await multerS3UserProfile.deleteProfileImageFromAws(path);  
            if(promise){
                console.log("++++++++++++++++++++ DELETED", promise)
            }  
        }

        multerS3UserProfile.uploadSingleImage(req.file, req.params, async (response) => {
            if(response){
                image_name = path.basename(response);
                if(requestBody.id){
                    [err, contact] = await to( 
                        Contact.update({ profile_image : image_name },{
                            where: {
                                id: requestBody.id
                            }
                        })
                    );
                    if(err){
                        return ReE(res, err, 422);
                    }    
                }else{
                    [err, contact] = await to( 
                        Contact.create({ 
                            entity_id : requestBody.lead_client_id,
                            entity_type : "LEAD_CLIENT",
                            profile_image : image_name 
                        })
                    );
                    if(err){
                        return ReE(res, err, 422);
                    }
                }
                
                return ReS( res, { image_name : image_name, message : "Image Uploaded." }, 200);                
            }
        });    

    }else{
        return res.json({ success: false, message: 'Something went wrong' });
    }

    

};
module.exports.uploadLeadImage = uploadLeadImage;