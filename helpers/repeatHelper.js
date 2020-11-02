var moment = require('moment');
require('./moment-recur');
const eventRepeats = require('../models').event_repeats;

const REPEAT_DAILY = 1;
const REPEAT_WEEKLY = 2;
const REPEAT_MONTHLY = 3;
const REPEAT_YEARLY = 4;
const REPEAT_CUSTOM_DAILY = 5;
const REPEAT_CUSTOM_WEEKLY = 6;
const REPEAT_CUSTOM_MONTHLY = 7;
const REPEAT_CUSTOM_YEARLY = 8;
const REPEAT_CUSTOM_MONTHLY_ON_DAY = 9;
const REPEAT_CUSTOM_YEARLY_ON_DAY = 10;
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const WEEKS = ['first', 'second', 'third', 'forth', 'fifth', 'last'];

const repeatHelper = function() {}


/**
 * @function getRepeats
 * @param {Object} monthDate
 * @param {Object} data {required}
 * @returns {Array} events
 */
repeatHelper.prototype.getRepeats = async function(monthDate, data) {
    data.base = "repeated";
    this.monthDate = monthDate || new Date();
    data.startTime = moment(data.start).utc().format("YYYY-MM-DDTHH:mm:ss");
    data.start = moment(data.start).utc().format("YYYY-MM-DDTHH:mm:ss");
    data.end = moment(data.end).utc().format("YYYY-MM-DDTHH:mm:ss");
    data.endTime = moment(data.end).utc().format("YYYY-MM-DDTHH:mm:ss");
    this.data = data;

    this.events = [];
    this.deletedDates = data.deletedDay || [];
    this.endRepeat = data.endrepeat.endrepeatDetail || false;
    this.endType = data.endrepeat.endrepeatVal || false;
    if (this.data == undefined) {
        return this.events;
    }
    this.currentDate = await this.getCurrentDateOfMonth();
    this.monthDays = await this.getMonthDay();
    this.preMonthDays = await this.getPreMonthDay();
    this.preMonthDate = moment(this.monthDate).subtract(1, 'month');
    this.nextMonthDays = await this.getNextMonthDay();
    this.daysDiff = await this.getDayDiff();
    this.repeatType = await this.evaluateRepeat();
    if (this.repeatType == REPEAT_DAILY) {
        this.events = await this.getDailyRepeat();
    } else if (this.repeatType == REPEAT_WEEKLY) {
        this.events = await this.getWeeklyRepeat();
    } else if (this.repeatType == REPEAT_MONTHLY) {
        this.events = await this.getMonthlyRepeat();
    } else if (this.repeatType == REPEAT_YEARLY) {
        this.events = await this.getYearlyRepeat();
    } else if (this.repeatType == REPEAT_CUSTOM_DAILY) {
        this.events = await this.getCustomDailyRepeat();
    } else if (this.repeatType == REPEAT_CUSTOM_WEEKLY) {
        this.events = await this.getCustomWeeklyRepeat();
    } else if (this.repeatType == REPEAT_CUSTOM_MONTHLY) {
        this.events = await this.getCustomMonthlyRepeat();
    } else if (this.repeatType == REPEAT_CUSTOM_MONTHLY_ON_DAY) {
        this.events = await this.getCustomMonthlyOnDayRepeat();
    } else if (this.repeatType == REPEAT_CUSTOM_YEARLY) {
        this.events = await this.getCustomYearlyRepeat();
    } else if (this.repeatType == REPEAT_CUSTOM_YEARLY_ON_DAY) {
        this.events = await this.getCustomYearlyOnDayRepeat();
    }
    return this.events;
}

/**
 * @function getMonthDay
 * @returns {Object} monthDate
 */
repeatHelper.prototype.getMonthDay = async function() {
    return moment(this.monthDate).daysInMonth();
}

/**
 * @function getPreMonthDay
 * @returns {Object}
 */
repeatHelper.prototype.getPreMonthDay = async function() {
    return moment(this.monthDate).subtract(1, 'months').daysInMonth();
}

/**
 * @function getNextMonthDay
 * @returns {Object}
 */
repeatHelper.prototype.getNextMonthDay = async function() {
    return moment(this.monthDate).add(1, 'months').daysInMonth();
}

/**
 * @function getCurrentDateOfMonth
 * @returns {Object}
 */
repeatHelper.prototype.getCurrentDateOfMonth = async function() {
    return moment(this.monthDate).date();
}

/**
 * @function getDailyRepeat
 * @returns {Array} repeat
 */
repeatHelper.prototype.getDailyRepeat = async function() {
    let repeat = [];
    let recurrence = moment(this.data.start).recur().every(1).days();
    let repeatedDay;
    if (this.data.endrepeat.endrepeatVal == 'after') {
        repeatedDay = recurrence.next(this.data.endrepeat.endrepeatDetail - 1);
    } else {
        repeatedDay = recurrence.next(this.daysDiff + 30);
    }
    let counter = 0;
    for (let i = 0; i < repeatedDay.length; i++) {
        if (repeatedDay[i].diff(moment(this.monthDate).subtract(15, 'days')) >= 0 && counter < 60) {
            counter++;
            let start = repeatedDay[i].hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
            let end = repeatedDay[i].hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
            const updatedData = Object.assign({}, this.data, {
                startTime: start,
                start: start,
                endTime: end,
                end: end
            });
            repeat.push(updatedData);
        }
    }
    return repeat;
}

/**
 * @function getWeeklyRepeat
 * @returns {Array} repeat
 */
