const Sequelize = require('sequelize');
const Models = require('../../models');
const { createContactIncludeModelForFilterFields } = require('./../../services/customFilterService');
const Contacts = Models.contacts;
const ContactsDetails = Models.contact_details;
const Subscribers = Models.subscribers;
const CustomFields = Models.custom_fields;
const User = Models.users;
const SaleStage = Models.sales_stages;
const Country = Models.countries;
const Currency = Models.currencies;
const LeadClient = Models.leads_clients;
const ContactFilters = Models.contact_filters;
// const EmailLists = Models.email_lists;

const createDropdownAttribute = async function (field, data) {
    switch (field.control_type) {
        case "currency":
            field.additional_attribute = data.currencyList;
            break;
        case "country_dropdown":
            field.additional_attribute = data.countryList;
            break;
        case "lead_owner":
            field.additional_attribute = data.userList;
            break;
        case "sales_stage":
            field.additional_attribute = data.saleStageList;
            break;
    };
    return field;
};

/* Get available attribute options from the database */
const getAttributesdata = async function () {
    let err, countryList, userList, saleStageList, currencyList;

    [err, currencyList] = await to(Currency.findAll({
        attributes: [
            ['symbol', 'value'],
            ['id', 'key']
        ]
    }));
    if (err) return ReE(res, {
        err,
        message: 'error getting attributes data.'
    }, 422);
    [err, countryList] = await to(Country.findAll({
        attributes: [
            ['name', 'value'],
            ['id', 'key']
        ]
    }));
    if (err) return ReE(res, {
        err,
        message: 'error getting attributes data.'
    }, 422);
    [err, userList] = await to(User.findAll({
        where: {
            is_deleted: 0
        },
        attributes: [
            ['id', 'key'],
            [Sequelize.fn("concat", Sequelize.col("first_name"), ' ', Sequelize.col("last_name")), 'value']
        ]
    }));
    if (err) return ReE(res, {
        err,
        message: 'error getting attributes data.'
    }, 422);
    [err, saleStageList] = await to(SaleStage.findAll({
        where: {
            is_pipeline: false
        },
        attributes: [
            ['name', 'value'],
            ['id', 'key']
        ]
    }));
    if (err) return ReE(res, {
        err,
        message: 'error getting attributes data.'
    }, 422);

    return {
        currencyList,
        countryList,
        userList,
        saleStageList
    }
}

/* Get available custom fields for contacts */
const getContactCustomFields = async function (req, res) {
    let fields, err, data;
    [err, fields] = await to(CustomFields.findAll({
        where: {
            //   table_name: ['contacts', 'contact_details'],
            type: ['BOTH', 'LEAD', 'CLIENT'],
            /* Brings contact fields set for Both(Lead and Client) */
            control_type: {
                '$notIn': ['note', 'action_button']
            }
        }
    }));

    if (err) return ReE(res, err, 422);
    data = await getAttributesdata();
    if (fields && fields.length) fields.forEach(field => {
        createDropdownAttribute(field.dataValues, data);
    });

    return ReS(res, {
        fields
    }, 200);
}

/* Make Filter object for static contact fields */
// const makeFilterObject = function (filter, whereObj) {
//    // let filterBy = filter.custom_field.model_name;
//     if (filter.custom_field_id === 5) filterBy = 'first_name';
//     if (filter.custom_field_id === 6) filterBy = 'last_name';
//     if (filter.custom_field_id === 7) filterBy = 'email';
//     if (filter.custom_field_id === 8) filterBy = 'phone_number';

//     if (filter.value === null && (filter.option === '$eq' || filter.option === '$ne')) {
//         whereObj.$or = [];
//         whereObj.$or.push({
//             [filterBy]: {
//                 [filter.option]: null
//             },
//             [filterBy]: {
//                 [filter.option]: ''
//             }
//         });
//     } else {
//         if (!whereObj.$and) whereObj.$and = [];
//         if (filter.option === '$isNull') {
//             filter.option = '$eq';
//             filter.value = null;
//         }
//         whereObj.$and.push({
//             [filterBy]: {
//                 [(filter.option === '$notNull') ? '$ne' : filter.option]: filter.value
//             }
//         });
//     }
//     return {
//         where: whereObj
//     };
// }

