/**
 * Created by cis on 14/8/18.
 */
const chai = require('chai');
const chaiHttp = require('chai-http');
const commonFunction = require('./commonFunction');
const server = require('../app');
const CreatedSampleData = require('./sampleData');
const modelName = 'users';
let token;
let sampleUser = CreatedSampleData.createdSampleData(modelName,1);
let user = sampleUser[0];

chai.use(chaiHttp);

const getAccessToken = () => {
    let data
    commonFunction.addDataToTable(modelName, user).then((responce)=>{
        console.log("error at creating access token",data);
       da
    });
    return responce;
};
// const addDataToTable = async () =>{
//    let [data,err] = await to(commonFunction.addDataToTable(modelName, user));
//     console.log("error at creating access token",addDataToTable());
//     return data;
// }
const sendrequest= async () =>{
   chai.request(server)
        .post('/api/users/login')
        .send(user)
        .end((err, res) => {
            console.log("error at creating access token",token);
            token = res.body.token;
            user = res.body.user;
            done();
        });
};

module.exports.getAccessToken = getAccessToken;



