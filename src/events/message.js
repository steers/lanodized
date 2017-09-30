'use strict';

const {tokenize} = require('../lib/parser');

module.exports = (ctx, client, message) => {
  // avoid getting caught in bot spam loops
  if (message.author.bot) return;
  // only respond to commands using the configured prefix
  if (message.content.indexOf(client.config.prefix) !== 0) return;

  const args = tokenize(message.content.slice(client.config.prefix.length));
  const command = args.shift().toLowerCase();
  const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

  if (!cmd) return;
  cmd.run(ctx, client, args).then(() => {
    // TODO: Measure command usage
  });
};
