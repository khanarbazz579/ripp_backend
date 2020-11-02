/**
 * Created by cis on 06/02/19.
 */
const EmailProvider = require('../../models').email_providers;

const EmailUsers = require('../../models').email_users

/**
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @description For fetch all providers list
 */
const getAll = async function(req, res) {
    let err, email_providers;
    [err, email_providers] = await to(
        EmailProvider.findAll({
            attributes: ['id', 'email_provider_name']
        })
    );
    if (err) {
        return ReE(res, err, 422);
    }
    return ReS(res, {
        email_providers: email_providers
    }, 200);
};

/**
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @description For create new provider
 */
const createProvider = async function(req, res) {
    const additionalFieldObject = req.body;
    let err, providerAdditionalField;
    [err, providerAdditionalField] = await to(EmailProvider.create(additionalFieldObject));
    if (err) return ReE(res, err, 422);
    return ReS(res, {
        providerAdditionalField: providerAdditionalField
    }, 200);
};

/**
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @description For upate existing provider
 */
const updateProviders = async function(req, res) {
    let err, providers, providerId, providerObject;
    if (isNaN(parseInt(req.params.id)))
        return ReE(res, { success: false, message: 'It should have requested provider id.' }, 401);
    providerId = req.params.id;
    providerObject = req.body;
    [err, providers] = await to(
        EmailProvider.update(providerObject, {
            where: { id: providerId }
        })
    );
    if (err) {
        return ReE(res, err);
    }
    return ReS(res, {
        email_providers: providers
    });
}

/**
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @description For delete existing provider
 */
const deleteProviders = async function(req, res) {
    let email_providers, err, providerId;
    if (req.params.id && isNaN(parseInt(req.params.id)))
        return ReE(res, { success: false, message: 'It should have requested email provider id.' }, 401);
    providerId = req.params.id;
    [err, email_providers] = await to(
        EmailProvider.destroy({
            where: { id: providerId }
        })
    );
    if (err) return ReE(res, 'error occured trying to delete email provider');
    return ReS(res, { message: 'Deleted email provider.' }, 200);
}

const deleteEMailIDWAsProvidersDelete = async function(req,res) {
    let email_providers, err, providerId;
    if (req.params.id && isNaN(parseInt(req.params.id)))
        return ReE(res, { success: false, message: 'It should have requested email provider id.' }, 401);
    providerId = req.params.id;
    [err, email_providers] = await to(
        EmailUsers.destroy({
            where: { email_provider_id: providerId }
        })
    );
    if (err) return ReE(res, 'error occured trying to delete email users of perticular providers');
    return ReS(res, { message: 'Deleted email users.' }, 200);
}










module.exports.getAll = getAll;
module.exports.createProvider = createProvider;
module.exports.updateProviders = updateProviders;
module.exports.deleteProviders = deleteProviders;
module.exports.deleteEMailIDWAsProvidersDelete = deleteEMailIDWAsProvidersDelete;