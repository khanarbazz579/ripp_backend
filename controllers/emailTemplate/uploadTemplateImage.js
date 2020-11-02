const app = require("express")();
const { uploadTemplateImage } = require("../../services/multerS3Service");
const { deleteObjects } = require("../../services/emailBuilderService");
const db = require("../../models");
const ImageLogs = db.image_logs;

app.use(uploadTemplateImage);

const uploadImage = function(req, res) {
  uploadTemplateImageAws(req, res, async err => {
 
    if (err) {
      return ReE(res, err, 422);
    }
    const { file } = req;
    Object.assign(file, {
      objectUrl: `${S3_MEDIA.awsPath}${S3_MEDIA.bucketName}/${file.key}`
    });

    [error, data] = await to(
      ImageLogs.create({
        path: file.key
      })
    );

    if (error) {
      return ReE(res, err, 422);
    }

    [error, data] = await to(
      db.sequelize.query(
        `SELECT path from image_logs where created_at < DATE_SUB(NOW() , INTERVAL 1 DAY)`,
        { type: db.sequelize.QueryTypes.SELECT }
      )
    );

    const records = [];

    data.map(rec => records.push({ Key: rec.path }));

    [error] = await to(
      db.sequelize.query(
        `DELETE from image_logs where created_at < DATE_SUB(NOW() , INTERVAL 1 DAY)`,
        { type: db.sequelize.QueryTypes.SELECT }
      )
    );

    if (records.length) {
      const params = {
        Delete: {
          Objects: records
        }
      };

      deleteObjects(params)
        .then(() => ReS(res, { data: file }, 201))
        .catch(err => ReE(res, err, 422));
    } else {
      return ReS(res, { data: file }, 201);
    }
  });
};

module.exports.uploadImage = uploadImage;
