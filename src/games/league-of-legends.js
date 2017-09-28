'use strict';

module.exports = {
  info: {
    title: 'League of Legends',
    released: new Date(2009, 10, 27),
    links: {
      buy: 'https://signup.leagueoflegends.com/en/signup',
      info: 'http://na.leagueoflegends.com/en/',
    },
    properties: {
      free: true,
    },
  },
  aliases: ['lol', 'league'],
  genres: ['moba'],
  platforms: ['windows', 'mac'],
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
