const EmailTemplates = require("../../models").email_templates;
const { readObject } = require("../../services/emailBuilderService");
const { decrypt } = require("../../services/commonFunction");
const datatable = require('sequelize-datatable');

const fetchAll = async (req, res) => {
  let user = req.user;
  let seachFor = (req.body.query.search) ? req.body.query.search : '';
  let orderData = (req.body.query.sort) ? req.body.query.sort : { by: 'created_at', type: 'DESC' }
  const {
    params: { type }
  } = req;


  let user_id = {
    $in: [user.id]
  };
 
 //Object is for sorting and searching the email template lists
 let queryObject = {
        order: [
            [
                [orderData.by, orderData.type]
            ]
        ],
         where: {
                name: { $like: '%' + seachFor + '%' },
                //'$subscriber_mails.email$': { $like: '%' + seachFor + '%' }
            },
    };

  if (req.roleAccess.isActive) {
    user_id = {
      $in: req.roleAccess.users
    }
  }

 datatable(EmailTemplates,req.body.query,queryObject)
        .then((result) => {
            return ReS(res, { result: result}, 201);
        });
};
module.exports = { fetchAll };