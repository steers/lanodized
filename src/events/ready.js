'use strict';

module.exports = (ctx, client) => {
  ctx.log('log', 'LANbot Online', client.user,
    `Connected to ${client.channels.size} channels in ${client.guilds.size} guilds`);
};
