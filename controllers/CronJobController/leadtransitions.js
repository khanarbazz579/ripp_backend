const CronJob = require('cron').CronJob;
const SalesStageCounter = require("../../models").sales_stage_counters;
const db = require('../../models');

const job = new CronJob('0 0 0 * * *', function() {
   // storeDailyRecords();
}, null, true, '');

//job.start();

const storeDailyRecords = async function() {
    let [err, data] = await to(
        db.sequelize
        .query(`SELECT (SELECT COUNT(*)  
        FROM sales_stage_transitions as c
        WHERE DATE(c.created_at) = subdate(CURDATE(), 1) && a.current_ss_id = c.current_ss_id) as entry_count,
        (SELECT COUNT(*)  
        FROM sales_stage_transitions as b
        WHERE DATE(b.created_at) = subdate(CURDATE(), 1) && a.current_ss_id = b.old_ss_id) as exit_count,
        current_ss_id as sales_stage_id 
        FROM sales_stage_transitions as a
        INNER JOIN sales_stages ON sales_stages.id = a.current_ss_id
        GROUP by sales_stages.id`,{ type: db.sequelize.QueryTypes.SELECT})
    );
   
    [err,data] = await to(
        SalesStageCounter.bulkCreate(data)
    )
   
    return {success:true};
}

module.exports.storeDailyRecords = storeDailyRecords;