repeatHelper.prototype.getWeeklyRepeat = async function() {
    let repeat = [];
    let recurrence = moment(this.data.start).recur().every(7).days();
    let repeatedDay;
    if (this.data.endrepeat.endrepeatVal == 'after') {
        repeatedDay = recurrence.next(this.data.endrepeat.endrepeatDetail - 1);
    } else {
        repeatedDay = recurrence.next(this.daysDiff);
    }
    let counter = 0;
    for (let i = 0; i < repeatedDay.length; i++) {
        if (repeatedDay[i].diff(moment(this.monthDate).subtract(15, 'days')) >= 0 && counter < 45) {
            counter++;
            let start = repeatedDay[i].hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
            let end = repeatedDay[i].hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
            const updatedData = Object.assign({}, this.data, {
                startTime: start,
                start: start,
                endTime: end,
                end: end

            });
            repeat.push(updatedData);
        }
    }
    return repeat;
}

/**
 * @function getDayDiff
 * @returns {Object}
 */
repeatHelper.prototype.getDayDiff = async function() {
    let next15Days = moment(this.monthDate).add(15, 'days');
    return next15Days.diff(moment(this.data.start), 'days');

}

/**
 * @function getMonthlyRepeat
 * @returns {Array} repeat
 */
repeatHelper.prototype.getMonthlyRepeat = async function() {
    let repeat = [];
    let start = moment.utc(this.data.start).month(moment(this.monthDate).month()).year(moment(this.monthDate).year()).format();
    let end = moment.utc(this.data.end).month(moment(this.monthDate).month()).year(moment(this.monthDate).year()).add(this.data.dayDiff - 1, 'days').format();
    const updatedData = Object.assign({}, this.data, {
        startTime: start,
        start: start,
        endTime: end,
        end: end,

    });
    if (this.data.endrepeat.endrepeatVal == 'after') {
        let endDate = moment(this.data.start).add(this.data.endrepeat.endrepeatDetail, 'months');
        if (moment(updatedData.start) < endDate) {
            repeat.push(updatedData);
        }
    } else {
        repeat.push(updatedData);
    }
    return repeat;
}

/**
 * @function getYearlyRepeat
 * @returns {Array} repeat
 */
repeatHelper.prototype.getYearlyRepeat = async function() {
    let repeat = [];
    let start = moment.utc(this.data.start).year(moment(this.monthDate).year()).format();
    let end = moment.utc(this.data.end).year(moment(this.monthDate).year()).add(this.data.dayDiff, 'days').format();
    const updatedData = Object.assign({}, this.data, {
        startTime: start,
        endTime: end,
        end: end,
        start: start
    });
    if (this.data.endrepeat.endrepeatVal == 'after') {
        let endDate = moment(this.data.start).add(this.data.endrepeat.endrepeatDetail, 'years');
        if (moment(updatedData.start) < endDate) {
            repeat.push(updatedData);
        }
    } else {
        repeat.push(updatedData);
    }
    return repeat;
}

/**
 * @function getCustomDailyRepeat
 * @returns {Array} repeat
 */
repeatHelper.prototype.getCustomDailyRepeat = function() {
    let repeat = [];
    let recurrence = moment(this.data.start).recur().every(this.data.repeat.repeatDetails.repeatInnerDetails.daily.every).days();
    let repeatedDay = recurrence.next(this.daysDiff + 30);
    let counter = 0;
    let newCounter = 0;
    for (let i = 0; i < repeatedDay.length; i++) {
        counter++;
        let start = repeatedDay[i].hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
        let end = repeatedDay[i].hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
        const updatedData = Object.assign({}, this.data, {
            startTime: start,
            start: start,
            endTime: end,
            end: end
        });
        if (this.data.endrepeat.endrepeatVal == 'after') {
            if (counter < this.data.endrepeat.endrepeatDetail) {
                repeat.push(updatedData);
            }
        } else {
            if (repeatedDay[i].diff(moment(this.monthDate).subtract(15, 'days')) >= 0 && newCounter < 45) {
                newCounter++;
                repeat.push(updatedData);
            }
        }
    }
    return repeat;
}

/**
 * @function getCustomWeeklyRepeat
 * @returns {Array} repeat
 */
repeatHelper.prototype.getCustomWeeklyRepeat = function() {
    let repeat = [];
    let recurrence = moment(this.data.start).subtract(1, 'weeks').recur().every(this.data.repeat.repeatDetails.repeatInnerDetails.weekly.every).weeks();
    let repeatedDay = recurrence.next(this.daysDiff < 5 ? 5 : this.daysDiff);
    let counter = 0;
    let newCounter = 0;
    if (this.data.repeat.repeatDetails.repeatInnerDetails.weekly.weekday.length === 1 && this.data.repeat.repeatDetails.repeatInnerDetails.weekly.weekday[0] == 0) {
        this.data.repeat.repeatDetails.repeatInnerDetails.weekly.weekday[0] = moment(this.data.start).day();
    }
    for (let i = 0; i < repeatedDay.length; i++) {
        let dayRecurrence = moment(repeatedDay[i]).recur().every(this.data.repeat.repeatDetails.repeatInnerDetails.weekly.weekday).daysOfWeek();
        let days = dayRecurrence.next(this.data.repeat.repeatDetails.repeatInnerDetails.weekly.weekday.length);
        for (let j = 0; j < days.length; j++) {
            counter++;
            let start = days[j].hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
            let end = days[j].hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
            const updatedData = Object.assign({}, this.data, {
                startTime: start,
                start: start,
                endTime: end,
                end: end
            });
            if (this.data.endrepeat.endrepeatVal == 'after') {
                if (counter < this.data.endrepeat.endrepeatDetail) {
                    repeat.push(updatedData);
                }
            } else {
                if (repeatedDay[i].diff(moment(this.monthDate).subtract(20, 'days')) >= 0 && newCounter < 45) {
                    newCounter++;
                    repeat.push(updatedData);
                }

            }
        }
    }
    return repeat;
}

