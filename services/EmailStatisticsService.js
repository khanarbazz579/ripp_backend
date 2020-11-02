const Sequelize = require('sequelize');
const Models = require('../models');
const EmailList = Models.email_lists;
const SmtpStatistics = Models.smtp_statistics;
const Contacts = Models.contacts;
const Subscribers = Models.subscribers;
const ContactFilters = Models.contact_filters;
const SegmentlList = Models.segment_lists;
const Users = Models.users;
const ClickedLinks = Models.clicked_links;
const TemplateLinks = Models.template_links;
const { filterSubscribers } = require('../controllers/emailListController/contactFilterController');


module.exports = (function () {
    this.startDate = new Date();
    this.endDate = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let convertToChartFormat = (chart_dataObj) => {
        let chart_data = [];
        for (var key in chart_dataObj) {
            let val = chart_dataObj[key];
            chart_data.push(val);
        }
        return chart_data;
    };

    let _graphAdapter = (data) => {
        let chart_dataObj = {}, avg_opening_count = 0;
        for (let j = this.startDate.getMonth(); j < this.endDate.getMonth(); j++) {
            let month = monthNames[j];
            chart_dataObj[month] = [month, 0, 0, 0, 0]
        }

        for (let i = 0; i < data.length; i++) {
            const el = data[i].dataValues,
                d = new Date(el.time_stamp);
            let month = monthNames[d.getMonth()];
            if (!chart_dataObj[month]) {
                chart_dataObj[month] = [month, 0, 0, 0, 0]
            }
            if (chart_dataObj && chart_dataObj[month]) {
                switch (el.event) {
                    case 'un_subscribed':
                        chart_dataObj[month][2]++;
                        break;
                    case 'hard_bounce':
                        chart_dataObj[month][3]++;
                        break;
                    case 'reported_spam':
                        chart_dataObj[month][4]++;
                        break;
                    case 'opened':
                        avg_opening_count++;
                        break;
                    default:
                        break;
                }
            }
        }

        return { chart_dataObj, avg_opening_count };
    }

    let _request = async (list_id, type, segment_id) => {
        let whereObj = {
            $and: [],
            time_stamp: {
                "$between": []
            }
        }, err, exludeIds = [];

        if (type === 'segment') {
            let [err, filter] = await to(ContactFilters.findOne({
                where: { list_id: segment_id, type }
            }));
            if (err) {
                err = err;
            }
            if (filter && filter.filterJson) {
                let data = await filterSubscribers(filter.filterJson, list_id, this.res, true);
                for (let i = 0; i < data.length; i++) {
                    const cont = data[i].dataValues;
                    exludeIds.push(cont.subscriber_id);
                }
                whereObj.$and.push({
                    list_id
                }, {
                        subscriber_id: {
                            '$notIn': exludeIds
                        }
                    })
            }
        } else {
            whereObj.$and.push({
                list_id
            })
        }

        whereObj.time_stamp['$between'].push(this.startDate, this.endDate);

        [err, data] = await to(SmtpStatistics.findAll({
            where: whereObj,
            attributes: ['id', 'subscriber_id', 'list_id', 'event', 'user_agent', 'time_stamp'],
            order: [
                ['time_stamp', 'DESC'],
            ],
            include: [
                {
                    model: Subscribers,
                    as: 'contacts',
                    include: [
                        {
                            model: Contacts,
                            as: 'subscriber',
                        }
                    ]
                }
            ]
        }));
        return {
            data,
            err,
            exludeIds
        }
    }

    /* method to get the email list subscribers */
    let getEmailListSubscribers = async (list_id, type, segment_id) => {
        try {
            listSubscribers = await EmailList.findAll({
                where: { id: list_id },
                include: [
                    {
                        model: Subscribers,
                        as: 'subscribers',
                        attributes: ['id']
                    },
                    {
                        model: SegmentlList,
                        as: 'segments',
                        include: [
                            {
                                model: Users,
                                as: 'By',
                                attributes: ['id', 'first_name', 'last_name']
                            },
                            {
                                model: ContactFilters,
                                as: 'filter',
                            }
                        ]
                    }
                ]
            }).map(el => el.get({ plain: true }));

            return {
                listSubscribers
            }
        } catch (error) {
            TE(error)
        }
    }

    /* method to get the opened emails */
    let getOpenedEmails = async (list_id, type, segment_id) => {
        try {
            return await SmtpStatistics.findAll({
                where: {
                    list_id: list_id,
                    event: 'opened'
                }
            }).map(el => el.get({ plain: true }));

        } catch (error) {
            TE(error)
        }
    }

    /* method to get the clicked links of the email list */
    let getClickedLinksofEmailList = async (list_id) => {
        try {
            return await ClickedLinks.findAll({
                attributes: ['subscriber_id'],
                include: [
                    {
                        model: Subscribers,
                        as: 'link_clicked_subscribers',
                        attributes: ['id'],
                        // [[Sequelize.fn('DISTINCT', Sequelize.col('link_clicked_subscribers.id')), 'link_clicked_subscribers.id']],
                        // [[Sequelize.literal('DISTINCT `id`'), 'id'], 'link_clicked_subscribers'],
                        // Tuple.findAll({attributes: [[Sequelize.literal('DISTINCT `key`'), 'key'], 'value']});
                        // [sequelize.fn('DISTINCT', sequelize.col('col_name')), 'alias_name']
                        // attributes: [[Sequelize.literal('DISTINCT `link_clicked_subscribers->list_subcribers`.`id`'), 'link_clicked_subscribers.id'], 'id'],
                        include: [
                            {
                                model: EmailList,
                                as: 'list_subcribers',
                                attributes: ['id'],
                                where: { id: list_id }
                            }
                        ],
                    },
                ],
                raw: true,
            });

        } catch (error) {
            TE(error)
        }
    }

    /* method to get the clicked links of the email list segment */
    let getClickedLinksofEmailListSegment = async (subscriberId) => {
        try {
            return await ClickedLinks.findAll({
                where: { subscriber_id: { $in: subscriberId } },
                raw: true,
            });
        } catch (error) {
            TE(error)
        }
    }

    /* method to get the graph data by listId, startDate, endDate, type optional: segment_id */
    this.getGraphDataByList = async (listId, startDate, endDate, type = 'list', segment_id, res) => {
        // console.log('202----listId, segment_id: ', listId, segment_id);

        let listSubscribersCount, segmentSubscribersCount, avgOpenRate, avgClickRate, subscriberIds = [];
        this.res = res;

        if (startDate && endDate) {
            this.startDate = new Date(startDate),
                this.endDate = new Date(endDate);
        } else {
            let t = new Date();
            t.setUTCHours(0, 0, 0);
            t.setMonth(t.getMonth() - 4)
            t.setDate(t.getDate() - (t.getDate() - 1));
            this.startDate = new Date(t);
            this.endDate = new Date;
        }

        try {
            let { listSubscribers } = await getEmailListSubscribers(listId, type, segment_id);
            if (listSubscribers.length && listSubscribers[0].subscribers) {
                listSubscribersCount = listSubscribers[0].subscribers.length;
            }
            if (segment_id) {
                if (listSubscribers) {
                    if (listSubscribers.length && listSubscribers[0].segments && listSubscribers[0].segments.length && listSubscribers[0].segments.length > 0) {
                        for (let j = 0; j < listSubscribers[0].segments.length; j++) {
                            const seg = listSubscribers[0].segments[j];
                            if (seg) {
                                // seg.subscribersCount = listSubscribersCount;
                                seg.subscribersCount = 0;
                                if (seg.filter && seg.filter.length && seg.filter.length && seg.filter.length > 0) {
                                    let found = seg.filter.find(el => el.type === 'segment');
                                    let filter = found;
                                    if (filter && filter.filterJson) {
                                        if (typeof filter.filterJson === 'string') filter.filterJson = JSON.parse(filter.filterJson);
                                        if (filter.filterJson && filter.filterJson.length && filter.filterJson.length > 0) {
                                            let data = await filterSubscribers(filter.filterJson, seg.list_id, res, true);
                                            if (data) {
                                                for (let idx = 0; idx < data.length; idx++) {
                                                    subscriberIds.push(data[idx].dataValues.id)
                                                }
                                                seg.subscribersCount = data.length;
                                            }
                                        }
                                    }
                                }
                            }
                            segmentSubscribersCount = seg.subscribersCount;
                        }
                    }
                }
            }
        } catch (error) {
            TE(error)
        }

        try {
            let openedEmails = await getOpenedEmails(listId, type, segment_id);
            let clickedLinks = await getClickedLinksofEmailList(listId);
            let clickedLinksOfSeg = await getClickedLinksofEmailListSegment(subscriberIds);
            let emailListUniqueSubscribers, emailSegmentUniqueSubscribers;
            if (clickedLinks) {
                emailListUniqueSubscribers = [...new Set(clickedLinks.map(e => e.subscriber_id))]
            }
            if (clickedLinksOfSeg) {
                emailSegmentUniqueSubscribers = [...new Set(clickedLinksOfSeg.map(e => e.subscriber_id))]
            }

            if (openedEmails) {
                let OpenEmailsCount = openedEmails.length;
                if (openedEmails.length > 0) {
                    const uniqueOccurences = [...new Set(openedEmails.map(u => u.subscriber_id))]
                    if (listSubscribersCount && uniqueOccurences && emailListUniqueSubscribers && !segmentSubscribersCount) {
                        // avgOpenRate = ((openedEmails.length / listSubscribersCount) * 100);
                        avgOpenRate = ((uniqueOccurences.length / listSubscribersCount) * 100);
                        avgClickRate = ((emailListUniqueSubscribers.length / listSubscribersCount) * 100);

                    } else if (segmentSubscribersCount && emailSegmentUniqueSubscribers && clickedLinksOfSeg && uniqueOccurences) {
                        // avgOpenRate = ((openedEmails.length / segmentSubscribersCount) * 100);
                        avgOpenRate = ((uniqueOccurences.length / segmentSubscribersCount) * 100);
                        avgClickRate = ((emailSegmentUniqueSubscribers.length / segmentSubscribersCount) * 100);
                    }
                }
            }
        } catch (error) {
            TE(error)
        }

        try {
            let { data, err, exludeIds } = await _request(listId, type, segment_id);
            if (!err) {
                let contIds = [];/* Report Spam and Hard bounce contact ids */
                const { chart_dataObj, avg_opening_count } = _graphAdapter(data);
                // if (data && data && data.length > 0) {
                //     for (let k = 0; k < data.length; k++) {
                //         const sub = data[k].dataValues;
                //         contIds.push(sub.subscriber_id);
                //         console.log("TCL: this.getGraphDataByList -> sub", sub)
                //     }
                // }
                contIds = [...new Set(contIds)];
                if (contIds) {
                    const [err, contacts] = await to(Subscribers.findAll({
                        where: {
                            subscriber_id: {
                                $notIn: (exludeIds) ? exludeIds : []
                            },
                            status: {
                                $notIn: ['hard_bounce', 'un_subscribed', 'reported_spam']
                            },
                            list_id: listId,
                            createdAt: {
                                $between: [this.startDate, this.endDate]
                            }
                        },
                        order: [
                            ['createdAt', 'DESC']
                        ]
                    }));

                    for (let m = 0; m < contacts.length; m++) {
                        const el = contacts[m].dataValues;
                        let month = monthNames[new Date(el.createdAt).getMonth()];
                        if (!chart_dataObj[month]) {
                            chart_dataObj[month] = [month, 0, 0, 0, 0]
                        }
                        if (chart_dataObj && chart_dataObj[month]) {
                            chart_dataObj[month][1]++;
                        }
                    }
                    if (err) err = err;
                }

                const chart_data = convertToChartFormat(chart_dataObj);

                return {
                    data,
                    chart_data,
                    avg_opening_count,
                    date_range: this.startDate + "~" + this.endDate,
                    callId: 211,
                    avgOpenRate,
                    avgClickRate
                };
            } else {
                return { data: [], err, time, callId: 444 };
            }

        } catch (error) {
            return { data: [], err, time, callId: 444 };
        }

    }

    return this;
})();