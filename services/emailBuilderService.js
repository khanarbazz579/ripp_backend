const { readFileContent, deleteManyObjects } = require("./multerS3Service");

const awsBaseUrl = `${S3_MEDIA.awsPath}${S3_MEDIA.bucketName}/`;

const parseTemplate = template => {
  const deleteObjects = [],
    copyObjects = [];

  template.elements.forEach(({ type, defaults }, index) => {
    let params;
    if (["image", "imageTextRight", "imageTextLeft"].includes(type)) {
      if (defaults.image.includes("email-templates/")) {
        const { key, path } = createData(defaults.image);
        params = {
          oldPath: key,
          path
        };
        deleteObjects.push({ Key: key });
        copyObjects.push(params);
        template.elements[index]["defaults"]["image"] = `${S3_MEDIA.awsPath}${
          S3_MEDIA.bucketName
        }/${path}`;
      }
    } else if (type.includes("imageText2x2")) {
      if (defaults.image1.includes("email-templates/")) {
        const { key, path } = createData(defaults.image1);
        params = {
          oldPath: key,
          path
        };
        deleteObjects.push({ Key: key });
        copyObjects.push(params);
        template.elements[index]["defaults"]["image1"] = `${S3_MEDIA.awsPath}${
          S3_MEDIA.bucketName
        }/${path}`;
      }
      if (defaults.image2.includes("email-templates/")) {
        const { key, path } = createData(defaults.image2);
        params = {
          oldPath: key,
          path
        };
        deleteObjects.push({ Key: key });
        copyObjects.push(params);
        template.elements[index]["defaults"]["image2"] = `${S3_MEDIA.awsPath}${
          S3_MEDIA.bucketName
        }/${path}`;
      }
    } else if (type.includes("imageText3x2")) {
      if (defaults.image1.includes("email-templates/")) {
        const { key, path } = createData(defaults.image1);
        params = {
          oldPath: key,
          path
        };
        deleteObjects.push({ Key: key });
        copyObjects.push(params);
        template.elements[index]["defaults"]["image1"] = `${S3_MEDIA.awsPath}${
          S3_MEDIA.bucketName
        }/${path}`;
      }
      if (defaults.image2.includes("email-templates/")) {
        const { key, path } = createData(defaults.image2);
        params = {
          oldPath: key,
          path
        };
        deleteObjects.push({ Key: key });
        copyObjects.push(params);
        template.elements[index]["defaults"]["image2"] = `${S3_MEDIA.awsPath}${
          S3_MEDIA.bucketName
        }/${path}`;
      }
      if (defaults.image3.includes("email-templates/")) {
        const { key, path } = createData(defaults.image3);
        params = {
          oldPath: key,
          path
        };
        deleteObjects.push({ Key: key });
        copyObjects.push(params);
        template.elements[index]["defaults"]["image3"] = `${S3_MEDIA.awsPath}${
          S3_MEDIA.bucketName
        }/${path}`;
      }
    }
  });
  return { deleteObjects, copyObjects, updatedTemplate: template };
};

const getDeletionObjects = objects => {
  const itemsToDelete = [];
  objects.forEach(({ type, defaults }) => {
    if (["image", "imageTextRight", "imageTextLeft"].includes(type)) {
      if (defaults.image.includes("email-templates/")) {
        const { key } = createData(defaults.image);
        itemsToDelete.push({ Key: key });
      }
    } else if (type.includes("imageText2x2")) {
      if (defaults.image1.includes("email-templates/")) {
        const { key } = createData(defaults.image1);
        itemsToDelete.push({ Key: key });
      }
      if (defaults.image2.includes("email-templates/")) {
        const { key } = createData(defaults.image2);
        itemsToDelete.push({ Key: key });
      }
    } else if (type.includes("imageText3x2")) {
      if (defaults.image1.includes("email-templates/")) {
        const { key } = createData(defaults.image1);
        itemsToDelete.push({ Key: key });
      }
      if (defaults.image2.includes("email-templates/")) {
        const { key } = createData(defaults.image2);
        itemsToDelete.push({ Key: key });
      }
      if (defaults.image3.includes("email-templates/")) {
        const { key } = createData(defaults.image3);
        itemsToDelete.push({ Key: key });
      }
    }
  });
  return itemsToDelete;
};

const createData = url => {
  const key = decodeURIComponent(url.replace(awsBaseUrl, ""));
  const path = key.replace("trash", "template-images");
  return { key, path };
};

const readObject = path => {
  return new Promise((resolve, reject) => {
    readFileContent(path, (error, response) => {
      if (error) {
        return reject(error);
      }
      return resolve(response);
    });
  });
};

const deleteObjects = params => {
  return new Promise((resolve, reject) => {
    deleteManyObjects(params, (error, response) => {
      if (error) {
        return reject(error);
      }
      return resolve(response);
    });
  });
};

module.exports = {
  parseTemplate,
  getDeletionObjects,
  readObject,
  deleteObjects
};
