const Supplier = require('../../models').suppliers;
const Contacts = require('../../models').contacts;
const SupplierDetails = require('../../models').supplier_details;

//Update a supplier object through requested id
const update = async function (req, res) {
    let err, data;

    let _id = req.params.id;
    let _body = req.body;

    [err, data] = await to(
        Supplier.findByPk(_id)
    );
    if (err) {
        return ReE(res, err, 422);
    }

    [err, delSupplierDetail] = await to (
        SupplierDetails.destroy({
            where :{
                supplier_id:_id
            }
        })
    );
    if(err){
        return ReE(res, err , 422)
    }

    let supplierData =[]
    for(let fieldId of _body.customFields){
        if(fieldId){
            supplierData.push({
                custom_field_id: fieldId,
                field_value : _body.formDetails[fieldId],
                supplier_id : _id
            })
        }
    }
    [err , addSupplierDetail] = await to (
        SupplierDetails.bulkCreate(supplierData)
    );
    if(err){
        return ReE(res, err , 422);
    }
    [err , delContact] = await to (
        Contacts.destroy({
            where: { 
                entity_id: _id,
                entity_type: _body.formDetails.type
            }
        })
    );
    if(err){
        return ReE(res, err, 422);
    }
    [err, addContact] = await to (
        Contacts.bulkCreate(_body.formDetails.contacts)
    );
    if(err){
        return ReE(res, err, 422);
    }
    
    [err, data] = await to(
        data.update(_body.formDetails)
    );   
    let responeData = {
        id : data.id,
        contacts : _body.formDetails.contacts,
        customFields :supplierData,
        created_at : data.created_at,
        updated_at : data.updated_at
    }
    if (err) {
        return ReE(res, err, 422);
    }
    
    return ReS(res, {
        supplier: responeData,
        message: 'Supplier updated successfully.'
    }, 200);
};

module.exports.update = update;