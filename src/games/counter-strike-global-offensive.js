'use strict';

module.exports = {
  info: {
    title: 'Counter-Strike: Global Offensive',
    released: new Date(2012, 8, 21),
    links: {
      buy: 'http://store.steampowered.com/app/730/CounterStrike_Global_Offensive/',
      info: 'http://blog.counter-strike.net/index.php/about/',
    },
    properties: {
      steamId: 730,
    },
  },
  aliases: ['csgo'],
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
