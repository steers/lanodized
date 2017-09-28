'use strict';

module.exports = {
  info: {
    title: 'War Thunder',
    released: new Date(2012, 11, 1),
    links: {
      buy: 'http://store.steampowered.com/app/236390/War_Thunder/',
      info: 'https://warthunder.com/en',
    },
    properties: {
      free: true,
      steamId: 236390,
    },
  },
  aliases: ['wt', 'warthunder'],
  genres: ['mmo', 'vehicle'],
  platforms: ['windows', 'mac', 'linux', 'ps4', 'xbone'],
  modes: [
    {
      name: 'Multiplayer',
      short: 'multiplayer',
      serverSize: 32,
      groupSize: 4,
      description: '',
      properties: null,
    },
  ],
};
