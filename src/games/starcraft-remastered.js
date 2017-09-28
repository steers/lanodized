'use strict';

module.exports = {
  info: {
    title: 'StarCraft: Remastered',
    released: new Date(2017, 8, 14),
    links: {
      buy: 'https://us.battle.net/shop/en/product/starcraft-remastered',
      info: 'https://starcraft.com/en-us/',
    },
    properties: null,
  },
  aliases: ['sc_r'],
  genres: ['strategy'],
  platforms: ['windows', 'mac'],
  modes: [
    {
      name: 'Multiplayer',
      short: 'multiplayer',
      serverSize: 8,
      groupSize: 4,
      description: '',
      properties: null,
    },
  ],
};
