const chai = require('chai');
const chaiHttp = require('chai-http');

const Section = require('../../models').sections;
const commonFunction = require('../commonFunction');
const generatedSampleData = require('../sampleData');
const server = require('../../app');

const should = chai.should();

chai.use(chaiHttp);

let user, userBody, token;

afterEach(() => {
    let key;
    for (key in this) {
        delete this[key];
    };
});

describe('Currecies', async () => {

	describe('/LOGIN Currecies', () => {

	    before((done) => {
	    	commonFunction.sequalizedDb(['users', 'user_roles']).then(() => {
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
	                res.body.user.should.be.a('object');
	                res.body.user.first_name.should.be.eql(user[0].first_name);
	                res.body.user.last_name.should.be.eql(user[0].last_name);
	                res.body.user.email.should.be.eql(user[0].email);
	        }).catch(function (err) {
	          return Promise.reject(err);
	        });
	    });
	});
   

    describe('/GET ALL Currecies', () => {
        it('it should not GET ALL Currecies without access token', () => {
            return chai.request(server)
                .get('/api/currencies')
                .end((res) => {
                    res.should.have.status(401);                    
                }).catch(function (err) {
		          	return Promise.reject(err);
		        });
        });
    });

    describe('/GET ALL Currecies', () => {

    	it('it should GET ALL Currecies', () => {
            return chai.request(server)
                .get('/api/currencies')
                .set({ Authorization: token })
                .then((res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    res.body.should.be.a('object');
                    res.body.currency.should.be.a('array');
                }).catch(function (err) {
		          	return Promise.reject(err);
		        });
        });
    });
});
