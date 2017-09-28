'use strict';

module.exports = {
  info: {
    title: 'Chivalry: Medieval Warfare',
    released: new Date(2012, 10, 16),
    links: {
      buy: 'http://store.steampowered.com/app/219640/Chivalry_Medieval_Warfare/',
      info: 'http://www.tornbanner.com/chivalry/',
    },
    properties: {
      steamId: 219640,
    },
  },
  aliases: ['chiv', 'chivalry'],
  genres: ['fps'],
  platforms: ['windows', 'mac', 'linux'],
  modes: [
    {
      name: 'Multiplayer',
      short: 'multiplayer',
      serverSize: 32,
      groupSize: 16,
      description: '',
      properties: null,
    },
  ],
};
