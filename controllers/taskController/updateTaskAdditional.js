const Lead = require('../../models').tasks;
const AdditionalField  = require('../../models').call_additional_fields;
const CustomField  = require('../../models').custom_fields;

const path = require('path');
const Sequelize = require('sequelize');
const multerS3UserProfile = require('../../services/multerS3UserProfile');
const Op = Sequelize.Op; 

const update = async function(req, res){
    
    let call_fields = req.body;
    let updatedFieldArray = [];

    if(call_fields.length > 0){

        for( let field of call_fields){

                if(field.id){
                    let _id = field.id;
    
                    additionalField = await (AdditionalField.findOne({ 
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

    return ReS( res, { fields : updatedFieldArray, message : "Task Updated Successfully" }, 200);
};
module.exports.update = update;