/**
 * @function getCustomMonthlyRepeat
 * @returns {Array} repeat
 */
repeatHelper.prototype.getCustomMonthlyRepeat = async function() {
    let repeat = [];
    let recurrence = moment(this.data.start).recur().every(this.data.repeat.repeatDetails.repeatInnerDetails.monthly.every * 31).days();
    let repeatedDay = recurrence.next(this.daysDiff);
    let counter = 0;
    let newCounter = 0;
    for (let i = 0; i < repeatedDay.length; i++) {
        if (this.data.repeat.repeatDetails.repeatInnerDetails.monthly.monthday.length == 1 && this.data.repeat.repeatDetails.repeatInnerDetails.monthly.monthday[0] == 0) {
            this.data.repeat.repeatDetails.repeatInnerDetails.monthly.monthday[0] = moment(this.data.start).date();
        }
        let dayRecurrence = moment(repeatedDay[i]).recur().every(this.data.repeat.repeatDetails.repeatInnerDetails.monthly.monthday).daysOfMonth();
        let days = dayRecurrence.next(this.data.repeat.repeatDetails.repeatInnerDetails.monthly.monthday.length);
        for (let j = 0; j < days.length; j++) {
            counter++;
            let start = days[j].hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
            let end = days[j].hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
            const updatedData = Object.assign({}, this.data, {
                startTime: start,
                start: start,
                endTime: end,
                end: end
            });
            if (this.data.endrepeat.endrepeatVal == 'after') {
                if (counter < this.data.endrepeat.endrepeatDetail) {
                    repeat.push(updatedData);
                }
            } else {
                if (repeatedDay[i].diff(moment(this.monthDate).subtract(33, 'days')) >= 0 && newCounter < 60) {
                    newCounter++;
                    repeat.push(updatedData);
                }
            }
        }
    }
    return repeat;
}

/**
 * @function getCustomYearlyRepeat
 * @returns {Array} repeat
 */
repeatHelper.prototype.getCustomYearlyRepeat = async function() {
    let repeat = [];
    let every = this.data.repeat.repeatDetails.repeatInnerDetails.yearly.every;
    let months = this.data.repeat.repeatDetails.repeatInnerDetails.yearly.yearmonth;
    let counter = 0;
    for (let i = 0; i < 100; i++) {
        this.data.start = moment(this.data.start).add(every, 'years');
        for (let i = 0; i < months.length; i++) {
            counter++;
            if (this.data.start.month(months[i] - 1).format('YYYY-MM') == moment(this.monthDate).format('YYYY-MM')) {
                let start = moment.utc(this.data.start).month(months[i] - 1).hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
                let end = moment.utc(this.data.start).month(months[i] - 1).hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
                const updatedData = Object.assign({}, this.data, {
                    startTime: start,
                    start: start,
                    endTime: end,
                    end: end
                });
                if (this.data.endrepeat.endrepeatVal == 'after') {
                    if (counter < this.data.endrepeat.endrepeatDetail) {
                        repeat.push(updatedData);
                    }
                } else {
                    repeat.push(updatedData);
                }
            }
        }
    }

    return repeat;
}

/**
 * @function getCustomMonthlyOnDayRepeat
 * @returns {Array} repeat
 */
