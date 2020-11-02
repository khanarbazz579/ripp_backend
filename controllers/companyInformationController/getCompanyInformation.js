const AccountsModel = require("../../models").accounts;



const getCompanyInformationData = async(req,res) =>{

	console.log("req.query.id>>>>>>>>>>>>>>>>>>>>>>>>>>",req.params.id);
	const[error,companyResponse] = await to(AccountsModel.findOne({
			where:{
				id:req.params.id
			}	
	}));
		if(error){
			return ReS(res, { 
    		response : error 
    	});
		}else{

			return ReS(res, { 
			message:"Information fetched successfully",	
    		companyResponse 
    	});
	}	
}

module.exports.getCompanyInformationData = getCompanyInformationData;