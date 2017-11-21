'use strict';
const Discord = require('discord.js');
const Commands = require('./commands');
const Events = require('./events');
const notification = require('./lib/notification');

const client = new Discord.Client();
client.api = Discord;
client.config = require('./config').chat;

client.commands = new Map();
client.aliases = new Map();
client.polls = new Map();

/**
 * Initialize the chat bot application and log into Discord.
 * @param {Object} ctx Application context
 * @return {Object} Chat client object
 */
async function initialize(ctx) {
  try {
    await Commands.initialize(ctx, client);
    await Events.initialize(ctx, client);

    const commands = Array.from(client.commands.values());
    const triggers = [].concat(...commands.map((command) => {
      return command.conf.triggers || [];
    }));
    await notification.syncTriggers(ctx, triggers);

    await client.login(client.config.discord.token);
  } catch (e) {
    ctx.log(`Encountered an error initializing chat`, e);
  }
  return client;
}

module.exports.initialize = initialize;
