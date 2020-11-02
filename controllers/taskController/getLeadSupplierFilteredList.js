const Contact = require('../../models').contacts;
const Company = require('../../models').companies;
const LeadClient = require('../../models').leads_clients;

const getList = async function (req, res) {

    let contacts, err, filteredData = [];

    let searchTerm = req.params.search_term;
    let user_id = [req.user.id];

    if(req.roleAccess.isActive) {
        user_id = req.roleAccess.users;
    }
    [err, contacts] = await to(
        Contact.findAll({
            attributes: ['id','first_name','last_name'],
            where: {
                $or: [{
                        first_name: {
                            $like: '%' + searchTerm + '%'
                        }
                    }, {
                        last_name: {
                            $like: '%' + searchTerm + '%'
                        }
                    },
                    {
                        '$lead_client.companies.name$': {
                            $like: '%' + searchTerm + '%'
                        }
                    }
                ]
            },
            include: [{
                    model: LeadClient,
                    as: 'lead_client',
                    attributes: ['id','owner','user_id'],
                    where: {
                        owner: {
                            $in: user_id
                        },
                        user_id: {
                            $in: user_id
                        }
                    },
                    include: [{
                        model: Company,
                        as: 'companies',
                        attributes: ["name"]
                    }],
                    required: true
                }
            ],
            raw: true
        })
    );
    if (err) {
        return ReE(res, err);
    };
    if (contacts) {
        contacts.forEach((contact) => {
            let companyName = contact['lead_client.companies.name'];
            let newArr = {
                id: contact.id,
                value:  contact.first_name + ' ' + contact.last_name+ ' - ' +(companyName ? companyName : 'N/A') ,
            }
            filteredData.push(newArr)
        })
    };

    return ReS(res, {
        filteredData: filteredData
    });
};


module.exports.getList = getList;