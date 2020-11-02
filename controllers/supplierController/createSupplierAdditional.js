const SupplierAdditional = require('../../models').supplier_details;

//Create a supplier additional object
const create = async function(req, res){
    
    const additionalFieldObject = req.body;
    console.log("Body Data -----------------___>",req.body);
    
    let err, supplierAdditionalField;
    
    [err, supplierAdditionalField] = await to(SupplierAdditional.create(additionalFieldObject));
    if(err) return ReE(res, err, 422);

    return ReS( res, {
    	supplierAdditionalField : supplierAdditionalField
    }, 200);   
}
module.exports.create = create;