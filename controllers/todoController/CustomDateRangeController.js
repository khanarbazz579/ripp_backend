const CustomDateRangeFilter = require('./../../models').custom_date_range_filters;

// Create custom date range with user id and type 
const create = async function(req, res){
    let err, customDateRangeFilter;
    
    customDateRangeFilter = req.body;
    customDateRangeFilter.user_id = req.user.id;

    [err, customDateRangeFilter] = await to(CustomDateRangeFilter.create(customDateRangeFilter));
    
    if(err){
        return ReE(res, err, 422);
    }

    return ReS(res,{
    	customDateRangeFilter: customDateRangeFilter
    }, 201);
};
module.exports.create = create;

// Fetch the custom data range filter of a user based on type
const get = async function(req, res){
    let [err, customDateRangeFilter] = await to(
        CustomDateRangeFilter.findOne({
        	where: {
            	user_id: req.user.id,
            	type: req.params.type
        	}
    	})
    );

    if(err){
        return ReE(res, err, 422);
    }

    return ReS(res, {
    	customDateRangeFilter: customDateRangeFilter
    }, 200);
};
module.exports.get = get;

// Update custom date range with user id and type 
const update = async function(req, res){
    let err, customDateRangeFilter;

    customDateRangeFilter = req.body;
    customDateRangeFilter.user_id = req.user.id;

    [err, customDateRangeFilter] = await to(
    	CustomDateRangeFilter.update(customDateRangeFilter,{
    		where:{
    			id: req.params.id
    		}
    	}
    ));
    
    if(err){
        return ReE(res, err, 422);
    }

    return ReS(res,{
    	customDateRangeFilter: customDateRangeFilter
    }, 201);
};
module.exports.update = update;