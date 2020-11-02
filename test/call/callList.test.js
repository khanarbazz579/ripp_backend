const chai = require('chai');
const chaiHttp = require('chai-http');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const server = require('../../app');
const should = chai.should();
chai.use(chaiHttp);


var user, userBody, leadBody, salesStageBody, token,listData, taskBody,temp, taskModelWithData, section,loggedInUser, filterWithField ,sectionsBody,callListData,callListWithData,custom_field, custom_field_id,encodedObject;

describe('Call List', () => {

    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });

    before((done) => {
        commonFunction.sequalizedDb([ 'user_details','custom_fields','call_outcomes_transitions', 'notes', 'histories', 'notifications', 'tasks', 'sales_stage_transitions', 'lost_lead_fields', 'sales_stage_counters', 'leads_clients', 'suppliers', 'sales_stages', 'users','user_roles','permission_sets','call_lists','sections']).then(() => {
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
                            leads[0].owner = userBody.id;
                            commonFunction.addDataToTable("leads_clients", leads[0]).then((data) => {
                                leadBody = data;
                                contacts = generatedSampleData.createdSampleData("contacts", 1);
                                contacts[0].entity_id = leadBody.id;
                                contacts[0].entity_type = "LEAD_CLIENT";
                                commonFunction.addDataToTable("contacts", contacts[0]).then((data) => {
                                    contactBody = data;
                                    tasks = generatedSampleData.createdSampleData("tasks", 1);
                                    tasks[0].user_id = userBody.id;
                                    tasks[0].contact_id = contactBody.id;
                                    commonFunction.addDataToTable("tasks", tasks[0]).then((data) => {
                                        taskBody = data;
                                        section = generatedSampleData.createdSampleData('sections',1);
                                        commonFunction.addDataToTable("sections",section[0]).then((data) =>{
                                            sectionsBody= data
                                             custom_field = {
                                                section_id: sectionsBody.id,
                                                table_name : 'contacts',
                                                model_name : 'first_name',
                                                restrict_action : 1,
                                                field_size: 6,
                                                created_at: new Date(),
                                                updated_at: new Date()
                                            }
                                            commonFunction.addDataToTable("custom_fields",custom_field).then((data) =>{
                                                custom_field_id = data.id
                                                taskModelWithData = generatedSampleData.createdSampleData("call_lists", 1);
                                                taskModelWithData[0].custom_filter_id = sectionsBody.id;
                                                taskModelWithData[0].name = sectionsBody.name;
                                                commonFunction.addDataToTable("call_lists", taskModelWithData[0]).then((data) =>{
                                                    listData = data;
                                                    done();
                                                })
                                            })
                                           
                                        }); 
                                    });
                                });
                            });
                        })
                    });
                });
            })
        });
    });


    describe('/LOGIN Task', () => {
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
    });

    describe('/GET List', () => {
        
       it('it should GET a List', () => {
           
            return chai.request(server)
                .get('/api/callList/' )
                .set({ Authorization: token })
                .then((res) => {
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.should.have.status(200);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });


    describe('/GET List', () => {
        
        it('it should not GET a List without access token', () => {
            return chai.request(server)
                .get('/api/callList/' )
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    // describe('/POST  List',() =>{

    //     it("it should not POST a list without any Data" ,() =>{
            
    //         return chai.request(server)
    //             .get('/api/callList/')
    //             // .send(listData)
    //             .set({Authorization: token})
    //             .then((res) =>{
    //                 res.should.have.status(422);
    //             }).catch((err) =>{
    //                 return Promise.reject(err)
    //             })
    //     })
    // })

  

    describe('/POST  List',() =>{

        it("it should POST a list" ,() =>{
            
            return chai.request(server)
                .get('/api/callList/')
                .send(listData)
                .set({Authorization: token})
                .then((res) =>{
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.should.have.status(200);
                }).catch((err) =>{
                    return Promise.reject(err)
                })
        })
    })
    
    describe('/POST  List',() =>{


        it("it should POST not a list without access token" ,() =>{
            
            return chai.request(server)
                .get('/api/callList/')
                .send(listData)
                .then((res) =>{
                    res.should.have.status(401);
                }).catch((err) =>{
                    return Promise.reject(err)
                })
        })
    })
    describe('/GET filter', () => {

        before((done) => {  
            filterWithField = {
                filterFields: [{
                    custom_field_id: sectionsBody.id,
                    option: "$eq",
                    value: "adsads",
                    type: "LEAD"
                    }],
                include_existing_call_contact: false,
                saleStageIds:[],
                addAttributes: {record_type:['LEAD']}
            }
            encodedObject = commonFunction.encodeToBase64(filterWithField);
            done();
        });

        it('it should GET Filter', () => {
            return chai.request(server)
                .get('/api/getFilterContactCount/'+encodedObject)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.should.have.status(200);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });
     describe('/POST filter', () => {
        before((done) => {
        filterWithField = {
            filterFields: [{
                custom_field_id: sectionsBody.id,
                option: "$eq",
                value: "adsads",
                type: "CLIENT"
                }],
            include_existing_call_contact: false,
            addAttributes: {record_type:['lead']}
        }
        encodedObject = commonFunction.encodeToBase64(filterWithField);
            done();
        });

        it('it should not GET Filter without access token', () => {
            return chai.request(server)
                .get('/api/getFilterContactCount/'+encodedObject)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });


    describe('/PUT Call List', () => {
        before((done) => {
            listData.fields = []
             callListData = {
                callListBody: listData,
                matchCriteria: []
             }
              done();
            });
        it('it should PUT Call List', () => {
            return chai.request(server)
                .put('/api/callList/')
                .set({ Authorization: token })
                .send(callListData)
                .then((res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.message.should.be.eql('Call list Updated Successfully.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT Call List', () => {
        before((done) => {
            listData.fields = []
             callListData = {
                callListBody: listData,
                matchCriteria: []
             }
              done();
            });
        it('it should PUT Call List', () => {
            return chai.request(server)
                .put('/api/callList/')
                .send(callListData)
                .then((res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });


    describe('/DELETE Call', () => {
       
        it('it should DELETE Call', () => {
            return chai.request(server)
                .delete('/api/callList/' + listData.id)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.message.should.be.eql('Call List get successfully.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });
    describe('/DELETE Call', () => {
       
        it('it should not DELETE Call without access token', () => {
            return chai.request(server)
                .delete('/api/callList/' + listData.id)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });
    
 /**
 * Test case for custom filter 
 */

describe('/GET filter', () => {
    before((done) => {  
        filterWithField = {
            filterFields: [{
                custom_field_id: custom_field_id,
                option: "$eq",
                value: contacts[0].first_name,
                type: "LEAD"
                }],
                addAttributes: {call_status:['all'],record_type:[]}
        }
        encodedObject = commonFunction.encodeToBase64(filterWithField);
        done();
    });

    it('it should GET Filter', () => {
        return chai.request(server)
            .get('/api/getFilterCallCount/'+encodedObject)
            .set({ Authorization: token })
            .then((res) => {
                res.should.be.json;
                res.body.should.be.a('object');
                res.should.have.status(200);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/GET filter', () => {
    before((done) => {  
        filterWithField = {
            filterFields: [{
                custom_field_id: custom_field_id,
                option: "$eq",
                value: contacts[0].first_name,
                type: "LEAD"
                }],
                addAttributes: {call_status:['today'],record_type:[]}
        }
        encodedObject = commonFunction.encodeToBase64(filterWithField);
        done();
    });

    it('it should GET filter for today attributes', () => {
        return chai.request(server)
            .get('/api/getFilterCallCount/'+encodedObject)
            .set({ Authorization: token })
            .then((res) => {
                res.should.be.json;
                res.body.should.be.a('object');
                res.should.have.status(200);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/GET filter', () => {
    before((done) => {  
        filterWithField = {
            filterFields: [{
                custom_field_id: custom_field_id,
                option: "$eq",
                value: contacts[0].first_name,
                type: "LEAD"
                }],
                addAttributes: {call_status:['future'],record_type:[]}
        }
        encodedObject = commonFunction.encodeToBase64(filterWithField);
        done();
    });

    it('it should GET filter for future attributes', () => {
        return chai.request(server)
            .get('/api/getFilterCallCount/'+encodedObject)
            .set({ Authorization: token })
            .then((res) => {
                res.should.be.json;
                res.body.should.be.a('object');
                res.should.have.status(200);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/GET filter', () => {
    before((done) => {  
        filterWithField = {
            filterFields: [{
                custom_field_id: custom_field_id,
                option: "$eq",
                value: contacts[0].first_name,
                type: "LEAD"
                }],
                addAttributes: {call_status:['overdue'],record_type:[]}
        }
        encodedObject = commonFunction.encodeToBase64(filterWithField);
        done();
    });

    it('it should GET filter for overdue attributes', () => {
        return chai.request(server)
            .get('/api/getFilterCallCount/'+encodedObject)
            .set({ Authorization: token })
            .then((res) => {
                res.should.be.json;
                res.body.should.be.a('object');
                res.should.have.status(200);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});


describe('/GET filter', () => {
    before((done) => {  
        filterWithField = {
            filterFields: [{
                custom_field_id: custom_field_id,
                option: "$eq",
                value: contacts[0].first_name,
                type: "LEAD"
                }],
                addAttributes:{call_status: ['today','future'],record_type:[]}
        }
        encodedObject = commonFunction.encodeToBase64(filterWithField);
        done();
    });

    it('it should GET Filter with today and future Attributes', () => {
        return chai.request(server)
            .get('/api/getFilterCallCount/'+encodedObject)
            .set({ Authorization: token })
            .then((res) => {
                res.should.be.json;
                res.body.should.be.a('object');
                res.should.have.status(200);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/GET filter', () => {
    before((done) => {  
        filterWithField = {
            filterFields: [{
                custom_field_id: custom_field_id,
                option: "$eq",
                value: contacts[0].first_name,
                type: "LEAD"
                }],
                addAttributes: {call_status:['all','today','future'],record_type:[]}
        }
        encodedObject = commonFunction.encodeToBase64(filterWithField);
        done();
    });

    it('it should GET Filter with all and today Attributes', () => {
        return chai.request(server)
            .get('/api/getFilterCallCount/'+encodedObject)
            .set({ Authorization: token })
            .then((res) => {
                res.should.be.json;
                res.body.should.be.a('object');
                res.should.have.status(200);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});


describe('/GET filter', () => {
    before((done) => {  
        filterWithField = {
            filterFields: [{
                custom_field_id: custom_field_id,
                option: "$eq",
                value: contacts[0].first_name,
                type: "LEAD"
                }],
                addAttributes: {call_status:['today','overdue'],record_type:[]}
        }
        encodedObject = commonFunction.encodeToBase64(filterWithField);
        done();
    });

    it('it should GET Filter with today and overdue Attributes', () => {
        return chai.request(server)
            .get('/api/getFilterCallCount/'+encodedObject)
            .set({ Authorization: token })
            .then((res) => {
                res.should.be.json;
                res.body.should.be.a('object');
                res.should.have.status(200);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/GET filter', () => {
    before((done) => {  
        filterWithField = {
            filterFields: [{
                custom_field_id: custom_field_id,
                option: "$eq",
                value: contacts[0].first_name,
                type: "LEAD"
                }],
                addAttributes: {call_status:['all'],record_type:[]}
        }
        encodedObject = commonFunction.encodeToBase64(filterWithField);
        done();
    });
    it('it should not GET Filter without access token', () => {
        return chai.request(server)
            .get('/api/getFilterCallCount/'+encodedObject)
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/GET filter', () => {
    before((done) => {  
        filterWithField = {
            filterFields: [],
            addAttributes: {call_status:[],record_type:[]}
        }
        encodedObject = commonFunction.encodeToBase64(filterWithField);
        done();
    });
    it('it should GET Filter without Passing data with body return with 0 count', () => {
        return chai.request(server)
            .get('/api/getFilterCallCount/'+encodedObject)
            .set({ Authorization: token })
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.message.should.be.eql('Call List get successfully.');
                res.body.count.should.be.eql(0);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

});