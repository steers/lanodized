'use strict';

module.exports = {
  info: {
    title: 'Don\'t Starve Together',
    released: new Date(2016, 4, 21),
    links: {
      buy: 'http://store.steampowered.com/app/322330/Dont_Starve_Together/',
      info: 'https://www.klei.com/games/dont-starve-together',
    },
    properties: {
      steamId: 322330,
    },
  },
  aliases: ['dst', 'dontstarve', 'dontstarvetogether'],
  genres: ['survival', 'coop'],
  platforms: ['windows', 'mac', 'linux'],
  modes: [
    {
      name: 'Multiplayer',
      short: 'multiplayer',
      serverSize: 20,
      groupSize: 20,
      description: '',
      properties: null,
    },
  ],
};
