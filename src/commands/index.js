'use strict';
const {promisify} = require('util');
const readdir = promisify(require('fs').readdir);
const path = require('path');
const basename = path.basename(module.filename);

/**
 * Dynamically load all chat commands from their local definition files into
 * maps defined in the chat client object.
 * @param  {Object} ctx Application context
 * @param  {Object} client Chat client object
 * @param  {Object} client.commands Map from canonical name to command object
 * @param  {Object} client.aliases Map from alias to canonical name
 * @return {undefined}
 */
async function initialize(ctx, client) {
  const files = await readdir(__dirname);
  files.filter((file) => {
    return (file.indexOf('.') !== 0)
        && (file !== basename)
        && (file.slice(-3) === '.js');
  }).forEach((file) => {
    let cmd = require(path.resolve(__dirname, file));
    client.commands.set(cmd.help.name, cmd);
    cmd.help.aliases.forEach((alias) => {
      client.aliases.set(alias, cmd.help.name);
    });
  });
};

module.exports.initialize = initialize;
