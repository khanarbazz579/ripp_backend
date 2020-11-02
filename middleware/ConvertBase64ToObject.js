module.exports.base64ToString = (req, res ,next) =>{
    let buff = Buffer.from(req.params.data, 'base64');
    let text = buff.toString('ascii');
    req.body = JSON.parse(text);
    next();
}