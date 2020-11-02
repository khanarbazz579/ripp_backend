const chai = require("chai");
const chaiHttp = require("chai-http");
const commonFunction = require("../commonFunction");
const server = require("../../app");
const generatedSampleData = require("../sampleData");
let token, user, providerId;

chai.use(chaiHttp);
let providerData = {
    email_provider_name: "Test Provider"
};



describe("EmailProviders", () => {
    /*
     * Test the email list, segments and subcriber routes
     */
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        }
    });



    before(done => {
        //Before each test we empty the database
        commonFunction
            .sequalizedDb(["email_lists", "users", "segment_lists", "subscribers", "user_roles"])
            .then(() => {
                email_lists = generatedSampleData.createdSampleData("email_lists", 1);
                segment_lists = generatedSampleData.createdSampleData("segment_lists", 1);
                subscribers = generatedSampleData.createdSampleData("subscribers", 1);

                const role = generatedSampleData.createdSampleData("user_roles", 1);
                const permission = generatedSampleData.createdSampleData("permission_sets", 1);
                user = generatedSampleData.createdSampleData("users", 1)[0];
                commonFunction.addDataToTable("user_roles", role[0]).then(role_data => {
                    user.role_id = role_data.id;
                    commonFunction
                        .addDataToTable("permission_sets", permission[0])
                        .then(permission_data => {
                            user.permission_set_id = permission_data.id;
                            commonFunction.addDataToTable("users", user).then(data => {
                                done();
                            });
                        });
                });
            });
    });

    it("it should be login user with token and credential", () => {
        return chai
            .request(server)
            .post("/api/users/login")
            .send(user)
            .then(res => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.token.should.be.a("string");
                token = res.body.token;
                loggedInUser = res.body.user;
                res.body.user.should.be.a("object");
                res.body.user.first_name.should.be.eql(user.first_name);
                res.body.user.last_name.should.be.eql(user.last_name);
                res.body.user.email.should.be.eql(user.email);
            })
            .catch(function(err) {
                return Promise.reject(err);
            });
    });

    //Email providers list route
    describe("/Get Providers ", () => {
        it("it should not GET provider List  data without token", () => {
            return chai
                .request(server)
                .get("/api/getEmailProviders")
                .then(res => {
                    res.should.have.status(401);
                })
                .catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it("it should GET provider List  data with token", () => {
            return chai
                .request(server)
                .get("/api/getEmailProviders")
                .set({
                    Authorization: token
                })
                .then(res => {
                    const body = res.body;
                    res.should.have.status(200);
                    body.success.should.be.eql(true);
                    body.email_providers.should.be.a('array');
                })
                .catch(function(err) {
                    return Promise.reject(err);
                });
        });

    });

    //Create Email Providers route
    describe("/Create Providers ", () => {
        it("it should create email providers without auth tokens", () => {
            return chai
                .request(server)
                .post("/api/createProviders")
                .then(res => {
                    res.should.have.status(401);
                })
                .catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it("it should create email providers with auth tokens", () => {
            return chai
                .request(server)
                .post("/api/createProviders")
                .set({
                    Authorization: token
                })
                .send(providerData)
                .then(res => {
                    const body = res.body;
                    res.should.have.status(200);
                    body.success.should.be.eql(true);
                    body.providerAdditionalField.should.be.a('object');
                    body.providerAdditionalField.id.should.be.a('number');
                    providerId = body.providerAdditionalField.id;
                })
                .catch(function(err) {
                    return Promise.reject(err);
                });
        });

    });

    //Delete Email Providers route
    describe("/Update Providers ", () => {
        it("it should update email providers without auth tokens", () => {
            return chai
                .request(server)
                .put("/api/updateProviders/" + providerId)
                .then(res => {
                    res.should.have.status(401);
                })
                .catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it("it should update email providers with auth tokens and invalid id", () => {
            return chai
                .request(server)
                .put("/api/updateProviders/" + 'invalid_id')
                .set({
                    Authorization: token
                })
                .send(providerData)
                .then(res => {
                    const body = res.body;
                    res.should.have.status(401);
                    body.success.should.be.eql(false);
                    body.message.should.be.a('string');
                    body.message.should.be.eql('It should have requested provider id.');
                })
                .catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it("it should update email providers with auth tokens", () => {
            return chai
                .request(server)
                .put("/api/updateProviders/" + providerId)
                .set({
                    Authorization: token
                })
                .send(providerData)
                .then(res => {
                    const body = res.body;
                    res.should.have.status(200);
                    body.success.should.be.eql(true);
                    body.email_providers.should.be.a('array');
                })
                .catch(function(err) {
                    return Promise.reject(err);
                });
        });

    });

    //Update Email Providers route
    describe("/Update Providers ", () => {
        it("it should delete email providers without auth tokens", () => {
            return chai
                .request(server)
                .delete("/api/deleteProviders/" + providerId)
                .then(res => {
                    res.should.have.status(401);
                })
                .catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it("it should delete email providers with auth tokens and invalid id", () => {
            return chai
                .request(server)
                .delete("/api/deleteProviders/" + 'invalid_id')
                .set({
                    Authorization: token
                })
                .send(providerData)
                .then(res => {
                    const body = res.body;
                    res.should.have.status(401);
                    body.success.should.be.eql(false);
                    body.message.should.be.a('string');
                    body.message.should.be.eql('It should have requested email provider id.');
                })
                .catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it("it should delete email providers with auth tokens", () => {
            return chai
                .request(server)
                .delete("/api/deleteProviders/" + providerId)
                .set({
                    Authorization: token
                })
                .send(providerData)
                .then(res => {
                    const body = res.body;
                    res.should.have.status(200);
                    body.success.should.be.eql(true);
                    body.message.should.be.a('string');
                    body.message.should.be.eql('Deleted email provider.');
                })
                .catch(function(err) {
                    return Promise.reject(err);
                });
        });

    });


    after(done => {
        done();
    });
});