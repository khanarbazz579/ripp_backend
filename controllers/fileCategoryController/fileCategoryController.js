const FileCategory = require('../../models').file_categories;

/**
 * Create file category object from request data
 * @param req request object
 * @param res response object
 */
const create = async function(req, res){
    
    let err, categoryObject;
    categoryObject = req.body;
    categoryObject.user_id = req.user.id;

    if(!categoryObject.name){
        return ReE(res, { success: false, message: 'Name is required.' }, 401);
    }

    [err, categoryObject] = await to(FileCategory.create(categoryObject));
    
    if(err) 
        return ReE(res, err, 422);

    return ReS( res, {
        category : categoryObject,
        message : 'File category created successfully.'
    }, 200);   
}

/**
 * Update existing file category object from request data
 * @param req request object
 * @param res response object
 */
const update = async function (req, res) {
    let err, data;

    let categoryId = req.params.id;
    let categoryBody = req.body;

    if(!categoryBody.name){
        return ReE(res, { success: false, message: 'Name is required.' }, 401);
    }

    [err, data] = await to(
        FileCategory.findByPk(categoryId)
    );

    if (err) {
        return ReE(res, err, 422);
    }

    [err, data] = await to(
        data.update(categoryBody)
    );

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        category: data,
        message: 'File category updated successfully.'
    }, 200);
};

/**
 * Get all the records of file categories
 * @param req request object
 * @param res response object
 */
const getAll = async function(req, res){
    
    let err, categoryObjects;
    
    [err, categoryObjects] = await to(
        FileCategory.findAll({
            attributes: ['id','name','user_id']
        })
    );
    
    if(err) 
        return ReE(res, err, 422);

    return ReS( res, {
        categories : categoryObjects
    }, 200);   

}

/**
 * Removes the file category
 * @param req request object
 * @param res response object
 */
const remove = async function(req, res){
    let err, data;

    const categoryId = req.params.id;

    [err, data] = await to(
        FileCategory.destroy({
            where: {
                id : categoryId
            }
        })
    );

    if(err){
        return ReE(res, err, 422);
    }

    return ReS(res, {
        category_id : categoryId,
        message : "File category deleted successfully."
    },200);
};

module.exports = {
    create: create,
    update: update,
    remove: remove,
    getAll: getAll
}