const Contact = require('../../models').contacts;
const multerS3UserProfile = require('../../services/multerS3UserProfile');

const removeLeadImage = async function(req, res){
    
    if(isNaN(parseInt(req.params.contact_id)) )
        return ReE(res, { success: false, message: 'It should have requested contact id.' }, 401);

    let err;
    let requestBody = req.body;
    let contactId = req.params.contact_id;

    if(requestBody.image_name){
        let path = `lead-profile-image/${requestBody.image_name}`;
        let promise = await multerS3UserProfile.deleteProfileImageFromAws(path)    
        
        if(promise){
            [err, contact] = await to( 
                Contact.update({ profile_image : null },{
                    where: {
                        id: contactId
                    }
                })
            );
            if(err){
                return ReE(res, err, 422);
            }
            return res.json({ success: true, message: 'Deleted successfully.' });        
        }else{
            return res.json({ success: false, message: 'Wrong image name.' });
        }
    }else{
        return res.json({ success: false, message: 'No image found.' });
    }
};
module.exports.removeLeadImage = removeLeadImage;