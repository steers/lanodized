'use strict';

const {tokenize} = require('../lib/parser');
const interaction = require('../lib/interaction');

module.exports = async (ctx, client, message) => {
  // avoid getting caught in bot spam loops
  if (message.author.bot) return;
  // don't accept multi-line input, only the first one counts
  const [content] = message.content.split('\n');
  // only respond to commands using the configured prefix
  if (content.indexOf(client.config.prefix) !== 0) return;
  // the first token (sans prefix) should map to a command
  const argv = tokenize(content.slice(client.config.prefix.length));
  const command = argv.shift().toLowerCase();
  const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

  if (!cmd) return;
  const result = await cmd.run(ctx, client, message, argv);

  // Make a record of the interaction for the calculation of metrics
  try {
    await interaction.executedCommand(ctx, message, cmd, command, result);
  } catch (err) {
    ctx.log(`Encountered an error while recording command interaction.`, 'error', err);
  }
};