/* get the Operator */
// const getOperator = function (option) {
//     return (option === '$eq') ? '=' :
//         (option === '$ne' ? '!=' : (
//             option === '$like' ? 'LIKE' : (
//                 option === '$notLike' ? 'NOT LIKE' : (
//                     option === '$isNull' ? '=' : (
//                         option === '$notNull' ? '!=' : ''
//                     )
//                 )
//             )
//         ));
// }

/* Make query to filter data as per custom fields, if exists */
// const makeSubquery = function (filter, subquery, counter) {
//     let operator = getOperator(filter.option);
//     if (counter === 0) {
//         subquery = ` (custom_field_id = ${filter.custom_field_id}  AND field_value  ${operator}  '${filter.value}' )`;
//     } else {
//         subquery += ` OR
//     (custom_field_id = ${filter.custom_field_id}  AND field_value  ${operator} '${filter.value}' )`
//     }
//     return subquery;
// }

/* Executes subquery and get contact ids to get aggregated data as per subquery */
// const getContactIdFromCustomFilter = async function (whereObj, counter, subquery, res) {
//     [err, contacts] = await to(Models.sequelize.query(`SELECT contact_id, COUNT(*) as cnt from contact_details 
//         WHERE ${subquery} GROUP BY contact_id HAVING cnt = ${counter} `));

//     if (err) return ReE(res, err, 422);

//     contact_ids = [];
//     if (contacts[0]) contacts[0].forEach(contact => {
//         contact_ids.push(contact.contact_id);
//     });
//     if (!whereObj.$and) whereObj.$and = [];
//     whereObj.$and.push({
//         id: contact_ids
//     });

//     return whereObj;
// }

/* Method to filter subscriber as per JSON filter fields passed */
const filterSubscribers = async function (fields, list_id, res, user_id, returnCountOnly = false) {
    let whereObj, counter = 0,
        subquery = '',
        includeObj = [],
        err, data, hasCustomFilter = false;
    if (fields && fields.length > 0) {

        let { includedObj, mainTableConditions } = await createContactIncludeModelForFilterFields(fields, 'contacts', user_id);

        [err, data] = await to(Subscribers.findAll({
            where: {
                list_id
            },
            include: [{
                model: Contacts,
                as: 'subscriber',
                where: mainTableConditions,
                include: includedObj
            }]
        }));

        if (data && data.length) {

            for (let i = 0; i < data.length; i++) {
                let el = (data[i].dataValues && data[i].dataValues['subscriber']) ? data[i].dataValues['subscriber'].dataValues : data[i].dataValues;
                if (el && el.contact_details && el.contact_details.length) {
                    for (let j = 0; j < el.contact_details.length; j++) {
                        const cont = el.contact_details[j].dataValues;
                        if (typeof cont.custom_field.dataValues.label === 'string') {
                            el[cont.custom_field.dataValues.label] = cont.field_value;
                        }
                    }
                }
            }

            await asyncForEach(data, async el => {
                if (el.dataValues && el.dataValues.subscriber_id) {
                    [err, listSubscriber] = await to(Subscribers.findAll({
                        where: {
                            subscriber_id: el.dataValues.subscriber_id
                        },
                        attributes: ['list_id']
                    }));
                    if (err) {
                        return ReE(res, err, 422);
                    }
                    if (el.dataValues.subscriber) {
                        el.dataValues.subscriber.dataValues.list_id = listSubscriber;
                    }
                }
            });
        }

        if (err) return ReE(res, err, 422);
        if (returnCountOnly) return data;
        else return ReS(res, {
            data: data
        }, 200);
    }

}

