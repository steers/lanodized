'use strict';
const {promisify} = require('util');
const readdir = promisify(require('fs').readdir);
const path = require('path');
const basename = path.basename(module.filename);

/**
 * Dynamically load all chat commands from their local definition files into
 * maps defined in the chat bot object.
 * @param  {Object} ctx Application context
 * @param  {Bot} bot Chat bot instance
 * @param  {Map} bot.commands Map from canonical name to command object
 * @param  {Map} bot.aliases Map from alias to canonical name
 * @return {undefined}
 */
async function initialize(ctx, bot) {
  const files = await readdir(__dirname);
  files.filter((file) => {
    return (file.indexOf('.') !== 0)
        && (file !== basename)
        && (file.slice(-3) === '.js');
  }).forEach((file) => {
    let cmd = require(path.resolve(__dirname, file));
    if (!cmd.conf.enabled) return;
    bot.commands.set(cmd.help.name, cmd);
    cmd.help.aliases.forEach((alias) => {
      bot.aliases.set(alias, cmd.help.name);
    });
  });
};

module.exports.initialize = initialize;