repeatHelper.prototype.getCustomMonthlyOnDayRepeat = async function() {
    let repeat = [];
    let start = this.data.start;
    let dayNumber = DAYS.indexOf(this.data.repeat.repeatDetails.repeatInnerDetails.monthly.day);
    let weekNumber = WEEKS.indexOf(this.data.repeat.repeatDetails.repeatInnerDetails.monthly.freq);
    if (dayNumber > -1 && weekNumber < 5) {
        let recurrence = moment(this.data.start).recur().every(dayNumber).daysOfWeek().every(weekNumber).weeksOfMonthByDay();
        let repeatedDay = recurrence.next(this.daysDiff)
        let counter = 0;
        let newCounter = 0;
        for (let i = 0; i < repeatedDay.length; i++) {

            counter++;
            let start = repeatedDay[i].hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
            let end = repeatedDay[i].hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
            const updatedData = Object.assign({}, this.data, {
                startTime: start,
                start: start,
                endTime: end,
                end: end
            });
            if (this.data.endrepeat.endrepeatVal == 'after') {
                if (counter < this.data.endrepeat.endrepeatDetail) {
                    repeat.push(updatedData);
                }
            } else {
                if (repeatedDay[i].diff(moment(this.monthDate).subtract(15, 'days')) >= 0 && newCounter < 45) {
                    newCounter++;
                    repeat.push(updatedData);
                }

            }
        }
    }
    if (dayNumber > -1 && weekNumber == 5) {
        let currentDay, previusDay;
        if (dayNumber == 1) {
            currentDay = await this.lastMondayDayForMonth(moment(this.monthDate), dayNumber);
            previusDay = await this.lastMondayDayForMonth(moment(this.preMonthDate), dayNumber);
        } else if (dayNumber == 2) {
            currentDay = await this.lastTueDayForMonth(moment(this.monthDate), dayNumber);
            previusDay = await this.lastTueDayForMonth(moment(this.preMonthDate), dayNumber);
        } else if (dayNumber == 3) {
            currentDay = await this.lastWedDayForMonth(moment(this.monthDate), dayNumber);
            previusDay = await this.lastWedDayForMonth(moment(this.preMonthDate), dayNumber);
        } else if (dayNumber == 4) {
            currentDay = await this.lastThurDayForMonth(moment(this.monthDate), dayNumber);
            previusDay = await this.lastThurDayForMonth(moment(this.preMonthDate), dayNumber);
        } else if (dayNumber == 5) {
            currentDay = await this.lastFriDayForMonth(moment(this.monthDate), dayNumber);
            previusDay = await this.lastFriDayForMonth(moment(this.preMonthDate), dayNumber);
        } else if (dayNumber == 6) {
            currentDay = await this.lastSatDayForMonth(moment(this.monthDate), dayNumber);
            previusDay = await this.lastSatDayForMonth(moment(this.preMonthDate), dayNumber);
        } else {
            currentDay = await this.lastSunDayForMonth(moment(this.monthDate), dayNumber);
            previusDay = await this.lastSunDayForMonth(moment(this.preMonthDate), dayNumber);
        }
        let cstart = currentDay.hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
        let cend = currentDay.hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();

        //Check end date
        repeat.push(Object.assign({}, this.data, {
            startTime: cstart,
            start: cstart,
            endTime: cend,
            end: cend
        }));
        let pstart = previusDay.hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
        let pend = previusDay.hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
        repeat.push(Object.assign({}, this.data, {
            startTime: pstart,
            start: pstart,
            endTime: pend,
            end: pend,
        }));
    }
    //-----------------------------------------------
    if (this.data.repeat.repeatDetails.repeatInnerDetails.monthly.day == 'day' && dayNumber < 0 && weekNumber < 5) {
        let currentDay = moment(this.monthDate);
        let cstart = currentDay.date(weekNumber + 1).hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
        let cend = currentDay.date(weekNumber + 1).hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
        repeat.push(Object.assign({}, this.data, {
            startTime: cstart,
            start: cstart,
            endTime: cend,
            end: cend
        }));
    }
    //-----------------------------------------------------
    if (this.data.repeat.repeatDetails.repeatInnerDetails.monthly.day == 'day' && dayNumber < 0 && weekNumber == 5) {
        let currentDay = moment(this.monthDate);
        let pstart = currentDay.endOf('month').hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
        let pend = currentDay.endOf('month').hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
        repeat.push(Object.assign({}, this.data, {
            startTime: pstart,
            start: pstart,
            endTime: pend,
            end: pend
        }));
    }
    //--------------------------------------------------------
    if (this.data.repeat.repeatDetails.repeatInnerDetails.monthly.day == 'weekday' && dayNumber < 0 && weekNumber < 5) {
        let currentDay = this.dateStart(this.monthDate, weekNumber);
        let cstart = currentDay.hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
        let cend = currentDay.hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
        repeat.push(Object.assign({}, this.data, {
            startTime: cstart,
            start: cstart,
            endTime: cend,
            end: cend
        }));
    }

    //-----------------------------------------------------------------
    if (this.data.repeat.repeatDetails.repeatInnerDetails.monthly.day == 'weekday' && dayNumber < 0 && weekNumber == 5) {
        let currentDay = this.lastWorkingDay(this.monthDate);
        let pstart = currentDay.hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
        let pend = currentDay.hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
        repeat.push(Object.assign({}, this.data, {
            startTime: pstart,
            start: pstart,
            endTime: pend,
            end: pend
        }));
    }

    //-------------------------------------------------------------------
    if (this.data.repeat.repeatDetails.repeatInnerDetails.monthly.day == 'weekend_day' && dayNumber < 0 && weekNumber < 5) {
        let currentDay = this.getCurrentWeekendDay(this.monthDate, weekNumber);
        let cstart = currentDay.hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
        let cend = currentDay.hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
        repeat.push(Object.assign({}, this.data, {
            startTime: cstart,
            start: cstart,
            endTime: cend,
            end: cend
        }));
    }
    //-----------------------------------------------------
    if (this.data.repeat.repeatDetails.repeatInnerDetails.monthly.day == 'weekend_day' && dayNumber < 0 && weekNumber == 5) {
        let currentDay = this.getCurrentLastWeekendDay(this.monthDate, weekNumber);
        let cstart = currentDay.hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
        let cend = currentDay.hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
        repeat.push(Object.assign({}, this.data, {
            startTime: cstart,
            start: cstart,
            endTime: cend,
            end: cend
        }));
    }
    let every = this.data.repeat.repeatDetails.repeatInnerDetails.monthly.every;
    if (every > 1) {
        let filteredRepeat = [];
        let startRecurr = moment(start).recur().every(every).months();
        start = startRecurr.next(50);
        start.filter(r => {
            if (moment(r).format("MM-YYYY") == moment(this.monthDate).format("MM-YYYY")) {
                filteredRepeat = repeat.filter(re => {
                    if (moment(r).format("MM-YYYY") == moment(re.start).format("MM-YYYY")) {
                        return true;
                    }
                });
            }
        });
        return filteredRepeat;
    } else {
        repeat = repeat.filter(e => {
            if (moment(e.start) > moment(this.data.start)) {
                return true;
            }
        })
        return repeat;
    }
}

/**
 * @function getCustomYearlyOnDayRepeat
 * @returns {Array} repeat
 */