/* Method to filter contacts as per JSON filter fields passed */
const filterContacts = async function (fields, res, user_id) {
    let err, data;
    if (fields && fields.length > 0) {
        let { includedObj, mainTableConditions } = await createContactIncludeModelForFilterFields(fields, 'contacts', user_id);

        includedObj.push({
            model: Subscribers,
            as: 'subscribers'
        });

        [err, data] = await to(Contacts.findAll({
            where: mainTableConditions,
            include: includedObj
        }));

        if (data && data.length) {
            for (let i = 0; i < data.length; i++) {
                let el = data[i].dataValues;
                if (el.contact_details && el.contact_details.length) {
                    for (let j = 0; j < el.contact_details.length; j++) {
                        const cont = el.contact_details[j].dataValues;
                        if (typeof cont.custom_field.dataValues.label === 'string') {
                            el[cont.custom_field.dataValues.label] = cont.field_value;
                        }
                    }
                }
            }
        }

        if (err) return ReE(res, {
            err,
            callId: 123
        }, 422);
        return ReS(res, {
            data
        }, 200);
    }
}

/* Method to check for active tab and calls appropriate filter method accordingly */
const filterData = async function (req, res) {
    const {
        fields,
        active_tab,
        list_id
    } = req.body;
    let user_id = [req.user.id];
    if (req.roleAccess.isActive) {
        user_id = req.roleAccess.users;
    }
    if (active_tab && active_tab === 'add') {
        if (fields.length === 0) {
            let [err, data] = await to(Contacts.findAll({
                include: [{
                    model: LeadClient,
                    as: 'lead_client'
                },
                {
                    model: Subscribers,
                    as: 'subscribers'
                }
                ]
            }));

            if (err) return ReE(res, err, 422);
            return ReS(res, {
                data
            }, 200);
        } else {
            filterContacts(fields, res, user_id);
        }
    } else if (active_tab === 'view') {
        if (fields.length === 0) {
            let [err, data] = await to(Subscribers.findAll({
                where: {
                    list_id
                },
                include: [{
                    model: Contacts,
                    as: 'subscriber',
                    include: [{
                        model: LeadClient,
                        as: 'lead_client'
                    }]
                }]
            }));

            if (err) return ReE(res, {
                err,
                callId: 456
            }, 422);
            return ReS(res, {
                data
            }, 200);
        } else {

            filterSubscribers(fields, list_id, res, user_id);
            //filterContacts(fields, res);
        }
    } else {
        return ReE(res, {
            message: 'Unknown request.'
        }, 422);
    }
}

/* Method to saveContactFilter for the add/view subscribers tab*/
const saveContactFilter = async function (req, res) {
    let {
        body: {
            list_id,
            type,
            filterJson
        },
        user
    } = req;
    let whereObj = {
        list_id,
        user_id: user.id
    }
    if (type) whereObj.type = type;
    let [err, filter] = await to(ContactFilters.findOne({
        where: whereObj
    }));

    if (filter) {
        [err, filter] = await to(filter.update({
            filterJson
        }, {
            where: {
                list_id,
                user_id: user.id
            }
        }));
    } else {
        [err, filter] = await to(ContactFilters.create({
            user_id: user.id,
            list_id,
            type,
            filterJson
        }));
    }

    if (err) return ReE(res, {
        err,
        callId: 462
    }, 422);

    return ReS(res, filter, 200);
}

/* Method to getContactFilter for the view subscribers tab*/
const getContactFilter = async function (req, res) {
    let {
        params: {
            list_id
        },
        user,
        query: {
            type
        }
    } = req;

    if (isNaN(list_id)) {
        return ReE(res, {
            message: 'No List Id recieved'
        }, 422);
    }
    let whereObj = {
        list_id,
        user_id: user.id
    }
    if (type) whereObj.type = type;

    const [err, filter] = await to(ContactFilters.findOne({
        where: whereObj
    }));

    if (err) return ReE(res, {
        err,
        callId: 473
    }, 422);

    if (filter && filter.filterJson && typeof filter.filterJson === 'string') {
        filter.filterJson = JSON.parse(filter.filterJson);
    }

    return ReS(res, (filter ? filter : {}), 200);
}


module.exports = {
    filterData,
    getContactCustomFields,
    saveContactFilter,
    getContactFilter,
    filterSubscribers
}