const commonFunction = require('../../services/commonFunction');

/**
  * Associate contacts with file
  * @param object request body
  * @param object response body
  */
updateAssociatedContact = async (req, res) => {
    
    await commonFunction.mediaCommonFunction.updateAssociateContacts(req.body);
    
    return ReS(res, {
        message: "Data updated" 
    }, 200);
}

module.exports = updateAssociatedContact;