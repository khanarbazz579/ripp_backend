const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const should = chai.should();
chai.use(chaiHttp);

let loggedInUser, token, user, settingData;

describe('Notifications >>>>>>>>>', () => {
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });

    before((done) => { 
        commonFunction.sequalizedDb([
            'global_notification_settings',
            'notifications',
            'notes',
            'sales_stage_transitions',
            'lost_lead_fields',
            'sales_stage_counters',
            'company_details',
            'companies',
            'contact_details',
            'contacts',
            'form_default_fields',
            'lead_client_details',
            'custom_fields',
            'sections',
            'leads_clients',
            'sales_stages',
            'user_has_permissions',
            'user_has_permission_sets',
            'permission_sets_has_permissions',
            'permission',
            'permission_sets',
            'users',
            "user_roles"
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
	                    settingData = {
	                    	type: "CALL",
	                    	is_active: 0
	                    };
		                commonFunction.addDataToTable("global_notification_settings", settingData).then((data) => {
		                    settingData = data
		                    done();
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
});

describe('/UPDATE Notification Setting', () => {

    it('it should not UPDATE a Notification Setting without Authorization', () => {
        return chai.request(server)
            .put('/api/notification/globalNotificationSetting/call')
            .send(settingData)
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should not UPDATE a Notification Setting with false notification type', () => {
        return chai.request(server)
            .put('/api/notification/globalNotificationSetting/abc')
            .send(settingData)
            .set({ Authorization: token })
            .then((res) => {
                res.should.have.status(401);
                res.body.success.should.be.eql(false);
                res.body.should.be.a('object');
                res.body.message.should.be.eql("It should have requested type.");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
})

describe('/UPDATE Notification Setting (CALL)', () => {
    before((done) => {
        settingData.is_active = 0;
        done();
    })
    it('it should UPDATE a Notification Setting', () => {
        return chai.request(server)
            .put('/api/notification/globalNotificationSetting/call')
            .send(settingData)
            .set({ Authorization: token })
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.should.be.a('object');
                res.body.message.should.be.eql("Settings updated successfully.");
            }).catch(function (err) {
                return Promise.reject(err);
        });
    });
})

describe('/UPDATE Notification Setting (EVENT)' ,() => {
    let eventSetting = {
        type : "EVENT_ACCEPT",
        is_active : 0
    }

    before( (done) => {
        commonFunction.addDataToTable("global_notification_settings", settingData).then((data) => {
            eventSetting = data
            done();
        });
    })

    it('it should UPDATE a Notification Setting', () => {
        return chai.request(server)
            .put('/api/notification/globalNotificationSetting/event')
            .send(eventSetting)
            .set({ Authorization: token })
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.should.be.a('object');
                res.body.message.should.be.eql("Settings updated successfully.");
            }).catch(function (err) {
                return Promise.reject(err);
        });
    });
})


describe('/GET Notification Setting', () => {

    it('it should not GET a Notification Setting without type', () => {
        return chai.request(server)
            .get('/api/notification/globalNotificationSetting/ABC')
            .set({ Authorization: token })
            .then((res) => {
                res.should.have.status(401);
                res.body.success.should.be.eql(false);
                res.body.should.be.a('object');
                res.body.message.should.be.eql("It should have type.");
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    it('it should GET a Notification Setting', () => {
        return chai.request(server)
            .get('/api/notification/globalNotificationSetting/CALL')
            .set({ Authorization: token })
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.should.be.a('object');
                res.body.setting.should.be.a('object');
                res.body.setting.type.should.be.eql('CALL');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
})

describe('/GETALL Notification Settings', () => {
    it('it should not GETALL Notification Settings without Authorization', () => {
        return chai.request(server)
            .get('/api/notification/globalNotificationSettings')
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
})

describe('/GETALL Notification Settings', () => {
    before((done) => {
        let typeTodo, typeEmail, typeEvent;
        typeTodo = {
        	type: "TODO",
        	is_active: 0
        };
        typeEmail = {
        	type: "EMAIL",
        	is_active: 0
        };
        typeEvent = {
        	type: "EVENT",
        	is_active: 0
        };
        commonFunction.addDataToTable("global_notification_settings", typeTodo).then(() => {
            commonFunction.addDataToTable("global_notification_settings", typeEmail).then(() => {
                commonFunction.addDataToTable("global_notification_settings", typeEvent).then(() => {
                    done();
                });
            });
        });
    })

    it('it should GETALL Notification Settings', () => {
        return chai.request(server)
            .get('/api/notification/globalNotificationSettings')
            .set({ Authorization: token })
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.should.be.a('object');
                res.body.should.have.property('settings');
                res.body.settings.length.should.be.eql(4);
                const receiveddata = res.body.settings[0];
                receiveddata.should.have.property('id');
                receiveddata.should.have.property('type');
                receiveddata.should.have.property('is_active');
                receiveddata.should.have.property('created_at');
                receiveddata.should.have.property('updated_at');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

    after((done) => { 
        commonFunction.sequalizedDb(["users", "user_roles", "permission_sets",'global_notification_settings']).then(() => {
        	done();
	    });   
    });
})