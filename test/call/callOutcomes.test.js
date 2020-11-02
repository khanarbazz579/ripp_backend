const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const should = chai.should();
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');

chai.use(chaiHttp);

let loggedInUser, callOutcomeBody, token, user, callOutcomesIdArray = [], taskObject, callOutcomeTransitionData;

afterEach(() => {
    let key;
    for (key in this) {
        delete this[key];
    };
});

describe('CALL OUTCOMES', () => {

    before((done) => { 
        commonFunction.sequalizedDb(['leads_clients','histories', 'call_outcomes_transitions', 'notifications', 'users', 'call_outcomes', 'user_roles']).then(() => {
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
                                    done();
                                });
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
                loggedInUser = res.body.user;
                res.body.user.should.be.a('object');
                res.body.user.first_name.should.be.eql(user[0].first_name);
                res.body.user.last_name.should.be.eql(user[0].last_name);
                res.body.user.email.should.be.eql(user[0].email);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    describe('/POST Call Outcome', () => {
    
        before((done) => { 
            callOutcomeBody = generatedSampleData.createdSampleData('call_outcomes', 1)[0];
            done();
        });

        it('it should not POST a Call Outcome without Authorization', () => {
            return chai.request(server)
                .post('/api/callOutcome')
                .send(callOutcomeBody)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Call Outcome', () => {
        before((done) => { 
            callOutcomeBody.name = null;
            done();
        });

        it('it should not POST a Call Outcome without Outcome name', () => {
            return chai.request(server)
                .post('/api/callOutcome')
                .set({ Authorization: token })
                .send(callOutcomeBody)
                .then((res) => {
                    res.should.have.status(401);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql('Name is required.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/POST Call Outcome', () => {
        before((done) => { 
            callOutcomeBody.name = "Call Outcome Name";
            done();
        });

        it('it should POST a Call Outcome', () => {
            return chai.request(server)
                .post('/api/callOutcome')
                .set({ Authorization: token })
                .send(callOutcomeBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.call_outcome.should.be.a('object')
                    const callOutcome = res.body.call_outcome;
                    callOutcome.should.have.property('id');
                    callOutcome.should.have.property('name');
                    callOutcome.should.have.property('priority_order');
                    callOutcome.name.should.be.eql(callOutcomeBody.name);
                    callOutcome.priority_order.should.be.eql(callOutcomeBody.priority_order);
                    callOutcomeBody = callOutcome;
                    res.body.message.should.be.eql('Call outcome created successfully.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/UPDATE Call Outcome', () => {

        before((done) => { 
            callOutcomeBody.name = null;
            done();
        });

        it('it should not UPDATE a Call Outcome without access token', () => {
            return chai.request(server)
                .put('/api/callOutcome/'+ callOutcomeBody.id)
                .send(callOutcomeBody)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not UPDATE a Call Outcome without Outcome name', () => {
            return chai.request(server)
                .put('/api/callOutcome/'+ callOutcomeBody.id)
                .set({ Authorization: token })
                .send(callOutcomeBody)
                .then((res) => {
                    res.should.have.status(401);
                    res.body.success.should.be.eql(false);
                    res.body.message.should.be.eql('Name is required.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/UPDATE Call Outcome', () => {
        before((done) => { 
            callOutcomeBody.name = "New Call Outcome Name";
            done();
        });

        it('it should UPDATE a Call Outcome', () => {
            return chai.request(server)
                .put('/api/callOutcome/'+ callOutcomeBody.id)
                .set({ Authorization: token })
                .send(callOutcomeBody)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.call_outcome.should.be.a('object')
                    const callOutcome = res.body.call_outcome;
                    callOutcome.should.have.property('id');
                    callOutcome.should.have.property('name');
                    callOutcome.should.have.property('priority_order');
                    callOutcome.name.should.be.eql(callOutcomeBody.name);
                    callOutcome.priority_order.should.be.eql(callOutcomeBody.priority_order);
                    callOutcomeBody = callOutcome;
                    res.body.message.should.be.eql('Call outcome updated successfully.');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GET Call Outcome', () => {
        it('it should not GET  Call Outcome without access token', () => {
            return chai.request(server)
                .get('/api/callOutcome')
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should GET Call Outcomes', () => {
            return chai.request(server)
                .get('/api/callOutcome')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.call_outcomes.should.be.a('array');
                    const callOutcome = res.body.call_outcomes[0];
                    callOutcome.should.have.property('id');
                    callOutcome.should.have.property('name');
                    callOutcome.should.have.property('priority_order');
                    callOutcome.name.should.be.eql(callOutcomeBody.name);
                    callOutcome.priority_order.should.be.eql(callOutcomeBody.priority_order);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/DELETE Call Outcome', () => {
        it('it should not DELETE a Call Outcome without access token', () => {
            return chai.request(server)
                .delete('/api/callOutcome/'+ callOutcomeBody.id)
                .send(callOutcomeBody)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should DELETE Call Outcome', () => {
            return chai.request(server)
                .delete('/api/callOutcome/' + callOutcomeBody.id)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql("Call outcome deleted successfully.")
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/DELETE Call Outcome', () => {
        it('it should not DELETE a Call Outcome without access token', () => {
            return chai.request(server)
                .delete('/api/callOutcome/'+ callOutcomeBody.id)
                .send(callOutcomeBody)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should DELETE Call Outcome', () => {
            return chai.request(server)
                .delete('/api/callOutcome/' + callOutcomeBody.id)
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql("Call outcome deleted successfully.")
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/UPDATE Call Outcome Transition', () => {
	    before((done) => { 
            let callOutcomes = generatedSampleData.createdSampleData("call_outcomes", 3)
            for (var i = 0; i < callOutcomes.length; i++) {
				commonFunction.addDataToTable("call_outcomes", callOutcomes[i]).then((data) => {
	                callOutcomesIdArray.push(data.id) 
	            });
            }
            taskObject = generatedSampleData.createdSampleData("tasks", 1);
            taskObject[0].contact_id = contactBody.id;
            commonFunction.addDataToTable("tasks", taskObject[0]).then((data) => {
                callOutcomeTransitionData = generatedSampleData.createdSampleData("call_outcomes_transitions", 1)
	    		callOutcomeTransitionData[0].task_id = data;
	    		callOutcomeTransitionData[0].outcome_id = callOutcomesIdArray;
                done()
            });
	    });

	    it('it should UPDATE Call Outcome Transition', () => {
            return chai.request(server)
                .post('/api/callOutcome/callOutcomeTransition')
                .set({ Authorization: token })
                .send(callOutcomeTransitionData[0])
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql("Call outcome transition created successfully.")
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
	});

    describe('/UPDATE Call Outcome Transition without Outcome', () => {
        before((done) => { 
            callOutcomeTransitionData[0].outcome_id = [];
            done();
        });

        it('it should UPDATE Call Outcome Transition without Outcome', () => {
            return chai.request(server)
                .post('/api/callOutcome/callOutcomeTransition')
                .set({ Authorization: token })
                .send(callOutcomeTransitionData[0])
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.eql("Call outcome transition created successfully.")
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/BULK UPDATE Call Outcome', () => {
        
        before((done) => { 
        	callOutcomeBody = [];
            callOutcomes = generatedSampleData.createdSampleData("call_outcomes", 2);
            commonFunction.addDataToTable("call_outcomes", callOutcomes[0]).then((data) => {
            	callOutcomeBody.push(data);
            	commonFunction.addDataToTable("call_outcomes", callOutcomes[1]).then((data2) => {
                	callOutcomeBody.push(data2);
            		done();
            	});    	
            });
        });

        it('it should GET Call Outcomes', () => {
            return chai.request(server)
                .get('/api/callOutcome')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.call_outcomes.should.be.a('array');
                    callOutcomeBody = res.body.call_outcomes;
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        it('it should not BULK UPDATE a Call Outcome without access token', () => {
            return chai.request(server)
                .put('/api/callOutcome/callOutcomebulkUpdate')
                .send(callOutcomeBody)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });

        // it('it should BULK UPDATE a Call Outcome', () => {
        //     return chai.request(server)
        //         .put('/api/callOutcome/callOutcomebulkUpdate')
        //         .set({ Authorization: token })
        //         .send(callOutcomeBody)
        //         .then((res) => {
        //             res.should.have.status(200);
        //             res.body.success.should.be.eql(true);
        //             res.body.message.should.be.eql("Call outcomes updated successfully.")
        //         }).catch(function (err) {
        //             return Promise.reject(err);
        //         });
        // });
	});
});