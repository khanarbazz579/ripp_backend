const AccountsModel = require("../../models").accounts;



const addCompanyInformationData = async(req,res) =>{

	const[error,companyResponse] = await to(AccountsModel.create({
			name:req.body.company_name,
			address:req.body.address,
			company_reg_number:req.body.company_reg_number,
			company_vat_number:req.body.vat_number
	}));
		if(error){
			return ReS(res, { 
    		response : error 
    	});
		}else{
			return ReS(res, { 
			message:"Information added successfully",	
    		response : companyResponse 
    	});
	}	
}

module.exports.addCompanyInformationData = addCompanyInformationData;