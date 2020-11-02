const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
chai.use(chaiHttp);
const modelName = 'leads_clients';
let loggedInUser, token, user;
let leadData, leadId, leadIdArray,encodedObject;
const {
    users,
    salesStages,
    customFields
} = require('../multiple-upload/default-custom-field');

describe('Leads', () => {
    describe('login', () => {
        afterEach(() => {
            let key;
            for (key in this) {
                delete this[key];
            };
        });
        before((done) => { //Before each test we empty the database
            commonFunction.sequalizedDb(['notes', 'sales_stage_transitions', 'lost_lead_fields', 'sales_stage_counters', 'company_details', 'companies', 'contact_details', 'contacts', 'form_default_fields', 'lead_client_details', 'custom_fields', 'sections', 'leads_clients', 'sales_stages', 'users', 'permission_sets', 'user_roles']).then(() => {
                const role = generatedSampleData.createdSampleData("user_roles", 1);
                const permission = generatedSampleData.createdSampleData("permission_sets", 1);
                commonFunction.addDataToTable("user_roles", role[0]).then((role_data) => {
                    commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_data) => {
                        users.forEach(element => {
                            element.role_id = role_data.id;
                            element.permission_set_id = permission_data.id;
                        });
                        commonFunction.addBulkDataToTable("users", users).then((data) => {
                            user = users[0];
                            user.password = '123456';
                            commonFunction.addBulkDataToTable("sales_stages", salesStages).then((data) => {
                                const sections = generatedSampleData.createdSampleData("sections", 1);
                                commonFunction.addDataToTable("sections", sections[0]).then((data) => {
                                    customFields.forEach(field => {
                                        field.section_id = data.id;
                                    });
                                    commonFunction.addBulkDataToTable("custom_fields", customFields).then((data) => {
                                        done();
                                    });
                                });
                            });
                        })
                    });
                });
            });
        })

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
    });


    // describe('/GET lead', () => {

    //     it('it should not GET a lead without Authorization', () => {
    //         return chai.request(server)
    //             .get('/api/lead/getAll')
    //             .send(leadData)
    //             .then((res) => {
    //                 res.should.have.status(401);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('Find an array of length 0 from the blank database', () => {
    //         return chai.request(server)
    //             .get('/api/lead/getAll')
    //             .set({
    //                 Authorization: token
    //             })
    //             .then((res) => {
    //                 res.should.have.status(200)
    //                 res.body.success.should.be.eql(true);
    //                 res.body.leads.should.be.a('Array');
    //                 res.body.leads.length.should.be.eql(0);
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });


    describe('/POST leads', () => {
        before((done) => { //Before each test we empty the database
            const leadArray = generatedSampleData.createdSampleData("leads_clients", 1);
                leadData = leadArray[0];
                done();
        });

        it('it should not POST a lead without Authorization', () => {
            return chai.request(server)
                .post('/api/lead')
                .send(leadData)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should POST a lead', () => {
            return chai.request(server)
                .post('/api/lead')
                .set({
                    Authorization: token
                }).send(leadData)
                .then((res) => {
                    if (res) {
                        res.should.have.status(201)
                        res.body.success.should.be.eql(true);
                        res.body.should.be.a('object');
                        const lead = res.body.lead;
                        leadId = lead.id;
                        lead.should.have.property('id');
                        lead.should.have.property('user_id');
                        lead.should.have.property('contacts');
                        lead.should.have.property('companies');
                        lead.companies.should.have.property('name');
                        lead.companies.should.have.property('company_details');
                        lead.should.have.property('lead_client_details');
                        lead.contacts[0].should.have.property('first_name');
                        lead.contacts[0].should.have.property('last_name');
                        lead.contacts[0].should.have.property('email');
                        lead.should.have.property('created_at');
                        lead.should.have.property('updated_at');
                        lead.should.have.property('sales_stage_id');
                    }
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

    });

    describe('/GET Lead without lead id', () => {
        it('it should not GET a lead without lead id', () => {
            return chai.request(server)
                .get('/api/lead/get/abc')
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(401);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("It should have requested lead id.");
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // describe('/GET leads with lead id', () => {
    //   it('It should GET a lead', () => {
    //     return chai.request(server)
    //       .get('/api/lead/get/' + leadId)
    //       .set({
    //         Authorization: token
    //       })
    //       .then((res) => {
    //         if (res) {
    //           res.should.have.status(200);
    //           res.body.success.should.be.eql(true);
    //           res.body.lead.should.be.a('object');
    //           const lead = res.body.lead;
    //           lead.should.have.property('id');
    //           lead.should.have.property('user_id');
    //           lead.should.have.property('contacts');
    //           lead.should.have.property('companies');
    //           lead.companies.should.have.property('name');
    //           lead.companies.should.have.property('company_details');
    //           lead.should.have.property('lead_client_details');
    //           lead.contacts[0].should.have.property('first_name');
    //           lead.contacts[0].should.have.property('last_name');
    //           lead.contacts[0].should.have.property('email');
    //           lead.should.have.property('created_at');
    //           lead.should.have.property('updated_at');
    //           lead.should.have.property('sales_stage_id');
    //         }
    //       }).catch(function (err) {
    //         return Promise.reject(err);
    //       });
    //   });
    // });

    describe('/GET all leads', () => {
        it('Get an array of all leads', () => {
            return chai.request(server)
                .get('/api/lead/getAll')
                .set({
                    Authorization: token
                })
                .then((res) => {
                    if (res) {
                        res.should.have.status(200)
                        res.body.success.should.be.eql(true);
                        res.body.leads.should.be.a('Array');
                        res.body.leads.length.should.not.eql(0);
                        res.body.leads[0].sales_stage_id.should.be.eql(leadData.sales_stage_id);
                    }
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // describe('/POST leads', () => {
    //     it('Fetch all lead for a selected filter data req body object', () => {
    //         const reqBody = {"saleStageIds":[1],"customFilterIds":[],"entityType":1,leads_client:''}
    //         encodedObject = commonFunction.encodeToBase64(reqBody);
    //         return chai.request(server)
    //             .get('/api/lead/filterdata/'+encodedObject)
    //             .set({
    //                 Authorization: token
    //             })
    //             .then((res) => {
    //                 if (res) {
    //                     res.should.have.status(200)
    //                     res.body.success.should.be.eql(true);
    //                     res.body.leads.should.be.a('Array');
    //                     res.body.leads.length.should.not.eql(0);
    //                     res.body.leads[0].sales_stage_id.should.be.eql(leadData.sales_stage_id);
    //                 }
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should fetch blank lead array for a selected filter data req body object with wrong values', () => {
    //         const reqBody = {"saleStageIds":[],"customFilterIds":[],"entityType":"LEAD"};
    //         encodedObject = commonFunction.encodeToBase64(reqBody);
    //         return chai.request(server)
    //             .get('/api/lead/filterdata/'+encodedObject)
    //             .set({
    //                 Authorization: token
    //             })
    //             .then((res) => {
    //                 if (res) {
    //                     res.should.have.status(200)
    //                     res.body.success.should.be.eql(true);
    //                     res.body.leads.should.be.a('Array');
    //                     res.body.leads.length.should.eql(0);
    //                 }
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });

    describe('/PUT leads', () => {
        before((done) => { //Before each test we empty the database
            leadData["id"] = leadId;
            leadData["sales_stage_id"] = 4;
            leadData['type'] = "CLIENT"
            done();
        });

        it('it should update lead with lead Id', () => {
            return chai.request(server)
                .put('/api/lead/update/' + leadId)
                .set({
                    Authorization: token
                })
                .send(leadData)
                .then((res) => {
                    res.should.have.status(201)
                    res.body.leads.should.be.a('Object');
                    res.body.leads.sales_stage_id.should.be.eql(leadData.sales_stage_id);
                    res.body.leads.type.should.be.eql(leadData.type);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        })
    });

    describe('/DELETE leads', () => {
        before((done) => {
            commonFunction.sequalizedDb(['sales_stage_transitions', 'lost_lead_fields']).then(() => {
                done();
            })
        })
        it('it should delete lead with lead Id', () => {
            return chai.request(server)
                .delete('/api/lead/' + leadId)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(201);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        })
    });

    // lead  bulk oprations
    describe('/Bulk oprations leads filter data API', () => {
        before((done) => {
            leadIdArray = [];
            leadData = generatedSampleData.createdSampleData("leads_clients", 25);
            leadData.forEach((element, indx) => {
                if (indx < 5) {
                    element["sales_stage_id"] = 7;
                } else if (indx < 10) {
                    element["sales_stage_id"] = 1;
                } else if (indx < 15) {
                    element["sales_stage_id"] = 4;
                } else {
                    element["sales_stage_id"] = 8;
                }
                element["user_id"] = loggedInUser.id;
                element['id'] = indx + 1
            });
            commonFunction.addBulkDataToTable("leads_clients", leadData).then((recived) => {
                done();
            });
        });

        describe('/GET all leads', () => {
            it('Get an array of all leads', () => {
                return chai.request(server)
                    .get('/api/lead/getAll')
                    .set({
                        Authorization: token
                    })
                    .then((res) => {
                        if (res) {
                            res.should.have.status(200)
                            res.body.success.should.be.eql(true);
                            const leads = res.body.leads;
                            leads.forEach((element, indx) => {
                                leadIdArray.push(element.id)
                            });
                            leads.should.be.a('Array');
                            leads.length.should.not.eql(0);
                            leads[0].should.have.property('sales_stage_id');
                            leadId = res.body.leads[0].id;
                        }
                    }).catch(function (err) {
                        return Promise.reject(err);
                    });
            });
        });

        it('it should not get lead filter data with wrong custom filters', () => {
            encodedObject = commonFunction.encodeToBase64({ saleStageIds : []});
            return chai.request(server)
                .get('/api/lead/filterdata/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("customFilterIds should be an array")
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not get lead filter data with wrong saleStageIds', () => {
            encodedObject = commonFunction.encodeToBase64({ customFilterIds : []});
            return chai.request(server)
                .get('/api/lead/filterdata/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(422);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql("saleStageIds should be an array")
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        })
    })

    describe('/POST Lost Lead Fields', () => {
        it('it Should create lost lead fields', () => {
            return chai.request(server)
                .post('/api/lead/lostLeadField')
                .send({
                    lead_id: leadId,
                    lost_identifier: "lost reason"
                })
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(201);
                    res.body.success.should.be.eql(true);
                    res.body.should.be.a('Object');
                    res.body.should.have.property("created");
                    res.body.should.have.property("data");
                    res.body.created.should.be.eql(true);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        })
    });

    describe('/Bulk oprations leads bulk update API', () => {
        it('it should bulk update lead with lead Id', () => {
            return chai.request(server)
                .put('/api/lead/bulkUpdate')
                .send({
                    sales_stage_id: 1,
                    leadIds: leadIdArray
                })
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(201);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not bulk update lead with lead Id', () => {
            return chai.request(server)
                .put('/api/lead/bulkUpdate')
                .send({
                    sales_stage_id: {},
                    leadIds: leadIdArray
                })
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(422);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        })
    });

    describe('/Bulk oprations leadsbulk delete API', () => {

        before((done) => {
            commonFunction.sequalizedDb(['sales_stage_transitions', ]).then(() => {
                done();
            })
        });

        it('it should bulk delete lead with lead Id', () => {
            return chai.request(server)
                .post('/api/lead/bulkRemove')
                .send(leadIdArray)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("massage");
                    res.body.should.have.property("leads");
                    res.body.massage.should.be.eql("lead removed sucessfully")
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        })
    });




    // describe('/POST leads', () => {
    //     it('Fetch all lead for a selected filter data req body object', () => {
    //         const reqBody = {"entityType":1,leads_client:''}
    //         encodedObject = commonFunction.encodeToBase64(reqBody);
    //         return chai.request(server)
    //             .get('/api/lead/searchData/'+encodedObject)
    //             .set({
    //                 Authorization: token
    //             })
    //             .then((res) => {
    //                 if (res) {
    //                     res.should.have.status(200)
    //                     res.body.success.should.be.eql(true);
    //                     res.body.leads.should.be.a('Array');
    //                     // res.body.leads.length.should.not.eql(0);
    //                     // res.body.leads[0].sales_stage_id.should.be.eql(leadData.sales_stage_id);
    //                 }
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });

    //     it('it should fetch blank lead array for a selected filter data req body object with wrong values', () => {
    //         const reqBody = {leads_client:'',"entityType":["LEAD"]};
    //         encodedObject = commonFunction.encodeToBase64(reqBody);
    //         return chai.request(server)
    //             .get('/api/lead/searchData/'+encodedObject)
    //             .set({
    //                 Authorization: token
    //             })
    //             .then((res) => {
    //                 if (res) {
    //                     res.should.have.status(200)
    //                     res.body.success.should.be.eql(true);
    //                     res.body.leads.should.be.a('Array');
    //                     res.body.leads.length.should.eql(0);
    //                 }
    //             }).catch(function (err) {
    //                 return Promise.reject(err);
    //             });
    //     });
    // });


});