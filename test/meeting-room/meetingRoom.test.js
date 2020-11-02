/**
 * Created by cis on 27/8/18.
 */
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const should = chai.should();
chai.use(chaiHttp);

let loggedInUser, token, user, data = {
    title: "Meeeting Room 1",
    address : "indore India",
    created_at: new Date(),
    updated_at: new Date()
};

describe('login', () => {
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });
    before((done) => { //Before each test we empty the database
        commonFunction.sequalizedDb(['users', 'permission_sets', 'user_roles', 'meeting_rooms']).then(() => {
            const role = generatedSampleData.createdSampleData("user_roles", 1);
            const permission = generatedSampleData.createdSampleData("permission_sets", 1);
            user = generatedSampleData.createdSampleData("users", 1)[0]
            commonFunction.addDataToTable("user_roles", role[0]).then((role_data) => {
                user.role_id = role_data.id
                commonFunction.addDataToTable("permission_sets", permission[0]).then((permission_data) => {
                    user.permission_set_id = permission_data.id;
                    commonFunction.addDataToTable("users", user).then((data) => {
                        done();
                    });
                })
            });
        });
    });

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

describe('/POST MEETING ROOM ', () => {
    it('it should not POST a MEETING ROOM  without Authorization', () => {
        return chai.request(server)
            .post('/api/meetingRoom')
            .send(data)
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

})

describe('/GET MEETING ROOM ', () => {
    it('It should get meetingRoom array of length zero form default database', () => {
        return chai.request(server)
            .get('/api/meetingRoom')
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.meetingRooms.should.be.a('array');
                res.body.meetingRooms.length.should.be.eql(0);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
})

describe('/POST  should not POST MEETING ROOM ', () => {
    it('it should not POST a meetingRoom without content', () => {
        return chai.request(server)
            .post('/api/meetingRoom')
            .set({
                Authorization: token
            })
            .send({
                title: null,
                address : null
            })
            .then((res) => {
                res.should.have.status(422);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
})

describe('/POST authorization MEETING ROOM ', () => {
    it('it should  POST a meetingRoom with authorization', () => {
        return chai.request(server)
            .post('/api/meetingRoom')
            .send(data)
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(201);
                res.body.success.should.be.eql(true);
                res.body.should.be.a('object');
                res.body.should.have.property('meetingRoom');
                const receiveddata = res.body.meetingRoom;
                receiveddata.should.have.property('id');
                receiveddata.should.have.property('title');
                receiveddata.should.have.property('created_at');
                receiveddata.should.have.property('updated_at');
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

})

describe('/GET token MEETING ROOM ', () => {
    it('it should not get any meetingRoom in without access token', () => {
        return chai.request(server)
            .get('/api/meetingRoom')
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
})

describe('/GET array MEETING ROOM ', () => {
    it('it should get meetingRoom array form created meetingRoom', () => {
        return chai.request(server)
            .get('/api/meetingRoom')
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.meetingRooms.should.be.a('array');
                data.id = res.body.meetingRooms[0].id;
                res.body.meetingRooms.length.should.not.eql(0);
                res.body.meetingRooms[0].title.should.be.eql(data.title);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/PUT MEETING ROOM  Id', () => {
    it('It should update meetingRoom with meetingRoom  Id', () => {
        return chai.request(server)
            .put('/api/meetingRoom/' + data.id)
            .send(data)
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(201);
                res.body.success.should.be.eql(true);
                res.body.meetingRoom.should.be.a('object');
                res.body.meetingRoom.id.should.be.eql(data.id);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/PUT update MEETING ROOM ', () => {
    it('It should not update meetingRoom without meetingRoom Id', () => {
        return chai.request(server)
            .put('/api/meetingRoom/' + data.id)
            .send(data)
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});

describe('/DELETE MEETING ROOM ', () => {
    it('it should not delete a meetingRoom without access token', () => {
        return chai.request(server)
            .delete('/api/meetingRoom/' + data.id)
            .send()
            .then((res) => {
                res.should.have.status(401);
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });

});

describe('/DELETE success MEETING ROOM ', () => {
    it('it should delete a meetingRoom with and meetingRoom Id and access token', () => {
        return chai.request(server)
            .delete('/api/meetingRoom/' + data.id)
            .send()
            .set({
                Authorization: token
            })
            .then((res) => {
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                res.body.meetingRoom.should.be.a('string');
                res.body.meetingRoom.should.be.eql(data.id.toString());
            }).catch(function (err) {
                return Promise.reject(err);
            });
    });
});