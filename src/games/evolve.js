'use strict';

module.exports = {
  info: {
    title: 'Evolve Stage 2',
    released: new Date(2015, 2, 10),
    links: {
      buy: 'http://store.steampowered.com/app/273350/Evolve_Stage_2/',
      info: 'https://evolvegame.com/',
    },
    properties: {
      free: true,
      steamId: 273350,
    },
  },
  aliases: ['evolve'],
  genres: ['fps', 'coop'],
  platforms: ['windows'],
  modes: [
    {
      name: 'Hunt',
      short: 'hunt',
      serverSize: 5,
      groupSize: 4,
      description: 'Basic mode: one monster, four hunters',
      properties: null,
    },
    {
      name: 'Defend',
      short: 'defend',
      serverSize: 4,
      groupSize: 4,
      description: 'Four hunters defend 3 locations from a Stage 03 monster + minions',
      properties: null,
    },
  ],
};