repeatHelper.prototype.getCustomYearlyOnDayRepeat = async function() {
    let repeat = [];
    let start = this.data.start;
    let dayNumber = DAYS.indexOf(this.data.repeat.repeatDetails.repeatInnerDetails.yearly.day);
    let weekNumber = WEEKS.indexOf(this.data.repeat.repeatDetails.repeatInnerDetails.yearly.freq);
    let every = this.data.repeat.repeatDetails.repeatInnerDetails.yearly.every;
    for (let i = 0; i < 100; i++) {
        if (dayNumber > -1 && weekNumber < 5) {
            this.data.start = moment(this.data.start).add(every, 'years');
            if (this.data.start.format('YYYY-MM') == moment(this.monthDate).format('YYYY-MM')) {
                this.data.start = moment(this.data.start);
                let recurrence = moment(this.data.start).recur().every(dayNumber).daysOfWeek().every(weekNumber).weeksOfMonthByDay();
                let repeatedDay = recurrence.next(1);
                for (let j = 0; j < repeatedDay.length; j++) {
                    let start = repeatedDay[j].hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
                    let end = repeatedDay[j].hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
                    const updatedData = Object.assign({}, this.data, {
                        startTime: start,
                        start: start,
                        endTime: end,
                        end: end
                    });
                    repeat.push(updatedData);
                }
            }
        }

        //------------------------------------------------------------------------
        if (dayNumber > -1 && weekNumber == 5) {
            let currentDay, previusDay;
            if (dayNumber == 1) {
                currentDay = await this.lastMondayDayForMonth(moment(this.monthDate), dayNumber);
                previusDay = await this.lastMondayDayForMonth(moment(this.preMonthDate), dayNumber);
            } else if (dayNumber == 2) {
                currentDay = await this.lastTueDayForMonth(moment(this.monthDate), dayNumber);
                previusDay = await this.lastTueDayForMonth(moment(this.preMonthDate), dayNumber);
            } else if (dayNumber == 3) {
                currentDay = await this.lastWedDayForMonth(moment(this.monthDate), dayNumber);
                previusDay = await this.lastWedDayForMonth(moment(this.preMonthDate), dayNumber);
            } else if (dayNumber == 4) {
                currentDay = await this.lastThurDayForMonth(moment(this.monthDate), dayNumber);
                previusDay = await this.lastThurDayForMonth(moment(this.preMonthDate), dayNumber);
            } else if (dayNumber == 5) {
                currentDay = await this.lastFriDayForMonth(moment(this.monthDate), dayNumber);
                previusDay = await this.lastFriDayForMonth(moment(this.preMonthDate), dayNumber);
            } else if (dayNumber == 6) {
                currentDay = await this.lastSatDayForMonth(moment(this.monthDate), dayNumber);
                previusDay = await this.lastSatDayForMonth(moment(this.preMonthDate), dayNumber);
            } else {
                currentDay = await this.lastSunDayForMonth(moment(this.monthDate), dayNumber);
                previusDay = await this.lastSunDayForMonth(moment(this.preMonthDate), dayNumber);
            }
            let cstart = currentDay.hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
            let cend = currentDay.hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
            repeat.push(Object.assign({}, this.data, {
                startTime: cstart,
                start: cstart,
                endTime: cend,
                end: cend
            }));
            let pstart = previusDay.hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
            let pend = previusDay.hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
            repeat.push(Object.assign({}, this.data, {
                startTime: pstart,
                start: pstart,
                endTime: pend,
                end: pend,
            }));
        }
        //----------------------------------------------------------
        if (this.data.repeat.repeatDetails.repeatInnerDetails.yearly.day == 'day' && dayNumber < 0 && weekNumber < 5) {
            let currentDay = moment(this.monthDate);
            let cstart = currentDay.date(weekNumber + 1).hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
            let cend = currentDay.date(weekNumber + 1).hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
            repeat.push(Object.assign({}, this.data, {
                startTime: cstart,
                start: cstart,
                endTime: cend,
                end: cend
            }));
        }
        //------------------------------------------------------------
        if (this.data.repeat.repeatDetails.repeatInnerDetails.yearly.day == 'weekday' && dayNumber < 0 && weekNumber < 5) {
            let currentDay = this.dateStart(this.monthDate, weekNumber);
            let cstart = currentDay.hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
            let cend = currentDay.hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
            repeat.push(Object.assign({}, this.data, {
                startTime: cstart,
                start: cstart,
                endTime: cend,
                end: cend
            }));
        }
        //------------------------------------------------------------
        if (this.data.repeat.repeatDetails.repeatInnerDetails.yearly.day == 'weekday' && dayNumber < 0 && weekNumber == 5) {
            let currentDay = this.lastWorkingDay(this.monthDate);
            let pstart = currentDay.hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
            let pend = currentDay.hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
            repeat.push(Object.assign({}, this.data, {
                startTime: pstart,
                start: pstart,
                endTime: pend,
                end: pend
            }));
        }
        //----------------------------------------------------------
        if (this.data.repeat.repeatDetails.repeatInnerDetails.yearly.day == 'weekend_day' && dayNumber < 0 && weekNumber < 5) {
            let currentDay = this.getCurrentWeekendDay(this.monthDate, weekNumber);
            let cstart = currentDay.hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
            let cend = currentDay.hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
            repeat.push(Object.assign({}, this.data, {
                startTime: cstart,
                start: cstart,
                endTime: cend,
                end: cend
            }));
        }
        //-------------------------------------------------------------
        if (this.data.repeat.repeatDetails.repeatInnerDetails.yearly.day == 'weekend_day' && dayNumber < 0 && weekNumber == 5) {
            let currentDay = this.getCurrentLastWeekendDay(this.monthDate, weekNumber);
            let cstart = currentDay.hour(moment(this.data.start).hour()).minute(moment(this.data.start).minute()).format();
            let cend = currentDay.hour(moment(this.data.end).hour()).minute(moment(this.data.end).minute()).add(this.data.dayDiff, 'days').format();
            repeat.push(Object.assign({}, this.data, {
                startTime: cstart,
                start: cstart,
                endTime: cend,
                end: cend
            }));
        }
    }

    if (every > 0) {
        let filteredRepeat = [];
        let startRecurr = moment(start).recur().every(every).years();
        start = startRecurr.next(30);
        start.filter(r => {
            if (moment(r).format("MM-YYYY") == moment(this.monthDate).format("MM-YYYY")) {
                filteredRepeat = repeat.filter(re => {
                    if (moment(r).format("MM-YYYY") == moment(re.start).format("MM-YYYY")) {
                        return true;
                    }
                });
            }
        });
        return filteredRepeat;
    } else {
        return repeat;
    }
}

/**
 * @function evaluateRepeat
 * @returns {Boolean}
 */
