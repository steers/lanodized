'use strict';

const eventTypes = [
  {
    name: 'Block',
    description: 'Multiple games scheduled together, play your favourite',
    properties: JSON.stringify({
      type: 'Game',
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Dedicated',
    description: 'Everyone playing the same game together, in groups or whole-party matches',
    properties: JSON.stringify({
      type: 'Game',
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: 'Free Play',
    description: 'Anything goes!',
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
