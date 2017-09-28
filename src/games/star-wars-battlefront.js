'use strict';

module.exports = {
  info: {
    title: 'Star Wars Battlefront',
    released: new Date(2015, 11, 17),
    links: {
      buy: 'http://starwars.ea.com/starwars/battlefront/buy',
      info: 'http://starwars.ea.com/starwars/battlefront',
    },
    properties: null,
  },
  aliases: ['swbf'],
  genres: ['fps'],
  platforms: ['windows', 'ps4', 'xbone'],
  modes: [
    {
      name: 'Multiplayer',
      short: 'multiplayer',
      serverSize: 64,
      groupSize: 4,
      description: '',
      properties: null,
    },
  ],
};
