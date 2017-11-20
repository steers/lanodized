'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Notifications', {
      id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
      },
      target: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      TriggerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Triggers',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      GuildId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'DiscordGuilds',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      CreatorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'DiscordUsers',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Notifications');
  },
};
