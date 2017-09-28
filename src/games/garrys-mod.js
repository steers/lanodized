'use strict';

module.exports = {
  info: {
    title: 'Garry\'s Mod',
    released: new Date(2004, 12, 24),
    links: {
      buy: 'http://store.steampowered.com/app/4000/Garrys_Mod/',
      info: 'https://gmod.facepunch.com/',
    },
    properties: {
      steamId: 4000,
    },
  },
  aliases: ['gmod'],
  genres: ['sandbox', 'fps'],
  platforms: ['windows', 'mac', 'linux'],
  modes: [
    {
      name: 'PropHunt',
      short: 'prophunt',
      serverSize: 32,
      groupSize: 16,
      description: 'Hide\'n\'Seek',
      properties: null,
    },
    {
      name: 'Murder',
      short: 'murder',
      serverSize: 24,
      groupSize: 12,
      description: '',
      properties: null,
    },
  ],
};
