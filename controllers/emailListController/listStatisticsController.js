const Sequelize = require('sequelize');
const Models = require('../../models');
const { getGraphDataByList } = require('../../services/EmailStatisticsService');
const Subscribers = Models.subscribers;
const Statistics = Models.smtp_statistics;

module.exports = (function () {

    /* method to get the list/segment subscribers, optional params - segment_id */
    this.getListStatistics = async (req, res, next) => {
        const { query: { id, type, startDate, endDate, segment_id } } = req;

        if (isNaN(id)) return ReE(res, { success: false, message: "Invalid list identifier!" }, 422);
        if (!type) return ReE(res, { success: false, message: "Proper type should be passed!" }, 422);
        // if (!id) return ReE(res, "Invalid list identifier!");

        let data = await getGraphDataByList(id, startDate, endDate, type, segment_id, res);
        return ReS(res, data, 200);
    }

    /* method to get the list/segment subscribers  */
    this.removeSubscriber = async (req, res, next) => {
        // { deleteData: { subscriber_id: [ 69 ], list_id: 7 } }
        let subscriberId = req.body.deleteData.subscriber_id, listId = req.body.deleteData.list_id;
        if (!subscriberId.length) {
            return ReE(res, { message: 'No Subscriber Id recieved to remove.' }, 422);
        }
        if (!listId) {
            return ReE(res, { message: 'No List Id recieved to remove.' }, 422);
        }

        [err, subscriber] = await to(Subscribers.destroy({
            where: {
                id: subscriberId,
                list_id: listId
            }
        }));

        [err, statistics] = await to(Statistics.destroy({
            where: {
                subscriber_id: subscriberId,
                list_id: listId
            }
        }));

        if (err) return ReE(res, err, 422);
        return ReS(res, { message: 'Subscribers removed successfully from the list.' }, 200);
    }

    return this;

})();
