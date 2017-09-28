'use strict';

module.exports = {
  info: {
    title: 'Heroes of the Storm',
    released: new Date(2015, 6, 2),
    links: {
      buy: 'http://us.battle.net/heroes/en/',
      info: 'http://us.battle.net/heroes/en/game/',
    },
    properties: {
      free: true,
    },
  },
  aliases: ['hots'],
  genres: ['moba'],
  platforms: ['windows', 'mac'],
  modes: [
    {
      name: 'Multiplayer',
      short: 'multiplayer',
      serverSize: 10,
      groupSize: 5,
      description: '',
      properties: null,
    },
  ],
};
