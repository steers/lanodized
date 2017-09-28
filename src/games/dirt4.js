'use strict';

module.exports = {
  info: {
    title: 'DiRT 4',
    released: new Date(2017, 6, 9),
    links: {
      buy: 'http://store.steampowered.com/app/421020/DiRT_4/',
      info: 'https://www.dirt4game.com/uk/home',
    },
    properties: {
      steamId: 421020,
    },
  },
  aliases: ['dirt4'],
  genres: ['racing', 'sim'],
  platforms: ['windows', 'ps4', 'xbone'],
  modes: [
    {
      name: 'Multiplayer',
      short: 'multiplayer',
      serverSize: 8,
      groupSize: 8,
      description: '',
      properties: null,
    },
  ],
};
