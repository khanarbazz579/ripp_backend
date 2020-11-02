const fs = require("fs");
const async = require("async");
const EmailTemplates = require("../../models").email_templates;
const { encrypt } = require("../../services/commonFunction");
const {
  uploadSingleFile,
  copyFileToAws,
  deleteManyObjects
} = require("../../services/multerS3Service");
const { parseTemplate } = require("../../services/emailBuilderService");

const dir = `${process.cwd()}/email-template-uploads`;

const create = function(req, res) {
  let {
    body: { template, template_type },
    user: { dataValues: user }
  } = req;

  const uniqueFileName = `${template_type}_${+new Date()}_${user.id}.txt`;
  const localUploadPath = `${dir}/${uniqueFileName}`;

  if (isEmptyObject(template)) {
    return ReE(res, "template data not valid", 422);
  }

  const { copyObjects, deleteObjects, updatedTemplate } = parseTemplate(
    template
  );

  template = updatedTemplate;

  moveImages(copyObjects)
    .then(() => {
      const deleteParams = {
        Delete: {
          Objects: deleteObjects
        }
      };

      deleteManyObjects(deleteParams, err => {
        console.log("err", err);
      });

      return writeToFile(template, localUploadPath);
    })
    .then(data => {
      const path = `email-templates/${user.email}/${uniqueFileName}`;
      return uploadToAws(localUploadPath, path);
    })
    .then(async result => {
      fs.unlinkSync(localUploadPath);

      [err, data] = await to(
        EmailTemplates.create({
          name: template.newEmailName,
          created_by: user.id,
          path: result.key,
          type: template_type
        })
      );

      if (err) {
        return ReE(res, err, 422);
      }

      return ReS(res, { data: data.toJSON() }, 201);
    })
    .catch(err => {
      return ReE(res, err, 422);
    });
};

const writeToFile = (template, filename) => {
  return new Promise((resolve, reject) => {
    const templateString = JSON.stringify(template);
    const encryptString = encrypt(templateString);

    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir);
      } catch (e) {
        reject("Something went wrong");
      }
    }
    fs.writeFile(filename, encryptString, error => {
      if (error) {
        reject("Something went wrong");
      }
      resolve(true);
    });
  });
};

const uploadToAws = (filePath, awsPath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, async (err, data) => {
      if (err) {
        reject("File not found.");
      }
      uploadSingleFile(awsPath, data, (error, result) => {
        if (error) {
          reject(error);
        }
        resolve(result);
      });
    });
  });
};

const moveImages = objects => {
  return new Promise((resolve, reject) => {
    async.each(
      objects,
      async (object, cb) => {
        const res = await copyFileToAws(object);
      },
      err => {
        return resolve(true);
      }
    );
  });
};

module.exports.create = create;
