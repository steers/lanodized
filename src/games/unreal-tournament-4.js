'use strict';

module.exports = {
  info: {
    title: 'Unreal Tournament 4',
    released: new Date(2014, 8),
    links: {
      buy: 'https://www.epicgames.com/unrealtournament/download',
      info: 'https://www.epicgames.com/unrealtournament/',
    },
    properties: {
      free: true,
      earlyAccess: true,
    },
  },
  aliases: ['ut4'],
  genres: ['fps', 'vehicle'],
  platforms: ['windows', 'mac', 'linux'],
  modes: [
    {
      name: 'Deathmatch',
      short: 'dm',
      serverSize: 4,
      groupSize: 1,
      description: '',
      properties: null,
    },
    {
      name: 'Team Deathmatch',
      short: 'tdm',
      serverSize: 8,
      groupSize: 4,
      description: '',
      properties: null,
    },
    {
      name: 'Capture the Flag',
      short: 'ctf',
      serverSize: 12,
      groupSize: 6,
      description: '',
      properties: null,
    },
    {
      name: 'Vehicle Capture the Flag',
      short: 'vctf',
      serverSize: 24,
      groupSize: 12,
      description: '',
      properties: null,
    },
  ],
};
