'use strict';

module.exports = {
  info: {
    title: 'Minecraft',
    released: new Date(2009, 5, 17),
    links: {
      buy: 'https://minecraft.net/en-us/store/minecraft/',
      info: 'https://minecraft.net/en-us/',
    },
    properties: null,
  },
  aliases: ['mc', 'minecraft'],
  genres: ['sandbox', 'survival'],
  platforms: ['windows', 'mac', 'linux', 'ps3', '360', 'ps4', 'xbone', 'wiiu'],
  modes: [
    {
      name: 'Survival',
      short: 'survival',
      serverSize: 2147483647,
      groupSize: 1,
      description: '',
      properties: null,
    },
  ],
};
