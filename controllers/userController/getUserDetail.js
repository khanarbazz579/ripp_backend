const User = require('../../models').users;
const Section = require('../../models').sections;
const CustomField = require('../../models').custom_fields;
const UserDetail = require('../../models').user_details;
const FormDefaultFields = require('../../models').form_default_fields;
const GuestUser = require('../../models').share_guest_users;

const authService = require('./../../services/AuthService');

const getUserDetail = async function (req, res) {

    let sections, err, countries;
    let type = req.params.type;

    if(type == 'user'){
        [err, data] = await to(User.findOne({
            where: {
                id: req.user.id,
                is_deleted: '0'
            },
            include:[{
                model: UserDetail,
                as: "user_details"
            }]
        }));

        if (data) {

            const userData = data.dataValues;
            if (userData.birth_date) {
                const d = new Date(userData.birth_date);
                userData.birth_date = {
                    day: d.getDate(),
                    month: d.getMonth() + 1,
                    year: d.getFullYear()
                };
            }

            return ReS(res, { data: data, message: "user recieved successfully" }, 200);
        }    
    }else if(type == 'guest'){
        [err, data] = await to(GuestUser.findOne({
            where: {
                id: req.user.id,
            }
        }));
        return ReS(res, { data: data, message: "guest user recieved successfully" }, 200);        
    }
    
}
module.exports.getUserDetail = getUserDetail;
