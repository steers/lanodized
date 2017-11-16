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
 * @param  {Object} client Chat client object
 * @param  {Object} message Chat message
 * @param  {string[]} argv Tokenized arguments
 * @return {Object} Result metadata from command execution.
 */
async function run(ctx, client, message, argv) {
  const args = parseArgs(argv, definition.options);
  let [command] = args._;

  let msg;
  if (command) {
    // Strip off the command prefix if it was included in the argument
    if (command.startsWith(client.config.prefix)) {
      command = command.slice(client.config.prefix.length);
    }
    // Try to find the command with the given name/alias
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
    msg = cmd ? Help.usage(cmd.help, {prefix: client.config.prefix, detailed: true})
      : `Sorry, I don't know \`${command}\``;
  } else {
    const lines = [
      `Hey ${message.author.username}! I'm ${client.user.username} and here's what I can do:`,
    ];
    // Without a specific command, get basic usage for all of em
    for (const cmd of client.commands.values()) {
      lines.push(Help.usage(cmd.help, {prefix: client.config.prefix}));
    }
    msg = lines.join('\n');
  }

  const result = {};
  const actions = [];
  try {
    actions.push(...await chat.replyDirect(message, msg));
  } catch (err) {
    result.error = err.toString().slice(0, 256);
    ctx.log(`Encountered an error running ${definition.name}`, 'error', err);
  }
  result.actions = actions;
  return result;
}

module.exports = {
  help: definition,
  conf: configuration,
  run: run,
};
