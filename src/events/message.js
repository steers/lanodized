'use strict';

module.exports = (ctx, client, message) => {
  // avoid getting caught in bot spam loops
  if (message.author.bot) return;
  // only respond to commands using the configured prefix
  if (message.content.indexOf(client.config.prefix) !== 0) return;

  const args = message.content.trim().split(/\s+/g);
  const command = args.shift().slice(client.config.prefix.length).toLowerCase();

  const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
  if (cmd) {
    message.flags = [];
    while (args[0] && args[0].match(/^-+/)) {
      message.flags.push(args.shift().replace(/^-+/, ''));
    }
    cmd.run(client, message, args).then(() => {
      // TODO: Measure command usage
    });
  }
};
