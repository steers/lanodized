'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('GamePlatforms', {
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      GameId: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Games',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      PlatformShort: {
        primaryKey: true,
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Platforms',
          key: 'short',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('GamePlatforms');
  },
};
