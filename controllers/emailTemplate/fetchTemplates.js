const EmailTemplates = require("../../models").email_templates;
const { readObject } = require("../../services/emailBuilderService");
const { decrypt } = require("../../services/commonFunction");

const fetchAll = async (req, res) => {
  const {
    user: { dataValues: user },
    params: { type }
  } = req;

  [err, data] = await to(
    EmailTemplates.findAll({
      where: {
        created_by: user.id,
        type
      }
    })
  );

  if (err) {
    return ReE(res, err, 422);
  }

  return ReS(res, { data }, 200);
};

const fetchOne = async (req, res) => {
  const {
    user: { dataValues: user },
    params: { id }
  } = req;
  [err, data] = await to(
    EmailTemplates.findOne({
      where: {
        created_by: user.id,
        id
      }
    })
  );

  if (err) {
    return ReE(res, err, 422);
  }

  if (!data) {
    return ReS(res, { data: null }, 200);
  }

  const { dataValues } = data;

  readObject(dataValues.path)
    .then(response => {
      const encryptedString = response.Body.toString("utf8");
      const templateString = decrypt(encryptedString);
      const parsedTemplate = JSON.parse(templateString);
      
      return ReS(res, { data: { email: parsedTemplate, dataValues } }, 200);
    })
    .catch(err => ReE(res,err, 422));

};

module.exports = { fetchAll, fetchOne };
