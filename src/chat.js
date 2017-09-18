'use strict';
const Discord = require('discord.js');
const config = require('./config/chat.json');
const addCommands = require('./commands');
const bindEvents = require('./events');

module.exports = (db) => {
  const client = new Discord.Client();
  client.db = db;
  client.log = console.log; // DEBUG
  client.config = Object.assign({}, config);
  client.commands = new Discord.Collection();
  client.aliases = new Discord.Collection();
  addCommands(client);
  bindEvents(client);
  return client.login(config.discord.token);
};
