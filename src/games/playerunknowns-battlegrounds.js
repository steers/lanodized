'use strict';

module.exports = {
  info: {
    title: 'PLAYERUNKNOWN\'S BATTLEGROUNDS',
    released: new Date(2017, 3, 23),
    links: {
      buy: 'http://store.steampowered.com/app/578080/PLAYERUNKNOWNS_BATTLEGROUNDS/',
      info: 'https://www.playbattlegrounds.com/main.pu',
    },
    properties: {
      steamId: 578080,
      earlyAccess: true,
    },
  },
  aliases: ['pubg'],
  genres: ['fps'],
  platforms: ['windows'],
  modes: [
    {
      name: 'Battle Royale',
      short: 'battleroyale',
      serverSize: 100,
      groupSize: 4,
      description: '',
      properties: null,
    },
  ],
};
