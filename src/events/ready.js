'use strict';

module.exports = (client) => {
  client.log('log', 'LANbot Online', client.user,
    `Connected to ${client.channels.size} channels in ${client.guilds.size} guilds`);
};
