'use strict';

const {tokenize} = require('../lib/parser');
const Interaction = require('../lib/interaction');

module.exports = async (ctx, bot, message) => {
  // avoid getting caught in bot spam loops
  if (message.author.bot) return;
  // don't accept multi-line input, only the first one counts
  const [content] = message.content.split('\n');
  // only respond to commands using the configured prefix
  if (content.indexOf(bot.prefix) !== 0) return;
  // the first token (sans prefix) should map to a command
  const argv = tokenize(content.slice(bot.prefix.length));
  const alias = argv.shift().toLowerCase();
  const command = bot.commands.get(alias) || bot.commands.get(bot.aliases.get(alias));
  if (!command) return;

  const interaction = await Interaction.record(ctx, message, command, alias);
  const result = {};
  try {
    let output = await command.run(ctx, bot, message, argv) || {};
    if (typeof output === 'object' && !Array.isArray(output)) {
      Object.assign(result, JSON.parse(JSON.stringify(output)));
    } else {
      result.output = output;
    }
  } catch (err) {
    ctx.log(`Encountered an error while running ${command.help.name}.`, 'error', err);
    result.error = err.toString().slice(0, 256);
  }
  await interaction.update({properties: result});
};
