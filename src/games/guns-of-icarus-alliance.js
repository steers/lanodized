'use strict';

module.exports = {
  info: {
    title: 'Guns of Icarus Alliance',
    released: new Date(2017, 5, 31),
    links: {
      buy: 'http://store.steampowered.com/app/608800/Guns_of_Icarus_Alliance/',
      info: 'https://gunsoficarus.com/',
    },
    properties: {
      steamId: 608800,
    },
  },
  aliases: ['goia', 'guns', 'gunsoficarus'],
  genres: ['vehicle', 'fps', 'coop', 'strategy'],
  platforms: ['windows', 'mac', 'linux'],
  modes: [
    {
      name: 'PVP',
      short: 'pvp',
      serverSize: 32,
      groupSize: 4,
      description: '',
      properties: null,
    },
    {
      name: 'PVE',
      short: 'pve',
      serverSize: 4,
      groupSize: 4,
      description: '',
      properties: null,
    },
  ],
};
