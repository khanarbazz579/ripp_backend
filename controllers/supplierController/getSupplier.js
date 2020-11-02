const Supplier = require('../../models').suppliers;
const SupplierDetails  = require('../../models').supplier_details;
const Contacts = require('../../models').contacts;
const ContactDetails = require('../../models').contact_details;
const Companies = require('../../models').companies;
const CompanyDetails = require('../../models').company_details;

const getCount = async function(req,res) {
    const [err,count]  = await to(
        Supplier.count()
    )
    if(err) return ReE(res, err, 422);

    return ReS(res,{count:count}, 200);
}
module.exports.getCount =getCount;

const getAll = async function(req,res) {
    let [err,data]  = await to(
        Supplier.findAll({
            include: [
            {
                model: Contacts,
                as: 'contacts',
                where : {
                    entity_type : 'SUPPLIER'
                }
            }
        ]
        })
    )
    if(err) return ReE(res, err, 422);
    
    return ReS(res,{data:data}, 200);
}
module.exports.getAll = getAll;
