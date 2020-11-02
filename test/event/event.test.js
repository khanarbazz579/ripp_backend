const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const commonFunction = require('../commonFunction');
const server = require('../../app');
const generatedSampleData = require('../sampleData');
const should = chai.should();
let rootData, user, token, token2, loggedInUser, role, event;
const md5 = require('md5');
const moment = require('moment');
chai.use(chaiHttp);
let encodedObject;
describe('Events', () => {
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });

    before((done) => { //Before each test we empty the database
         commonFunction.sequalizedDb(['user_details', 'users', 'permission_sets', 'user_roles', 'event_repeats', 'events']).then(() => {
            role = generatedSampleData.createdSampleData("user_roles", 1);
            permission = generatedSampleData.createdSampleData("permission_sets", 1);
            user = generatedSampleData.createdSampleData("users", 2)
            commonFunction.addDataToTable("user_roles", role[0]).then((role_data) => {
                user[0].role_id = role_data.id;
                user[1].role_id = role_data.id;
                commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_data) => {
                    user[0].permission_set_id = permission_data.id;
                    user[1].permission_set_id = permission_data.id;
                    commonFunction.addDataToTable("users", user[0]).then((data) => {
                        commonFunction.addDataToTable("users", user[1]).then((data) => {
                            sharedWithUser = data;
                            done();
                        });
                    });
                })
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
            })
            .catch(function(err) {
                return Promise.reject(err);
            });
    });

    // it('it should be login user2', () => {
    //     return chai.request(server)
    //         .post('/api/users/login')
    //         .send(user[1])
    //         .then((res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a('object');
    //             res.body.token.should.be.a('string');
    //             token2 = res.body.token;
    //             // loggedInUser = res.body.user;
    //             res.body.user.should.be.a('object');
    //             res.body.user.first_name.should.be.eql(user[1].first_name);
    //             res.body.user.last_name.should.be.eql(user[1].last_name);
    //             res.body.user.email.should.be.eql(user[1].email);
    //         })
    //         .catch(function(err) {
    //             return Promise.reject(err);
    //         });
    // });

    describe('Create Events', () => {
        it('it should not POST a event without Authorization', () => {
            eventData = {
                "lead_id": "null",
                "contact_id": [{
                    "fixed": true,
                    "company": "Ripple CRM Ltd",
                    "message": "(Organiser)",
                    "email": loggedInUser.email,
                    "first_name": loggedInUser.first_name,
                    "last_name": loggedInUser.last_name,
                    "id": loggedInUser.id,
                    "status": 'U',
                    "rmessage": null,
                    "img": loggedInUser.first_name.substring(0, 1).toUpperCase() + loggedInUser.last_name.substring(0, 1).toUpperCase()
                }],
                "is_meeting_room": false,
                "meeting_room_id": null,
                "title": "",
                "type": "",
                "start": new Date(),
                "startTime": new Date(),
                "end": "",
                "endTime": "",
                "color": "",
                "location": "",
                "details": "",
                "is_multiday": false,
                "email_reminder": false,
                "text_reminder": "",
                "is_all_day": false,
                "repeat": {
                    "repeatVal": "none",
                    "repeatDetails": {
                        "repeatDetailsValue": "daily",
                        "repeatInnerDetails": {
                            "daily": {
                                "every": 1,
                            },
                            "weekly": {
                                "every": 1,
                                "weekday": []
                            },
                            "monthly": {
                                "every": 1,
                                "monthday": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            },
                            "yearly": {
                                "every": 1,
                                "yearmonth": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            }
                        }
                    }
                },
                "endrepeat": {
                    "endrepeatVal": "",
                    "endrepeatDetail": 1
                },
                "is_send_email": true
            };
            return chai.request(server)
                .post('/api/event/events')
                .send({
                    events: eventData
                })
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should  POST a event with Authorization', () => {
            eventData = {
                "lead_id": "null",
                "contact_id": [{
                    "fixed": true,
                    "company": "Ripple CRM Ltd",
                    "message": "(Organiser)",
                    "email": loggedInUser.email,
                    "first_name": loggedInUser.first_name,
                    "last_name": loggedInUser.last_name,
                    "id": loggedInUser.id,
                    "status": 'U',
                    "rmessage": null,
                    "img": loggedInUser.first_name.substring(0, 1).toUpperCase() + loggedInUser.last_name.substring(0, 1).toUpperCase()
                }, {
                    "fixed": false,
                    "company": "Ripple CRM Ltd",
                    "message": "(Organiser)",
                    "email": loggedInUser.email,
                    "first_name": loggedInUser.first_name,
                    "last_name": loggedInUser.last_name,
                    "id": loggedInUser.id,
                    "status": 'U',
                    "rmessage": null,
                    "img": loggedInUser.first_name.substring(0, 1).toUpperCase() + loggedInUser.last_name.substring(0, 1).toUpperCase()
                }],
                "is_meeting_room": false,
                "meeting_room_id": null,
                "title": "Test",
                "type": "meeting",
                "start": new Date().toString(),
                "startTime": new Date().toString(),
                "end": new Date().toString(),
                "endTime": new Date().toString(),
                "is_end": true,
                "is_end_time": true,
                "color": "purple",
                "location": "",
                "details": "",
                "is_multiday": false,
                "email_reminder": false,
                "text_reminder": "",
                "is_all_day": false,
                "repeat": {
                    "repeatVal": "none",
                    "repeatDetails": {
                        "repeatDetailsValue": "daily",
                        "repeatInnerDetails": {
                            "daily": {
                                "every": 1,
                            },
                            "weekly": {
                                "every": 1,
                                "weekday": []
                            },
                            "monthly": {
                                "every": 1,
                                "monthday": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            },
                            "yearly": {
                                "every": 1,
                                "yearmonth": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            }
                        }
                    }
                },
                "endrepeat": {
                    "endrepeatVal": "",
                    "endrepeatDetail": 1
                },
                "is_send_email": true
            };
            return chai.request(server)
                .post('/api/event/events')
                .set({
                    Authorization: token
                })
                .send({
                    events: eventData
                })
                .then((res) => {
                    res.should.have.status(201);
                    res.body.success.should.be.eql(true);
                    res.body.event.should.be.a('object');
                    event = res.body.event;
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should  POST a event with Authorization and end time', () => {
            eventData = {
                "lead_id": "null",
                "contact_id": [{
                    "fixed": true,
                    "company": "Ripple CRM Ltd",
                    "message": "(Organiser)",
                    "email": loggedInUser.email,
                    "first_name": loggedInUser.first_name,
                    "last_name": loggedInUser.last_name,
                    "id": loggedInUser.id,
                    "status": 'U',
                    "rmessage": null,
                    "img": loggedInUser.first_name.substring(0, 1).toUpperCase() + loggedInUser.last_name.substring(0, 1).toUpperCase()
                }, {
                    "fixed": false,
                    "company": "Ripple CRM Ltd",
                    "message": "(Organiser)",
                    "email": loggedInUser.email,
                    "first_name": loggedInUser.first_name,
                    "last_name": loggedInUser.last_name,
                    "id": loggedInUser.id,
                    "status": 'U',
                    "rmessage": null,
                    "img": loggedInUser.first_name.substring(0, 1).toUpperCase() + loggedInUser.last_name.substring(0, 1).toUpperCase()
                }, {
                    "fixed": false,
                    "company": "Ripple CRM Ltd",
                    "message": "(Organiser)",
                    "email": loggedInUser.email,
                    "first_name": loggedInUser.first_name,
                    "last_name": loggedInUser.last_name,
                    "id": 0,
                    "status": 'U',
                    "rmessage": null,
                    "img": loggedInUser.first_name.substring(0, 1).toUpperCase() + loggedInUser.last_name.substring(0, 1).toUpperCase()
                }],
                "is_meeting_room": false,
                "meeting_room_id": null,
                "title": "",
                "type": "meeting",
                "start": new Date(),
                "startTime": new Date(),
                "end": new Date(),
                "endTime": new Date(),
                "color": "purple",
                "location": "",
                "details": "",
                "is_multiday": false,
                "email_reminder": false,
                "text_reminder": "",
                "is_all_day": false,
                "repeat": {
                    "repeatVal": "none",
                    "repeatDetails": {
                        "repeatDetailsValue": "daily",
                        "repeatInnerDetails": {
                            "daily": {
                                "every": 1,
                            },
                            "weekly": {
                                "every": 1,
                                "weekday": []
                            },
                            "monthly": {
                                "every": 1,
                                "monthday": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            },
                            "yearly": {
                                "every": 1,
                                "yearmonth": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            }
                        }
                    }
                },
                "endrepeat": {
                    "endrepeatVal": "",
                    "endrepeatDetail": 1
                },
                "is_send_email": true
            };
            return chai.request(server)
                .post('/api/event/events')
                .set({
                    Authorization: token
                })
                .send({
                    events: eventData
                })
                .then((res) => {
                    res.should.have.status(201);
                    res.body.success.should.be.eql(true);
                    res.body.event.should.be.a('object');
                    event = res.body.event;
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should  POST a event with Authorization for daily repeat', () => {
            eventData = {
                "lead_id": "null",
                "contact_id": [{
                    "fixed": true,
                    "company": "Ripple CRM Ltd",
                    "message": "(Organiser)",
                    "email": loggedInUser.email,
                    "first_name": loggedInUser.first_name,
                    "last_name": loggedInUser.last_name,
                    "id": loggedInUser.id,
                    "status": 'U',
                    "rmessage": null,
                    "img": loggedInUser.first_name.substring(0, 1).toUpperCase() + loggedInUser.last_name.substring(0, 1).toUpperCase()
                }, {
                    "fixed": false,
                    "company": "Ripple CRM Ltd",
                    "message": "(Organiser)",
                    "email": loggedInUser.email,
                    "first_name": loggedInUser.first_name,
                    "last_name": loggedInUser.last_name,
                    "id": loggedInUser.id,
                    "status": 'U',
                    "rmessage": null,
                    "img": loggedInUser.first_name.substring(0, 1).toUpperCase() + loggedInUser.last_name.substring(0, 1).toUpperCase()
                }, {
                    "fixed": false,
                    "company": "Ripple CRM Ltd",
                    "message": "(Organiser)",
                    "email": 'test@mailinator.com',
                    "first_name": loggedInUser.first_name,
                    "last_name": loggedInUser.last_name,
                    "id": 0,
                    "status": 'U',
                    "rmessage": null,
                    "img": loggedInUser.first_name.substring(0, 1).toUpperCase() + loggedInUser.last_name.substring(0, 1).toUpperCase()
                }],
                "is_meeting_room": false,
                "meeting_room_id": 1,
                "title": "Test",
                "type": "meeting",
                "start": new Date().toString(),
                "startTime": new Date().toString(),
                "end": new Date().toString(),
                "endTime": new Date().toString(),
                "color": "purple",
                "location": "",
                "details": "",
                "is_multiday": false,
                "email_reminder": false,
                "text_reminder": "",
                "is_all_day": false,
                "repeat": {
                    "repeatVal": "every_day",
                    "repeatDetails": {
                        "repeatDetailsValue": "daily",
                        "repeatInnerDetails": {
                            "daily": {
                                "every": 1,
                            },
                            "weekly": {
                                "every": 1,
                                "weekday": []
                            },
                            "monthly": {
                                "every": 1,
                                "monthday": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            },
                            "yearly": {
                                "every": 1,
                                "yearmonth": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            }
                        }
                    }
                },
                "endrepeat": {
                    "endrepeatVal": "",
                    "endrepeatDetail": 1
                },
                "is_send_email": true
            };
            return chai.request(server)
                .post('/api/event/events')
                .set({
                    Authorization: token
                })
                .send({
                    events: eventData
                })
                .then((res) => {
                    res.should.have.status(201);
                    res.body.success.should.be.eql(true);
                    res.body.event.should.be.a('object');
                    event = res.body.event;
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });


        it('it should  POST a event with Authorization for all day', () => {
            eventData = {
                "lead_id": "null",
                "contact_id": [{
                    "fixed": true,
                    "company": "Ripple CRM Ltd",
                    "message": "(Organiser)",
                    "email": loggedInUser.email,
                    "first_name": loggedInUser.first_name,
                    "last_name": loggedInUser.last_name,
                    "id": loggedInUser.id,
                    "status": 'U',
                    "rmessage": null,
                    "img": loggedInUser.first_name.substring(0, 1).toUpperCase() + loggedInUser.last_name.substring(0, 1).toUpperCase()
                }, {
                    "fixed": false,
                    "company": "Ripple CRM Ltd",
                    "message": "(Organiser)",
                    "email": loggedInUser.email,
                    "first_name": loggedInUser.first_name,
                    "last_name": loggedInUser.last_name,
                    "id": loggedInUser.id,
                    "status": 'U',
                    "rmessage": null,
                    "img": loggedInUser.first_name.substring(0, 1).toUpperCase() + loggedInUser.last_name.substring(0, 1).toUpperCase()
                }, {
                    "fixed": false,
                    "company": "Ripple CRM Ltd",
                    "message": "(Organiser)",
                    "email": 'test@mailinator.com',
                    "first_name": loggedInUser.first_name,
                    "last_name": loggedInUser.last_name,
                    "id": 0,
                    "status": 'U',
                    "rmessage": null,
                    "img": loggedInUser.first_name.substring(0, 1).toUpperCase() + loggedInUser.last_name.substring(0, 1).toUpperCase()
                }],
                "is_meeting_room": false,
                "meeting_room_id": 1,
                "title": "Test",
                "type": "meeting",
                "start": new Date().toString(),
                "startTime": new Date().toString(),
                "end": new Date().toString(),
                "endTime": new Date().toString(),
                "color": "purple",
                "location": "",
                "details": "",
                "is_multiday": false,
                "email_reminder": false,
                "text_reminder": "",
                "is_all_day": true,
                "repeat": {
                    "repeatVal": "every_day",
                    "repeatDetails": {
                        "repeatDetailsValue": "daily",
                        "repeatInnerDetails": {
                            "daily": {
                                "every": 1,
                            },
                            "weekly": {
                                "every": 1,
                                "weekday": []
                            },
                            "monthly": {
                                "every": 1,
                                "monthday": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            },
                            "yearly": {
                                "every": 1,
                                "yearmonth": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            }
                        }
                    }
                },
                "endrepeat": {
                    "endrepeatVal": "",
                    "endrepeatDetail": 1
                },
                "is_send_email": true
            };
            return chai.request(server)
                .post('/api/event/events')
                .set({
                    Authorization: token
                })
                .send({
                    events: eventData
                })
                .then((res) => {
                    res.should.have.status(201);
                    res.body.success.should.be.eql(true);
                    res.body.event.should.be.a('object');
                    event = res.body.event;
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });


        it('it should not POST a event without required fields', () => {
            return chai.request(server)
                .post('/api/event/events')
                .set({
                    Authorization: token
                })
                .send({})
                .then((res) => {
                    res.should.have.status(422);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/GET  Events', () => {
        it('It should get event without required fields ', () => {
            encodedObject = commonFunction.encodeToBase64({});
            return chai.request(server)
                .get('/api/event/getEvents/'+encodedObject)
                // .send({})
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(422);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        // it('It should get event array ', () => {
        //      encodedObject = commonFunction.encodeToBase64({
        //         currentMonth: new Date()
        //     });
        //     let buff = Buffer.from(encodedObject, 'base64');
        //     let text = buff.toString('ascii');
        //     console.log("JSON.parse(text) ========>",JSON.parse(text));
            
        //     return chai.request(server)
        //         .get('/api/event/getEvents/'+encodedObject)
        //         // .send({
        //         //     currentMonth: new Date()
        //         // })
        //         .set({
        //             Authorization: token
        //         })
        //         .then((res) => {
        //             res.should.have.status(200);
        //             res.body.success.should.be.eql(true);
        //             res.body.events.should.be.a('array');
        //         }).catch(function(err) {
        //             return Promise.reject(err);
        //         });
        // });
    });

    describe('/COUNT Events Objects', () => {
        it('it should not count a Event without access token', () => {
            return chai.request(server)
                .get('/api/event/eventCount')
                .send()
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should count all Event with access token', () => {
            return chai.request(server)
                .get('/api/event/eventCount')
                .send()
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.eventCount.should.be.a('Object');
                    res.body.eventCount.should.have.property('personal');
                    res.body.eventCount.should.have.property('annualLeave');
                    res.body.eventCount.should.have.property('meeting');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/PUT Events', () => {
        // it('It should update event with event Id', () => {
        //     eventData = event;
        //     return chai.request(server)
        //         .put('/api/event/event/' + eventData.id)
        //         .send({
        //             events: eventData
        //         })
        //         .set({
        //             Authorization: token
        //         })
        //         .then((res) => {
        //             res.should.have.status(200);
        //             res.body.success.should.be.eql(true);
        //             res.body.event.should.be.a('object');
        //             res.body.event.id.should.be.eql(eventData.id);
        //         }).catch(function(err) {
        //             return Promise.reject(err);
        //         });
        // });

        it('It should update repeated event with event Id', () => {
            eventData = event;
            eventData.base = "repeated";
            eventData.contact_id = [];
            return chai.request(server)
                .put('/api/event/event/' + eventData.id)
                .send(eventData)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.event.should.be.a('object');
                    res.body.event.id.should.be.eql(eventData.id);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('It should not update event without access token', () => {
            eventData = event;
            return chai.request(server)
                .put('/api/event/event/' + eventData.id)
                .send({
                    events: eventData
                })
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/Get Signle event By Id', () => {
        it('it should get single event with id param', () => {
            return chai.request(server)
                .get('/api/event/event/' + event.id)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    //Resend email
    describe('/post resend email', () => {
        it('it should not resend email without access token', () => {
            return chai.request(server)
                .post('/api/event/resendEmail/')
                .send()
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should resend email with access token', () => {
            eventData = {
                "id": event.id - 1,
                "email": loggedInUser.email,
                "lead_id": "null",
                "contact_id": [{
                    "fixed": true,
                    "company": "Ripple CRM Ltd",
                    "message": "(Organiser)",
                    "email": loggedInUser.email,
                    "first_name": loggedInUser.first_name,
                    "last_name": loggedInUser.last_name,
                    "id": loggedInUser.id,
                    "status": 'U',
                    "rmessage": null,
                    "img": loggedInUser.first_name.substring(0, 1).toUpperCase() + loggedInUser.last_name.substring(0, 1).toUpperCase()
                }, {
                    "fixed": false,
                    "company": "Ripple CRM Ltd",
                    "message": "(Organiser)",
                    "email": loggedInUser.email,
                    "first_name": loggedInUser.first_name,
                    "last_name": loggedInUser.last_name,
                    "id": 0,
                    "status": 'U',
                    "rmessage": null,
                    "img": loggedInUser.first_name.substring(0, 1).toUpperCase() + loggedInUser.last_name.substring(0, 1).toUpperCase()
                }],
                "is_meeting_room": false,
                "meeting_room_id": null,
                "title": "",
                "type": "meeting",
                "start": new Date().toString(),
                "startTime": new Date().toString(),
                "end": new Date(),
                "endTime": new Date(),
                "is_end": true,
                "is_end_time": true,
                "color": "purple",
                "location": "",
                "details": "",
                "is_multiday": false,
                "email_reminder": false,
                "text_reminder": "",
                "is_all_day": false,
                "repeat": {
                    "repeatVal": "none",
                    "repeatDetails": {
                        "repeatDetailsValue": "daily",
                        "repeatInnerDetails": {
                            "daily": {
                                "every": 1,
                            },
                            "weekly": {
                                "every": 1,
                                "weekday": []
                            },
                            "monthly": {
                                "every": 1,
                                "monthday": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            },
                            "yearly": {
                                "every": 1,
                                "yearmonth": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            }
                        }
                    }
                },
                "endrepeat": {
                    "endrepeatVal": "",
                    "endrepeatDetail": 1
                },
                "is_send_email": true
            };
            return chai.request(server)
                .post('/api/event/resendEmail/')
                .send(eventData)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.message.should.be.a('string');
                    res.body.message.should.be.eql("Resend invitation successfully sent.");
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

    });

    //Is meeting room availbale.

    describe('/post check meeting room availebilty', () => {
        it('it should get meeting room avaibilty ', () => {
            encodedObject = commonFunction.encodeToBase64({
                startTime: new Date('2000-01-01 00:00:00'),
                start: new Date('2000-01-01 00:00:00'),
                endTime: new Date(),
                end: new Date(),
                event_id: 0,
                meeting_room_id: 1,
                repeat: {
                    "repeatVal": "none",
                    "repeatDetails": {
                        "repeatDetailsValue": "daily",
                        "repeatInnerDetails": {
                            "daily": {
                                "every": 1,
                            },
                            "weekly": {
                                "every": 1,
                                "weekday": []
                            },
                            "monthly": {
                                "every": 1,
                                "monthday": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            },
                            "yearly": {
                                "every": 1,
                                "yearmonth": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            }
                        }
                    }
                },
                endrepeat: {
                    "endrepeatVal": "",
                    "endrepeatDetail": 1
                }
            });
            return chai.request(server)
                .get('/api/event/isMeetingRoomAvailable/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });


        it('it should get meeting room avaibilty for repeated events ', () => {
            encodedObject = commonFunction.encodeToBase64({
                startTime: moment().add(1, 'days'),
                start: moment().add(1, 'days'),
                endTime: moment().add(2, 'days'),
                end: moment().add(2, 'days'),
                event_id: 0,
                meeting_room_id: 1,
                repeat: {
                    "repeatVal": "every_month",
                    "repeatDetails": {
                        "repeatDetailsValue": "daily",
                        "repeatInnerDetails": {
                            "daily": {
                                "every": 1,
                            },
                            "weekly": {
                                "every": 1,
                                "weekday": []
                            },
                            "monthly": {
                                "every": 1,
                                "monthday": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            },
                            "yearly": {
                                "every": 1,
                                "yearmonth": [],
                                "type": "each",
                                "freq": "first",
                                "day": "day"
                            }
                        }
                    }
                },
                endrepeat: {
                    "endrepeatVal": "",
                    "endrepeatDetail": 1
                }
            });
            return chai.request(server)
                .get('/api/event/isMeetingRoomAvailable/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should get meeting room avaibilty without end date', () => {
            encodedObject = commonFunction.encodeToBase64({
                startTime: new Date('2000-01-01 00:00:00'),
                start: new Date('2000-01-01 00:00:00'),
                endTime: new Date(),
                end: null,
                event_id: event.id,
                meeting_room_id: 1
            });
            return chai.request(server)
                .get('/api/event/isMeetingRoomAvailable/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should get meeting room avaibilty with invalid meeting id', () => {
            encodedObject = commonFunction.encodeToBase64({
                startTime: new Date('2000-01-01 00:00:00'),
                start: new Date('2000-01-01 00:00:00'),
                endTime: new Date(),
                end: null,
                event_id: 0,
                meeting_room_id: 0
            });
            return chai.request(server)
                .get('/api/event/isMeetingRoomAvailable/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/post acceptRejectInvitation', () => {
        it('it should change accept status of invitation ', () => {
            return chai.request(server)
                .post('/api/event/acceptRejectInvitation/')
                .set({
                    Authorization: token
                })
                .send({
                    title: 'Test',
                    status: true,
                    email: 'test@mailinator.com'
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should change reject status of invitation ', () => {
            return chai.request(server)
                .post('/api/event/acceptRejectInvitation/')
                .set({
                    Authorization: token
                })
                .send({
                    title: 'Test',
                    status: false,
                    email: 'test@mailinator.com',
                    message: "I have another meeting"
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    })

    describe('/DELETE Events', () => {
        it('it should not delete a Event without access token', () => {
            return chai.request(server)
                .post('/api/event/deleteEvent/')
                .send()
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should delete a Event without event Id and with access token', () => {
            return chai.request(server)
                .post('/api/event/deleteEvent/')
                .send({})
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(422);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should delete a Event with and event Id and access token', () => {
            return chai.request(server)
                .post('/api/event/deleteEvent/')
                .send({
                    id: event.id
                })
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.event.should.be.a('number');
                    res.body.event.should.be.eql(event.id);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    });

    describe('/get Contacts', () => {
        it('it should not get contact list without access token', () => {
            return chai.request(server)
                .get('/api/event/contacts/')
                .send()
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should  get contact list with access token', () => {
            return chai.request(server)
                .get('/api/event/contacts/')
                .set({
                    Authorization: token
                })
                .send()
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.contacts.should.be.a('array');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    })

    describe('/get getContacts', () => {
        it('it should not get contact list without access token', () => {
            encodedObject = commonFunction.encodeToBase64({});
            return chai.request(server)
                .get('/api/event/getContacts/'+encodedObject)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should not get contact list with access token without term', () => {
            encodedObject = commonFunction.encodeToBase64({});
            return chai.request(server)
                .get('/api/event/getContacts/'+encodedObject)
                .then((res) => {
                    res.should.have.status(401);
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });

        it('it should  get contact list with access token with term', () => {
            encodedObject = commonFunction.encodeToBase64({
                text: 'te'
            });
            return chai.request(server)
                .get('/api/event/getContacts/'+encodedObject)
                .set({
                    Authorization: token
                })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.contacts.should.be.a('array');
                }).catch(function(err) {
                    return Promise.reject(err);
                });
        });
    })

    describe('Update Invite Status', () => {
        // it('it should  get event by key list with access token with term', () => {
        //     return chai.request(server)
        //         .post('/api/event/getEventByKey/')
        //         .set({
        //             Authorization: token
        //         })
        //         .send({
        //             key: md5(1)
        //         })
        //         .then((res) => {
        //             res.should.have.status(200);
        //             res.body.success.should.be.eql(true);
        //             res.body.data.events.should.be.a('array');
        //         }).catch(function(err) {
        //             return Promise.reject(err);
        //         });
        // });

        // it('it should  get event by key list with access token with term', () => {
        //     return chai.request(server)
        //         .post('/api/event/updateStatus/')
        //         .set({
        //             Authorization: token
        //         })
        //         .send({
        //             event_recipients_id: 1,
        //             event_id: event.id - 1,
        //             status: 'Y',
        //             message: ''
        //         })
        //         .then((res) => {
        //             res.should.have.status(200);
        //             res.body.success.should.be.eql(true);
        //         }).catch(function(err) {
        //             return Promise.reject(err);
        //         });
        // });
    })

    after((done) => { 
         commonFunction.sequalizedDb(['notifications']).then(() => {
          done()
        });
    });


});