repeatHelper.prototype.evaluateRepeat = async function() {
    if (this.data.repeat.repeatVal != "none") {
        if (this.data.repeat.repeatVal === 'every_day') {
            return 1
        }
        if (this.data.repeat.repeatVal === 'every_week') {
            return 2;
        }
        if (this.data.repeat.repeatVal === 'every_month') {
            return 3;
        }
        if (this.data.repeat.repeatVal === 'every_year') {
            return 4;
        }
        if (this.data.repeat.repeatVal === 'custom') {
            if (this.data.repeat.repeatDetails.repeatDetailsValue == "daily") {
                return 5;
            }
            if (this.data.repeat.repeatDetails.repeatDetailsValue == "weekly") {
                return 6;
            }
            if (this.data.repeat.repeatDetails.repeatDetailsValue == "monthly") {
                if (this.data.repeat.repeatDetails.repeatInnerDetails.monthly.type == 'each') {
                    return 7;
                } else {
                    return 9;
                }
            }
            if (this.data.repeat.repeatDetails.repeatDetailsValue == "yearly") {
                if (this.data.repeat.repeatDetails.repeatInnerDetails.yearly.type == 'each') {
                    return 8;
                } else {
                    return 10;
                }
            }
        }
    }
}

/**
 * @function getUniqueRecords
 * @param {Array} arr {Required}
 * @returns {Array} clean
 */
repeatHelper.prototype.getUniqueRecords = async function(arr) {
    var clean = [];
    if (arr) {
        clean = arr.filter((arr, index, self) =>
            index === self.findIndex((t) => (t.id === arr.id && moment(t.start).format('YYYY-MM-DD') === moment(arr.start).format('YYYY-MM-DD'))));
    }
    return clean;
}

/**
 * @function weekCount
 * @param {Number} year {Required}
 * @param {Number} month {Required}
 * @returns {Number}
 */
repeatHelper.prototype.weekCount = async function(year, month_number) {
    var firstOfMonth = new Date(year, month_number - 1, 1);
    var lastOfMonth = new Date(year, month_number, 0);
    var used = firstOfMonth.getDay() + lastOfMonth.getDate();
    return Math.ceil(used / 7);
}

/**
 * @function lastMondayDayForMonth
 * @param {Object} monthMoment {Required}
 * @returns {Object} lastDay
 */
repeatHelper.prototype.lastMondayDayForMonth = async function(monthMoment) {
    var lastDay = monthMoment.endOf('month').startOf('day');
    switch (lastDay.day()) {
        case 6:
            return lastDay.subtract(5, 'days');
        case 5:
            return lastDay.subtract(4, 'days');
        case 4:
            return lastDay.subtract(3, 'days');
        case 3:
            return lastDay.subtract(2, 'days');
        case 2:
            return lastDay.subtract(1, 'days');
        case 1:
            return lastDay.subtract(0, 'days');
        default:
            return lastDay.subtract(6, 'days');
    }
}

/**
 * @function lastTueDayForMonth
 * @param {Object} monthMoment {Required}
 * @returns {Object} lastDay
 */
repeatHelper.prototype.lastTueDayForMonth = async function(monthMoment) {
    var lastDay = monthMoment.endOf('month').startOf('day');
    switch (lastDay.day()) {
        case 6:
            return lastDay.subtract(4, 'days');
        case 5:
            return lastDay.subtract(3, 'days');
        case 4:
            return lastDay.subtract(2, 'days');
        case 3:
            return lastDay.subtract(1, 'days');
        case 2:
            return lastDay.subtract(0, 'days');
        case 1:
            return lastDay.subtract(6, 'days');
        default:
            return lastDay.subtract(5, 'days');
    }
}

/**
 * @function lastWedDayForMonth
 * @param {Object} monthMoment {Required}
 * @returns {Object} lastDay
 */
repeatHelper.prototype.lastWedDayForMonth = async function(monthMoment) {
    var lastDay = monthMoment.endOf('month').startOf('day');
    switch (lastDay.day()) {
        case 6:
            return lastDay.subtract(3, 'days');
        case 5:
            return lastDay.subtract(2, 'days');
        case 4:
            return lastDay.subtract(1, 'days');
        case 3:
            return lastDay.subtract(0, 'days');
        case 2:
            return lastDay.subtract(6, 'days');
        case 1:
            return lastDay.subtract(5, 'days');
        default:
            return lastDay.subtract(4, 'days');
    }
}

/**
 * @function lastThurDayForMonth
 * @param {Object} monthMoment {Required}
 * @returns {Object} lastDay
 */
repeatHelper.prototype.lastThurDayForMonth = async function(monthMoment) {
    var lastDay = monthMoment.endOf('month').startOf('day');
    switch (lastDay.day()) {
        case 6:
            return lastDay.subtract(2, 'days');
        case 5:
            return lastDay.subtract(1, 'days');
        case 4:
            return lastDay.subtract(0, 'days');
        case 3:
            return lastDay.subtract(6, 'days');
        case 2:
            return lastDay.subtract(5, 'days');
        case 1:
            return lastDay.subtract(4, 'days');
        default:
            return lastDay.subtract(3, 'days');
    }
}

/**
 * @function lastFriDayForMonth
 * @param {Object} monthMoment {Required}
 * @returns {Object} lastDay
 */
repeatHelper.prototype.lastFriDayForMonth = async function(monthMoment) {
    var lastDay = monthMoment.endOf('month').startOf('day');
    switch (lastDay.day()) {
        case 6:
            return lastDay.subtract(1, 'days');
        case 5:
            return lastDay.subtract(0, 'days');
        case 4:
            return lastDay.subtract(6, 'days');
        case 3:
            return lastDay.subtract(5, 'days');
        case 2:
            return lastDay.subtract(4, 'days');
        case 1:
            return lastDay.subtract(3, 'days');
        default:
            return lastDay.subtract(2, 'days');
    }
}

