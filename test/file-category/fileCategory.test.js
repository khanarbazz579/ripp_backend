const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');

chai.use(chaiHttp);

let loggedInUser, token, user, userBody, fileCategoryBody;

afterEach(() => {
    let key;
    for (key in this) {
        delete this[key];
    };
});

describe('FILE CATEGORY', () => {

    before((done) => { 
        commonFunction.sequalizedDb(['permission_sets', 'user_details', 'users', 'user_roles', 'permission_sets','file_categories']).then(() => {
            userRoles = generatedSampleData.createdSampleData("user_roles", 1);
            commonFunction.addDataToTable("user_roles", userRoles[0]).then((data) => {
                roleBody = data;
                permissionSet = generatedSampleData.createdSampleData("permission_sets", 1);
                commonFunction.addDataToTable("permission_sets", permissionSet[0]).then((data) => {
                    setBody = data;
                    user = generatedSampleData.createdSampleData("users", 1);
                    user[0].role_id = roleBody.id;
                    user[0].permission_set_id = setBody.id;
                    commonFunction.addDataToTable("users", user[0]).then((data) => {
                        userBody = data;
                        done();
                   	});
                });
            });
        });
    });

    it('it should be login user with token and credential', () => {
        return chai.request(server)
            .post('/api/users/login')
            .send(user[0])
            .then((res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.token.should.be.a('string');
                token = res.body.token;
                loggedInUser = res.body.user;
                res.body.user.should.be.a('object');
                res.body.user.first_name.should.be.eql(user[0].first_name);
                res.body.user.last_name.should.be.eql(user[0].last_name);
                res.body.user.email.should.be.eql(user[0].email);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    describe('/POST File Category', () => {

        it('it should not POST a File Category without Authorization', () => {
            return chai.request(server)
                .post('/api/fileCategory')
                .send({ name : "Category1"})
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST File Category', () => {
        it('it should not POST a File Category without category name', () => {
            return chai.request(server)
                .post('/api/fileCategory')
                .set({ Authorization: token })
                .send({ name : "" })
                .then((res) => {
                	res.should.have.status(401);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql('Name is required.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST File Category', () => {
        it('it should POST a File Category', () => {
            return chai.request(server)
                .post('/api/fileCategory')
                .set({ Authorization: token })
                .send({ name : "Category1" })
                .then((res) => {
                	res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.category.should.be.a('object')
                    const category = res.body.category;
                    category.should.have.property('id');
                    category.should.have.property('name');
                    category.should.have.property('user_id');
                    category.name.should.be.eql("Category1");
                    categoryBody = category;
                    res.body.message.should.be.eql('File category created successfully.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/UPDATE File Category', () => {

        it('it should not UPDATE a File Category without access token', () => {
            return chai.request(server)
                .put('/api/fileCategory/'+ categoryBody.id)
                .send(categoryBody)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not UPDATE a File Category without category name', () => {
            return chai.request(server)
                .put('/api/fileCategory/'+ categoryBody.id)
                .set({ Authorization: token })
                .send({ name: "" })
                .then((res) => {
                    res.should.have.status(401);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql('Name is required.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should UPDATE a File Category', () => {
            return chai.request(server)
                .put('/api/fileCategory/'+ categoryBody.id)
                .set({ Authorization: token })
                .send({ name: "UpdatedName" })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.category.should.be.a('object')
                    const category = res.body.category;
                    category.should.have.property('id');
                    category.should.have.property('name');
                    category.name.should.be.eql("UpdatedName");
                    categoryBody = category;
                    res.body.message.should.be.eql('File category updated successfully.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GET File Category', () => {
        it('it should not GET File Category without access token', () => {
            return chai.request(server)
                .get('/api/fileCategory')
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should GET File Category', () => {
            return chai.request(server)
                .get('/api/fileCategory')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.categories.should.be.a('array');
                    const category = res.body.categories[0];
                    category.should.have.property('id');
                    category.should.have.property('name');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/DELETE File Category', () => {
        it('it should not DELETE a File Category without access token', () => {
            return chai.request(server)
                .delete('/api/fileCategory/'+ categoryBody.id)
                .send(categoryBody)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should DELETE File Category', () => {
            return chai.request(server)
                .delete('/api/fileCategory/' + categoryBody.id)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql("File category deleted successfully.")
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        after((done) => { 
            commonFunction.sequalizedDb(['permission_sets', 'user_details', 'users', 'user_roles', 'permission_sets','file_categories']).then(() => {
                done();
            });
        });
    });

});