const Supplier = require('../../models').suppliers;

//Update a supplier object through requested id
const remove = async function (req, res) {
    let err, data;

    let _id = req.params.id;

    [err, data] = await to(
        Supplier.destroy({
            where: {
                id : _id
            }
        })
    );

    if (err) {
        return ReE(res, err, 422);
    }

    return ReS(res, {
        supplier: data,
        message: 'Supplier removed successfully.'
    }, 200);
};

module.exports.remove = remove;