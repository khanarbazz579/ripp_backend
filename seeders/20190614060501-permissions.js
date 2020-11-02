"use strict";
const { FIELD_MAP } = require('../constants/permissions')

var structure = {
  leads: {
    "add new leads": {
      children: {
        "single lead add": {},
        "multiple lead add": {}
      }
    },
    "delete leads": {
      children: {
        "single lead delete": {},
        "multiple lead delete": {}
      }
    },
    "edit leads": {},
    "share leads": {},
    "leads activity history": {},
    [FIELD_MAP.LEAD_CLIENT]: {
      is_custom: true
    }
  },
  clients: {
    "add new clients": {},
    "delete clients": {
      children: {
        "single client delete": {},
        "multiple client delete": {}
      }
    },
    "edit clients": {},
    "clients activity history": {}
  },
  suppliers: {
    "add new suppliers": {},
    "delete suppliers": {
      children: {
        "single": {},
        "multiple": {}
      }
    },
    "edit suppliers":{},
    [FIELD_MAP.SUPPLIER]: {
      is_custom: true
    }
  },
  media: {
    "upload files-folders":{},
    "edit files-folders":{},
    "delete files-folders":{},
    "move files-folders": {},
    "copy files-folders": {},
    "share files-folders": {}
  },
  activities: {
    todo: {
      is_custom: false,
      children: {
        "todo category": {
          is_custom: false,
          children: {
            "add todo category": {
              is_custom: false
            },
            "edit todo category": {
              is_custom: false
            },
            "delete todo category": {
              is_custom: false
            }
          }
        },
        "add todo": {
          is_custom: false
        },
        "edit todo": {
          is_custom: false
        },
        "delete todo": {
          is_custom: false
        }
      }
    },
    calls: {
      is_custom: false,
      children: {
        "add call":{
          is_custom: false
        },
        "edit call":{
          is_custom: false
        },
        "delete call":{
          is_custom:false
        }
      }
    },
    events: {
      is_custom: false,
      children: {
        "add event":{
          is_custom: false
        },
        "edit event":{
          is_custom: false
        },
        "delete event":{
          is_custom:false
        }
      }
    }
  },
  "email inbox": [],
  "emails": {
    "campaigns":{
      is_custom:false,
      children:{
        'add campaign':{},
        'edit campaign':{},
        'delete campaign':{}
      }
    },
    "lists": {
      children: {
        'add list':{},
        'edit list':{},
        "copy list": {},
        'delete list':{},
        'subscribers': {
          children: {
            'add subscriber': {},
            'edit segment': {},
            'delete subscriber': {},
            "transfer subscriber":{},
            "merge subscriber": {},
          }
        },
        'segments': {
          children:{
            'add segment': {},
            'edit segment': {},
            'delete segment': {}
          }
        }
      }
    },
    "templates":{
      is_custom:false,
      children:{
        'add template':{},
        'edit template':{},
        'delete template':{}
      }
    },
    "reports":{}
  },
  "analytics reports": [],
  profile: {
    [FIELD_MAP.USER]: {
      is_custom: true
    }
  },
  automation: [],
  pipeline: [],
  "view data for": []
};
const models = require('../models');
const { FIELD_PREFIX, SECTION_PREFIX } = require('../constants/permissions');

const insertValues = async (queryInterface, data, currentNode, label = '') => {
  let document = await queryInterface.bulkInsert("permissions", data, {});
  if (currentNode) {
    for (let child in currentNode) {
      insertValues(
        queryInterface,
        [
          {
            permission: child,
            is_custom: currentNode[child].is_custom ? currentNode[child].is_custom : 0,
            parent_id: document,
            alternate_label: label + child,
            created_at: new Date(),
            updated_at: new Date()
          }
        ],
        currentNode[child].children,
        label + child + ' > '
      );
    }
  }
  return document;
};

const addCustomFieldPermissions = async (queryInterface) => {
  try {
    let sections = await queryInterface.sequelize.query('SELECT * from sections', { type: queryInterface.sequelize.QueryTypes.SELECT }),
      insertSections = [];

    if (sections.length) {
      for (let i = 0; i < sections.length; i++) {

        let sectionPermission = await models.permission.count({
          where: {
            section_id: sections[i].id,
            is_section: 1
          }
        });

        if (sectionPermission) {
          break;
        }

        let section = sections[i], where = {};
        where = {
          permission: FIELD_MAP[section.type] ? FIELD_MAP[section.type] : FIELD_MAP.DEFAULT
        }

        let parent = await models.permission.findOne({
          where,
          raw: true
        });

        if (parent) {
          where.permission = parent.alternate_label;
          parent = parent.id
        } else {
          parent = null;
        }

        let permission = await models.permission.create({
          permission: SECTION_PREFIX + section.name + ' ' + section.id,
          alternate_label: where.permission + ' > ' + section.name.toLowerCase(),
          section_id: section.id,
          is_section: 1,
          created_at: new Date(),
          updated_at: new Date(),
          parent_id: parent
        });

        if (permission) {
          insertSections.push(permission.dataValues);
        }
      }
    }

    let custom_fields = await queryInterface.sequelize.query('SELECT * from custom_fields WHERE is_default = 0', { type: queryInterface.sequelize.QueryTypes.SELECT });
    if (custom_fields.length) {
      for (let i = 0; i < custom_fields.length; i++) {
        let field = custom_fields[i];
        let [match] = insertSections.filter(section => section.section_id === field.section_id);

        let permission = await models.permission.create({
          permission: FIELD_PREFIX + field.label + ' ' + field.id,
          alternate_label: (match ? match.alternate_label + ' > ' : '') + field.label.toLowerCase(),
          custom_field_id: field.id,
          is_custom: 1,
          created_at: new Date(),
          updated_at: new Date(),
          parent_id: match ? match.id : null
        });
      }
    }

  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    await queryInterface.sequelize.query("TRUNCATE TABLE permissions");
    for (let level in structure) {
      let phaseValue = structure[level];
      await insertValues(
        queryInterface,
        [
          {
            permission: level,
            is_custom: phaseValue.is_custoom ? phaseValue.is_custoom : 0,
            alternate_label: level,
            created_at: new Date(),
            updated_at: new Date()
          }
        ],
        structure[level],
        level + ' > '
      );
    }

    await addCustomFieldPermissions(queryInterface);
    return queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("permissons", {}, {
      truncate: true
    });
  }
};