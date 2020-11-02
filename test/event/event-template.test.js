const chai = require('chai');
const expect = require('chai').expect;
const chaiHttp = require('chai-http');
const emailTemplate = require('../../controllers/eventController/eventTemplate');
const should = chai.should();
chai.use(chaiHttp);
describe('EmailTemplates', () => {
    afterEach(() => {
        let key;
        for (key in this) {
            delete this[key];
        };
    });

    it("It should get inviteTemplate event template", async function() {
        let template = await emailTemplate.inviteTemplate("Test", new Date(), new Date(), "Test", [{ first_name: "Test" }], "Test Tet", "Test Adess", "Key");
        template.should.be.a('string');
    })

    it("It should get orgenizerTemplate event template", async function() {
        let template = await emailTemplate.orgenizerTemplate("Test", new Date(), new Date(), "Test", [{ first_name: "Test" }, { first_name: "Fixed", fixed: true }], "Test Tet", "Test Adess", "Key", true);
        template.should.be.a('string');
    })

    it("It should get orgenizerTemplate event template for attending", async function() {
        let template = await emailTemplate.orgenizerTemplate("Test", new Date(), new Date(), "Test", [{ first_name: "Test", status: true }, { first_name: "Fixed", fixed: true }], "Test Tet", "Test Adess", "Key", true);
        template.should.be.a('string');
    })

    it("It should get orgenizerTemplate event template for not attending", async function() {
        let template = await emailTemplate.orgenizerTemplate("Test", new Date(), new Date(), "Test", [{ first_name: "Test", status: false }, { first_name: "Fixed", fixed: true }], "Test Tet", "Test Adess", "Key", true);
        template.should.be.a('string');
    })

    it("It should get getDeleteEventEmailTemplate event template", async function() {
        let template = await emailTemplate.getDeleteEventEmailTemplate("Test", new Date(), new Date(), "Test", [{ first_name: "Test" }], "Test Tet", "Test Adess");
        template.should.be.a('string');
    })



});