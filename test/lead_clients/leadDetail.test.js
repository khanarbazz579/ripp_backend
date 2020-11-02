const chai = require('chai');
const chaiHttp = require('chai-http');

const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const server = require('../../app');

const should = chai.should();

chai.use(chaiHttp);

let user, userBody, salesStageBody, leadBody, sectionBody, customFieldBody;
let contactBody, companyBody, token, companyContactBody, leadDetailBody;

describe('Update Lead Details', async () => {

	describe('/LOGIN Lead Details', () => {
        afterEach(() => {
            let key;
            for (key in this) {
                delete this[key];
            };
        });

	    before((done) => {
	    	commonFunction.sequalizedDb([ 'sales_stage_transitions', 'lost_lead_fields', 'sales_stage_counters', 'leads_clients', 'sales_stages', 'users', 'permission_sets', 'user_roles']).then(() => {
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
                            sales_stages = generatedSampleData.createdSampleData("sales_stages", 1);
                            commonFunction.addDataToTable("sales_stages", sales_stages[0]).then((data) => {
                                salesStageBody = data;
                                leads = generatedSampleData.createdSampleData("leads_clients", 1);
                                leads[0].sales_stage_id = salesStageBody.id;
                                leads[0].user_id = userBody.id;
                                commonFunction.addDataToTable("leads_clients", leads[0]).then((data) => {
                                    leadBody = data;
                                    contacts = generatedSampleData.createdSampleData("contacts", 1);
                                    contacts[0].entity_id = leadBody.id;
                                    contacts[0].entity_type = "LEAD_CLIENT";
                                    commonFunction.addDataToTable("contacts", contacts[0]).then((data) => {
                                        contactBody = data;
                                        section = generatedSampleData.createdSampleData("sections", 1);
                                        commonFunction.addDataToTable("sections", section[0]).then((data) => {
                                            sectionBody  = data;
                                            customField = generatedSampleData.createdSampleData("custom_fields", 1);
                                            customField[0].section_id = sectionBody.id;
                                            commonFunction.addDataToTable("custom_fields", customField[0]).then((data) => {
                                                customFieldBody = data;
                                                done();
                                            });
                                        });
                                    })
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

    describe('/UPLOAD Lead Profile Image', () => {

        it('it should not UPLOAD profile image without image', () => {
            return chai.request(server)
                .post('/api/uploadImage')
                .set({ Authorization: token })
                .field('lead_client_id', leadBody.id )
                .then((uploadedResponse) => {
                    uploadedResponse.body.success.should.be.eql(false);
                    uploadedResponse.body.message.should.be.eql("Something went wrong"); 
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/UPLOAD Lead Profile Image', () => {
        it('it should UPLOAD profile image of lead with new contact', () => {
            return chai.request(server)
                .post('/api/uploadImage')
                .set({ Authorization: token })
                .field('lead_client_id', leadBody.id)
                .attach('profile_image', 'test/test-image/demo.jpg', 'demo')
                .then((uploadedResponse) => {
                    uploadedResponse.should.have.status(200);
                    uploadedResponse.body.success.should.be.eql(true);
                    uploadedResponse.body.message.should.be.eql("Image Uploaded.");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/UPLOAD AND UPDATE Lead Profile Image', () => {
        it('it should UPLOAD profile image of lead with existing contact', () => {
            return chai.request(server)
                .post('/api/uploadImage')
                .set({ Authorization: token })
                .field('lead_client_id', leadBody.id)
                .field('id', contactBody.id)
                .attach('profile_image', 'test/test-image/demo.jpg', 'demo')
                .then((uploadedResponse) => {
                    uploadedResponse.should.have.status(200);
                    uploadedResponse.body.success.should.be.eql(true);
                    uploadedResponse.body.message.should.be.eql("Image Uploaded.");
                    contactBody.profile_image = uploadedResponse.body.image_name
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/DELETE and UPLOAD Lead Profile Image', () => {
        it('it should DELETE AND UPLOAD profile image of lead', () => {
            return chai.request(server)
                .post('/api/uploadImage')
                .set({ Authorization: token })
                .field('old_image_name', contactBody.profile_image)
                .field('lead_client_id', leadBody.id)
                .field('id', contactBody.id)
                .attach('profile_image', 'test/test-image/demo.jpg', 'demo')
                .then((uploadedResponse) => {
                    uploadedResponse.should.have.status(200);
                    uploadedResponse.body.success.should.be.eql(true);
                    uploadedResponse.body.message.should.be.eql("Image Uploaded.");
                    contactBody.profile_image = uploadedResponse.body.image_name
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/DELETE Lead Profile Image', () => {
        it('it should not DELETE a image without contact id', () => {
            return chai.request(server)
                .put('/api/removeImage/abc')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(401);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("It should have requested contact id.");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/DELETE Lead Profile Image', () => {
        it('it should not DELETE profile image without image name', () => {
            return chai.request(server)
                .put('/api/removeImage/' + contactBody.id)
                .set({ Authorization: token })
                .then((res) => {
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("No image found."); 
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/DELETE Lead Profile Image', () => {
        it('it should not DELETE profile image with wrong image name', () => {
            return chai.request(server)
                .put('/api/removeImage/' + contactBody.id)
                .set({ Authorization: token })
                .field('type', "primary")
                .field('image_name', "abcd")
                .then((res) => {
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("Wrong image name."); 
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/DELETE Lead Profile Image', () => {
        it('it should DELETE profile image of lead', () => {
            return chai.request(server)
                .put('/api/removeImage/' + contactBody.id)
                .set({ Authorization: token })
                .field('image_name', contactBody.profile_image)
                .then((deletedResponse) => {
                    console.log("++++++++++++", deletedResponse.body)
                    deletedResponse.should.have.status(200);
                    deletedResponse.body.success.should.be.eql(true);
                    deletedResponse.body.message.should.be.eql("Deleted successfully.");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/UPDATE Contact and Company', () => {
        before( (done) => {
            contactBody = generatedSampleData.createdSampleData("contacts", 1);
            contactBody[0].entity_id = leadBody.id;
            contactBody[0].entity_type = "LEAD_CLIENT"
            commonFunction.addDataToTable("contacts", contactBody[0]).then((data) => {
                contactBody = data;
                companyBody = generatedSampleData.createdSampleData("companies", 1);
                companyBody[0].entity_id = leadBody.id;
                companyBody[0].entity_type = "LEAD_CLIENT"
                commonFunction.addDataToTable("companies", companyBody[0]).then((data) => {
                    companyBody = data;
                    companyContactBody = { 
                        'contact':{
                            'contact_id': contactBody.id,
                            'first_name': contactBody.first_name,
                            'last_name': contactBody.last_name,
                            'email': contactBody.email,
                            'phone_number': contactBody.phone_number
                        },
                        'company':{
                            'company_id': companyBody.id,
                            'name': companyBody.name
                        }
                    };
                    done();
                }); 
            });
        });

        it('it should UPDATE Contact and Company of lead', () => {
            return chai.request(server)
                .post('/api/updateCompanyContact')
                .set({ Authorization: token })
                .send(companyContactBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.company.should.be.a('object');
                    res.body.contact.should.be.a('object');
                    res.body.message.should.be.eql("Contact Updated Successfully");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/UPDATE Lead and CREATE lead detail, contact detail, company detail', () => {
        before( (done) => {
            contactBody = generatedSampleData.createdSampleData("contacts", 2);
            contactBody[0].entity_id = leadBody.id;
            contactBody[0].entity_type = "LEAD_CLIENT"
            contactBody[1].entity_id = leadBody.id;
            contactBody[1].entity_type = "LEAD_CLIENT"
            companyBody = generatedSampleData.createdSampleData("companies", 1);
            companyBody[0].entity_id = leadBody.id;
            companyBody[0].entity_type = "LEAD_CLIENT"

            section = generatedSampleData.createdSampleData("sections", 1);
            commonFunction.addDataToTable("sections", section[0]).then((data) => {
                sectionBody  = data;
                customField = generatedSampleData.createdSampleData("custom_fields", 1);
                customField[0].section_id = sectionBody.id;
                commonFunction.addDataToTable("custom_fields", customField[0]).then((data) => {
                    let customFieldBody = data;
                    commonFunction.addDataToTable("companies", companyBody[0]).then((data) => {
                        companyBody = data;
                        leadDetailBody = {
                            'lead_detail_body' :{
                                'id': leadBody.id,
                                'sales_stage_id' : leadBody.sales_stage_id,
                                'type': 'LEAD',
                                'contacts':[{
                                    'first_name': contactBody[0].first_name,
                                    'last_name': contactBody[0].last_name,
                                    'email': contactBody[0].email,
                                    'phone_number': contactBody[0].phone_number
                                },{
                                    'first_name': contactBody[1].first_name,
                                    'last_name': contactBody[1].last_name,
                                    'email': contactBody[1].email,
                                    'phone_number': contactBody[1].phone_number
                                }],
                                'companies':{
                                    'id': companyBody.id,
                                    'name': companyBody.name,
                                }
                            },
                            'deleted_contacts' : [] 
                        };
                        leadDetailBody['lead_detail_body'][customFieldBody.id] = 'lead detail';
                        leadDetailBody['lead_detail_body']['companies'][customFieldBody.id] = 'company detail';
                        leadDetailBody['lead_detail_body']['contacts'][0][customFieldBody.id] = 'contact detail';
                        done();
                    });
                });
            });
 
        });

        it('it should UPDATE Lead and CREATE lead detail, contact detail, company detail', () => {
            return chai.request(server)
                .put('/api/updateLeadDetail/'+ leadBody.id)
                .set({ Authorization: token })
                .send(leadDetailBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.lead.should.be.a('object');
                    res.body.message.should.be.eql("Lead updated successfully.");
                    leadBody = res.body.lead;
                    console.log("++++++++++++++", leadBody)

                    res.body.lead.should.have.property('id');
                    res.body.lead.should.have.property('sales_stage_id');
                    res.body.lead.should.have.property('type');
                    res.body.lead.should.have.property('contacts');
                    res.body.lead.should.have.property('companies');
                    res.body.lead.contacts.length.should.be.eql(2);
                    res.body.lead.contacts[0].first_name.should.be.eql(contactBody[0].first_name);
                    res.body.lead.contacts[1].last_name.should.be.eql(contactBody[1].last_name);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/UPDATE Lead and UPDATE lead detail, contact detail, company detail', () => {
        before( (done) => {
            delete leadBody.sales_stage;
            leadBody.contacts[0].first_name = "Alex";
            leadDetailBody = {
                'lead_detail_body' : leadBody,  
                'deleted_contacts' : [leadBody.contacts[1].id] 
            }
            done(); 
        });

        it('it should UPDATE Lead and UPDATE lead detail, contact detail, company detail', () => {
            return chai.request(server)
                .put('/api/updateLeadDetail/'+leadBody.id)
                .set({ Authorization: token })
                .send(leadDetailBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.success.should.be.eql(true);
                    res.body.lead.should.be.a('object');
                    res.body.message.should.be.eql("Lead updated successfully.");
                    leadBody = res.body.lead;
                    res.body.lead.should.have.property('id');
                    res.body.lead.should.have.property('sales_stage_id');
                    res.body.lead.should.have.property('type');
                    res.body.lead.should.have.property('contacts');
                    res.body.lead.should.have.property('companies');
                    res.body.lead.contacts[0].first_name.should.be.eql("Alex");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

});
