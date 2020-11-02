const fs = require("fs");
const async = require("async");
const EmailTemplates = require("../../models").email_templates;
const { encrypt, decrypt } = require("../../services/commonFunction");
const {
  uploadSingleFile,
  readFileContent,
  deleteManyObjects
} = require("../../services/multerS3Service");
const {
  parseTemplate,
  getDeletionObjects
} = require("../../services/emailBuilderService");

const dir = `${process.cwd()}/email-template-uploads`;

const update = async (req, res) => {
  let {
    body: { template },
    user: { dataValues: user },
    params: { id }
  } = req;

  const uniqueFileName = `${+new Date()}_${user.id}.txt`;
  const localUploadPath = `${dir}/${uniqueFileName}`;

  if (isEmptyObject(template)) {
    return ReE(res, "template data not valid", 422);
  }

  [err, templateData] = await to(
    EmailTemplates.findOne({
      where: { id, created_by: user.id }
    })
  );

  templateData = templateData.dataValues;
  let itemsToDelete = [];

  readPreviousTemplate(templateData.path)
    .then(previousTemplate => {
      // get previous images to delete
      itemsToDelete = getDeletionObjects(previousTemplate.elements);

      // get current images & move images to delete
      const { copyObjects, deleteObjects, updatedTemplate } = parseTemplate(
        template
      );

      itemsToDelete = [...itemsToDelete, ...deleteObjects];
      template = updatedTemplate;

      // move images
      return moveImages(copyObjects);
    })
    .then(() => {
      // delete trash/over-written images & previous template
      itemsToDelete.push({ Key: templateData.path });
      const deleteParams = {
        Delete: {
          Objects: itemsToDelete
        }
      };
      deleteManyObjects(deleteParams, err => {
        console.log("err", err);
      });
      // write new file to AWS
      return writeToFile(template, localUploadPath);
    })
    .then(data => {
      const path = `email-templates/${user.email}/${uniqueFileName}`;
      return uploadToAws(localUploadPath, path);
    })
    .then(async result => {
      fs.unlinkSync(localUploadPath);

      [err, data] = await to(
        EmailTemplates.update(
          {
            name: template.newEmailName,
            path: result.key
          },
          { where: { id, created_by: user.id } }
        )
      );

      if (err) {
        return ReE(res, err, 422);
      }

      return ReS(res, { data }, 200);
    })
    .catch(err => {
      console.log("err", err);
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

const readPreviousTemplate = path => {
  return new Promise((resolve, reject) => {
    readFileContent(path, (err, data) => {
      let parsedTemplate = {};
      if (err) {
        resolve(parsedTemplate);
      }
      parsedTemplate = decrypt(data.Body.toString("utf-8"));
      parsedTemplate = JSON.parse(parsedTemplate);
      resolve(parsedTemplate);
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

module.exports.update = update;