/**
 * @function lastSatDayForMonth
 * @param {Object} monthMoment {Required}
 * @returns {Object} lastDay
 */
repeatHelper.prototype.lastSatDayForMonth = async function(monthMoment) {
    var lastDay = monthMoment.endOf('month').startOf('day');
    switch (lastDay.day()) {
        case 6:
            return lastDay.subtract(0, 'days');
        case 5:
            return lastDay.subtract(6, 'days');
        case 4:
            return lastDay.subtract(5, 'days');
        case 3:
            return lastDay.subtract(4, 'days');
        case 2:
            return lastDay.subtract(3, 'days');
        case 1:
            return lastDay.subtract(2, 'days');
        default:
            return lastDay.subtract(1, 'days');
    }
}

/**
 * @function lastSunDayForMonth
 * @param {Object} monthMoment {Required}
 * @returns {Object} lastDay
 */
repeatHelper.prototype.lastSunDayForMonth = async function(monthMoment) {
    var lastDay = monthMoment.endOf('month').startOf('day');
    switch (lastDay.day()) {
        case 6:
            return lastDay.subtract(6, 'days');
        case 5:
            return lastDay.subtract(5, 'days');
        case 4:
            return lastDay.subtract(4, 'days');
        case 3:
            return lastDay.subtract(3, 'days');
        case 2:
            return lastDay.subtract(2, 'days');
        case 1:
            return lastDay.subtract(1, 'days');
        default:
            return lastDay.subtract(0, 'days');
    }
}

/**
 * @function dateStart
 * @param {Object} date {Required}
 * @param {Number} dayNumber {Required}
 * @returns {Object} first
 */
repeatHelper.prototype.dateStart = function(date, dayNumber) {
    var first = moment(date).startOf('month');
    switch (first.day()) {
        case 0:
            return first.add(dayNumber + 1, 'days');
        default:
            if (6 - dayNumber > first.day()) {
                return first.add(dayNumber, 'days');
            } else {
                return first.add(dayNumber + 2, 'days');
            }
    }
}

/**
 * @function lastWorkingDay
 * @param {Object} date {Required}
 * @returns {Object} last
 */
repeatHelper.prototype.lastWorkingDay = function(date) {
    var last = moment(date).endOf('month');
    switch (last.day()) {
        case 0:
            return last.subtract(2, 'days');
        case 6:
            return last.subtract(1, 'days');
        default:
            return last;
    }
}

/**
 * @function getCurrentWeekendDay
 * @param {Object} date {Required}
 * @param {Number} weeks {Required}
 * @returns {Object} last
 */
repeatHelper.prototype.getCurrentWeekendDay = function(date, weeks) {
    return moment(date).startOf('month').add(weeks, 'weeks').endOf('week');
}

/**
 * @function getCurrentLastWeekendDay
 * @param {Object} date {Required}
 * @returns {Object} last
 */
repeatHelper.prototype.getCurrentLastWeekendDay = function(date) {
    var last = moment(date).endOf('month');
    if (last > 0) {
        return moment(date).endOf('month').subtract(1, 'weeks').endOf('week');
    } else {
        return moment(date).endOf('month').endOf('week');
    }
}

/**
 * @function saveEventRepeat
 * @param {Object} repeat {Required}
 * @param {Object} endRepeat {Required}
 * @param {Number} eventId {Required}
 * @param {String} repeat_for {Required}
 * @param {Boolean} isSave
 * @returns {Array} [err,repeatCreate]
 */
repeatHelper.prototype.saveEventRepeat = async function(repeat, endRepeat, eventId, repeat_for, isSave) {
    if (!repeat) {
        return false;
    }
    let repeatData = {
        repeat_type: repeat.repeatVal,
        event_id: eventId,
        repeat_for: repeat_for
    };
    let err, repeatCreate;
    repeatData.custom_type = repeat.repeatDetails.repeatDetailsValue;
    if (repeat.repeatVal == 'custom') {
        if (repeat.repeatDetails.repeatDetailsValue == "daily") {
            repeatData.every = repeat.repeatDetails.repeatInnerDetails.daily.every;
        }
        if (repeat.repeatDetails.repeatDetailsValue == "weekly") {
            repeatData.every = repeat.repeatDetails.repeatInnerDetails.weekly.every;
            repeatData.event_repeat_day = repeat.repeatDetails.repeatInnerDetails.weekly.weekday.join(',');
        }
        if (repeat.repeatDetails.repeatDetailsValue == "monthly") {
            repeatData.every = repeat.repeatDetails.repeatInnerDetails.monthly.every;
            repeatData.type = repeat.repeatDetails.repeatInnerDetails.monthly.type;
            if (repeat.repeatDetails.repeatInnerDetails.monthly.type == 'each') {
                repeatData.event_repeat_day = repeat.repeatDetails.repeatInnerDetails.monthly.monthday.join(',');
            } else {
                repeatData.day_type = repeat.repeatDetails.repeatInnerDetails.monthly.freq;
                repeatData.on_day = repeat.repeatDetails.repeatInnerDetails.monthly.day;
            }
        }
        if (repeat.repeatDetails.repeatDetailsValue == "yearly") {
            repeatData.every = repeat.repeatDetails.repeatInnerDetails.yearly.every;
            repeatData.type = repeat.repeatDetails.repeatInnerDetails.yearly.type;
            if (repeat.repeatDetails.repeatInnerDetails.yearly.type == 'each') {
                repeatData.event_repeat_day = repeat.repeatDetails.repeatInnerDetails.yearly.yearmonth.join(',');
            } else {
                repeatData.day_type = repeat.repeatDetails.repeatInnerDetails.yearly.freq;
                repeatData.on_day = repeat.repeatDetails.repeatInnerDetails.yearly.day;
            }
        }
    }
    repeatData.end_repeat = endRepeat.endrepeatVal;
    if (endRepeat.endrepeatVal === 'after') {
        repeatData.end_repeat_on_hours = endRepeat.endrepeatDetail;
    }
    if (endRepeat.endrepeatVal === 'on_date') {
        repeatData.end_repeat_on_date = moment.utc(endRepeat.endrepeatDetail);
    }
    if (isSave) {
        [err, repeatCreate] = await to(eventRepeats.create(repeatData));
    } else {
        [err, repeatCreate] = await to(eventRepeats.update(repeatData, {
            returning: true,
            where: {
                event_id: eventId
            }
        }));
    }
    if (err) {
        return [err];
    } else {
        return repeatCreate;
    }
}

