'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('DiscordChannels', {
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
      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING,
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
      GuildId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'DiscordGuilds',
          key: 'id',
        },
        onUpdate: 'no action',
        onDelete: 'set null',
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('DiscordChannels');
  },
};
