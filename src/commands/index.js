'use strict';
const {promisify} = require('util');
const readdir = promisify(require('fs').readdir);
const path = require('path');
const basename = path.basename(module.filename);

async function initialize(ctx, client) {
  const files = await readdir(__dirname);
  files.filter((file) => {
    return (file.indexOf('.') !== 0)
        && (file !== basename)
        && (file.slice(-3) === '.js');
  }).forEach((file) => {
    let cmd = require(path.resolve(__dirname, file));
    client.commands.set(cmd.help.name, cmd);
    cmd.conf.aliases.forEach((alias) => {
      client.aliases.set(alias, cmd.help.name);
    });
  });
};

module.exports.initialize = initialize;