/**
 * @function getEndRepeatDetails
 * @param {Number} eventId {Required}
 * @param {String} repeat_for {Required}
 * @returns {Array} [err,endRepeats]
 */
repeatHelper.prototype.getEndRepeatDetails = async function(event_id, repeat_for) {
    let err, endRepeats;
    [err, endRepeats] = await to(
        eventRepeats.findAll({
            where: {
                event_id: event_id,
                repeat_for: repeat_for
            }
        })
    );
    if (err) {
        return console.log("Error:::" + err);
    }

    if (endRepeats.length > 0) {
        return {
            endrepeatVal: endRepeats[0].end_repeat,
            endrepeatDetail: endRepeats[0].end_repeat == 'after' ? endRepeats[0].end_repeat_on_hours : endRepeats[0].end_repeat_on_date,
            endRepeatId: endRepeats[0].id
        }
    }
}

/**
 * @function getRepeatDetails
 * @param {Number} eventId {Required}
 * @param {String} repeat_for {Required}
 * @returns {Array} [err,repeats]
 */
repeatHelper.prototype.getRepeatDetails = async function(event_id, repeat_for) {
    let err, repeats;
    [err, repeats] = await to(
        eventRepeats.findAll({
            where: {
                event_id: event_id,
                repeat_for: repeat_for
            }
        })
    );
    if (err) {
        return console.log("Error:::" + err);
    }
    if (repeats.length > 0) {
        return {
            repeatVal: repeats[0].repeat_type,
            repeatDetails: {
                repeatDetailsValue: repeats[0].custom_type,
                repeatInnerDetails: {
                    daily: {
                        every: repeats[0].repeat_type == 'custom' && repeats[0].custom_type == 'daily' ? repeats[0].every : 1,
                    },
                    weekly: {
                        every: repeats[0].repeat_type == 'custom' && repeats[0].custom_type == 'weekly' ? repeats[0].every : 1,
                        weekday: repeats[0].repeat_type == 'custom' && repeats[0].custom_type == 'weekly' ? repeats[0].event_repeat_day.split(',').map(Number) : []
                    },
                    monthly: {
                        every: repeats[0].repeat_type == 'custom' && repeats[0].custom_type == 'monthly' ? repeats[0].every : 1,
                        monthday: repeats[0].repeat_type == 'custom' && repeats[0].custom_type == 'monthly' && repeats[0].type == 'each' ? repeats[0].event_repeat_day.split(',').map(Number) : [],
                        type: repeats[0].type ? repeats[0].type : "each",
                        freq: repeats[0].type ? repeats[0].day_type : "first",
                        day: repeats[0].type ? repeats[0].on_day : "day"
                    },
                    yearly: {
                        every: repeats[0].repeat_type == 'custom' && repeats[0].custom_type == 'yearly' ? repeats[0].every : 1,
                        yearmonth: repeats[0].repeat_type == 'custom' && repeats[0].custom_type == 'yearly' && repeats[0].type == 'each' ? repeats[0].event_repeat_day.split(',').map(Number) : [],
                        type: repeats[0].type ? repeats[0].type : "each",
                        freq: repeats[0].type ? repeats[0].day_type : "first",
                        day: repeats[0].type ? repeats[0].on_day : "day"
                    }
                }
            },
            repeatId: repeats[0].id
        }
    }
}

/**
 * @function getFormatedDateTime
 * @param {Array} arr {Required}
 * @returns {Array} arr
 */
repeatHelper.prototype.getFormatedDateTime = async function(arr) {
    // for (let i = 0; i < arr.length; i++) {
    //     arr[i].start = arr[i].start.replace('Z', '');
    //     arr[i].startTime = arr[i].startTime.replace('Z', '');
    //     arr[i].end = arr[i].end.replace('Z', '');
    //     arr[i].endTime = arr[i].endTime.replace('Z', '');
    // }
    return arr;
}

repeatHelper.prototype.filterEventsByEndDateAndDeletedDays = async function(events, isNotEndCheck) {
    this.events = events || this.events;
    let endDate;
    if (!isNotEndCheck) {
        this.events = this.events.filter(e => {
            if (e.endrepeat.endrepeatVal == "on_date") {
                endDate = moment(e.endrepeat.endrepeatDetail).add(1, 'day');
                if (endDate >= moment(e.start)) {
                    return true;
                }
            } else {
                return true;
            }
        });
    }

    this.events = this.events.filter(e => {
        let isNotDeleted = true;
        e.deletedDay = e.deletedDay || [];
        for (let i = 0; i < e.deletedDay.length; i++) {
            if (moment(e.start).format('DD-MM-YYYY') === moment(e.deletedDay[i].dataValues.delete_date).format('DD-MM-YYYY')) {
                isNotDeleted = false;
                break;
            }
        }
        return isNotDeleted;
    });
    return this.events;
}

module.exports = new repeatHelper();