const Files = require('../../models').files;
const uploadToAws = require('../../services/multerS3Service');

const generateuniqueStamp = async (req, res) => {
    const unique = Math.floor(Date.now() / 1000);
    const userId = req.user.id;
    const uniqueUserStamp = `${unique}-${userId}`
    return res.json({ success: true, data: uniqueUserStamp });
}

const removeuniqueStamp = async (req, res) => {
    delete GLOBAL_USER_SESSION[req.params.uniquestamp];
    return res.json({ success: true});
}

module.exports = {
    generateuniqueStamp,
    removeuniqueStamp
}
