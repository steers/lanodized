'use strict';
const Discord = require('discord.js');
const Commands = require('./commands');
const Events = require('./events');

const client = new Discord.Client();
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
    await client.login(client.config.discord.token);
  } catch (e) {
    ctx.log(`Encountered an error initializing chat`, e);
  }
  return client;
}

module.exports.initialize = initialize;
