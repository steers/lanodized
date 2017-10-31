'use strict';

const {parseArgs} = require('../lib/parser');
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
 * @return {undefined}
 */
async function run(ctx, client, message, argv) {
  const args = parseArgs(argv, definition.options);
  const [command] = args._;
  let msg;
  if (command) {
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
  message.guild.emojis.forEach((val, key) => {
    console.log(`${key}: ${val}`);
  });
  if (configuration.direct) {
    const channel = await message.author.createDM();
    await channel.send(msg);
    await channel.delete();
  } else {
    await message.reply(msg);
  }
}

module.exports = {
  help: definition,
  conf: configuration,
  run: run,
};
