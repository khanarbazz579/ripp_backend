const LeadClient = require('../../models').leads_clients;
const LostLead = require('../../models').lost_lead_fields;
const db = require('../../models');

const sequelize = require('sequelize');
const months = [
    'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September',
    'October', 'November', 'December'
    ];

const getConvertionGraph = async function(req, res){
    let err, allLeadCount;

    [err, allLeadCount] = await to(
        LeadClient.count({
            where : {
                sales_stage_id : {
                    [sequelize.Op.ne] : 1
                }
            }
        })
    );

    [err, clientPercentage] = await to(LeadClient.findAll({
        where: { 
          sales_stage_id : 8,
          created_at: {
            $lte: new Date(),
            $gte: new Date(new Date() - 24 *360* 3600 * 1000)
          }
        },
        attributes: [
          [sequelize.fn('MONTH', sequelize.col('created_at')),"month"],
          [ sequelize.fn('count', '*'), 'count']
        ],
        group:[sequelize.fn('MONTH', sequelize.col('created_at'))]
      }));

    if(err){
        return ReE(res, err,422);
    }
    const getPercentage = (clientCount) => {
        let value = clientCount ? ((clientCount/(allLeadCount))*100) >100 ? 100 :((clientCount/(allLeadCount))*100).toFixed(2) :0;
       return value;
    }
    let Percentage = clientPercentage.map(element => {
        let centage = getPercentage(element.dataValues.count)
        let obj = [ 
            months[element.dataValues.month-1],
            parseFloat(centage),
            centage+"% in " +  months[element.dataValues.month-1]
        ]
        return obj;
    });
    
    return ReS(res, {Percentage:Percentage},200);
}

module.exports.getConvertionGraph = getConvertionGraph; 

const getLostLeadGraph = async function(req, res){
    let err, lostGraph;
    [err, lostGraph] = await to(LostLead.findAll({
        attributes: [
          "lost_identifier",
          [ sequelize.fn('count', '*'), 'count']
        ],
        group:["lost_identifier"]
      }));

    if(err){
        return ReE(res, err,422);
    }
    let Percentage = lostGraph.map(element => {
        let obj = [ 
            element.dataValues.lost_identifier,
            parseInt(element.dataValues.count)
        ]
        return obj;
    });
    
    return ReS(res, {Percentage:Percentage},200);
}

module.exports.getLostLeadGraph = getLostLeadGraph; 

const getTotaldayToConvert = async function(req, res){
    let err, Graph;

    [err, Graph] = await to(db.sequelize
        .query(
            `SELECT month(a.created_at) as month,
            ROUND((CASE WHEN 
             a.current_ss_id!=1 && a.current_ss_id!=7
             THEN 
            SUM(TIME_TO_SEC(TIMEDIFF(
                 (
                     SELECT b.created_at 
                     FROM sales_stage_transitions b 
                     WHERE b.lead_client_id=a.lead_client_id and b.id>a.id AND (a.current_ss_id!=1 && a.current_ss_id!=7) LIMIT 1
                 )
                 ,a.created_at))/60/60/24)
             ELSE 0 
             END) 
             /
             (SELECT Count(*) FROM sales_stage_transitions WHERE current_ss_id=8),2) as AVG
             FROM sales_stage_transitions a 
             WHERE a.lead_client_id 
             IN (
                 SELECT c.lead_client_id 
                 FROM sales_stage_transitions c 
                 WHERE c.current_ss_id=8
             )
             GROUP BY month(a.created_at)`,
            { type: sequelize.QueryTypes.SELECT}
        )
    );

    if(err){
        return ReE(res, err,422);
    }
    let Percentage = Graph.map(element => {
        let obj = [ 
            months[element.month-1],
            parseInt(element.AVG)
        ]
        return obj;
    });
    
    return ReS(res, {Percentage:Percentage},200);
}

module.exports.getTotaldayToConvert = getTotaldayToConvert; 

const getStageTransistionGraph = async function(req, res){
   let selectedDated = req.body.date;
   let [err, Graph] = await to(db.sequelize
        .query(
            `SELECT (SELECT COUNT(*)  
            FROM sales_stage_transitions as c
            WHERE DATE(c.created_at) = DATE("${selectedDated}") && a.current_ss_id = c.current_ss_id) as entry_count,
            (SELECT COUNT(*)
            FROM sales_stage_transitions as b
            WHERE DATE(b.created_at) = DATE("${selectedDated}") && a.current_ss_id = b.old_ss_id) as exit_count,
            sales_stages.name 
            FROM sales_stage_transitions as a
            INNER JOIN sales_stages ON sales_stages.id = a.current_ss_id
            GROUP by sales_stages.id`,
            { type: sequelize.QueryTypes.SELECT}
        )
    );

    if(err){
        return ReE(res, err,422);
    }
    let Percentage = Graph.map(element => {
        let obj = [ 
            element.name,
            parseInt(element.entry_count),
            parseInt(element.exit_count)
        ]
        return obj;
    });
    return ReS(res, {Percentage:Percentage},200);
}

module.exports.getStageTransistionGraph = getStageTransistionGraph; 

