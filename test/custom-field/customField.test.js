const chai = require('chai');
const chaiHttp = require('chai-http');

const Section = require('../../models').sections;
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const server = require('../../app');

const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);

let user, userBody, sectionBody, customFieldBody, mainBody, token, customField, setBody;
const seed = require('../../seeders/20190614060501-permissions');
const models = require('../../models');

afterEach(() => {
    let key;
    for (key in this) {
        delete this[key];
    };
});

describe('Custom Fields', async () => {

    describe('/LOGIN Custom Fields', () => {

        before((done) => {
            commonFunction.sequalizedDb([
                'countries',
                'currencies',
                'call_outcomes_transitions',
                'contact_details',
                'company_details',
                'form_default_fields',
                'leads_clients',
                'sales_stages',
                'user_has_permissions',
                'user_has_permission_sets',
                'permission_sets_has_permissions',
                'permission',
                'permission_sets',
                'custom_filter_fields',
                'custom_fields',
                'sections',
                'users',
                'user_roles'
            ]).then(() => {
                userRoles = generatedSampleData.createdSampleData("user_roles", 1);
                commonFunction.addDataToTable("user_roles", userRoles[0]).then((data) => {
                    roleBody = data
                    permissionSet = generatedSampleData.createdSampleData("permission_sets", 1);
                    commonFunction.addDataToTable("permission_sets", permissionSet[0]).then((data) => {
                        setBody = data;
                        user = generatedSampleData.createdSampleData("users", 1);
                        user[0].role_id = roleBody.id;
                        user[0].permission_set_id = setBody.id;
                        commonFunction.addDataToTable("users", user[0]).then((data) => {
                            userBody = data;
                            section = generatedSampleData.createdSampleData("sections", 1);
                            commonFunction.addDataToTable("sections", section[0]).then((data) => {
                                sectionBody = data;
                                customField = generatedSampleData.createdSampleData("custom_fields", 1);
                                customField[0].section_id = sectionBody.id;
                                commonFunction.addDataToTable("custom_fields", customField[0]).then(async (data) => {
                                    customFieldBody = data;

                                    await seed.up(models.sequelize.queryInterface, models.Sequelize);
                                    done();
                                });
                            });
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
                    res.body.user.should.be.a('object');
                    res.body.user.first_name.should.be.eql(user[0].first_name);
                    res.body.user.last_name.should.be.eql(user[0].last_name);
                    res.body.user.email.should.be.eql(user[0].email);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Section', () => {

        before((done) => {
            mainBody = {};
            mainBody['sections'] = [];
            mainBody['deleted_section'] = [];
            mainBody['deleted_custom_fields'] = [];
            mainBody['sections'].push(section[0]);
            done();
        });

        it('it should not POST a section using unauthorized user', () => {
            return chai.request(server)
                .post('/api/customField')
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Section', () => {
        before((done) => {
            mainBody["sections"][0].name = "";
            done();
        });

        it('it should not POST a section without section name', () => {
            return chai.request(server)
                .post('/api/customField')
                .set({ Authorization: token })
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.a('array');
                    res.body.message[0].should.be.eql("Name is required in section-1");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should create a section for supplier', () => {
            mainBody["sections"][0].type = "SUPPLIER";
            mainBody["sections"][0].name = "Supplier section";
            return chai.request(server)
                .post('/api/customField')
                .set({ Authorization: token })
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.a('array');
                    res.body.sections.should.be.a('array');
                    res.body.sections[0].type.should.be.eql("SUPPLIER");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('It should create a section for user', () => {
            mainBody["sections"][0].type = "USER";
            mainBody["sections"][0].name = "User section";
            return chai.request(server)
                .post('/api/customField')
                .set({ Authorization: token })
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.a('array');
                    res.body.sections.should.be.a('array');
                    res.body.sections[0].type.should.be.eql("USER");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should create a permission for a section', () => {
            mainBody["sections"][0].type = "USER";
            mainBody["sections"][0].name = "User section";
            return chai.request(server)
                .post('/api/customField')
                .set({ Authorization: token })
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.a('array');
                    res.body.sections.should.be.a('array');
                    res.body.sections[0].type.should.be.eql("USER");
                    return res.body.sections[0]
                })
                .then((section) => {
                    models.sequelize.query(`SELECT count(*) as count FROM permissions WHERE section_id = ${section.id} AND is_section = 1;`, { type: models.sequelize.QueryTypes.SELECT })
                        .then(data => {
                            expect(data[0].count).to.be.eql(1);
                        })
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        })
    });

    describe('/POST Section', () => {
        before((done) => {
            mainBody["sections"][0].name = "Any Name";
            mainBody["sections"][0].type = null;
            done();
        });
        it('it should not POST a section without section type', () => {
            return chai.request(server)
                .post('/api/customField')
                .set({ Authorization: token })
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.a('array');
                    res.body.message[0].should.be.eql("Type is required in section-1");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });


    });

    describe('/POST Section', () => {
        before((done) => {
            mainBody["sections"][0].name = "Any Name";
            mainBody["sections"][0].type = "LEAD_CLIENT";
            done();
        });
        it('it should POST a section', () => {
            return chai.request(server)
                .post('/api/customField')
                .set({ Authorization: token })
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.sections.length.should.be.eql(1);
                    res.body.message[0].should.be.eql("Section Created Successfully.");
                    const section = res.body.sections[0];
                    section.should.have.property('id');
                    section.should.have.property('name');
                    section.should.have.property('description');
                    section.should.have.property('type');
                    section.should.have.property('priority_order');
                    section.should.have.property('restrict_action');
                    section.should.have.property('allow_add_fields');
                    section.should.have.property('is_hidden');
                    section.name.should.be.eql(mainBody["sections"][0].name)
                    section.type.should.be.eql(mainBody["sections"][0].type)
                    mainBody["sections"][0] = section;
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Section', () => {
        before((done) => {
            mainBody["sections"][0].name = "My First Section";
            mainBody["sections"][0].type = "LEAD_CLIENT";
            mainBody['sections'].push(section[0]);
            mainBody["sections"][1].name = "My Second Section";
            mainBody["sections"][1].type = "LEAD_CLIENT";
            done();
        });
        it('it should POST AND UPDATE a section', () => {
            return chai.request(server)
                .post('/api/customField')
                .set({ Authorization: token })
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.sections.length.should.be.eql(2);
                    res.body.message[0].should.be.eql("Section Updated Successfully.");
                    res.body.message[1].should.be.eql("Section Created Successfully.");
                    const section = res.body.sections[1];
                    section.should.have.property('id');
                    section.should.have.property('name');
                    section.should.have.property('description');
                    section.should.have.property('type');
                    section.should.have.property('priority_order');
                    section.should.have.property('restrict_action');
                    section.should.have.property('allow_add_fields');
                    section.should.have.property('is_hidden');
                    section.name.should.be.eql(mainBody["sections"][1].name)
                    section.type.should.be.eql(mainBody["sections"][1].type)
                    mainBody["sections"][1] = section;
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Custom Field', () => {
        before((done) => {
            mainBody['sections'][0].custom_fields = [];
            customField[0].label = '';
            mainBody['sections'][0].custom_fields.push(customField[0]);
            done();
        });

        it('it should not POST a custom field without field label', () => {
            return chai.request(server)
                .post('/api/customField')
                .set({ Authorization: token })
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.a('array');
                    res.body.message[0].should.be.eql("Field label is required in field-1");
                    mainBody['sections'][0].custom_fields = [];
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });


    describe('/POST Custom Field', () => {
        before((done) => {
            customField[0].label = 'Demo Field Name';
            customField[0].control_type = '';
            mainBody['sections'][0].custom_fields.push(customField[0]);
            done();
        });

        it('it should not POST a custom field without field control type', () => {
            return chai.request(server)
                .post('/api/customField')
                .set({ Authorization: token })
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.a('array');
                    mainBody['sections'][0].custom_fields = [];
                    res.body.message[0].should.be.eql("Field control type is required in field-1");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Custom Field', () => {
        before((done) => {
            customField[0].control_type = 'text_field';
            customField[0].section_id = null;
            mainBody['sections'][0].custom_fields.push(customField[0]);
            done();
        });

        it('it should not POST a custom field without section id', () => {
            return chai.request(server)
                .post('/api/customField')
                .set({ Authorization: token })
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.a('array');
                    mainBody['sections'][0].custom_fields = [];
                    res.body.message[0].should.be.eql("Field section id is required in field-1");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Custom Field', () => {
        before((done) => {
            customField[0].section_id = mainBody['sections'][0].id;
            mainBody['sections'][0].custom_fields.push(customField[0]);
            done();
        });

        it('it should POST a section with custom field', () => {
            return chai.request(server)
                .post('/api/customField')
                .set({ Authorization: token })
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.sections.length.should.be.eql(2);
                    res.body.sections[0].custom_fields.length.should.be.eql(1);
                    res.body.message[0].should.be.eql("Section Updated Successfully.");
                    res.body.message[1].should.be.eql("Section Updated Successfully.");
                    const customField = res.body.sections[0].custom_fields[0];
                    customField.should.have.property('id');
                    customField.should.have.property('label');
                    customField.should.have.property('control_type');
                    customField.should.have.property('field_size');
                    customField.should.have.property('priority_order');
                    customField.should.have.property('is_hidden');
                    customField.label.should.be.eql(mainBody["sections"][0].custom_fields[0].label)
                    customField.control_type.should.be.eql(mainBody["sections"][0].custom_fields[0].control_type)
                    mainBody["sections"][0].custom_fields[0] = customField;
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should POST a custom field and create a permission', () => {

            mainBody['sections'][0].custom_fields[0].permissions = {
                users: [],
                sets: []
            };

            return chai.request(server)
                .post('/api/customField')
                .set({ Authorization: token })
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.sections.length.should.be.eql(2);
                    res.body.sections[0].custom_fields.length.should.be.eql(1);
                    return res.body.sections[0].custom_fields[0]
                })
                .then((data) => {
                    return models.sequelize
                        .query('SELECT count(*) as count FROM permissions WHERE custom_field_id = ' + data.id + ' AND is_custom = 1', {
                            type: models.sequelize.QueryTypes.SELECT
                        })
                        .then(data => {
                            expect(data[0].count).to.be.eql(1);
                        });
                })
                .catch(function (err) {
                    return Promise.reject(err);
                });
        });

        // it('it should update a custom fields permission', () => {

        //     mainBody['sections'][0].custom_fields[0].permissions = {
        //         users: [{
        //             id: userBody.id,
        //             access_type: 'RW',
        //             isCustom: true
        //         }],
        //         sets: []
        //     };

        //     return chai.request(server)
        //         .post('/api/customField')
        //         .set({ Authorization: token })
        //         .send(mainBody)
        //         .then((res) => {
        //             res.should.have.status(200);
        //             res.body.should.be.a('object');
        //             res.body.success.should.be.eql(true);
        //             res.body.sections.length.should.be.eql(2);
        //             res.body.sections[0].custom_fields.length.should.be.eql(1);
        //             return res.body.sections[0].custom_fields[0]
        //         })
        //         .then(() => {
        //             mainBody['sections'][0].custom_fields[0].permissions = {
        //                 users: [{
        //                     id: userBody.id,
        //                     access_type: 'R',
        //                     isCustom: true
        //                 }],
        //                 sets: []
        //             };
        //             return chai.request(server)
        //                 .post('/api/customField')
        //                 .set({ Authorization: token })
        //                 .send(mainBody)
        //                 .then((res) => {
        //                     res.should.have.status(200);
        //                     res.body.should.be.a('object');
        //                     res.body.success.should.be.eql(true);
        //                     res.body.sections.length.should.be.eql(2);
        //                     res.body.sections[0].custom_fields.length.should.be.eql(1);
        //                     return res.body.sections[0].custom_fields[0]
        //                 })
        //                 .then((data) => {
        //                     return models.sequelize
        //                         .query('SELECT * FROM user_has_permissions AS uhp JOIN permissions AS p ON p.id = uhp.permission_id WHERE uhp.user_id = ' + userBody.id + ' AND p.custom_field_id =' + data.id, {
        //                             type: models.sequelize.QueryTypes.SELECT
        //                         })
        //                         .then(data => {
        //                             expect(data.length).to.be.eql(1);
        //                             expect(data[0].access_type).to.be.eql('R');
        //                         })
        //                 })
        //         })
        //         .catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });

        // it('it should POST a custom field, create a permission and attach users to the permission', () => {

        //     mainBody['sections'][0].custom_fields[0].permissions = {
        //         users: [{
        //             id: userBody.id,
        //             access_type: 'RW',
        //             isCustom: true
        //         }],
        //         sets: []
        //     };

        //     return chai.request(server)
        //         .post('/api/customField')
        //         .set({ Authorization: token })
        //         .send(mainBody)
        //         .then((res) => {
        //             res.should.have.status(200);
        //             res.body.should.be.a('object');
        //             res.body.success.should.be.eql(true);
        //             res.body.sections.length.should.be.eql(2);
        //             res.body.sections[0].custom_fields.length.should.be.eql(1);
        //             return res.body.sections[0].custom_fields[0]
        //         })
        //         .then((data) => {
        //             return models.sequelize
        //                 .query('SELECT *  FROM permissions WHERE custom_field_id = ' + data.id + ' AND is_custom = 1', {
        //                     type: models.sequelize.QueryTypes.SELECT
        //                 })
        //                 .then(res => {
        //                     expect(res.length).to.be.eql(1);
        //                     return res[0];
        //                 });
        //         })
        //         .then((data) => {
        //             return models.sequelize
        //                 .query('SELECT count(*) as count FROM user_has_permissions WHERE user_id = ' + userBody.id + ' AND permission_id = ' + data.id, {
        //                     type: models.sequelize.QueryTypes.SELECT
        //                 })
        //                 .then(data => {
        //                     expect(data[0].count).to.be.eql(1);
        //                 });
        //         })
        //         .catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });

        // it('it should POST a custom field with permission set', () => {

        //     mainBody['sections'][0].custom_fields[0].permissions = {
        //         sets: [{
        //             id: setBody.id,
        //             access_type: 'RW',
        //             isCustom: false
        //         }],
        //         users: []
        //     };

        //     return chai.request(server)
        //         .post('/api/customField')
        //         .set({ Authorization: token })
        //         .send(mainBody)
        //         .then((res) => {
        //             res.should.have.status(200);
        //             res.body.should.be.a('object');
        //             res.body.success.should.be.eql(true);
        //             res.body.sections.length.should.be.eql(2);
        //             res.body.sections[0].custom_fields.length.should.be.eql(1);
        //             return res.body.sections[0].custom_fields[0]
        //         })
        //         .then((data) => {
        //             return models.sequelize
        //                 .query('SELECT *  FROM permissions WHERE custom_field_id = ' + data.id + ' AND is_custom = 1', {
        //                     type: models.sequelize.QueryTypes.SELECT
        //                 })

        //         })
        //         .then(res => {
        //             expect(res.length).to.be.eql(1);
        //             return models.sequelize
        //                 .query('SELECT count(*) as count FROM permission_sets_has_permissions WHERE permission_id = ' + res[0].id + ' AND permission_set_id = ' + setBody.id, {
        //                     type: models.sequelize.QueryTypes.SELECT
        //                 })
        //                 .then((perm) => {
        //                     expect(perm[0].count).to.be.eql(1);
        //                     return res[0];
        //                 })
        //         })
        //         .catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });
    });


    describe('Field Permissions', () =>  {
    
        it('Should not get field permissions with token', () => {
            return chai.request(server)
                .get('/api/fieldAdjustments/fieldPermissions')
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        })
    
        it('Should not get field without valid id', () => {
            return chai.request(server)
                .get('/api/fieldAdjustments/fieldPermissions?data='+JSON.stringify({
                    id: null
                }))
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.message.should.be.eql('Error: Invalid custom field!');
                    res.body.status.should.be.eql(false);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        })
    
        it('Should not get field without valid id', () => {
            return chai.request(server)
                .get('/api/fieldAdjustments/fieldPermissions?data='+JSON.stringify({
                    id: customFieldBody.id
                }))
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.status.should.be.eql(true);
                    res.body.payload.users.should.be.a('array');
                    res.body.payload.permission_sets.should.be.a('array');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    
        // it('Should return users attached to a custom field', () => {
        //     mainBody['sections'][0].custom_fields[0].permissions = {
        //         users: [{
        //             id: userBody.id,
        //             access_type: 'RW',
        //             isCustom: true
        //         }],
        //         sets: []
        //     };
            
        //     return chai.request(server)
        //         .post('/api/customField')
        //         .set({ Authorization: token })
        //         .send(mainBody)
        //         .then((res) => {
        //             res.should.have.status(200);
        //             res.body.should.be.a('object');
        //             res.body.success.should.be.eql(true);
        //             res.body.sections.length.should.be.eql(2);
        //             res.body.sections[0].custom_fields.length.should.be.eql(1);
        //             return res.body.sections[0].custom_fields[0]
        //         })
        //         .then((data) => {
        //             return chai.request(server)
        //                 .get('/api/fieldAdjustments/fieldPermissions?data='+JSON.stringify({
        //                     id: data.id
        //                 }))
        //                 .set({ Authorization: token })
        //                 .then((res) => {
        //                     res.should.have.status(200);
        //                     res.body.status.should.be.eql(true);
        //                     res.body.payload.users.should.be.a('array');
        //                     expect(res.body.payload.users.length).to.be.greaterThan(0);
        //                     res.body.payload.permission_sets.should.be.a('array');
        //                 })
        //         })
        //         .catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });

        // it('Should return permission set attached to a custom field', () => {
        //     mainBody['sections'][0].custom_fields[0].permissions = {
        //         users: [],
        //         sets: [{
        //             id: setBody.id,
        //             access_type: 'RW',
        //         }]
        //     };

        //     return models.user_has_permission_sets.create({
        //         user_id: userBody.id,
        //         permission_set_id: setBody.id
        //     })
        //     .then(data => {
        //         return chai.request(server)
        //             .post('/api/customField')
        //             .set({ Authorization: token })
        //             .send(mainBody)
        //             .then((res) => {
        //                 res.should.have.status(200);
        //                 res.body.should.be.a('object');
        //                 res.body.success.should.be.eql(true);
        //                 res.body.sections.length.should.be.eql(2);
        //                 res.body.sections[0].custom_fields.length.should.be.eql(1);
        //                 let data = res.body.sections[0].custom_fields[0]

        //                 return chai.request(server)
        //                     .get('/api/fieldAdjustments/fieldPermissions?data='+JSON.stringify({
        //                         id: data.id
        //                     }))
        //                     .set({ Authorization: token })
        //                     .then((res) => {
        //                         res.should.have.status(200);
        //                         res.body.status.should.be.eql(true);
        //                         res.body.payload.users.should.be.a('array');
        //                         expect(res.body.payload.users.length).to.be.greaterThan(0);
        //                         res.body.payload.permission_sets.should.be.a('array');
        //                     })
        //             })
        //             .catch(function (err) {
        //                 return Promise.reject(err);
        //             });
        //     })
        // })
    });

    describe('Remove User from permission set', () => {

        it('it should not remove without access token', () => {
            return chai.request(server)
                .get('/api/fieldAdjustments/removeUserFromSet?data='+JSON.stringify({userId:[0]}))
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not remove with invalid data', () => {
            return models.user_has_permission_sets.create({
                user_id: userBody.id,
                permission_set_id: setBody.id
            })
            .then(() => {
                return chai.request(server)
                    .get('/api/fieldAdjustments/removeUserFromSet?data='+JSON.stringify({userId:[]}))
                    .set({ Authorization: token })
                    .then((res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object')
                        res.body.message.should.be.eql('Error: Invalid user!');
                        res.body.status.should.be.eql(false)
                    })
                    .catch(function (err) {
                        return Promise.reject(err);
                    });
            })
        });

        it('it should remove without valid data', () => {
            return models.user_has_permission_sets.create({
                user_id: userBody.id,
                permission_set_id: setBody.id
            })
            .then(() => {
                return chai.request(server)
                    .get('/api/fieldAdjustments/removeUserFromSet?data='+JSON.stringify({userId:[userBody.id]}))
                    .set({ Authorization: token })
                    .then((res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object')
                        res.body.message.should.be.eql('User successfully removed from the permission set!');
                        res.body.status.should.be.eql(true)
                    })
                    .catch(function (err) {
                        return Promise.reject(err);
                    });
            })
        });
    })

    describe('Data Stream for Field Adjustments', () => {
        let request;
        beforeEach((done) => {
            request = {
                search:'a'
            };
            done();
        });

        it('Should not get users without access token', () => {
            return chai.request(server)
                .get('/api/fieldAdjustments/stream/users?data='+JSON.stringify(request))
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should not get permission sets without access token', () => {
            return chai.request(server)
                .get('/api/fieldAdjustments/stream/permission_sets?data='+JSON.stringify(request))
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get users when searched', () => {
            request.search = userBody.first_name;
            return chai.request(server)
                .get('/api/fieldAdjustments/stream/users?data='+JSON.stringify(request))
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                    // expect(res.body.payload.length).to.be.greaterThan(0);
                    // expect(res.body.payload[0].first_name).to.be.eql(userBody.first_name);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should get permission sets', () => {
            return chai.request(server)
                .get('/api/fieldAdjustments/stream/permission_sets?data='+JSON.stringify(request))
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(true);
                    res.body.payload.should.be.a('array');
                    expect(res.body.payload.length).to.be.greaterThan(0);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('Should throw error with invalid stream type', () => {
            return chai.request(server)
                .get('/api/fieldAdjustments/stream/invalid?data='+JSON.stringify(request))
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql(false);
                    res.body.message.should.be.eql('Invalid request!');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    })

    describe('/POST Custom Field', () => {
        before((done) => {
            mainBody['sections'][1].custom_fields = []
            customField[0].section_id = mainBody['sections'][1].id;
            mainBody['sections'][1].custom_fields.push(customField[0]);
            done();
        });

        it('it should POST a section with custom field', () => {
            return chai.request(server)
                .post('/api/customField')
                .set({ Authorization: token })
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.sections.length.should.be.eql(2);
                    res.body.sections[1].custom_fields.length.should.be.eql(1);
                    res.body.message[0].should.be.eql("Section Updated Successfully.");
                    res.body.message[1].should.be.eql("Section Updated Successfully.");
                    const customField = res.body.sections[1].custom_fields[0];
                    customField.should.have.property('id');
                    customField.should.have.property('label');
                    customField.should.have.property('control_type');
                    customField.should.have.property('field_size');
                    customField.should.have.property('priority_order');
                    customField.should.have.property('is_hidden');
                    customField.label.should.be.eql(mainBody["sections"][1].custom_fields[0].label)
                    customField.control_type.should.be.eql(mainBody["sections"][1].custom_fields[0].control_type)
                    mainBody["sections"][1].custom_fields[0] = customField;
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT Section', () => {
        before((done) => {
            mainBody['sections'][0].name = 'my updated name';
            done();
        });

        it('it should not UPDATE a section without access token', () => {
            return chai.request(server)
                .post('/api/customField/')
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should UPDATE section', () => {
            return chai.request(server)
                .post('/api/customField/')
                .set({ Authorization: token })
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.sections.length.should.be.eql(2);
                    res.body.sections[0].custom_fields.length.should.be.eql(1);
                    res.body.message[0].should.be.eql("Section Updated Successfully.");
                    res.body.message[1].should.be.eql("Section Updated Successfully.");
                    const section = res.body.sections[0]
                    section.name.should.be.eql(mainBody["sections"][0].name)
                    mainBody["sections"][0] = section;
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    /**
     * auther : Gaurav V
     * task for multiple lead upload module
     */
    describe('update Custom field attribte', () => {
        it('it should update Custom field attribte without affecting the section', () => {
            let reqbody = {
                'id': customFieldBody.id,
                'additional_attribute': [{
                    "key": "someKey",
                    "value": "someValue"
                }]
            };

            return chai.request(server)
                .post('/api/updateCustomFieldAttibute')
                .set({ Authorization: token })
                .send(reqbody)
                .then((res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.should.have.property('data');
                    res.body.data.should.be.a('array');
                    res.body.data[0].should.be.eql(1);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        // it('it should not update Custom field attribte without custom field ID', () => {
        //     let reqbody = {
        //         'id' : {},
        //         'additional_attribute' : [{
        //             "key": "someKey",
        //             "value" : "someValue"
        //         }]
        //     };

        //     return chai.request(server)
        //         .post('/api/updateCustomFieldAttibute')
        //         .set({ Authorization: token })
        //         .send(reqbody)
        //         .then((res) => {
        //             res.should.have.status(422);
        //             res.body.should.be.a('object');
        //             res.body.should.have.property('success');
        //             res.body.success.should.be.eql(false);
        //             res.body.should.have.property('message');
        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });

        it('it should not update Custom field attribte without authentication', () => {
            let reqbody = {
                'id': {},
                'additional_attribute': [{
                    "key": "someKey",
                    "value": "someValue"
                }]
            };

            return chai.request(server)
                .post('/api/updateCustomFieldAttibute')
                .send(reqbody)
                .then((res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/DELETE Custom Fields', () => {
        before((done) => {
            let fieldId = mainBody['sections'][0].custom_fields[0].id;
            mainBody['sections'][0].custom_fields.splice(0, 1);
            mainBody['deleted_custom_fields'].push(fieldId);
            done();
        });

        it('it should DELETE secondary image of lead', () => {
            return chai.request(server)
                .post('/api/customField/')
                .set({ Authorization: token })
                .send(mainBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.sections.length.should.be.eql(2);
                    res.body.sections[0].custom_fields.length.should.be.eql(0);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GET ALL Section', () => {
        it('it should not GET ALL section without access token', () => {
            return chai.request(server)
                .get('/api/customFields/lead')
                .end((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GET ALL Section', () => {
        it('it should not GET ALL section without valid type', () => {
            return chai.request(server)
                .get('/api/customFields/abc')
                .end((res) => {
                    res.should.have.status(401);
                    res.body.message.should.be.eq("It should have valid requested type.");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GET ALL Lead Section', () => {

        before((done) => {
            commonFunction.sequalizedDb(['custom_fields', 'sections']).then(() => {
                section = generatedSampleData.createdSampleData("sections", 1);
                section[0].type = "LEAD_CLIENT";
                commonFunction.addDataToTable("sections", section[0]).then((data) => {
                    sectionBody = data;
                    customFields = generatedSampleData.createdSampleData("custom_fields", 1);
                    customFields[0].section_id = sectionBody.id;
                    customFields[0].control_type = "dropdown"
                    customFields[0].additional_attribute = '{"0":{"key":"Yes","value":"Yes"},"1":{"key":"No","value":"No"}}'
                    commonFunction.addDataToTable("custom_fields", customFields[0]).then((data) => {
                        customFieldBody = data;
                        done();
                    });
                });
            });
        });

        it('it should GET ALL lead sections', () => {
            return chai.request(server)
                .get('/api/customFields/lead')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.be.a('object');
                    res.body.sections.should.be.a('array');
                    res.body.sections[0].type.should.be.eql("LEAD_CLIENT");
                    res.body.sections[0].name.should.be.eql(sectionBody.name);
                    res.body.sections[0].description.should.be.eql(sectionBody.description);
                    res.body.sections[0].custom_fields.length.should.be.eql(1);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GET ALL Client Section', () => {
        it('it should GET ALL client sections', () => {
            return chai.request(server)
                .get('/api/customFields/client')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.be.a('object');
                    res.body.sections.should.be.a('array');
                    res.body.sections[0].type.should.be.eql('LEAD_CLIENT');
                    res.body.sections[0].name.should.be.eql(sectionBody.name);
                    res.body.sections[0].description.should.be.eql(sectionBody.description);
                    res.body.sections[0].custom_fields.length.should.be.eql(1);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GET ALL Supplier Section', () => {
        before((done) => {
            section = generatedSampleData.createdSampleData("sections", 1);
            section[0].type = 'SUPPLIER';
            commonFunction.addDataToTable("sections", section[0]).then((data) => {
                sectionBody = data;
                customFields = generatedSampleData.createdSampleData("custom_fields", 1);
                customFields[0].section_id = sectionBody.id;
                customFields[0].control_type = "checkbox"
                customFields[0].additional_attribute = '{"0":{"key":"Yes","value":"Yes"},"1":{"key":"No","value":"No"}}'
                commonFunction.addDataToTable("custom_fields", customFields[0]).then((data) => {
                    customFieldBody = data;
                    done();
                });
            })
        });

        it('it should GET ALL supplier sections', () => {
            return chai.request(server)
                .get('/api/customFields/supplier')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.be.a('object');
                    res.body.sections.should.be.a('array');
                    res.body.sections[0].type.should.be.eql('SUPPLIER');
                    res.body.sections[0].name.should.be.eql(sectionBody.name);
                    res.body.sections[0].description.should.be.eql(sectionBody.description);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GET ALL Profile Section', () => {
        before((done) => {
            section = generatedSampleData.createdSampleData("sections", 1);
            section[0].type = 'USER';
            commonFunction.addDataToTable("sections", section[0]).then((data) => {
                sectionBody = data;
                customFields = generatedSampleData.createdSampleData("custom_fields", 1);
                customFields[0].section_id = sectionBody.id;
                customFields[0].control_type = "country_dropdown"
                customFields[0].additional_attribute = '{"0":{"key":"Yes","value":"Yes"},"1":{"key":"No","value":"No"}}'
                commonFunction.addDataToTable("custom_fields", customFields[0]).then((data) => {
                    customFieldBody = data;
                    done();
                });
            })
        });

        it('it should GET ALL profile sections', () => {
            return chai.request(server)
                .get('/api/customFields/user')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.be.a('object');
                    res.body.sections.should.be.a('array');
                    res.body.sections[0].type.should.be.eql('USER');
                    res.body.sections[0].name.should.be.eql(sectionBody.name);
                    res.body.sections[0].description.should.be.eql(sectionBody.description);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });


    describe('/GET ALL Sections with Custom Fields', () => {
        before((done) => {
            let currencies = {
                symbol: "s",
                name: "US Dollar"
            };
            let countries = {
                country_code: "AF",
                name: "Afghanistan"
            };
            commonFunction.addDataToTable("currencies", currencies).then((data) => {
                commonFunction.addDataToTable("countries", countries).then((data) => {
                    let sales_stages = generatedSampleData.createdSampleData("sales_stages", 1);
                    commonFunction.addDataToTable("sales_stages", sales_stages[0]).then((data) => {
                        section = generatedSampleData.createdSampleData("sections", 1);
                        section[0].type = 'LEAD_CLIENT';
                        commonFunction.addDataToTable("sections", section[0]).then((data) => {
                            sectionBody = data;
                            customFields = generatedSampleData.createdSampleData("custom_fields", 5);
                            customFields[0].section_id = sectionBody.id;
                            customFields[0].control_type = "dropdown"
                            customFields[0].additional_attribute = '{"0":{"key":"Yes","value":"Yes"},"1":{"key":"No","value":"No"}}'
                            commonFunction.addDataToTable("custom_fields", customFields[0]).then((data) => {
                                customFields[1].section_id = sectionBody.id;
                                customFields[1].control_type = "currency"
                                customFields[1].additional_attribute = '';
                                commonFunction.addDataToTable("custom_fields", customFields[1]).then((data) => {
                                    customFields[2].section_id = sectionBody.id;
                                    customFields[2].control_type = "country_dropdown"
                                    customFields[2].additional_attribute = '';
                                    commonFunction.addDataToTable("custom_fields", customFields[2]).then((data) => {
                                        customFields[3].section_id = sectionBody.id;
                                        customFields[3].control_type = "lead_owner"
                                        customFields[3].additional_attribute = '';
                                        commonFunction.addDataToTable("custom_fields", customFields[3]).then((data) => {
                                            customFields[4].section_id = sectionBody.id;
                                            customFields[4].control_type = "sales_stage"
                                            customFields[4].additional_attribute = '';
                                            commonFunction.addDataToTable("custom_fields", customFields[3]).then((data) => {
                                                done();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        it('it should GET ALL sections with additional attribute', () => {
            return chai.request(server)
                .get('/api/getSectionsWithAttribute/lead')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.be.a('object');
                    res.body.sections.should.be.a('array');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should GET ALL sections with additional attribute', () => {
            return chai.request(server)
                .get('/api/getSectionsWithAttribute/client')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.be.a('object');
                    res.body.sections.should.be.a('array');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });
});

describe('/GET ALL Lead custom Fields with attribute', () => {

    it('it should GET ALL custom Fields with attribute', () => {
        return chai.request(server)
            .get('/api/customFilter/customFieldsWithAttribute/lead')
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should GET ALL custom Fields with attribute', () => {
        return chai.request(server)
            .get('/api/customFilter/customFieldsWithAttribute/lead')
            .set({ Authorization: token })
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.should.be.a('object');
                res.body.fields.should.be.a('array');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});