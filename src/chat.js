'use strict';
const Discord = require('discord.js');
const Commands = require('./commands');
const Events = require('./events');
const notification = require('./lib/notification');
const config = require('./config').chat;

/**
 * A fantastic chat bot. Truly amazing.
 */
class Bot {
  /**
   * Create a new Discord chat bot.
   */
  constructor() {
    this.api = Discord;
    this.client = new this.api.Client();
    this._config = JSON.parse(JSON.stringify(config));

    this.commands = new Map();
    this.aliases = new Map();
    this.polls = new Map();
  }

  /**
   * Retrieve the command prefix used by this bot.
   * @return {string} Chat command prefix
   */
  get prefix() {
    return this._config.prefix;
  }

  /**
   * Retrieve the chat API token used by this bot.
   * @return {string} Discord API token
   */
  get token() {
    return this._config.discord.token;
  }

  /**
   * Initialize the chat bot application.
   * @param {Object} ctx Application context
   */
  async initialize(ctx) {
    try {
      await Commands.initialize(ctx, this);
      console.log(`commands initialized: ${JSON.stringify(this.commands.keys())}`);
      await Events.initialize(ctx, this);

      const commands = Array.from(this.commands.values());
      const triggers = [].concat(...commands.map((command) => {
        return command.conf.triggers || [];
      }));
      await notification.syncTriggers(ctx, triggers);
    } catch (err) {
      ctx.log(`Encountered an error initializing chat`, 'error', err);
      throw err;
    }
  }

  /**
   * Log into the Discord API with the configured token.
   */
  async login() {
    await this.client.login(this.token);
  }
}

module.exports.Bot = Bot;
