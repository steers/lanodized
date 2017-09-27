'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let genres = [
      {
        name: 'FPS',
        short: 'fps',
        description: 'First-person Shooter',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'MOBA',
        short: 'moba',
        description: 'Multiplayer Online Battle Arena',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Survival',
        short: 'survival',
        description: 'Starting with nothing, fighting for your life',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Co-operative',
        short: 'coop',
        description: 'Working together with other players',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Strategy',
        short: 'strategy',
        description: 'Thinking ahead of your opponents',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Racing',
        short: 'racing',
        description: 'Competing for best time or position',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Sports',
        short: 'sports',
        description: 'Basically any game with a ball',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Vehicle',
        short: 'vehicle',
        description: 'Piloting a large/fast/strong contraption',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Simulation',
        short: 'sim',
        description: 'Just like real life, only different',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Sandbox',
        short: 'sandbox',
        description: 'Your own world to explore and manipulate',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'RPG',
        short: 'rpg',
        description: 'Role-playing Game',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'MMO',
        short: 'mmo',
        description: 'Massively Multiplayer Online',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await queryInterface.bulkInsert('Genres', genres);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Genres', null, {});
  },
};
