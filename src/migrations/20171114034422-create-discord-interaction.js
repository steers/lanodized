'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('DiscordInteractions', {
      id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
      },
      command: {
        type: Sequelize.STRING,
      },
      alias: {
        type: Sequelize.STRING,
      },
      properties: {
        type: Sequelize.JSONB,
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
        allowNull: false,
        references: {
          model: 'DiscordUsers',
          key: 'id',
        },
        onUpdate: 'no action',
        onDelete: 'no action',
      },
      ChannelId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'DiscordChannels',
          key: 'id',
        },
        onUpdate: 'no action',
        onDelete: 'no action',
      },
      GuildId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'DiscordGuilds',
          key: 'id',
        },
        onUpdate: 'no action',
        onDelete: 'no action',
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('DiscordInteractions');
  },
};
