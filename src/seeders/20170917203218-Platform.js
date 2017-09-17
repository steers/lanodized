'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let platforms = [
      {
        name: 'Windows',
        short: 'windows',
        description: 'Microsoft Windows',
        properties: JSON.stringify({
          type: 'PC',
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Mac',
        short: 'mac',
        description: 'Apple Mac OS X',
        properties: JSON.stringify({
          type: 'PC',
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Linux',
        short: 'linux',
        description: 'GNU/Linux',
        properties: JSON.stringify({
          type: 'PC',
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Xbox',
        short: 'xbox',
        description: 'Microsoft Xbox',
        properties: JSON.stringify({
          type: 'Console',
          generation: 6,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Xbox 360',
        short: '360',
        description: 'Microsoft Xbox 360',
        properties: JSON.stringify({
          type: 'Console',
          generation: 7,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Xbox One',
        short: 'xbone',
        description: 'Microsoft Xbox One',
        properties: JSON.stringify({
          type: 'Console',
          generation: 8,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'PS2',
        short: 'ps2',
        description: 'Sony PlayStation 2',
        properties: JSON.stringify({
          type: 'Console',
          generation: 6,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'PS3',
        short: 'ps3',
        description: 'Sony PlayStation 3',
        properties: JSON.stringify({
          type: 'Console',
          generation: 7,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'PS4',
        short: 'ps4',
        description: 'Sony PlayStation 4',
        properties: JSON.stringify({
          type: 'Console',
          generation: 8,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'GameCube',
        short: 'gc',
        description: 'Nintendo GameCube',
        properties: JSON.stringify({
          type: 'Console',
          generation: 6,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Wii',
        short: 'wii',
        description: 'Nintendo Wii',
        properties: JSON.stringify({
          type: 'Console',
          generation: 7,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Wii U',
        short: 'wiiu',
        description: 'Nintendo Wii U',
        properties: JSON.stringify({
          type: 'Console',
          generation: 8,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await queryInterface.bulkInsert('Platforms', platforms);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Platforms', null, {});
  },
};
