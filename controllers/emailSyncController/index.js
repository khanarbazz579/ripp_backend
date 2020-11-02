const EmailSyncService = require("./../../services/EmailSyncService");

module.exports = {

    async sendEmail(req, res, next) {
        let [err, provider] = await EmailSyncService.checkMailerProviderActive(req.user.id, req.body);
        if (err) return ReE(res, err, 422);
        return ReS(res, { message: "Email successfully sent. " });
    },

    async trackEmail(req, res, next) {
        var emailTrackingCode = req.params.id;
        if (req.headers.referer == "http://localhost:4200/app/view/lead/type") {
        } else if (req.headers.referer == "https://frontend.devsubdomain.com/app/view/lead/type") {
        } else {
            EmailSyncService.trackEmail(emailTrackingCode);
        }
        var buf = new Buffer([
            0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
            0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x2c,
            0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02,
            0x02, 0x44, 0x01, 0x00, 0x3b
        ]);
        res.set('Content-Type', 'image/png');
        res.end(buf, 'binary');
    },

    async downloadAttachment(req, res, next) {
        let userId = req.user.id;
        let id = req.body.id;
        let emailId = req.body.email_id;
        let [err, file] = await EmailSyncService.downloadAttachment(userId, id, emailId);
        if (err) return ReE(res, err, 422);
        return ReS(res, file);
    }
}