const EntityFile = require('../../models').entity_files;
const FileNotificationDetail = require('../../models').file_notification_details;
const uploadToAws = require('../../services/multerS3Service');
const commonFunction = require('../../services/commonFunction');

const removeFile = async (req, res) => {

	const criteria = req.body;
	const userData = req.user.dataValues;

	let [err, file] = await to(
      	EntityFile.findOne({
      		where: criteria
      	})
    );

    if (err) {
        return ReE(res, err, 422);
    }
	
	if (file) {
    	// check for file owner
	    if (file.created_by != userData.id) {
	    	return res.json({ success: false, message: 'You don\'t have the required permission' });
	    }

	  	// delete from AWS
		let deleteFileFromAws = await uploadToAws.deleteFileFromAws(file.path);
	    
	    // icon
	    if (S3_MEDIA.allowed_image_file_extensions.indexOf(file.mimetype) > -1) {
	      	await uploadToAws.deleteFileFromAws(file.icon_path);
	    }
	    
	    [err, file] = await to(
	      	FileNotificationDetail.destroy({
	      		where: {
	      			file_id: criteria.id
	      		}
	      	})
	    );

	    if (err) {
	     	return res.json({ success: false, message: 'Something went wrong' });
	    }

	    [err, file] = await to(
	      	EntityFile.destroy({
	      		where: criteria
	      	})
	    );

	    if (err) {
	     	return res.json({ success: false, message: 'Something went wrong' });
	    }
	    return res.json({ success: true, message: 'Deleted succesfully' });
    } else {
  		return res.json({ success: false, message: 'File not exists' });
  	}
}

module.exports = removeFile;
