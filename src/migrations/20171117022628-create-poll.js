'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Polls', {
      id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
      },
      snowflake: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      alternatives: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      opinion: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      outcome: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      validTo: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'DiscordUsers',
          key: 'id',
        },
        onUpdate: 'no action',
        onDelete: 'set null',
      },
      ChannelId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'DiscordChannels',
          key: 'id',
        },
        onUpdate: 'no action',
        onDelete: 'set null',
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Polls');
  },
};
