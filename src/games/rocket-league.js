'use strict';

module.exports = {
  info: {
    title: 'Rocket League',
    released: new Date(2015, 7, 7),
    links: {
      buy: 'http://store.steampowered.com/app/252950/Rocket_League/',
      info: 'https://www.rocketleague.com/',
    },
    properties: {
      steamId: 252950,
    },
  },
  aliases: ['rl', 'rocketleague'],
  genres: ['sports', 'vehicle'],
  platforms: ['windows', 'mac', 'linux', 'ps4', 'xbone'],
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
