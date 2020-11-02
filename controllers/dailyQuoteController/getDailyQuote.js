const DailyQuotes = require('../../models').daily_qoutes;
const { Op } = require("sequelize");

const getDailyQuotes = async(req, res) =>{

  let date = req.body;
   let {count , rows } = await DailyQuotes.findAndCountAll({
    where: {
      id: {
        [Op.not]: null
      }
    },
   });
   let index = await generateNumber(date , count)
    return ReS(res,{'Message':"Get Daily quotes",count,quote:rows[index]});
}

const generateNumber = async(data , count) => {
   for(var i = data; i > count ; i= i%count);
   return Math.ceil(i)+1;
  }
module.exports.getDailyQuotes = getDailyQuotes;
