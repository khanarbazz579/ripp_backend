const EmailTemplates = require("../../models").email_templates;
const {
  readObject,
  deleteObjects,
  getDeletionObjects
} = require("../../services/emailBuilderService");
const { decrypt } = require("../../services/commonFunction");

const remove = async function (req, res) {
  const {
    params: { id }
  } = req;

  [err, data] = await to(
    EmailTemplates.findOne({
      attributes: [["path", "Key"]],
      where: {
        id
      }
    })
  );

  if (err) {
    return ReE(res, err, 422);
  }
  if (!data || data === null) {
    return ReE(res, 'Template not found', 404);
  }

  const path = data.dataValues;
  readObject(path.Key)
    .then(data => {
      const encryptedString = data.Body.toString("utf8");
      const templateString = decrypt(encryptedString);
      const parsedTemplate = JSON.parse(templateString);
      const itemsToDelete = getDeletionObjects(parsedTemplate.elements);
      itemsToDelete.push(path);

      const params = {
        Delete: {
          Objects: itemsToDelete
        }
      };
      return deleteObjects(params);
    })
    .then(async data => {
      [err] = await to(
        EmailTemplates.destroy({
          where: {
            id
          }
        })
      );

      if (err) {
        return ReE(res, err, 422);
      }
      return ReS(res, { id }, 200);
    })
    .catch(error => {
      return ReE(res, error, 422);
    });
};

module.exports.remove = remove;
