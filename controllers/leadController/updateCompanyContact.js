const Company = require('../../models').companies;
const Contact = require('../../models').contacts;

const update = async function (req, res) {
    let err, contact, company, companyBody, contactBody;

    try {
        contactBody = req.body.contact;
        companyBody = req.body.company;

        [err, contact] = await to(
            Contact.findByPk(contactBody.contact_id)
        );
        if (err) {
            return ReE(res, err, 422);
        }

        [err, contact] = await to(
            contact.update(contactBody)
        );

        [err, company] = await to(
            Company.findByPk(companyBody.company_id)
        );
        if (err) {
            return ReE(res, err, 422);
        }

        [err, company] = await to(
            company.update(companyBody)
        );

        return ReS( res, { contact: contact, company: company, message : "Contact Updated Successfully" }, 200);
        
    } catch (err) {
        return ReE(res, { success: false, message: 'Exception :' + err.message }, 401);
    }
}
module.exports.update = update;
