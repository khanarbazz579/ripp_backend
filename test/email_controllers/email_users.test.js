const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const imapHelper = require("./../../helpers/imapHelper");
const should = chai.should();
chai.use(chaiHttp);
const expect = chai.expect;
//let token;

let emailProviders = {
    id: 31,
    email_provider_name: 'Other Provider'
}
let imapUser = {
    email_provider_id: 31,
    email_user_name: 'dhyanesh.j@outlook.com',
    email_user_password: 'dny@123456',
    email_port: 993,
    email_host: 'outlook.office365.com',
    type: 'IMAP',
    use_ssl: 1
};
let smtpUser = {
    email_provider_id: 31,
    email_user_name: 'dhyanesh.j@outlook.com',
    email_user_password: 'dny@123456',
    email_port: 587,
    email_host: 'smtp.office365.com',
    type: 'SMTP',
    use_ssl: 1
};


describe('EmailUsers', () => {
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });
    before((done) => { //Before each test we empty the database
        commonFunction.sequalizedDb(['users', 'permission_sets', 'user_roles', 'email_users', 'email_providers']).then(() => {
            const role = generatedSampleData.createdSampleData("user_roles", 1);
            const permission = generatedSampleData.createdSampleData("permission_sets", 1);
            user = generatedSampleData.createdSampleData("users", 1)[0]
            commonFunction.addDataToTable("user_roles", role[0]).then((role_data) => {
                user.role_id = role_data.id
                commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_data) => {
                    user.permission_set_id = permission_data.id;
                    commonFunction.addDataToTable("users", user).then((data) => {
                        commonFunction.addDataToTable("email_providers", emailProviders).then((data) => {
                            commonFunction.addDataToTable("email_users", imapUser).then((data) => {
                                commonFunction.addDataToTable("email_users", smtpUser).then((data) => {
                                    done();
                                });
                            });
                        })
                    });
                })
            });
        });
    });

    it('it should be login user with token and credential', () => {
        return chai.request(server)
            .post('/api/users/login')
            .send(user)
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.token.should.be.a('string');
                token = res.body.token;
                loggedInUser = res.body.user;
                res.body.user.should.be.a('object');
                res.body.user.first_name.should.be.eql(user.first_name);
                res.body.user.last_name.should.be.eql(user.last_name);
                res.body.user.email.should.be.eql(user.email);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
    // it('it should be get folders without auth token', () => {
    //     return chai.request(server)
    //         .get('/api/getEmailUsers')
    //         .then((res) => {
    //             res.should.have.status(200);
    //         }).catch(function (err) {
    //             return Promise.reject(err);
    //         });
    // });
    it('it should be createEmailUsers without auth token  ll', () => {
        return chai.request(server)
            .post('/api/createEmailUsers')
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                // res.body.should.be.a('object');
                // res.body.message.should.be.a('string');
               // res.body.message.should.be.eql('notNull Violation: email_users.email_user_name cannot be null');
                console.log(res.body);
            }).catch(function (err) {

                return Promise.reject(err);
            });
    });
    // it('it should be createEmailUsers with auth token  ll', () => {
    //     return chai.request(server)
    //         .post('/api/createEmailUsers')
    //         .set({
    //             Authorization: token
    //         })
    //         .send({ email_user_name: 'hello@ripplecrm.co.uk', email_provider_id: 31, password: '', host: 'outlook.office365.com', port: 99 })
    //         .then((res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a('object');
    //             console.log(res.body);
    //             //res.body.message.should.be.a('string');
    //             //res.body.message.should.be.eql('notNull Violation: email_users.email_user_name cannot be null');
    //             console.log(res.body);
    //         }).catch(function (err) {

    //             return Promise.reject(err);
    //         });
    // });

    //http://localhost:3000/api/updateEmailUsers/1
    it('it should be updateEmailUsers with auth token', () => {
        return chai.request(server)
            .put('/api/updateEmailUsers/856')
            .set({
                Authorization: token
            })
            .send({ email_user_name: 'hello@ripplecrm.co.uk', email_provider_id: 31, password: ''})
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                console.log(res.body);

                console.log(res.body);
            }).catch(function (err) {

                return Promise.reject(err);
            });
    });
    it('it should be updateEmailUsers with auth token', () => {
        return chai.request(server)
            .put('/api/updateEmailUsers/jk')
            .set({
                Authorization: token
            })
            .send({ email_user_name: 'hello@ripplecrm.co.uk', email_provider_id: 31, password: ''})
            .then((res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                console.log(res.body);

                console.log(res.body);
            }).catch(function (err) {

                return Promise.reject(err);
            });
    });

    it('it should be deleteEmailUsers with auth token', () => {
        return chai.request(server)
            .delete('/api/deleteEmailUsers/856')
            .set({
                Authorization: token
            }).then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                console.log(res.body);

                console.log(res.body);
            }).catch(function (err) {

                return Promise.reject(err);
            });
    });

    it('it should be deleteEmailUsers wrong id', () => {
        return chai.request(server)
            .delete('/api/deleteEmailUsers/jk')
            .set({
                Authorization: token
            }).then((res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                console.log(res.body);

                console.log(res.body);
            }).catch(function (err) {

                return Promise.reject(err);
            });
    });
    // it('it should be getEmailUserByID with auth token', () => {
    //     return chai.request(server)
    //         .get('/api/getEmailUsersByIdOf/856')
    //         // .set({
    //         //     Authorization: token
    //         // })
    //         .then((res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a('object');
    //             console.log('#########',res.body);
    //             console.log(res.body);

    //             console.log(res.body);
    //         }).catch(function (err) {
    //             return Promise.reject(err);
    //         });
    // });
});
