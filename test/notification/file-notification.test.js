const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const should = chai.should();
chai.use(chaiHttp);

let user, userBody, leadBody, salesStageBody, token, taskBody, loggedInUser, notificationBody, contactBody, fileCategoryBody, entityFileBody;

describe('File Notifications', () => {
    
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });

    before((done) => { 
        commonFunction.sequalizedDb([
			'notifications',
        	'file_categories',
            'file_notification_details',
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


    describe('/UPLOAD Entity File', () => {

    	before( (done) => {
    		let fileCategory = {
		        name:'General',
		        user_id: userBody.id
		    }
		    commonFunction.addDataToTable("file_categories", fileCategory).then((data) => {
		        fileCategoryBody = data;
		        done();
		    });
    	})

        it('it should UPLOAD a IMAGE Entity File for file notification', function () {
            return chai
                .request(server)
                .post('/api/entityMedia/upload')
                .set({ Authorization: token })
                .field('selectedCategory', fileCategoryBody.id)
                .field('uniqueuserstamp', new Date().getTime())
                .field('fileWithExtention', 'Googlelogo.png')
                .field('entity_id', leadBody.id)
                .field('entity_type', "LEAD_CLIENT")
                .field('selectedContact', [contactBody.id])
                .attach('file', 'test/test-image/Googlelogo.png', 'Googlelogo')
                .then((res) => {
                    uploadedFile = res.body;
                    uploadedFile.should.be.a('object');
                    uploadedFile.success.should.be.eql(true);
                    entityFileBody = uploadedFile.data; 
                    uploadedFile.message.should.be.eql('File uploaded and copied successfully!');
                    uploadedFile.data.id.should.not.be.null;
                    uploadedFile.data.created_by.should.not.be.null;
                    uploadedFile.data.name.should.be.eql('Googlelogo.png');
                }).catch(function (err) {
                    return Promise.reject(err);
            });
        });

    });

    describe('/CREATE File Notification', () => {
	    it('it should not CREATE a file notification without Authorization', () => {
	        return chai.request(server)
	            .post('/api/notification/createFileNotification')
	            .send(notificationBody)
	            .then((res) => {
	                res.should.have.status(401);
	            }).catch(function (err) {
	                return Promise.reject(err);
	            });
	    });
	})

	describe('/CREATE File Notification', () => {
		before( (done) => {
			notificationBody = {
				entity_id: null,
				file_name: 'Googlelogo.png'
			}
			done()
		});

	    it('it should not CREATE a file notification without entity type or entity id', () => {
	        return chai.request(server)
	            .post('/api/notification/createFileNotification')
	            .send(notificationBody)
	            .set({ Authorization: token })
	            .then((res) => {
	                res.should.have.status(401);
	                res.body.success.should.be.eql(false);
	                res.body.should.be.a('object');
	                res.body.message.should.be.eql("It should have entity.");
	            }).catch(function (err) {
	                return Promise.reject(err);
	            });
	    });
	})

	describe('/CREATE File Notification', () => {
		before( (done) => {
			notificationBody = {
				entity_type: "LEAD_CLIENT",
				entity_id: leadBody.id,
				file_name: 'Googlelogo.png',
				progress: 100,
				file_id: entityFileBody.id
			}
			done()
		});

	    it('it should CREATE a file notification', () => {
	        return chai.request(server)
	            .post('/api/notification/createFileNotification')
	            .send(notificationBody)
	            .set({ Authorization: token })
	            .then((res) => {
	                res.should.have.status(200);
	                res.body.success.should.be.eql(true);
	                res.body.should.be.a('object');
	                res.body.notification_detail.entity_id.should.be.eql(leadBody.id);
	                res.body.message.should.be.eql('File notification detail created successfully.');
	                notificationBody = res.body.notification_detail;
	            }).catch(function (err) {
	                return Promise.reject(err);
	            });
	    });
	})

	describe('/UPDATE File Notification', () => {
		
		it('it should not UPDATE a file notification without Authorization', () => {
	        return chai.request(server)
	            .put('/api/notification/updateFileNotification/'+notificationBody.id)
	            .send(notificationBody)
	            .then((res) => {
	            	res.should.have.status(401);
	                notificationBody.entity_type = null;
	            }).catch(function (err) {
	                return Promise.reject(err);
	            });
	    });

	    it('it should not UPDATE a file notification without notification id', () => {
	        return chai.request(server)
	            .put('/api/notification/updateFileNotification/'+notificationBody.id)
	            .send(notificationBody)
	            .set({ Authorization: token })
	            .then((res) => {
	                res.should.have.status(401);
	                res.body.success.should.be.eql(false);
	                res.body.should.be.a('object');
	                res.body.message.should.be.eql("It should have entity.");
	                notificationBody.entity_type = 'LEAD_CLIENT';
	                notificationBody.is_read = 1;
	            }).catch(function (err) {
	                return Promise.reject(err);
	            });
	    });

	    it('it should UPDATE a file notification and get notification read status', () => {
	        return chai.request(server)
	            .put('/api/notification/updateFileNotification/'+notificationBody.id)
	            .send(notificationBody)
	            .set({ Authorization: token })
	            .then((res) => {
	            	res.should.have.status(200);
	                res.body.success.should.be.eql(true);
	                res.body.should.be.a('object');
	                res.body.notificationsReadStatus.should.be.a('boolean');
	                res.body.message.should.be.eql('File notification updated successfully.');
	            }).catch(function (err) {
	                return Promise.reject(err);
	            });
	    });
	})

	describe('/BULK UPDATE File Notification', () => {
		
		let reqBody = {};

		it('it should not BULK UPDATE a file notification without Authorization', () => {
	        return chai.request(server)
	            .post('/api/notification/bulkUpdateFileNotification')
	            .send(reqBody)
	            .then((res) => {
	            	res.should.have.status(401);
	            }).catch(function (err) {
	                return Promise.reject(err);
	            });
	    });

	    it('it should not BULK UPDATE a file notification without criteria', () => {
	        return chai.request(server)
	            .post('/api/notification/bulkUpdateFileNotification')
	            .send(reqBody)
	            .set({ Authorization: token })
	            .then((res) => {
	                res.should.have.status(401);
	                res.body.success.should.be.eql(false);
	                res.body.should.be.a('object');
	                res.body.message.should.be.eql("Criteria is required.");
	                reqBody = {
						criteria: {
							user_id: notificationBody.user_id
						}
					}
	            }).catch(function (err) {
	                return Promise.reject(err);
	            });
	    });

	    it('it should not BULK UPDATE a file notification without data', () => {
	        return chai.request(server)
	            .post('/api/notification/bulkUpdateFileNotification')
	            .send(reqBody)
	            .set({ Authorization: token })
	            .then((res) => {
	                res.should.have.status(401);
	                res.body.success.should.be.eql(false);
	                res.body.should.be.a('object');
	                res.body.message.should.be.eql("Data to be updated is required.");
	                reqBody = {
						criteria: {
							user_id:  notificationBody.user_id
						},
						data: {
							is_read: 1
						}
					}
	            }).catch(function (err) {
	                return Promise.reject(err);
	            });
	    });

	    it('it should BULK UPDATE a file notification', () => {
	        return chai.request(server)
	            .post('/api/notification/bulkUpdateFileNotification')
	            .send(reqBody)
	            .set({ Authorization: token })
	            .then((res) => {
	            	res.should.have.status(200);
	                res.body.success.should.be.eql(true);
	                res.body.should.be.a('object');
	                res.body.message.should.be.eql("Notification updated successfully.");
	            }).catch(function (err) {
	                return Promise.reject(err);
	            });
	    });
	})

	describe('/GETALL File Notifications', () => {

		let reqBody = {};

		before( (done) => {
			reqBody = {
				whereCriteria: {
					created_at: {
						$lt: new Date()					
					},
					user_id: userBody.id
				}
			}
			done()
		})

	    it('it should not GETALL file notifications without Authorization', () => {
			encodedObject = commonFunction.encodeToBase64({});
	        return chai.request(server)
	            .get('/api/notification/fileNotifications/'+encodedObject)
	            .then((res) => {
	                res.should.have.status(401);
	            }).catch(function (err) {
	                return Promise.reject(err);
	            });
	    });

	    it('it should GETALL file notification', () => {
			encodedObject = commonFunction.encodeToBase64(reqBody);
	        return chai.request(server)
	            .get('/api/notification/fileNotifications/'+encodedObject)
	            // .send(reqBody)
	            .set({ Authorization: token })
	            .then((res) => {
	            	res.should.have.status(200);
	                res.body.success.should.be.eql(true);
	                res.body.should.be.a('object');
	                res.body.notificationDetailObjects.should.be.a('array');
	                res.body.message.should.be.eql('File notification detail get successfully.');
	            }).catch(function (err) {
	                return Promise.reject(err);
	            });
	    });
	})

	//Problem with socket hang
	// describe('/GET File Notifications Read Status', () => {

	//     it('it should not GET File Notifications Read Status without Authorization', () => {
	//         return chai.request(server)
	//             .get('/api/notification/getFileNotificationReadStatus')
	//             .then((res) => {
	//                 res.should.have.status(401);
	//             }).catch(function (err) {
	//                 return Promise.reject(err);
	//             });
	//     });

	//     it('it should GET File Notifications Read Status', () => {
	//         return chai.request(server)
	//             .get('/api/notification/getFileNotificationReadStatus')
	//             .set({ Authorization: token })
	//             .then((res) => {
	//             	res.should.have.status(200);
	//                 res.body.success.should.be.eql(true);
	//                 res.body.should.be.a('object');
	//                 res.body.notificationsReadStatus.should.be.a('boolean');
	//                 res.body.message.should.be.eql('File notification read status get successfully.');
	//             }).catch(function (err) {
	//                 return Promise.reject(err);
	//             });
	//     });
	// })

	

	describe('/DELETE Entity File', () => {
        it('it should delete the file by file id', () => {
            return chai
                .request(server)
                .post(`/api/entityMedia/remove`)
                .set({ Authorization: token })
                .send({ id: entityFileBody.id })
                .then((res) => {
                    const data = res.body;
                    data.success.should.be.eql(true);
                    res.body.message.should.be.eql('Deleted succesfully');
                }).catch(function (err) {
                    return Promise.reject(err);
                });
        });
    });

	after((done) => { 
        commonFunction.sequalizedDb([
        	'file_categories',
            'file_notification_details',
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
        	done();
	    });   
    });

});