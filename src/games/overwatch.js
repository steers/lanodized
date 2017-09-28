'use strict';

module.exports = {
  info: {
    title: 'Overwatch',
    released: new Date(2016, 5, 24),
    links: {
      buy: 'https://us.battle.net/shop/en/product/overwatch',
      info: 'https://playoverwatch.com/en-us/',
    },
    properties: null,
  },
  aliases: ['ow', 'overwatch'],
  genres: ['fps'],
  platforms: ['windows', 'ps4', 'xbone'],
  modes: [
    {
      name: 'Multiplayer',
      short: 'multiplayer',
      serverSize: 12,
      groupSize: 6,
      description: '',
      properties: null,
    },
  ],
};
