'use strict';

const {parseArgs} = require('../lib/parser');
const chat = require('../lib/chat');
const Help = require('../lib/help');

const definition = {
  name: 'help',
  aliases: ['h'],
  description: 'Learn about available chat bot commands',
  usage: '[command]',
  options: null,
};

const configuration = {
  enabled: true,
  direct: true,
};

/**
 * Execute the help command in response to an incoming chat message.
 * @param  {Object} ctx Application context
 * @param  {Bot} bot Chat bot instance
 * @param  {Object} message Chat message
 * @param  {string[]} argv Tokenized arguments
 * @return {Object} Result metadata from command execution.
 */
async function run(ctx, bot, message, argv) {
  const args = parseArgs(argv, definition.options);
  let [command] = args._;

  let msg;
  if (command) {
    // Strip off the command prefix if it was included in the argument
    if (command.startsWith(bot.prefix)) {
      command = command.slice(bot.prefix.length);
    }
    // Try to find the command with the given name/alias
    const cmd = bot.commands.get(command) || bot.commands.get(bot.aliases.get(command));
    msg = cmd ? Help.usage(cmd.help, {prefix: bot.prefix, detailed: true})
      : `Sorry, I don't know \`${command}\``;
  } else {
    const lines = [
      `Hey ${message.author.username}! I'm ${bot.client.user.username} and here's what I can do:`,
    ];
    // Without a specific command, get basic usage for all of em
    for (const cmd of bot.commands.values()) {
      lines.push(Help.usage(cmd.help, {prefix: bot.prefix}));
    }
    msg = lines.join('\n');
  }

  const result = {};
  const actions = [];
  try {
    await chat.respondDirect(message, msg);
    actions.push('responded directly');
  } catch (err) {
    ctx.log(`Encountered an error running ${definition.name}`, 'error', err);
    result.error = err.toString().slice(0, 255);
  }
  result.actions = actions;
  return result;
}

module.exports = {
  help: definition,
  conf: configuration,
  run: run,
};
