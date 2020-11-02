const Suppliers = require('../../models').suppliers;
const SupplierDetails = require('../../models').supplier_details;
const Contacts = require('../../models').contacts;
const ContactDetails = require('../../models').contact_details;
const Companies = require('../../models').companies;
const CompanyDetails = require('../../models').company_details;

const create = async function (req, res) {
    let err, data;
    let _info = req.body

    if (isEmptyObject(_info)) {
        return ReE(res, "supplier details not valid", 422);
    }

    [err, data] = await to(Suppliers.create(_info, {
        isNewRecord: true,
        include: [{
                model: SupplierDetails,
                as: 'supplier_details'
            },
            {
                model: Contacts,
                as: 'contacts',
                include: [{
                    model: ContactDetails,
                    as: "contact_details"
                }]
            },
            {
                model: Companies,
                as: 'companies',
                include: [{
                    model: CompanyDetails,
                    as: 'company_details'
                }]
            }
        ]
    }));

    if (err) return ReE(res, err, 422);

    let data_json = data.toJSON();

    return ReS(res, {
        data: data_json
    }, 201);
};
module.exports.create = create;