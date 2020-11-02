'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('campaigns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        // references: {
        //   model: "users",
        //   key: "id"
        // }
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      email_template_id: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      from_name: {
        allowNull: true,
        type: Sequelize.STRING
      },
      from_email: {
        allowNull: true,
        type: Sequelize.STRING
      },
      reply_email: {
        allowNull: true,
        type: Sequelize.STRING
      },
      subject_line: {
        allowNull: true,
        type: Sequelize.STRING
      },
      preheader_text: {
        allowNull: true,
        type: Sequelize.STRING
      },
      scheduled_time: {
        type: Sequelize.DATE
      },
      status: {
        allowNull: false,
        type: Sequelize.TINYINT
      },
      is_scheduled:
      {
        allowNull: true,
        type: Sequelize.TINYINT
      },
      email_percentage:
      {
        allowNull: true,
        type: Sequelize.FLOAT
      },
      email_template_html:
      {
        allowNull: true,
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('campaigns');
  }
};