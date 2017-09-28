'use strict';

module.exports = {
  info: {
    title: 'Team Fortress 2',
    released: new Date(2007, 10, 10),
    links: {
      buy: 'http://store.steampowered.com/app/440/Team_Fortress_2/',
      info: 'http://www.teamfortress.com/',
    },
    properties: {
      free: true,
      steamId: 440,
    },
  },
  aliases: ['tf2', 'mvm'],
  genres: ['fps', 'coop'],
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
    {
      name: 'Mann vs. Machine',
      short: 'mvm',
      serverSize: 6,
      groupSize: 6,
      description: '',
      properties: null,
    },
  ],
};
