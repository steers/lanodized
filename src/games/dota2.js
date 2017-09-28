'use strict';

module.exports = {
  info: {
    title: 'Dota 2',
    released: new Date(2013, 7, 9),
    links: {
      buy: 'http://store.steampowered.com/app/570/Dota_2/',
      info: 'http://www.dota2.com/play/',
    },
    properties: {
      free: true,
      steamId: 570,
    },
  },
  aliases: ['dota2', 'dota'],
  genres: ['moba'],
  platforms: ['windows', 'mac', 'linux'],
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
