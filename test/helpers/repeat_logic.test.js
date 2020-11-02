'use strict';
const chai = require('chai');
const moment = require('moment');
require('moment-timezone');
const repeatHelper = require('../../helpers/repeatHelper');
const expect = chai.expect;
var monthDate = moment('01/05/2019').format('DD-MM-YYYY');
let data = {
    title: "Test Events",
    startTime: moment('01/05/2019 11:00:00').format(),
    start: moment('01/05/2019 11:00:00').format(),
    endTime: moment('01/05/2019 12:00:00').format(),
    end: moment('01/05/2019 13:00:00').format(),
    repeat: {},
    deletedDay: [],
    endrepeat: {

    }
}
let records = [{
        title: "Test Events",
        startTime: moment('01/05/2019 11:00:00').format(),
        start: moment('01/05/2019 11:00:00').format(),
        endTime: moment('01/05/2019 12:00:00').format(),
        end: moment('01/05/2019 13:00:00').format(),
        repeat: {},
        id: 1,
        deletedDay: [],
        endrepeat: {

        }
    },
    {
        title: "Test Events",
        startTime: moment('01/05/2019 11:00:00').format(),
        start: moment('01/05/2019 11:00:00').format(),
        endTime: moment('01/05/2019 12:00:00').format(),
        end: moment('01/05/2019 13:00:00').format(),
        repeat: {},
        id: 2,
        deletedDay: [],
        endrepeat: {

        }
    },
    {
        title: "Test Events",
        startTime: moment('01/05/2019 11:00:00').format(),
        start: moment('01/05/2019 11:00:00').format(),
        endTime: moment('01/05/2019 12:00:00').format(),
        end: moment('01/05/2019 13:00:00').format(),
        repeat: {},
        id: 2,
        deletedDay: [],
        endrepeat: {

        }
    }
];
describe('RepeatLogic', () => {
    describe("Setup Repeats", function() {
        data.repeat.repeatVal = 'every_day';


        it("from  repeat helper, without monthDate parameter and with data parameter - repeatHelper.prototype.getRepeats(undefined,data)", async function() {
            let repeats = await repeatHelper.getRepeats(undefined, data);
            expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(new Date()).format('DD-MM-YYYY'));
            expect(repeatHelper.data).to.eq(data);
            expect(repeats).to.be.a('array');
            expect(repeats[0]).to.be.a('object');
        })

        it("from repeat helper, with monthDate parameter and with data parameter - repeatHelper.prototype.getRepeats(monthDate,data)", async function() {
            let repeats = await repeatHelper.getRepeats(monthDate, data);
            expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
            expect(repeatHelper.data).to.eq(data);
            expect(repeats).to.be.a('array');
            expect(repeats[0]).to.be.a('object');
            expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
            expect(repeatHelper.preMonthDays).to.eql(30);
            expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
            expect(repeatHelper.nextMonthDays).to.eql(30);
            // expect(repeatHelper.daysDiff).to.eql(130);
            expect(repeatHelper.repeatType).to.eql(1);
        });
    });

    describe("Daily Repeats", function() {
        it("from repeat helper, get daily repeats with none repeatVal", async function() {
            data.repeat.repeatVal = 'none';
            let repeats = await repeatHelper.getRepeats(monthDate, data);
            expect(repeatHelper.monthDate).to.eql(monthDate);
            expect(repeats.length).to.eql(0);
        });

        it("from repeat helper, get daily repeats", async function() {
            data.repeat.repeatVal = 'every_day';
            let repeats = await repeatHelper.getRepeats(monthDate, data);
            expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
            expect(repeatHelper.data).to.eq(data);
            expect(repeats).to.be.a('array');
            expect(repeats[0]).to.be.a('object');
            expect(repeats[1]).to.be.a('object');
            expect(repeats[2]).to.be.a('object');
            expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
            expect(repeatHelper.preMonthDays).to.eql(30);
            expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
            expect(repeatHelper.nextMonthDays).to.eql(30);
            // expect(repeatHelper.daysDiff).to.eql(130);
            expect(repeatHelper.repeatType).to.eql(1);
            expect(repeats[0].start).to.be.a('string');
            expect(repeats[1].start).to.be.a('string');
            expect(repeats[2].start).to.be.a('string');
            expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('04/16/2019').format('DD-MM-YYYY'));
            expect(moment(repeats[1].start).format('DD-MM-YYYY')).to.eql(moment('04/17/2019').format('DD-MM-YYYY'));
            expect(moment(repeats[2].start).format('DD-MM-YYYY')).to.eql(moment('04/18/2019').format('DD-MM-YYYY'));
        });
    });

    describe("Weekly Repeats", function() {
        it("from repeat helper, get weekly repeats with none repeatVal", async function() {
            data.repeat.repeatVal = 'none';
            let repeats = await repeatHelper.getRepeats(monthDate, data);
            expect(repeatHelper.monthDate).to.eql(monthDate);
            expect(repeats.length).to.eql(0);
        });

        it("from repeat helper, get weekly repeats", async function() {
            data.repeat.repeatVal = 'every_week';
            let repeats = await repeatHelper.getRepeats(monthDate, data);
            expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
            expect(repeatHelper.data).to.eq(data);
            expect(repeats).to.be.a('array');
            expect(repeats[0]).to.be.a('object');
            expect(repeats[1]).to.be.a('object');
            expect(repeats[2]).to.be.a('object');
            expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
            expect(repeatHelper.preMonthDays).to.eql(30);
            expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
            expect(repeatHelper.nextMonthDays).to.eql(30);
            //expect(repeatHelper.daysDiff).to.eql(130);
            expect(repeatHelper.repeatType).to.eql(2);
            expect(repeats[0].start).to.be.a('string');
            expect(repeats[1].start).to.be.a('string');
            expect(repeats[2].start).to.be.a('string');
        });
    });

    describe("Monthly Repeats", function() {
        it("from repeat helper, get monthly repeats with none repeatVal", async function() {
            data.repeat.repeatVal = 'none';
            let repeats = await repeatHelper.getRepeats(monthDate, data);
            expect(repeatHelper.monthDate).to.eql(monthDate);
            expect(repeats.length).to.eql(0);
        });

        it("from repeat helper, get monthly repeats", async function() {
            data.repeat.repeatVal = 'every_month';
            let repeats = await repeatHelper.getRepeats(monthDate, data);
            expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
            expect(repeatHelper.data).to.eq(data);
            expect(repeats).to.be.a('array');
            expect(repeats[0]).to.be.a('object');
            expect(repeats[1]).to.be.a('undefined');
            expect(repeats[2]).to.be.a('undefined');
            expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
            expect(repeatHelper.preMonthDays).to.eql(30);
            expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
            expect(repeatHelper.nextMonthDays).to.eql(30);
            //expect(repeatHelper.daysDiff).to.eql(130);
            expect(repeatHelper.repeatType).to.eql(3);
            expect(repeats[0].start).to.be.a('string');
        });
    });


    describe("Yearly Repeats", function() {
        it("from repeat helper, get yearly repeats with none repeatVal", async function() {
            data.repeat.repeatVal = 'none';
            let repeats = await repeatHelper.getRepeats(monthDate, data);
            expect(repeatHelper.monthDate).to.eql(monthDate);
            expect(repeats.length).to.eql(0);
        });

        it("from repeat helper, get yearly repeats", async function() {
            data.repeat.repeatVal = 'every_year';
            let repeats = await repeatHelper.getRepeats(monthDate, data);
            expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
            expect(repeatHelper.data).to.eq(data);
            expect(repeats).to.be.a('array');
            expect(repeats[0]).to.be.a('object');
            expect(repeats[1]).to.be.a('undefined');
            expect(repeats[2]).to.be.a('undefined');
            expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
            expect(repeatHelper.preMonthDays).to.eql(30);
            expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
            expect(repeatHelper.nextMonthDays).to.eql(30);
            //expect(repeatHelper.daysDiff).to.eql(130);
            expect(repeatHelper.repeatType).to.eql(4);
            expect(repeats[0].start).to.be.a('string');
        });
    });

    describe("Custom Repeats", function() {
        it("from repeat helper, get custom repeats with none repeatVal", async function() {
            data.repeat.repeatVal = 'none';
            let repeats = await repeatHelper.getRepeats(monthDate, data);
            expect(repeatHelper.monthDate).to.eql(monthDate);
            expect(repeats.length).to.eql(0);
        });

        describe("Custom Daily Repeats", function() {
            it("from repeat helper, get custom daily repeat with none repeatDetails", async function() {
                data.repeat.repeatVal = 'custom';
                data.repeat.repeatDetails = {};
                let repeats = await repeatHelper.getRepeats(monthDate, data);
                expect(repeatHelper.monthDate).to.eql(monthDate);
                expect(repeats.length).to.eql(0);
            });

            it("from repeat helper, get custom daily repeat with repeatDetails", async function() {
                data.repeat.repeatVal = 'custom';
                data.repeat.repeatDetails.repeatDetailsValue = "daily";
                data.repeat.repeatDetails.repeatInnerDetails = {};
                data.repeat.repeatDetails.repeatInnerDetails.daily = {
                    every: 1
                }
                let repeats = await repeatHelper.getRepeats(monthDate, data);
                expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                expect(repeatHelper.data).to.eq(data);
                expect(repeats).to.be.a('array');
                expect(repeats[0]).to.be.a('object');
                expect(repeats[1]).to.be.a('object');
                expect(repeats[2]).to.be.a('object');
                expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                expect(repeatHelper.preMonthDays).to.eql(30);
                expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                expect(repeatHelper.nextMonthDays).to.eql(30);
                //expect(repeatHelper.daysDiff).to.eql(130);
                expect(repeatHelper.repeatType).to.eql(5);
                expect(repeats[0].start).to.be.a('string');
                expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('04/16/2019').format('DD-MM-YYYY'));
                expect(moment(repeats[1].start).format('DD-MM-YYYY')).to.eql(moment('04/17/2019').format('DD-MM-YYYY'));
                expect(moment(repeats[2].start).format('DD-MM-YYYY')).to.eql(moment('04/18/2019').format('DD-MM-YYYY'));
            })

            it("from repeat helper, get custom daily 2 day's interval repeat with repeatDetails", async function() {
                data.repeat.repeatVal = 'custom';
                data.repeat.repeatDetails.repeatDetailsValue = "daily";
                data.repeat.repeatDetails.repeatInnerDetails = {};
                data.repeat.repeatDetails.repeatInnerDetails.daily = {
                    every: 2
                }
                let repeats = await repeatHelper.getRepeats(monthDate, data);
                expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                expect(repeatHelper.data).to.eq(data);
                expect(repeats).to.be.a('array');
                expect(repeats[0]).to.be.a('object');
                expect(repeats[1]).to.be.a('object');
                expect(repeats[2]).to.be.a('object');
                expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                expect(repeatHelper.preMonthDays).to.eql(30);
                expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                expect(repeatHelper.nextMonthDays).to.eql(30);
                //expect(repeatHelper.daysDiff).to.eql(130);
                expect(repeatHelper.repeatType).to.eql(5);
                expect(repeats[0].start).to.be.a('string');
            })

            it("from repeat helper, get custom daily 3 day's interval repeat with repeatDetails", async function() {
                data.repeat.repeatVal = 'custom';
                data.repeat.repeatDetails.repeatDetailsValue = "daily";
                data.repeat.repeatDetails.repeatInnerDetails = {};
                data.repeat.repeatDetails.repeatInnerDetails.daily = {
                    every: 3
                }
                let repeats = await repeatHelper.getRepeats(monthDate, data);
                expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                expect(repeatHelper.data).to.eq(data);
                expect(repeats).to.be.a('array');
                expect(repeats[0]).to.be.a('object');
                expect(repeats[1]).to.be.a('object');
                expect(repeats[2]).to.be.a('object');
                expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                expect(repeatHelper.preMonthDays).to.eql(30);
                expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                expect(repeatHelper.nextMonthDays).to.eql(30);
                // expect(repeatHelper.daysDiff).to.eql(130);
                expect(repeatHelper.repeatType).to.eql(5);
                expect(repeats[0].start).to.be.a('string');
                expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('04/17/2019').format('DD-MM-YYYY'));
                expect(moment(repeats[1].start).format('DD-MM-YYYY')).to.eql(moment('04/20/2019').format('DD-MM-YYYY'));
                expect(moment(repeats[2].start).format('DD-MM-YYYY')).to.eql(moment('04/23/2019').format('DD-MM-YYYY'));
            })
        });

        describe("Custom Weekly Repeats", function() {
            it("from repeat helper, get custom weekly repeat with none repeatDetails", async function() {
                data.repeat.repeatVal = 'custom';
                data.repeat.repeatDetails = {};
                let repeats = await repeatHelper.getRepeats(monthDate, data);
                expect(repeatHelper.monthDate).to.eql(monthDate);
                expect(repeats.length).to.eql(0);
            });

            it("from repeat helper, get custom weekly repeat with repeatDetails", async function() {
                data.repeat.repeatVal = 'custom';
                data.repeat.repeatDetails.repeatDetailsValue = "weekly";
                data.repeat.repeatDetails.repeatInnerDetails = {};
                data.repeat.repeatDetails.repeatInnerDetails.weekly = {
                    every: 1,
                    weekday: ['T', 'W']
                }
                let repeats = await repeatHelper.getRepeats(monthDate, data);
                expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                expect(repeatHelper.data).to.eq(data);
                expect(repeats).to.be.a('array');
                expect(repeats[0]).to.be.a('object');
                expect(repeats[1]).to.be.a('object');
                expect(repeats[2]).to.be.a('object');
                expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                expect(repeatHelper.preMonthDays).to.eql(30);
                expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                expect(repeatHelper.nextMonthDays).to.eql(30);
                // expect(repeatHelper.daysDiff).to.eql(130);
                expect(repeatHelper.repeatType).to.eql(6);
                expect(repeats[0].start).to.be.a('string');

            })

            it("from repeat helper, get custom weekly 2 day's interval repeat with repeatDetails", async function() {
                data.repeat.repeatVal = 'custom';
                data.repeat.repeatDetails.repeatDetailsValue = "weekly";
                data.repeat.repeatDetails.repeatInnerDetails = {};
                data.repeat.repeatDetails.repeatInnerDetails.weekly = {
                    every: 2,
                    weekday: ['T', 'W']
                }
                let repeats = await repeatHelper.getRepeats(monthDate, data);
                expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                expect(repeatHelper.data).to.eq(data);
                expect(repeats).to.be.a('array');
                expect(repeats[0]).to.be.a('object');
                expect(repeats[1]).to.be.a('object');
                expect(repeats[2]).to.be.a('object');
                expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                expect(repeatHelper.preMonthDays).to.eql(30);
                expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                expect(repeatHelper.nextMonthDays).to.eql(30);
                // expect(repeatHelper.daysDiff).to.eql(130);
                expect(repeatHelper.repeatType).to.eql(6);
                expect(repeats[0].start).to.be.a('string');
                expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('04/21/2019').format('DD-MM-YYYY'));
                expect(moment(repeats[1].start).format('DD-MM-YYYY')).to.eql(moment('04/28/2019').format('DD-MM-YYYY'));
                expect(moment(repeats[2].start).format('DD-MM-YYYY')).to.eql(moment('05/05/2019').format('DD-MM-YYYY'));
            })

            it("from repeat helper, get custom daily 3 day's interval repeat with repeatDetails", async function() {
                data.repeat.repeatVal = 'custom';
                data.repeat.repeatDetails.repeatDetailsValue = "weekly";
                data.repeat.repeatDetails.repeatInnerDetails = {};
                data.repeat.repeatDetails.repeatInnerDetails.weekly = {
                    every: 3,
                    weekday: ['T', 'W']
                }
                let repeats = await repeatHelper.getRepeats(monthDate, data);
                expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                expect(repeatHelper.data).to.eq(data);
                expect(repeats).to.be.a('array');
                expect(repeats[0]).to.be.a('object');
                expect(repeats[1]).to.be.a('object');
                expect(repeats[2]).to.be.a('object');
                expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                expect(repeatHelper.preMonthDays).to.eql(30);
                expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                expect(repeatHelper.nextMonthDays).to.eql(30);
                // expect(repeatHelper.daysDiff).to.eql(130);
                expect(repeatHelper.repeatType).to.eql(6);
                expect(repeats[0].start).to.be.a('string');
            })
        });


        describe("Custom Monthly Each Type Repeats", function() {
            it("from repeat helper, get custom monthly each typerepeat with none repeatDetails", async function() {
                data.repeat.repeatVal = 'custom';
                data.repeat.repeatDetails = {};
                let repeats = await repeatHelper.getRepeats(monthDate, data);
                expect(repeatHelper.monthDate).to.eql(monthDate);
                expect(repeats.length).to.eql(0);
            });

            it("from repeat helper, get custom monthly aech type repeat with repeatDetails", async function() {
                data.repeat.repeatVal = 'custom';
                data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                data.repeat.repeatDetails.repeatInnerDetails = {};
                data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                    every: 1,
                    monthday: [1, 2, 3],
                    type: 'each'
                }
                let repeats = await repeatHelper.getRepeats(monthDate, data);
                expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                expect(repeatHelper.data).to.eq(data);
                expect(repeats).to.be.a('array');
                expect(repeats[0]).to.be.a('object');
                expect(repeats[1]).to.be.a('object');
                expect(repeats[2]).to.be.a('object');
                expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                expect(repeatHelper.preMonthDays).to.eql(30);
                expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                expect(repeatHelper.nextMonthDays).to.eql(30);
                //expect(repeatHelper.daysDiff).to.eql(130);
                expect(repeatHelper.repeatType).to.eql(7);
                expect(repeats[0].start).to.be.a('string');
                expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('05/01/2019').format('DD-MM-YYYY'));
                expect(moment(repeats[1].start).format('DD-MM-YYYY')).to.eql(moment('05/02/2019').format('DD-MM-YYYY'));
                expect(moment(repeats[2].start).format('DD-MM-YYYY')).to.eql(moment('05/03/2019').format('DD-MM-YYYY'));
            })

            it("from repeat helper, get custom monthly each type 2 day's interval repeat with repeatDetails", async function() {
                data.repeat.repeatVal = 'custom';
                data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                data.repeat.repeatDetails.repeatInnerDetails = {};
                data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                    every: 2,
                    monthday: [1, 2, 3],
                    type: 'each'
                }
                let repeats = await repeatHelper.getRepeats(monthDate, data);
                expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                expect(repeatHelper.data).to.eq(data);
                expect(repeats).to.be.a('array');
                expect(repeats[0]).to.be.a('object');
                expect(repeats[1]).to.be.a('object');
                expect(repeats[2]).to.be.a('object');
                expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                expect(repeatHelper.preMonthDays).to.eql(30);
                expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                expect(repeatHelper.nextMonthDays).to.eql(30);
                // expect(repeatHelper.daysDiff).to.eql(130);
                expect(repeatHelper.repeatType).to.eql(7);
                expect(repeats[0].start).to.be.a('string');
                expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('06/01/2019').format('DD-MM-YYYY'));
                expect(moment(repeats[1].start).format('DD-MM-YYYY')).to.eql(moment('06/02/2019').format('DD-MM-YYYY'));
                expect(moment(repeats[2].start).format('DD-MM-YYYY')).to.eql(moment('06/03/2019').format('DD-MM-YYYY'));
            })

            it("from repeat helper, get custom monthly each type 3 day's interval repeat with repeatDetails", async function() {
                data.repeat.repeatVal = 'custom';
                data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                data.repeat.repeatDetails.repeatInnerDetails = {};
                data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                    every: 3,
                    monthday: [1, 2, 3],
                    type: 'each'
                }
                let repeats = await repeatHelper.getRepeats(monthDate, data);
                expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                expect(repeatHelper.data).to.eq(data);
                expect(repeats).to.be.a('array');
                expect(repeats[0]).to.be.a('object');
                expect(repeats[1]).to.be.a('object');
                expect(repeats[2]).to.be.a('object');
                expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                expect(repeatHelper.preMonthDays).to.eql(30);
                expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                expect(repeatHelper.nextMonthDays).to.eql(30);
                //  expect(repeatHelper.daysDiff).to.eql(130);
                expect(repeatHelper.repeatType).to.eql(7);
                expect(repeats[0].start).to.be.a('string');
                expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('05/01/2019').format('DD-MM-YYYY'));
                expect(moment(repeats[1].start).format('DD-MM-YYYY')).to.eql(moment('05/02/2019').format('DD-MM-YYYY'));
                expect(moment(repeats[2].start).format('DD-MM-YYYY')).to.eql(moment('05/03/2019').format('DD-MM-YYYY'));
            })
        });

        describe("Custom Monthly ", function() {
            describe("Custom Monthly Each Type Repeats", function() {
                it("from repeat helper, get custom monthly each typerepeat with none repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails = {};
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(repeatHelper.monthDate).to.eql(monthDate);
                    expect(repeats.length).to.eql(0);
                });

                it("from repeat helper, get custom monthly aech type repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [1, 2, 3],
                        type: 'each'
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeats[1]).to.be.a('object');
                    expect(repeats[2]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    // expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(7);
                    expect(repeats[0].start).to.be.a('string');
                })

                it("from repeat helper, get custom monthly each type 2 day's interval repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 2,
                        monthday: [1, 2, 3],
                        type: 'each'
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeats[1]).to.be.a('object');
                    expect(repeats[2]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    //expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(7);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('06/01/2019').format('DD-MM-YYYY'));
                    expect(moment(repeats[1].start).format('DD-MM-YYYY')).to.eql(moment('06/02/2019').format('DD-MM-YYYY'));
                    expect(moment(repeats[2].start).format('DD-MM-YYYY')).to.eql(moment('06/03/2019').format('DD-MM-YYYY'));
                })

                it("from repeat helper, get custom monthly each type 3 day's interval repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 3,
                        monthday: [1, 2, 3],
                        type: 'each'
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeats[1]).to.be.a('object');
                    expect(repeats[2]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    //expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(7);
                    expect(repeats[0].start).to.be.a('string');
                })
            });

            describe("Custom Monthly on Type Repeats", function() {
                it("from repeat helper, get custom monthly on typerepeat with none repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails = {};
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(repeatHelper.monthDate).to.eql(monthDate);
                    expect(repeats.length).to.eql(0);
                });

                it("from repeat helper, get custom monthly on type for every first sunday repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "first",
                        day: "sunday"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeats[1]).to.be.a('object');
                    expect(repeats[2]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    // expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                })

                it("from repeat helper, get custom monthly on type every second sunday repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "second",
                        day: "sunday"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeats[1]).to.be.a('object');
                    expect(repeats[2]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    // expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('05/12/2019').format('DD-MM-YYYY'));
                    expect(moment(repeats[1].start).format('DD-MM-YYYY')).to.eql(moment('06/09/2019').format('DD-MM-YYYY'));
                    expect(moment(repeats[2].start).format('DD-MM-YYYY')).to.eql(moment('07/14/2019').format('DD-MM-YYYY'));
                })

                it("from repeat helper, get custom monthly on type every third sunday repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "third",
                        day: "sunday"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeats[1]).to.be.a('object');
                    expect(repeats[2]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    // expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('04/21/2019').format('DD-MM-YYYY'));
                    expect(moment(repeats[1].start).format('DD-MM-YYYY')).to.eql(moment('05/19/2019').format('DD-MM-YYYY'));
                    expect(moment(repeats[2].start).format('DD-MM-YYYY')).to.eql(moment('06/16/2019').format('DD-MM-YYYY'));
                })

                it("from repeat helper, get custom monthly on type every fourth sunday repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "fifth",
                        day: "sunday"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeats[1]).to.be.a('object');
                    expect(repeats[2]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    //  expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('06/30/2019').format('DD-MM-YYYY'));
                })

                it("from repeat helper, get custom monthly on type every last sunday repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "last",
                        day: "sunday"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    // expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('05/26/2019').format('DD-MM-YYYY'));
                })

                it("from repeat helper, get custom monthly on type every last monday repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "last",
                        day: "monday"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    // expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('05/27/2019').format('DD-MM-YYYY'));
                })

                it("from repeat helper, get custom monthly on type every last tuesday repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "last",
                        day: "tuesday"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    //  expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('05/28/2019').format('DD-MM-YYYY'));
                })

                it("from repeat helper, get custom monthly on type every last wednesday repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "last",
                        day: "wednesday"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    //  expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('05/29/2019').format('DD-MM-YYYY'));
                })

                it("from repeat helper, get custom monthly on type every last thursday repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "last",
                        day: "thursday"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    //  expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('05/30/2019').format('DD-MM-YYYY'));
                })

                it("from repeat helper, get custom monthly on type every last friday repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "last",
                        day: "friday"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    // expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('05/31/2019').format('DD-MM-YYYY'));
                })

                it("from repeat helper, get custom monthly on type every last saturday repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "last",
                        day: "saturday"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    //  expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('05/25/2019').format('DD-MM-YYYY'));
                })

                it("from repeat helper, get custom monthly on type every first day repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "first",
                        day: "day"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    // expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('05/01/2019').format('DD-MM-YYYY'));
                })

                it("from repeat helper, get custom monthly on type every first weekday repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "first",
                        day: "weekday"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    //   expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('05/01/2019').format('DD-MM-YYYY'));
                })

                it("from repeat helper, get custom monthly on type every last weekday repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "last",
                        day: "weekday"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    // expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('05/31/2019').format('DD-MM-YYYY'));
                })

                it("from repeat helper, get custom monthly on type every first weekend repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "first",
                        day: "weekend_day"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    //expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('05/04/2019').format('DD-MM-YYYY'));
                })

                it("from repeat helper, get custom monthly on type every last weekend repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "last",
                        day: "weekend_day"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    //  expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('05/25/2019').format('DD-MM-YYYY'));
                })


                it("from repeat helper, get custom monthly on type for every last day repeat with repeatDetails", async function() {
                    data.repeat.repeatVal = 'custom';
                    data.repeat.repeatDetails.repeatDetailsValue = "monthly";
                    data.repeat.repeatDetails.repeatInnerDetails = {};
                    data.repeat.repeatDetails.repeatInnerDetails.monthly = {
                        every: 1,
                        monthday: [],
                        type: "on",
                        freq: "last",
                        day: "day"
                    }
                    let repeats = await repeatHelper.getRepeats(monthDate, data);
                    expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                    expect(repeatHelper.data).to.eq(data);
                    expect(repeats).to.be.a('array');
                    expect(repeats[0]).to.be.a('object');
                    expect(repeatHelper.currentDate).to.eql(moment(monthDate).date());
                    expect(repeatHelper.preMonthDays).to.eql(30);
                    expect(repeatHelper.preMonthDate.format('DD-MM-YYYY')).to.eql(moment('04/01/2019').format('DD-MM-YYYY'));
                    expect(repeatHelper.nextMonthDays).to.eql(30);
                    //  expect(repeatHelper.daysDiff).to.eql(130);
                    expect(repeatHelper.repeatType).to.eql(9);
                    expect(repeats[0].start).to.be.a('string');
                    expect(moment(repeats[0].start).format('DD-MM-YYYY')).to.eql(moment('05/31/2019').format('DD-MM-YYYY'));
                })
            });
        });

        describe("Custom Yearly Each Type Repeats", function() {
            it("from repeat helper, get custom yearly each type repeat with none repeatDetails", async function() {
                data.repeat.repeatVal = 'custom';
                data.repeat.repeatDetails = {};
                let repeats = await repeatHelper.getRepeats(monthDate, data);
                expect(repeatHelper.monthDate).to.eql(monthDate);
                expect(repeats.length).to.eql(0);
            });

            it("from repeat helper, get custom yearly aech type repeat with repeatDetails", async function() {
                data.repeat.repeatVal = 'custom';
                data.repeat.repeatDetails.repeatDetailsValue = "yearly";
                data.repeat.repeatDetails.repeatInnerDetails = {};
                data.repeat.repeatDetails.repeatInnerDetails.yearly = {
                    every: 1,
                    yearmonth: [0, 1, 5, 6],
                    type: 'each'
                }
                let repeats = await repeatHelper.getRepeats(monthDate, data);
                expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                expect(repeatHelper.data).to.eq(data);
            })

            it("from repeat helper, get custom yearly on type for every first sunday repeat with repeatDetails", async function() {
                data.repeat.repeatVal = 'custom';
                data.repeat.repeatDetails.repeatDetailsValue = "yearly";
                data.repeat.repeatDetails.repeatInnerDetails = {};
                data.repeat.repeatDetails.repeatInnerDetails.yearly = {
                    every: 1,
                    yearmonth: [],
                    type: "on",
                    freq: "first",
                    day: "sunday"
                }
                monthDate = moment('01/06/2020').format('DD-MM-YYYY');
                let repeats = await repeatHelper.getRepeats(monthDate, data);
                expect(moment(repeatHelper.monthDate).format('DD-MM-YYYY')).to.eql(moment(monthDate).format('DD-MM-YYYY'));
                expect(repeatHelper.data).to.eq(data);
                expect(repeats).to.be.a('array');
            })
        });
    });

    describe("getUniqueRecords", function() {
        it("from repeat helper - Get uniuqe records from array", async function() {
            let uniqueRecods = await repeatHelper.getUniqueRecords(records);
            expect(uniqueRecods).to.be.a('array');
            expect(uniqueRecods.length).to.eql(2);
        });
    });

    describe("weekCount", function() {
        it("from repeat helper - Get number of weeks in a month", async function() {
            let weeks = await repeatHelper.weekCount(2019, 5);
            expect(weeks).to.be.a('number');
            expect(weeks).to.eql(5);
        });
    });

    describe("lastMondayDayForMonth", function() {
        it("from repeat helper - Get last moday of month", async function() {
            let weeks = await repeatHelper.lastMondayDayForMonth(moment('01-05-2019'));
            expect(weeks.format('DD-MM-YYYY')).to.eql(moment("2019-01-28T00:00:00.000").format('DD-MM-YYYY'));
        });
    });

    describe("lastTueDayForMonth", function() {
        it("from repeat helper - Get last tuesday of month", async function() {
            let weeks = await repeatHelper.lastTueDayForMonth(moment('01-05-2019'));
            expect(weeks.format('DD-MM-YYYY')).to.eql(moment("2019-01-29T00:00:00.000").format('DD-MM-YYYY'));
        });
    });

    describe("lastWedDayForMonth", function() {
        it("from repeat helper - Get last tuesday of month", async function() {
            let weeks = await repeatHelper.lastWedDayForMonth(moment('01-05-2019'));
            expect(weeks.format('DD-MM-YYYY')).to.eql(moment("2019-01-30T00:00:00.000").format('DD-MM-YYYY'));
        });
    });

    describe("lastThurDayForMonth", function() {
        it("from repeat helper - Get last thursday of month", async function() {
            let weeks = await repeatHelper.lastThurDayForMonth(moment('01-05-2019'));
            expect(weeks.format('DD-MM-YYYY')).to.eql(moment("2019-01-31T00:00:00.000").format('DD-MM-YYYY'));
        });
    });

    describe("lastFriDayForMonth", function() {
        it("from repeat helper - Get last friday of month", async function() {
            let weeks = await repeatHelper.lastThurDayForMonth(moment('01-05-2019'));
            expect(weeks.format('DD-MM-YYYY')).to.eql(moment("2019-01-31T00:00:00.000").format('DD-MM-YYYY'));
        });
    });

    describe("lastSatDayForMonth", function() {
        it("from repeat helper - Get last saterday of month", async function() {
            let weeks = await repeatHelper.lastSatDayForMonth(moment('01-05-2019'));
            expect(weeks.format('DD-MM-YYYY')).to.eql(moment("2019-01-26T00:00:00.000").format('DD-MM-YYYY'));
        });
    });

    describe("lastSunDayForMonth", function() {
        it("from repeat helper - Get last sunday of month", async function() {
            let weeks = await repeatHelper.lastSunDayForMonth(moment('01-05-2019'));
            expect(weeks.format('DD-MM-YYYY')).to.eql(moment("2019-01-27T00:00:00.000").format('DD-MM-YYYY'));
        });
    });

    describe("dateStart", function() {
        it("from repeat helper - get start date of month", async function() {
            let weeks = await repeatHelper.dateStart(moment('01-05-2019'), 1);
            expect(weeks.format('DD-MM-YYYY')).to.eql(moment("2019-01-02T00:00:00.000").format('DD-MM-YYYY'));
        });
    });

    describe("lastWorkingDay", function() {
        it("from repeat helper - get last working day date of month", async function() {
            let weeks = await repeatHelper.lastWorkingDay('01-05-2019');
            expect(weeks.format('DD-MM-YYYY')).to.eql(moment("2019-01-31T00:00:00.000").format('DD-MM-YYYY'));
        });
    });

    describe("getCurrentWeekendDay", function() {
        it("from repeat helper - get current weekend day date of month", async function() {
            let weeks = await repeatHelper.getCurrentWeekendDay('01-05-2019', 4);
            expect(weeks.format('DD-MM-YYYY')).to.eql(moment("2019-02-02T00:00:00.000").format('DD-MM-YYYY'));
        });
    });

    describe("getCurrentLastWeekendDay", function() {
        it("from repeat helper - get current last weekend day date of month", async function() {
            let weeks = await repeatHelper.getCurrentLastWeekendDay('01-05-2019', 4);
            expect(weeks.format('DD-MM-YYYY')).to.eql(moment("2019-01-26T00:00:00.000").format('DD-MM-YYYY'));
        });
    });
});