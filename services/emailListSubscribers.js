const Sequelize = require('sequelize');
const Models = require('../models');
const Contacts = Models.contacts;
const Subscribers = Models.subscribers;
const TemplateLinks = Models.template_links;
// const Segments = Models.segment_lists;
// const Users = Models.users;
const Raven = require('raven');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const jwt = require('jsonwebtoken');
const URL = require('url');

/* To get the email list subscribers array and return their emails */
const getListSubscribers = async function (listHeaders) {
  let listId = listHeaders['x-list-id'], subsEmailDetails = [], err, listSubscribers;

  try {
    [err, listSubscribers] = await to(Subscribers.findAll({
      where: {
        list_id: listId
      },
      include: [{
        model: Contacts,
        as: 'subscriber',
        where: { id: Sequelize.col('subscribers.subscriber_id') },
      }]
    }));
    if (err) {
      throw err;
    } else {
      if (listSubscribers) {
        for (let idx = 0; idx < listSubscribers.length; idx++) {
          if (listSubscribers[idx].dataValues && listSubscribers[idx].dataValues.subscriber.dataValues) {
            subsEmailDetails.push(
              {
                email: listSubscribers[idx].dataValues.subscriber.dataValues.email,
                subscriberId: listSubscribers[idx].dataValues.subscriber.dataValues.id
              }
            );
          }
        }
      }
    }
  } catch (err) {
    // Uncomment this later when in production
    // Raven.captureException(err);
  }

  return [...new Set(subsEmailDetails)]
}

/* To track clicks by appending the list,segment,user Id in the < a href=""></a> JSDOM*/
const buildEmailTemplate = async function (campaign, subsEmail, listHeaders) {
  let listId = listHeaders['x-list-id'];

  try {
    if (campaign.email_template_html) {
      const dom = new JSDOM(campaign.email_template_html);
      let elems = dom.window.document.getElementsByClassName("track-click");

      let anchorLinks = dom.window.document.getElementsByTagName('a');
      for(let j = 0 ; j < anchorLinks.length ; j++) {
        if(anchorLinks.item(j).getAttribute('href') !== '') {
          let url = URL.parse(anchorLinks.item(j).getAttribute('href'), true);
          if(url.hostname) {
            let payload = {
              email: subsEmail.email,
              campaign_id: campaign.id
            };

            let token = jwt.sign(payload, CONFIG.jwt.encryption), search = [];

            if(url.slice && url.search !== '') {
              search = url.search.slice(1).split('&');
            }

            url.search = [
              `utm_source=EMAIL_CAMPAIGN`,
              `utm_medium=email`,
              `utm_campaign=${campaign.name}-${campaign.id}`,
              `utm_hash=${token}`,
              ...search
            ].join('&');

            url = URL.format(url);
            anchorLinks.item(j).setAttribute('href', url)
          }
        }
      }

      if (elems) {
        for (let i = 0; i < elems.length; i++) {
          if (elems.item(i).getAttribute("href") && elems.item(i).getAttribute("href") !== '#') {
            elems.item(i).setAttribute(
              'href',
              await updateTemplateLink(
                elems.item(i).innerHTML,
                elems.item(i).getAttribute("href"),
                listId,
                subsEmail.subscriberId,
                campaign.id
              ));
          }
        }
      }

      let multipleElems = dom.window.document.getElementsByClassName("track-multi-click");
      if (multipleElems) {
        for (let i = 0; i < multipleElems.length; i++) {
          for (let j = 0; j < multipleElems.item(i).querySelectorAll("a").length; j++) {
            if (multipleElems.item(i).querySelectorAll("a")[j].href && multipleElems.item(i).querySelectorAll("a")[j].href !== '#') {
              multipleElems.item(i).querySelectorAll("a")[j].setAttribute(
                'href',
                await updateTemplateLink(
                  multipleElems.item(i).querySelectorAll("a")[j].innerHTML,
                  multipleElems.item(i).querySelectorAll("a")[j].href,
                  listId,
                  subsEmail.subscriberId,
                  campaign.id
                ));
            }
          }
        }
      }

      // TODO later for implemnting the unsubscribe functionality
      // dom.window.document.querySelector(".mj-container").innerHTML = dom.window.document.querySelector(".mj-container").innerHTML + `<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fff; color:#444; width: 600px; border: solid 1px #ddd; 
      // max-width: 600px; border-collapse: collapse;font-size: 14px; line-height: 1; 
      // margin: 0 auto; font-family:Arial, sans-serif;" align="center" class="main-table"> 
      // <tbody> <tr> <td class="button-td"> <a href="http://localhost:4200/redirectTo?type=unsubs&lstId=${listId}&subsId=${subsEmail.subscriberId}" style="font-size:15px;margin:0px 30%;"> Click on this link to unsubscribe.. </a> <!--[if mso | IE]> <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" style="font-size:1px;margin:0px auto; border:1px solid #DADFE1;width:100%;" width="600"> <tr> <td style="height:0;line-height:0;"> </td> </tr> </table> <![endif]--> </td> </tr> </tbody> </table>`;

      return dom.window.document.querySelector('html').innerHTML
    }
  } catch (err) {
    return TE(err)
  }
}

const updateTemplateLink = async function (innerHTML, link, listId, subscriberId, campaignId) {
  try {
    let templateLinkObj = {}, savedTemplateLink, templateLinkExists, token;
    templateLinkExists = await TemplateLinks.findOne({
      where: {
        'text': innerHTML.replace(/<\/?[^>]+(>|$)|(\s*(&nbsp;)*)/g, ""),
        'href': link,
        'list_id': listId,
        'campaign_id': campaignId
      },
      raw:true
    });

    let payload = { template_link_id: null, subscriber_id: subscriberId }

    if (!templateLinkExists) {
      templateLinkObj = {
        'text': innerHTML.replace(/<\/?[^>]+(>|$)|(\s*(&nbsp;)*)/g, ""),
        'href': link,
        'list_id': listId,
        'campaign_id': campaignId
      };
      savedTemplateLink = await TemplateLinks.create(templateLinkObj);
      payload.template_link_id = savedTemplateLink.dataValues.id;
    } else {
      payload.template_link_id = templateLinkExists.id;
    }

    token = jwt.sign(payload, CONFIG.jwt.encryption);
    return `http://localhost:4200/redirectTo?type=avgClick&link=${Buffer(link).toString('base64')}&token=${token}`;
  } catch (err) {
    return TE(err);
  }
}

module.exports = {
  getListSubscribers,
  buildEmailTemplate
};
