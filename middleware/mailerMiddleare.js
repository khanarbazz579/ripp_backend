const { outlookMailerController, googleMailerController, impaMailerController } = require('./../controllers/mailerController/');
module.exports.callControllerMethod = function (method) {
    if (typeof method == undefined) {
        throw ("Call undefined route");
    } else {
        return function (req, res, next) {
            if (req.body.provider === "outlook") {
                outlookMailerController[method](req, res, next);
            } else if (req.body.provider === "google") {
                googleMailerController[method](req, res, next);
            } else if (req.body.provider === "custom") {
                impaMailerController[method](req, res, next);
            } else {
                res.json({ status: "Error", message: "Invalid provider" });
            }
        }
    }
};
