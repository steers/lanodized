'use strict';

const {tokenize} = require('../lib/parser');

module.exports = (ctx, client, message) => {
  // avoid getting caught in bot spam loops
  if (message.author.bot) return;
  // only respond to commands using the configured prefix
  if (message.content.indexOf(client.config.prefix) !== 0) return;
  // the first token (sans prefix) should map to a command
  const argv = tokenize(message.content.slice(client.config.prefix.length));
  const command = argv.shift().toLowerCase();
  const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

  if (!cmd) return;

  cmd.run(ctx, client, message, argv).then(() => {
    if (cmd.conf.direct && message.channel.type !== 'dm') {
      message.delete().catch((err) => {
        ctx.log(`Tried to delete message ${message.id} for direct command ${command} in non-DM channel, but failed: ${err.toString()}`);
      });
    }
  });
};
