const Supplier = require('../../models').suppliers;
const AdditionalField  = require('../../models').supplier_additional_fields;
const CustomField  = require('../../models').custom_fields;

const path = require('path');
const Sequelize = require('sequelize');
const multerS3UserProfile = require('../../services/multerS3UserProfile');
const Op = Sequelize.Op; 

//Updates the supplier object and also create additional fields
const supplierDetail = async function(req, res){
    
    let err;
    let supplier = {}
    
    let supplierInfo = Object.assign({user_id: req.user.id,...req.body});   

    if(supplierInfo.profile_image == "null"){
        supplierInfo.profile_image = "";
    }

    if(supplierInfo.id){
        [err, supplier] = await to(
            Supplier.findOne({ 
                where: {
                    id: supplierInfo.id
                }
        }));
        
        if(err){
            return ReE(res, err, 422);
        }
        
        [err, supplier] = await to( 
            supplier.update(supplierInfo)
        );
        if(err){
            return ReE(res, err, 422);
        }
    }else{
        [err, supplier] = await to( 
            Supplier.create(supplierInfo)
        );
    }   
    supplier = supplier.toJSON();

    let updatedFieldArray = [];
    let additionalField;

    if(supplierInfo.fields){

        supplierInfo.fields = JSON.parse(supplierInfo.fields);
        
        if(supplierInfo.deleted_field_id){
            await (
                AdditionalField.destroy({
                    where: { 
                        id : {
                            [Op.in]: JSON.parse(supplierInfo.deleted_field_id)
                        }
                    }
                }) 
            );    
        }

        if(supplierInfo.fields.length > 0){
            
            for( let field of supplierInfo.fields){

                if(field.field_id == 'secondary_contact_data' || isNaN(field.field_id)){
                    continue;
                }

                if(field.id){
                    let _id = field.id;
    
                    additionalField = await (AdditionalField.find({ 
                        where: {id: _id}, 
                        include:[
                            { model: CustomField, as: 'fields' }
                        ]
                    }));
                    
                    [err, additionalField] = await to(
                        additionalField.update(field,{
                            include: [
                                { model: CustomField, as: 'fields' }
                            ]
                        })
                    );

                    if(err){
                        return ReE(res, err, 422);
                    }

                    updatedFieldArray.push(additionalField);
                    
                }else{
                    
                    field.supplier_id = supplier.id;

                    let createdField = await (AdditionalField.create(field,{ 
                        include:[
                            { model: CustomField, as: 'fields' }
                        ]
                    }));

                    let fields = await (CustomField.findByPk(createdField.field_id));
                    
                    createdField = createdField.toJSON();
                    createdField['fields'] = fields;
                    updatedFieldArray.push(createdField);
                }
            }
        }
    }
    supplier['fields'] = updatedFieldArray;

    return ReS( res, { supplier : supplier, message : "Supplier Updated Successfully" }, 200);
};
module.exports.supplierDetail = supplierDetail;