'use strict';

const eventTypes = [
  {
    name: 'Announcement',
    description: 'News you ought to know',
    properties: JSON.stringify({
      type: 'Admin',
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Break',
    description: 'Free time for refreshment and personal care',
    properties: JSON.stringify({
      type: 'Admin',
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Special',
    description: 'Giveaways and other special events',
    properties: JSON.stringify({
      type: 'Admin',
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Bananza',
    description: 'Games with <16 players, multiple instances',
    properties: JSON.stringify({
      type: 'Game',
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Massive',
    description: 'Games with 16+ players, gigantic matches',
    properties: JSON.stringify({
      type: 'Game',
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('EventTypes', eventTypes);
  },

  down: async (queryInterface, Sequelize) => {
    const where = {
      name: {
        $in: eventTypes.map((entity) => entity.name),
      },
    };
    await queryInterface.bulkDelete('EventTypes', where);
  },
};
